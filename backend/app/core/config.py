import os
from typing import List
from pydantic import BaseSettings

class Settings(BaseSettings):
    # 数据库配置
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/dp_agent"
    )
    
    # MinIO配置
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    MINIO_ACCESS_KEY: str = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
    MINIO_SECRET_KEY: str = os.getenv("MINIO_SECRET_KEY", "minioadmin")
    MINIO_SECURE: bool = os.getenv("MINIO_SECURE", "false").lower() == "true"
    MINIO_BUCKET_PREFIX: str = "dp-agent"
    
    # OpenAI配置
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    
    # Docker配置
    DOCKER_IMAGE: str = "python:3.9-slim"
    SANDBOX_MEMORY_LIMIT: str = "2g"
    SANDBOX_CPU_LIMIT: float = 1.0
    
    # 应用配置
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # CORS配置
    CORS_ORIGINS: List[str] = ["*"]
    
    # 版本控制配置
    VERSION_RETENTION_DAYS: int = int(os.getenv("VERSION_RETENTION_DAYS", "30"))
    MAX_VERSIONS_PER_PROJECT: int = int(os.getenv("MAX_VERSIONS_PER_PROJECT", "100"))
    
    class Config:
        env_file = ".env"

settings = Settings()