import os
from minio import Minio
from minio.error import S3Error
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class MinIOClient:
    """MinIO客户端封装"""
    
    def __init__(self):
        self.client = Minio(
            endpoint=os.getenv('MINIO_ENDPOINT', 'localhost:9000'),
            access_key=os.getenv('MINIO_ACCESS_KEY', 'minioadmin'),
            secret_key=os.getenv('MINIO_SECRET_KEY', 'minioadmin'),
            secure=os.getenv('MINIO_SECURE', 'false').lower() == 'true'
        )
    
    def ensure_bucket_exists(self, bucket_name: str) -> bool:
        """确保存储桶存在"""
        try:
            if not self.client.bucket_exists(bucket_name):
                self.client.make_bucket(bucket_name)
                logger.info(f"创建存储桶: {bucket_name}")
            return True
        except S3Error as e:
            logger.error(f"创建存储桶失败: {e}")
            return False
    
    def upload_file(self, file_path: str, bucket_name: str, object_name: str) -> bool:
        """上传文件到MinIO"""
        try:
            self.ensure_bucket_exists(bucket_name)
            self.client.fput_object(bucket_name, object_name, file_path)
            logger.info(f"文件上传成功: {object_name}")
            return True
        except S3Error as e:
            logger.error(f"文件上传失败: {e}")
            return False
    
    def download_file(self, bucket_name: str, object_name: str, file_path: str) -> bool:
        """从MinIO下载文件"""
        try:
            self.client.fget_object(bucket_name, object_name, file_path)
            logger.info(f"文件下载成功: {object_name}")
            return True
        except S3Error as e:
            logger.error(f"文件下载失败: {e}")
            return False
    
    def delete_object(self, bucket_name: str, object_name: str) -> bool:
        """删除对象"""
        try:
            self.client.remove_object(bucket_name, object_name)
            logger.info(f"对象删除成功: {object_name}")
            return True
        except S3Error as e:
            logger.error(f"对象删除失败: {e}")
            return False
    
    def list_objects(self, bucket_name: str, prefix: str = "") -> list:
        """列出存储桶中的对象"""
        try:
            objects = self.client.list_objects(bucket_name, prefix=prefix)
            return [obj.object_name for obj in objects]
        except S3Error as e:
            logger.error(f"列出对象失败: {e}")
            return []