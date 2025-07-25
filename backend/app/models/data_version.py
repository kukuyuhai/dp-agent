from sqlalchemy import Column, String, DateTime, JSON, Text, Integer, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    versions = relationship("DataVersion", back_populates="project")
    sessions = relationship("Session", back_populates="project")

class DataVersion(Base):
    __tablename__ = "data_versions"
    
    id = Column(String(40), primary_key=True)  # Git-like commit hash
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    parent_id = Column(String(40), ForeignKey("data_versions.id"))
    message = Column(Text, nullable=False)  # 操作描述
    code = Column(Text)  # 生成的Python代码
    data_snapshot_path = Column(String(500))  # 数据快照在MinIO中的路径
    meta_info = Column(JSON)  # 数据元信息（行列数、列类型等）
    created_at = Column(DateTime, default=datetime.utcnow)
    author = Column(String(100))
    
    # 关联关系
    project = relationship("Project", back_populates="versions")
    parent = relationship("DataVersion", remote_side=[id])
    children = relationship("DataVersion")

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    title = Column(String(255), default="新对话")
    current_version_id = Column(String(40), ForeignKey("data_versions.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    project = relationship("Project", back_populates="sessions")
    current_version = relationship("DataVersion")
    messages = relationship("Message", back_populates="session")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    meta_data = Column(JSON)  # 包含参数提取结果等
    version_id = Column(String(40), ForeignKey("data_versions.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关联关系
    session = relationship("Session", back_populates="messages")
    version = relationship("DataVersion")