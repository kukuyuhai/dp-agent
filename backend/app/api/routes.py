from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from datetime import datetime

from ..core.database import get_db
from ..services.session_manager import SessionManager
from ..services.data_profiler import DataProfiler
from ..core.version_manager import VersionManager
from ..core.minio_client import MinIOClient
from ..models.data_version import Project
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1")

# 数据模型
class ProjectCreate(BaseModel):
    name: str
    description: str = ""

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    status: str
    message: str
    data_preview: Optional[List[dict]] = None
    version_id: Optional[str] = None
    rows_affected: Optional[int] = None

class VersionRollbackRequest(BaseModel):
    session_id: str
    version_id: str

# 依赖注入
def get_session_manager(db: Session = Depends(get_db)):
    return SessionManager(db)

def get_data_profiler():
    return DataProfiler()

def get_version_manager():
    return VersionManager()

def get_minio_client():
    return MinIOClient()

# 项目相关端点
@router.post("/projects", response_model=dict)
async def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db)
):
    """创建新项目"""
    project_id = str(uuid.uuid4())
    
    db_project = Project(
        id=project_id,
        name=project.name,
        description=project.description,
        created_at=datetime.utcnow()
    )
    
    db.add(db_project)
    db.commit()
    
    return {
        "project_id": project_id,
        "name": project.name,
        "description": project.description
    }

@router.get("/projects", response_model=List[dict])
async def get_projects(db: Session = Depends(get_db)):
    """获取所有项目列表"""
    projects = db.query(Project).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "created_at": p.created_at.isoformat(),
            "version_count": len(p.versions)
        }
        for p in projects
    ]

@router.get("/projects/{project_id}", response_model=dict)
async def get_project_details(
    project_id: str,
    db: Session = Depends(get_db)
):
    """获取项目详细信息"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "created_at": project.created_at.isoformat(),
        "versions": [
            {
                "id": v.id,
                "version_number": v.version_number,
                "description": v.description,
                "created_at": v.created_at.isoformat(),
                "parent_version_id": v.parent_version_id
            }
            for v in project.versions
        ]
    }

# 文件上传端点
@router.post("/projects/{project_id}/upload")
async def upload_file(
    project_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    minio_client: MinIOClient = Depends(get_minio_client)
):
    """上传数据文件到项目"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="文件名不能为空")
    
    # 验证文件类型
    allowed_extensions = {'.csv', '.xlsx', '.xls', '.parquet'}
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="不支持的文件类型")
    
    # 保存文件
    file_id = str(uuid.uuid4())
    filename = f"{file_id}_{file.filename}"
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # 上传到MinIO
    bucket_name = f"project-{project_id}"
    object_name = f"data/{filename}"
    
    if not minio_client.upload_file(file_path, bucket_name, object_name):
        raise HTTPException(status_code=500, detail="文件上传失败")
    
    # 创建初始版本
    version_manager = VersionManager()
    version = await version_manager.create_version(
        project_id=project_id,
        data_file=file_path,
        code="# 初始数据上传",
        description=f"上传文件: {file.filename}"
    )
    
    return {
        "message": "文件上传成功",
        "file_id": file_id,
        "filename": file.filename,
        "version_id": version["version_id"]
    }

# 数据探查端点
@router.post("/data/profile")
async def profile_data(
    file_path: str,
    profiler: DataProfiler = Depends(get_data_profiler)
):
    """探查数据文件"""
    try:
        profile = profiler.profile_data(file_path)
        return profile
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 会话管理端点
@router.post("/sessions", response_model=dict)
async def create_session(
    project_id: str = Form(...),
    title: str = Form("新对话"),
    initial_message: str = Form(None),
    session_manager: SessionManager = Depends(get_session_manager)
):
    """创建新会话"""
    session_id = session_manager.create_session(project_id, title, initial_message)
    
    # 如果有初始消息，立即处理
    if initial_message:
        try:
            result = await session_manager.process_user_input(
                session_id=session_id,
                user_input=initial_message
            )
            return {
                "id": session_id,
                "project_id": project_id,
                "title": title,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "initial_response": result
            }
        except Exception as e:
            logger.error(f"处理初始消息失败: {e}")
    
    return {
        "id": session_id,
        "project_id": project_id,
        "title": title,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }

@router.get("/sessions", response_model=List[dict])
async def get_sessions(
    project_id: str,
    db: Session = Depends(get_db)
):
    """获取项目的会话列表"""
    from ..models.data_version import Session as SessionModel
    sessions = db.query(SessionModel).filter(SessionModel.project_id == project_id).order_by(SessionModel.created_at.desc()).all()
    return [
        {
            "id": s.id,
            "project_id": s.project_id,
            "title": s.title or "新对话",
            "created_at": s.created_at.isoformat(),
            "updated_at": s.updated_at.isoformat()
        }
        for s in sessions
    ]

@router.get("/sessions/{session_id}", response_model=dict)
async def get_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """获取单个会话详情"""
    from ..models.data_version import Session as SessionModel
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    return {
        "id": session.id,
        "project_id": session.project_id,
        "title": session.title or "新对话",
        "created_at": session.created_at.isoformat(),
        "updated_at": session.updated_at.isoformat()
    }

@router.get("/sessions/{session_id}/history", response_model=List[dict])
async def get_session_history(
    session_id: str,
    session_manager: SessionManager = Depends(get_session_manager)
):
    """获取会话历史"""
    return session_manager.get_session_history(session_id)

# 聊天端点
@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    session_manager: SessionManager = Depends(get_session_manager)
):
    """处理聊天消息"""
    try:
        result = await session_manager.process_user_input(
            session_id=request.session_id,
            user_input=request.message
        )
        
        if result['status'] == 'success':
            return ChatResponse(
                status='success',
                message=result['message'],
                data_preview=result.get('data_preview'),
                version_id=result.get('version_id'),
                rows_affected=result.get('rows_affected')
            )
        else:
            return ChatResponse(
                status='error',
                message=result['message']
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 版本管理端点
@router.get("/versions/{project_id}", response_model=List[dict])
async def get_versions(
    project_id: str,
    version_manager: VersionManager = Depends(get_version_manager)
):
    """获取项目版本历史"""
    try:
        versions = await version_manager.get_version_history(project_id)
        return versions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/versions/rollback")
async def rollback_version(
    request: VersionRollbackRequest,
    session_manager: SessionManager = Depends(get_session_manager)
):
    """回滚到指定版本"""
    result = session_manager.rollback_to_version(
        request.session_id,
        request.version_id
    )
    
    if result['status'] == 'error':
        raise HTTPException(status_code=400, detail=result['message'])
    
    return result

@router.get("/versions/{version_id}/diff")
async def get_version_diff(
    version_id: str,
    version_manager: VersionManager = Depends(get_version_manager)
):
    """获取版本差异"""
    try:
        diff = await version_manager.compare_versions(version_id)
        return diff
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 健康检查端点
@router.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}