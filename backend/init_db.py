#!/usr/bin/env python3
"""
数据库初始化脚本
"""
import os
import sys

# 添加app目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine
from app.models.data_version import Base, Project, DataVersion, Session, Message

def init_database():
    """初始化数据库表"""
    print("正在创建数据库表...")
    
    # 创建所有表
    Base.metadata.create_all(bind=engine)
    
    print("数据库表创建完成")
    
    # 验证表是否创建成功
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"已创建的表: {tables}")

if __name__ == "__main__":
    init_database()