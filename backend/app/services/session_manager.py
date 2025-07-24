import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
import logging

from ..models.data_version import Session as SessionModel, Message, Project
from ..core.agent_orchestrator import AgentOrchestrator
from ..core.version_manager import VersionManager
from ..core.sandbox_executor import SandboxExecutor

logger = logging.getLogger(__name__)

class SessionManager:
    """会话管理服务，管理多轮对话的上下文和状态"""
    
    def __init__(self, db: Session):
        self.db = db
        self.agent = AgentOrchestrator()
        self.version_manager = VersionManager()
        self.sandbox = SandboxExecutor()
    
    def create_session(self, project_id: str, user_input: str = None) -> str:
        """创建新会话"""
        session_id = str(uuid.uuid4())
        
        session = SessionModel(
            id=session_id,
            project_id=project_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            current_version_id=None
        )
        
        self.db.add(session)
        self.db.commit()
        
        # 如果有初始输入，添加到会话
        if user_input:
            self.add_message(session_id, "user", user_input)
        
        logger.info(f"创建会话: {session_id}")
        return session_id
    
    def add_message(self, session_id: str, role: str, content: str, 
                   metadata: Dict[str, Any] = None) -> str:
        """添加消息到会话"""
        message_id = str(uuid.uuid4())
        
        message = Message(
            id=message_id,
            session_id=session_id,
            role=role,
            content=content,
            metadata=metadata or {},
            created_at=datetime.utcnow()
        )
        
        self.db.add(message)
        
        # 更新会话时间戳
        session = self.db.query(SessionModel).filter_by(id=session_id).first()
        if session:
            session.updated_at = datetime.utcnow()
        
        self.db.commit()
        
        logger.debug(f"添加消息到会话 {session_id}: {role} - {content[:50]}...")
        return message_id
    
    def get_session_history(self, session_id: str) -> List[Dict[str, Any]]:
        """获取会话历史"""
        messages = self.db.query(Message).filter_by(
            session_id=session_id
        ).order_by(Message.created_at).all()
        
        return [
            {
                'id': msg.id,
                'role': msg.role,
                'content': msg.content,
                'metadata': msg.metadata,
                'created_at': msg.created_at.isoformat()
            }
            for msg in messages
        ]
    
    def get_conversation_context(self, session_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """获取对话上下文用于LLM提示"""
        messages = self.db.query(Message).filter_by(
            session_id=session_id
        ).order_by(desc(Message.created_at)).limit(limit).all()
        
        # 反转顺序，使最新消息在最后
        messages.reverse()
        
        return [
            {
                'role': msg.role,
                'content': msg.content
            }
            for msg in messages
        ]
    
    async def process_user_input(self, session_id: str, user_input: str, 
                                file_path: str = None) -> Dict[str, Any]:
        """处理用户输入并返回响应"""
        try:
            # 添加用户消息
            self.add_message(session_id, "user", user_input)
            
            # 获取会话和项目信息
            session = self.db.query(SessionModel).filter_by(id=session_id).first()
            if not session:
                raise ValueError("会话不存在")
            
            project = self.db.query(Project).filter_by(id=session.project_id).first()
            if not project:
                raise ValueError("项目不存在")
            
            # 获取当前数据文件路径
            current_file = file_path or self._get_current_data_file(session)
            if not current_file:
                return {
                    'status': 'error',
                    'message': '请先上传数据文件',
                    'suggestions': ['请上传CSV、Excel或Parquet格式的数据文件']
                }
            
            # 获取对话上下文
            context = self.get_conversation_context(session_id)
            
            # 使用Agent处理输入
            result = await self.agent.process_intent(
                user_input=user_input,
                context=context,
                data_file=current_file
            )
            
            if result['status'] == 'success':
                # 执行生成的代码
                execution_result = await self.sandbox.execute_code(
                    code=result['generated_code'],
                    input_file=current_file,
                    output_file=f"temp_{session_id}.csv"
                )
                
                if execution_result['success']:
                    # 创建新版本
                    new_version = await self.version_manager.create_version(
                        project_id=project.id,
                        data_file=execution_result['output_file'],
                        code=result['generated_code'],
                        description=user_input,
                        parent_version_id=session.current_version_id
                    )
                    
                    # 更新会话当前版本
                    session.current_version_id = new_version['version_id']
                    session.updated_at = datetime.utcnow()
                    self.db.commit()
                    
                    # 添加助手回复
                    self.add_message(
                        session_id, 
                        "assistant", 
                        result['response'],
                        {
                            'action': result['action'],
                            'code': result['generated_code'],
                            'version_id': new_version['version_id'],
                            'rows_affected': execution_result.get('rows_affected', 0)
                        }
                    )
                    
                    return {
                        'status': 'success',
                        'message': result['response'],
                        'data_preview': execution_result.get('preview', []),
                        'version_id': new_version['version_id'],
                        'rows_affected': execution_result.get('rows_affected', 0)
                    }
                else:
                    # 执行失败
                    error_msg = f"代码执行失败: {execution_result['error']}"
                    self.add_message(session_id, "assistant", error_msg)
                    
                    return {
                        'status': 'error',
                        'message': error_msg,
                        'code': result['generated_code']
                    }
            else:
                # 意图理解失败
                self.add_message(session_id, "assistant", result['message'])
                return result
                
        except Exception as e:
            logger.error(f"处理用户输入时出错: {e}")
            error_msg = f"处理请求时出错: {str(e)}"
            self.add_message(session_id, "assistant", error_msg)
            return {
                'status': 'error',
                'message': error_msg
            }
    
    def get_active_sessions(self, project_id: str) -> List[Dict[str, Any]]:
        """获取项目的活跃会话"""
        sessions = self.db.query(SessionModel).filter_by(
            project_id=project_id
        ).order_by(desc(SessionModel.updated_at)).limit(10).all()
        
        return [
            {
                'id': session.id,
                'created_at': session.created_at.isoformat(),
                'updated_at': session.updated_at.isoformat(),
                'current_version_id': session.current_version_id,
                'message_count': len(session.messages)
            }
            for session in sessions
        ]
    
    def rollback_to_version(self, session_id: str, version_id: str) -> Dict[str, Any]:
        """回滚到指定版本"""
        try:
            session = self.db.query(SessionModel).filter_by(id=session_id).first()
            if not session:
                raise ValueError("会话不存在")
            
            # 验证版本属于该项目
            version = self.version_manager.get_version(version_id)
            if not version or version['project_id'] != session.project_id:
                raise ValueError("版本不存在或不属于当前项目")
            
            # 更新会话当前版本
            session.current_version_id = version_id
            session.updated_at = datetime.utcnow()
            self.db.commit()
            
            # 添加回滚记录
            self.add_message(
                session_id, 
                "system", 
                f"已回滚到版本 {version_id}",
                {'action': 'rollback', 'version_id': version_id}
            )
            
            return {
                'status': 'success',
                'message': f'成功回滚到版本 {version_id}',
                'version_id': version_id
            }
            
        except Exception as e:
            logger.error(f"回滚失败: {e}")
            return {
                'status': 'error',
                'message': str(e)
            }
    
    def _get_current_data_file(self, session: SessionModel) -> Optional[str]:
        """获取当前会话的数据文件路径"""
        if session.current_version_id:
            version = self.version_manager.get_version(session.current_version_id)
            if version:
                return version['data_file_path']
        
        # 获取项目的最新版本
        project = self.db.query(Project).filter_by(id=session.project_id).first()
        if project and project.versions:
            latest_version = project.versions[-1]
            return latest_version.data_file_path
        
        return None
    
    def close_session(self, session_id: str) -> bool:
        """关闭会话"""
        try:
            session = self.db.query(SessionModel).filter_by(id=session_id).first()
            if session:
                # 这里可以添加会话清理逻辑
                logger.info(f"会话已关闭: {session_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"关闭会话失败: {e}")
            return False