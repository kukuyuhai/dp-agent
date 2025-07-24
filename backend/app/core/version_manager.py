import os
import json
import hashlib
import shutil
from datetime import datetime
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import desc
import polars as pl
from pathlib import Path

from ..models.data_version import DataVersion, Project
from ..core.minio_client import MinIOClient

class VersionManager:
    """数据版本管理器，实现Git-like版本控制"""
    
    def __init__(self, db_session: DBSession, minio_client: MinIOClient):
        self.db = db_session
        self.minio = minio_client
        self.bucket_name = "data-versions"
        
    def create_project(self, name: str, description: str = "") -> Project:
        """创建新项目"""
        project = Project(name=name, description=description)
        self.db.add(project)
        self.db.commit()
        return project
    
    def create_version(self, project_id: str, message: str, code: str, 
                      data_path: str, author: str = "system") -> DataVersion:
        """创建新版本"""
        
        # 生成版本ID（Git-like hash）
        version_data = f"{project_id}{message}{code}{datetime.utcnow().isoformat()}"
        version_id = hashlib.sha1(version_data.encode()).hexdigest()[:10]
        
        # 上传数据快照到MinIO
        snapshot_path = f"{project_id}/{version_id}/data.parquet"
        self.minio.upload_file(data_path, self.bucket_name, snapshot_path)
        
        # 获取数据元信息
        metadata = self._get_data_metadata(data_path)
        
        # 创建版本记录
        version = DataVersion(
            id=version_id,
            project_id=project_id,
            message=message,
            code=code,
            data_snapshot_path=snapshot_path,
            metadata=metadata,
            author=author
        )
        
        self.db.add(version)
        self.db.commit()
        return version
    
    def checkout_version(self, version_id: str, output_path: str) -> bool:
        """检出指定版本"""
        version = self.db.query(DataVersion).filter_by(id=version_id).first()
        if not version:
            return False
            
        # 从MinIO下载数据快照
        success = self.minio.download_file(
            self.bucket_name, 
            version.data_snapshot_path, 
            output_path
        )
        
        return success
    
    def get_version_history(self, project_id: str) -> List[Dict[str, Any]]:
        """获取项目版本历史"""
        versions = self.db.query(DataVersion).filter_by(
            project_id=project_id
        ).order_by(desc(DataVersion.created_at)).all()
        
        history = []
        for version in versions:
            history.append({
                'id': version.id,
                'message': version.message,
                'author': version.author,
                'created_at': version.created_at.isoformat(),
                'metadata': version.metadata,
                'code': version.code[:200] + '...' if len(version.code) > 200 else version.code
            })
        
        return history
    
    def compare_versions(self, version1_id: str, version2_id: str) -> Dict[str, Any]:
        """比较两个版本的差异"""
        
        # 获取版本信息
        v1 = self.db.query(DataVersion).filter_by(id=version1_id).first()
        v2 = self.db.query(DataVersion).filter_by(id=version2_id).first()
        
        if not v1 or not v2:
            return {'error': '版本不存在'}
        
        # 下载两个版本的数据
        with tempfile.NamedTemporaryFile(suffix='.parquet') as f1, \
             tempfile.NamedTemporaryFile(suffix='.parquet') as f2:
            
            self.checkout_version(version1_id, f1.name)
            self.checkout_version(version2_id, f2.name)
            
            # 加载数据
            df1 = pl.read_parquet(f1.name)
            df2 = pl.read_parquet(f2.name)
            
            # 计算差异
            diff = self._calculate_data_diff(df1, df2)
            
            return {
                'version1': {
                    'id': v1.id,
                    'message': v1.message,
                    'metadata': v1.metadata
                },
                'version2': {
                    'id': v2.id,
                    'message': v2.message,
                    'metadata': v2.metadata
                },
                'diff': diff
            }
    
    def get_current_data_path(self, project_id: str) -> Optional[str]:
        """获取项目当前版本的数据路径"""
        latest_version = self.db.query(DataVersion).filter_by(
            project_id=project_id
        ).order_by(desc(DataVersion.created_at)).first()
        
        if latest_version:
            # 下载最新版本到临时文件
            temp_path = f"/tmp/current_{project_id}.parquet"
            if self.checkout_version(latest_version.id, temp_path):
                return temp_path
        
        return None
    
    def _get_data_metadata(self, data_path: str) -> Dict[str, Any]:
        """获取数据元信息"""
        try:
            if data_path.endswith('.csv'):
                df = pl.read_csv(data_path)
            elif data_path.endswith('.xlsx'):
                df = pl.read_excel(data_path)
            elif data_path.endswith('.parquet'):
                df = pl.read_parquet(data_path)
            else:
                return {}
            
            return {
                'rows': len(df),
                'columns': len(df.columns),
                'column_names': df.columns,
                'dtypes': {col: str(dtype) for col, dtype in df.schema.items()},
                'null_counts': {col: df[col].null_count() for col in df.columns},
                'memory_usage': df.estimated_size()
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _calculate_data_diff(self, df1: pl.DataFrame, df2: pl.DataFrame) -> Dict[str, Any]:
        """计算数据差异"""
        
        # 基本统计信息
        diff = {
            'rows_before': len(df1),
            'rows_after': len(df2),
            'rows_change': len(df2) - len(df1),
            'columns_before': len(df1.columns),
            'columns_after': len(df2.columns),
            'columns_change': len(df2.columns) - len(df1.columns)
        }
        
        # 列变化
        columns_added = list(set(df2.columns) - set(df1.columns))
        columns_removed = list(set(df1.columns) - set(df2.columns))
        
        diff.update({
            'columns_added': columns_added,
            'columns_removed': columns_removed,
            'columns_renamed': []
        })
        
        # 数据变化统计（如果有相同列）
        common_columns = list(set(df1.columns) & set(df2.columns))
        if common_columns:
            data_changes = {}
            for col in common_columns:
                changes = (df1[col] != df2[col]).sum()
                data_changes[col] = int(changes)
            diff['data_changes'] = data_changes
        
        return diff
    
    def create_branch(self, project_id: str, branch_name: str, 
                     from_version_id: str) -> DataVersion:
        """从指定版本创建分支"""
        from_version = self.db.query(DataVersion).filter_by(
            id=from_version_id
        ).first()
        
        if not from_version:
            raise ValueError("源版本不存在")
        
        # 创建新分支版本
        new_version = DataVersion(
            id=hashlib.sha1(f"{branch_name}{datetime.utcnow()}".encode()).hexdigest()[:10],
            project_id=project_id,
            parent_id=from_version_id,
            message=f"创建分支: {branch_name}",
            code=from_version.code,
            data_snapshot_path=from_version.data_snapshot_path,
            metadata=from_version.metadata,
            author="system"
        )
        
        self.db.add(new_version)
        self.db.commit()
        return new_version
    
    def cleanup_old_versions(self, project_id: str, keep_count: int = 50):
        """清理旧版本，只保留最近的N个版本"""
        versions = self.db.query(DataVersion).filter_by(
            project_id=project_id
        ).order_by(desc(DataVersion.created_at)).all()
        
        if len(versions) > keep_count:
            old_versions = versions[keep_count:]
            for version in old_versions:
                # 从MinIO删除数据快照
                try:
                    self.minio.delete_object(self.bucket_name, version.data_snapshot_path)
                except:
                    pass
                
                # 删除数据库记录
                self.db.delete(version)
            
            self.db.commit()