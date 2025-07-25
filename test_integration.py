#!/usr/bin/env python3
"""
集成测试脚本，验证前后端接口联调
"""

import asyncio
import aiohttp
import json
from typing import Dict, Any

# 测试配置
BASE_URL = "http://localhost:8000"
TEST_PROJECT_NAME = "测试项目"
TEST_MESSAGE = "请删除空值行"

async def test_api_endpoints():
    """测试API端点是否正常工作"""
    
    print("🚀 开始测试DP Agent集成...")
    
    async with aiohttp.ClientSession() as session:
        try:
            # 1. 测试健康检查
            print("📊 测试健康检查...")
            async with session.get(f"{BASE_URL}/api/v1/health") as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print(f"✅ 健康检查通过: {data}")
                else:
                    print(f"❌ 健康检查失败: {resp.status}")
                    return False
            
            # 2. 创建测试项目
            print("\n🏗️  创建测试项目...")
            async with session.post(
                f"{BASE_URL}/api/v1/projects",
                json={"name": TEST_PROJECT_NAME, "description": "测试项目描述"}
            ) as resp:
                if resp.status == 200:
                    project_data = await resp.json()
                    project_id = project_data["id"]
                    print(f"✅ 项目创建成功: {project_id}")
                else:
                    print(f"❌ 项目创建失败: {resp.status}")
                    return False
            
            # 3. 创建会话
            print("\n💬 创建会话...")
            async with session.post(
                f"{BASE_URL}/api/v1/sessions",
                data={"project_id": project_id, "title": "测试会话"}
            ) as resp:
                if resp.status == 200:
                    session_data = await resp.json()
                    session_id = session_data["id"]
                    print(f"✅ 会话创建成功: {session_id}")
                else:
                    print(f"❌ 会话创建失败: {resp.status}")
                    return False
            
            # 4. 测试聊天接口
            print("\n🤖 测试聊天接口...")
            async with session.post(
                f"{BASE_URL}/api/v1/chat",
                json={"session_id": session_id, "message": TEST_MESSAGE}
            ) as resp:
                if resp.status == 200:
                    chat_data = await resp.json()
                    print(f"✅ 聊天接口正常: {chat_data['status']}")
                    print(f"📝 响应: {chat_data['message'][:100]}...")
                else:
                    error_text = await resp.text()
                    print(f"❌ 聊天接口失败: {resp.status} - {error_text}")
                    return False
            
            # 5. 测试会话历史
            print("\n📜 测试会话历史...")
            async with session.get(f"{BASE_URL}/api/v1/sessions/{session_id}/history") as resp:
                if resp.status == 200:
                    history_data = await resp.json()
                    print(f"✅ 会话历史正常: {len(history_data)} 条消息")
                    for msg in history_data:
                        print(f"  - {msg['role']}: {msg['content'][:50]}...")
                else:
                    print(f"❌ 会话历史失败: {resp.status}")
                    return False
            
            print(f"\n🎉 所有测试通过！项目ID: {project_id}, 会话ID: {session_id}")
            return True
            
        except Exception as e:
            print(f"❌ 测试过程中发生错误: {e}")
            return False

if __name__ == "__main__":
    asyncio.run(test_api_endpoints())