import docker
import tempfile
import os
import uuid
import json
import time
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class SecureCodeExecutor:
    """安全代码执行器，使用Docker容器沙箱"""
    
    def __init__(self):
        self.client = docker.from_env()
        self.container_timeout = 30  # 容器最大运行时间（秒）
        self.memory_limit = '2g'    # 内存限制
        self.cpu_limit = '1'        # CPU限制
        
    def execute_python_script(self, script: str, input_data_path: str, 
                           output_data_path: str) -> Dict[str, Any]:
        """
        在安全的Docker容器中执行Python脚本
        
        Args:
            script: 要执行的Python代码
            input_data_path: 输入数据文件路径
            output_data_path: 输出数据文件路径
            
        Returns:
            执行结果字典
        """
        container_name = f"dp-sandbox-{uuid.uuid4().hex[:8]}"
        
        # 创建临时目录用于脚本和数据交换
        with tempfile.TemporaryDirectory() as temp_dir:
            script_path = os.path.join(temp_dir, "script.py")
            
            # 准备完整的执行脚本
            full_script = f"""
import sys
import traceback
import json
import polars as pl
import os

# 设置安全限制
sys.setrecursionlimit(1000)

# 读取输入数据
try:
    if '{input_data_path}'.endswith('.csv'):
        df = pl.read_csv('{input_data_path}')
    elif '{input_data_path}'.endswith('.xlsx'):
        df = pl.read_excel('{input_data_path}')
    else:
        raise ValueError("不支持的文件格式")
    
    # 执行用户代码
{script}
    
    # 保存结果
    result_df.write_csv('{output_data_path}')
    
    # 返回统计信息
    stats = {{
        'rows': len(result_df),
        'columns': len(result_df.columns),
        'columns_list': result_df.columns,
        'dtypes': {{col: str(dtype) for col, dtype in result_df.schema.items()}}
    }}
    
    print(json.dumps(stats))
    
except Exception as e:
    error_info = {{
        'error': str(e),
        'traceback': traceback.format_exc()
    }}
    print(json.dumps(error_info))
    sys.exit(1)
"""
            
            with open(script_path, 'w', encoding='utf-8') as f:
                f.write(full_script)
            
            try:
                # 启动Docker容器
                container = self.client.containers.run(
                    image='python:3.10-slim',
                    command=['python', '/sandbox/script.py'],
                    name=container_name,
                    volumes={
                        temp_dir: {'bind': '/sandbox', 'mode': 'rw'},
                        os.path.dirname(input_data_path): {'bind': '/data', 'mode': 'ro'}
                    },
                    working_dir='/sandbox',
                    mem_limit=self.memory_limit,
                    cpu_quota=int(self.cpu_limit) * 100000,
                    network_mode='none',  # 禁用网络访问
                    read_only=True,       # 只读文件系统
                    tmpfs={'/tmp': 'size=100m'},  # 临时文件系统
                    remove=True,          # 容器退出后自动删除
                    detach=True,
                    stdout=True,
                    stderr=True
                )
                
                # 等待容器完成
                result = container.wait(timeout=self.container_timeout)
                
                # 获取输出
                logs = container.logs().decode('utf-8').strip()
                
                if result['StatusCode'] == 0:
                    # 解析成功结果
                    try:
                        stats = json.loads(logs.split('\n')[-1])
                        return {
                            'success': True,
                            'stats': stats,
                            'output_path': output_data_path
                        }
                    except json.JSONDecodeError:
                        return {
                            'success': True,
                            'message': '执行成功',
                            'raw_output': logs
                        }
                else:
                    # 解析错误信息
                    try:
                        error_info = json.loads(logs)
                        return {
                            'success': False,
                            'error': error_info.get('error', '执行失败'),
                            'traceback': error_info.get('traceback', '')
                        }
                    except json.JSONDecodeError:
                        return {
                            'success': False,
                            'error': logs
                        }
                        
            except docker.errors.ContainerError as e:
                return {
                    'success': False,
                    'error': f'容器执行错误: {str(e)}'
                }
            except docker.errors.ImageNotFound:
                return {
                    'success': False,
                    'error': 'Python镜像未找到'
                }
            except Exception as e:
                return {
                    'success': False,
                    'error': f'执行异常: {str(e)}'
                }

    def validate_script(self, script: str) -> bool:
        """验证脚本安全性"""
        dangerous_imports = [
            'os.system', 'subprocess', 'socket', 'urllib', 'requests',
            '__import__', 'eval', 'exec', 'compile', 'open('
        ]
        
        for dangerous in dangerous_imports:
            if dangerous in script:
                return False
                
        return True