import os
import sys

# 添加app目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.core.database import engine, Base
from app.core.config import settings

# 创建数据库表
Base.metadata.create_all(bind=engine)

# FastAPI应用
app = FastAPI(
    title="DP Agent - 数据处理智能体系统",
    description="基于自然语言的数据处理和分析平台",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(api_router)

@app.get("/")
async def root():
    return {
        "message": "DP Agent API 正在运行",
        "version": "1.0.0",
        "docs": "/docs",
        "features": [
            "自然语言数据处理",
            "Git-like版本控制",
            "Docker沙箱执行",
            "多轮对话管理",
            "数据质量探查"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z",
        "services": {
            "database": "connected",
            "minio": "connected",
            "docker": "connected"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
