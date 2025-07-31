import polars as pl
import numpy as np
from typing import Dict, Any, List
import logging
import os
from datetime import datetime

logger = logging.getLogger(__name__)

class DataProfiler:
    """数据探查服务，提供数据质量报告和统计信息"""
    
    def __init__(self):
        pass
    
    def profile_data(self, file_path: str) -> Dict[str, Any]:
        """全面探查数据文件"""
        try:
            # 获取文件扩展名（转换为小写）
            file_ext = os.path.splitext(file_path)[1].lower()
            
            # 调试信息
            print(f"处理文件: {file_path}")
            print(f"文件扩展名: {file_ext}")
            
            # 加载数据
            if file_ext == '.csv' or file_ext == '.tsv':
                # 使用chardet检测文件编码并读取CSV文件
                import chardet
                
                # 检测文件编码
                with open(file_path, 'rb') as f:
                    raw_data = f.read(10000)  # 读取前10KB用于检测编码
                    encoding_result = chardet.detect(raw_data)
                    detected_encoding = encoding_result['encoding'] or 'utf-8'
                
                # 设置分隔符
                separator = '\t' if file_ext == '.tsv' else ','
                
                # 使用检测到的编码读取文件
                try:
                    # 尝试使用polars的encoding参数
                    df = pl.read_csv(file_path, separator=separator, encoding=detected_encoding)
                except TypeError:
                    # 如果polars版本不支持encoding参数，使用pandas作为后备
                    import pandas as pd
                    df = pl.from_pandas(pd.read_csv(file_path, sep=separator, encoding=detected_encoding))
                except Exception:
                    # 如果检测失败，尝试常见编码
                    for encoding in ['utf-8', 'gbk', 'gb18030', 'latin-1']:
                        try:
                            try:
                                df = pl.read_csv(file_path, separator=separator, encoding=encoding)
                            except TypeError:
                                import pandas as pd
                                df = pl.from_pandas(pd.read_csv(file_path, sep=separator, encoding=encoding))
                            break
                        except Exception:
                            continue
                    else:
                        # 最后尝试使用替换模式读取
                        try:
                            df = pl.read_csv(file_path, separator=separator, encoding='utf-8', encoding_errors='replace')
                        except TypeError:
                            import pandas as pd
                            df = pl.from_pandas(pd.read_csv(file_path, sep=separator, encoding='utf-8', encoding_errors='replace'))
            elif file_ext in ['.xlsx', '.xls']:
                df = pl.read_excel(file_path)
            elif file_ext == '.parquet':
                df = pl.read_parquet(file_path)
            else:
                raise ValueError(f"不支持的文件格式: {file_ext}")
                
            print(f"成功加载数据，形状: {df.shape}")
            
            return {
                'basic_info': self._get_basic_info(df),
                'columns': self._analyze_columns(df),
                'quality_report': self._generate_quality_report(df),
                'statistics': self._calculate_statistics(df),
                'data_types': self._analyze_data_types(df),
                'sample_data': self._get_sample_data(df)
            }
            
        except Exception as e:
            logger.error(f"数据探查失败: {e}")
            raise
    
    def _get_basic_info(self, df: pl.DataFrame) -> Dict[str, Any]:
        """获取基本数据信息"""
        return {
            'total_rows': len(df),
            'total_columns': len(df.columns),
            'memory_usage': df.estimated_size(),
            'column_names': df.columns
        }
    
    def _analyze_columns(self, df: pl.DataFrame) -> Dict[str, Any]:
        """分析每列的详细信息"""
        columns_info = {}
        
        for col in df.columns:
            series = df[col]
            null_count = series.null_count()
            unique_count = series.n_unique()
            
            col_info = {
                'name': col,
                'dtype': str(series.dtype),
                'null_count': null_count,
                'null_percentage': (null_count / len(df)) * 100,
                'unique_count': unique_count,
                'unique_percentage': (unique_count / len(df)) * 100,
                'is_numeric': series.dtype in [pl.Int8, pl.Int16, pl.Int32, pl.Int64, 
                                             pl.UInt8, pl.UInt16, pl.UInt32, pl.UInt64,
                                             pl.Float32, pl.Float64]
            }
            
            # 添加数据类型特定的统计
            if col_info['is_numeric']:
                col_info.update({
                    'min': float(series.min()) if null_count < len(df) else None,
                    'max': float(series.max()) if null_count < len(df) else None,
                    'mean': float(series.mean()) if null_count < len(df) else None,
                    'median': float(series.median()) if null_count < len(df) else None,
                    'std': float(series.std()) if null_count < len(df) else None
                })
            else:
                # 文本数据
                non_null_values = series.drop_nulls()
                if len(non_null_values) > 0:
                    value_counts = non_null_values.value_counts().head(10)
                    col_info.update({
                        'top_values': value_counts.to_dicts(),
                        'avg_length': non_null_values.str.len_chars().mean()
                    })
            
            columns_info[col] = col_info
        
        return columns_info
    
    def _generate_quality_report(self, df: pl.DataFrame) -> Dict[str, Any]:
        """生成数据质量报告"""
        report = {
            'overall_score': 0,
            'issues': [],
            'recommendations': []
        }
        
        # 检查空值
        null_counts = {col: df[col].null_count() for col in df.columns}
        total_rows = len(df)
        
        for col, null_count in null_counts.items():
            null_percentage = (null_count / total_rows) * 100
            if null_percentage > 50:
                report['issues'].append({
                    'type': 'high_null_rate',
                    'column': col,
                    'severity': 'high',
                    'description': f'列 {col} 空值率过高 ({null_percentage:.1f}%)'
                })
                report['recommendations'].append(f'考虑删除列 {col} 或填充缺失值')
            elif null_percentage > 20:
                report['issues'].append({
                    'type': 'medium_null_rate',
                    'column': col,
                    'severity': 'medium',
                    'description': f'列 {col} 空值率较高 ({null_percentage:.1f}%)'
                })
        
        # 检查重复行
        duplicate_count = len(df) - len(df.unique())
        if duplicate_count > 0:
            duplicate_percentage = (duplicate_count / len(df)) * 100
            report['issues'].append({
                'type': 'duplicates',
                'severity': 'medium',
                'description': f'发现 {duplicate_count} 行重复数据 ({duplicate_percentage:.1f}%)'
            })
            report['recommendations'].append('建议删除重复行')
        
        # 检查异常值（数值列）
        for col in df.columns:
            if df[col].dtype in [pl.Float32, pl.Float64, pl.Int8, pl.Int16, pl.Int32, pl.Int64]:
                series = df[col].drop_nulls()
                if len(series) > 0:
                    q1 = float(series.quantile(0.25))
                    q3 = float(series.quantile(0.75))
                    iqr = q3 - q1
                    lower_bound = q1 - 1.5 * iqr
                    upper_bound = q3 + 1.5 * iqr
                    
                    outliers = series.filter((series < lower_bound) | (series > upper_bound))
                    if len(outliers) > 0:
                        outlier_percentage = (len(outliers) / len(series)) * 100
                        if outlier_percentage > 5:
                            report['issues'].append({
                                'type': 'outliers',
                                'column': col,
                                'severity': 'medium',
                                'description': f'列 {col} 发现异常值 ({outlier_percentage:.1f}%)'
                            })
        
        # 计算总体质量分数
        issue_count = len(report['issues'])
        if issue_count == 0:
            report['overall_score'] = 100
        elif issue_count <= 2:
            report['overall_score'] = 80
        elif issue_count <= 5:
            report['overall_score'] = 60
        else:
            report['overall_score'] = 40
        
        return report
    
    def _calculate_statistics(self, df: pl.DataFrame) -> Dict[str, Any]:
        """计算综合统计信息"""
        stats = {
            'numeric_summary': {},
            'categorical_summary': {}
        }
        
        # 数值列统计
        numeric_cols = [col for col in df.columns 
                       if df[col].dtype in [pl.Float32, pl.Float64, pl.Int8, pl.Int16, pl.Int32, pl.Int64]]
        
        if numeric_cols:
            numeric_df = df.select(numeric_cols)
            stats['numeric_summary'] = {
                'count': len(numeric_df),
                'mean': {col: float(numeric_df[col].mean()) for col in numeric_cols},
                'std': {col: float(numeric_df[col].std()) for col in numeric_cols},
                'min': {col: float(numeric_df[col].min()) for col in numeric_cols},
                'max': {col: float(numeric_df[col].max()) for col in numeric_cols}
            }
        
        # 分类列统计
        categorical_cols = [col for col in df.columns 
                          if df[col].dtype in [pl.Utf8, pl.Categorical]]
        
        for col in categorical_cols:
            value_counts = df[col].drop_nulls().value_counts()
            stats['categorical_summary'][col] = {
                'unique_count': df[col].n_unique(),
                'top_values': value_counts.head(5).to_dicts()
            }
        
        return stats
    
    def _analyze_data_types(self, df: pl.DataFrame) -> Dict[str, Any]:
        """分析数据类型分布"""
        type_counts = {}
        for col in df.columns:
            dtype = str(df[col].dtype)
            type_counts[dtype] = type_counts.get(dtype, 0) + 1
        
        return {
            'type_distribution': type_counts,
            'datetime_columns': self._detect_datetime_columns(df),
            'numeric_columns': [col for col in df.columns 
                              if df[col].dtype in [pl.Float32, pl.Float64, pl.Int8, pl.Int16, pl.Int32, pl.Int64]],
            'text_columns': [col for col in df.columns 
                           if df[col].dtype in [pl.Utf8]]
        }
    
    def _detect_datetime_columns(self, df: pl.DataFrame) -> List[str]:
        """检测可能的日期时间列"""
        datetime_candidates = []
        
        for col in df.columns:
            if df[col].dtype == pl.Utf8:
                # 尝试解析为日期
                try:
                    sample_values = df[col].drop_nulls().head(10)
                    for val in sample_values:
                        if val and self._is_datetime_string(str(val)):
                            datetime_candidates.append(col)
                            break
                except:
                    continue
        
        return datetime_candidates
    
    def _is_datetime_string(self, value: str) -> bool:
        """判断字符串是否为日期格式"""
        import re
        # 常见的日期格式
        patterns = [
            r'\d{4}-\d{2}-\d{2}',  # YYYY-MM-DD
            r'\d{2}/\d{2}/\d{4}',  # MM/DD/YYYY
            r'\d{2}-\d{2}-\d{4}',  # MM-DD-YYYY
            r'\d{4}/\d{2}/\d{2}',  # YYYY/MM/DD
        ]
        
        for pattern in patterns:
            if re.match(pattern, value):
                return True
        return False
    
    def _get_sample_data(self, df: pl.DataFrame) -> Dict[str, Any]:
        """获取样本数据用于预览"""
        return {
            'head': df.head(5).to_dicts(),
            'tail': df.tail(5).to_dicts(),
            'shape': df.shape
        }