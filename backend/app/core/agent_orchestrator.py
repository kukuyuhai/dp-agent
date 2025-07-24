import openai
import json
import re
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

class IntentParameter(BaseModel):
    operation: str
    target_column: Optional[str] = None
    condition: Optional[str] = None
    value: Optional[Any] = None
    new_column: Optional[str] = None

class AgentOrchestrator:
    """智能体编排器，负责意图理解和代码生成"""
    
    def __init__(self, api_key: str):
        openai.api_key = api_key
        self.model = "gpt-4o-mini"  # 可根据需要切换模型
        
    def extract_intent(self, instruction: str, data_info: Dict[str, Any]) -> IntentParameter:
        """从自然语言指令中提取结构化意图参数"""
        
        prompt = f"""
你是一个数据处理智能体，负责将用户的自然语言指令转换为结构化的数据处理操作。

数据信息：
{json.dumps(data_info, ensure_ascii=False, indent=2)}

用户指令：{instruction}

请从指令中提取以下结构化参数：
- operation: 操作类型（如：filter, clean, transform, aggregate, sort等）
- target_column: 目标列名
- condition: 条件表达式（如果有）
- value: 操作值（如果有）
- new_column: 新列名（如果有）

返回格式必须是有效的JSON，不要添加解释：
{{
    "operation": "操作类型",
    "target_column": "列名",
    "condition": "条件",
    "value": 值,
    "new_column": "新列名"
}}
"""
        
        try:
            response = openai.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=200
            )
            
            result = response.choices[0].message.content
            params = json.loads(result)
            return IntentParameter(**params)
            
        except Exception as e:
            logger.error(f"意图提取失败: {e}")
            # 回退到简单的关键词匹配
            return self._fallback_intent_extraction(instruction, data_info)
    
    def generate_polars_code(self, intent: IntentParameter, data_info: Dict[str, Any]) -> str:
        """根据意图参数生成Polars代码"""
        
        columns = data_info.get('columns', [])
        
        code_map = {
            'filter': self._generate_filter_code,
            'clean': self._generate_clean_code,
            'transform': self._generate_transform_code,
            'aggregate': self._generate_aggregate_code,
            'sort': self._generate_sort_code,
            'drop': self._generate_drop_code,
            'rename': self._generate_rename_code,
            'fillna': self._generate_fillna_code
        }
        
        generator = code_map.get(intent.operation)
        if generator:
            return generator(intent, columns)
        else:
            return self._generate_custom_code(intent, data_info)
    
    def _generate_filter_code(self, intent: IntentParameter, columns: List[str]) -> str:
        """生成过滤代码"""
        if not intent.condition:
            return "result_df = df.clone()"
        
        # 智能解析条件
        condition = intent.condition.lower()
        column = intent.target_column
        
        if '大于' in condition or '>' in condition:
            value = self._extract_number(condition)
            return f"result_df = df.filter(pl.col('{column}') > {value})"
        elif '小于' in condition or '<' in condition:
            value = self._extract_number(condition)
            return f"result_df = df.filter(pl.col('{column}') < {value})"
        elif '等于' in condition or '等于' in condition:
            value = self._extract_value(condition)
            return f"result_df = df.filter(pl.col('{column}') == {value})"
        elif '包含' in condition or '包含' in condition:
            value = self._extract_string(condition)
            return f"result_df = df.filter(pl.col('{column}').str.contains('{value}'))"
        else:
            return f"result_df = df.filter(pl.col('{column}') {condition})"
    
    def _generate_clean_code(self, intent: IntentParameter, columns: List[str]) -> str:
        """生成数据清洗代码"""
        column = intent.target_column
        
        if '异常值' in str(intent.condition) or '异常' in str(intent.value):
            return f"""
# 使用IQR方法识别异常值
q1 = df['{column}'].quantile(0.25)
q3 = df['{column}'].quantile(0.75)
iqr = q3 - q1
lower_bound = q1 - 1.5 * iqr
upper_bound = q3 + 1.5 * iqr
result_df = df.filter((pl.col('{column}') >= lower_bound) & (pl.col('{column}') <= upper_bound))
"""
        elif '重复' in str(intent.condition):
            return f"result_df = df.unique(subset=['{column}'])"
        elif '空值' in str(intent.condition) or '缺失' in str(intent.condition):
            return f"result_df = df.filter(pl.col('{column}').is_not_null())"
        else:
            return f"result_df = df.clone()"
    
    def _generate_transform_code(self, intent: IntentParameter, columns: List[str]) -> str:
        """生成数据转换代码"""
        column = intent.target_column
        new_column = intent.new_column or f"{column}_transformed"
        
        if intent.value and isinstance(intent.value, str):
            if intent.value.startswith('lambda'):
                return f"result_df = df.with_columns(pl.col('{column}').apply({intent.value}).alias('{new_column}'))"
            else:
                return f"result_df = df.with_columns(pl.col('{column}').{intent.value}().alias('{new_column}'))"
        else:
            return f"result_df = df.clone()"
    
    def _generate_aggregate_code(self, intent: IntentParameter, columns: List[str]) -> str:
        """生成聚合代码"""
        group_by = intent.target_column
        agg_column = intent.new_column or columns[0] if columns else 'value'
        
        return f"""
result_df = df.group_by('{group_by}').agg([
    pl.count().alias('count'),
    pl.mean('{agg_column}').alias('mean'),
    pl.median('{agg_column}').alias('median'),
    pl.std('{agg_column}').alias('std')
])
"""
    
    def _generate_sort_code(self, intent: IntentParameter, columns: List[str]) -> str:
        """生成排序代码"""
        column = intent.target_column
        ascending = 'descending=False' if '升序' in str(intent.condition) else 'descending=True'
        return f"result_df = df.sort('{column}', {ascending})"
    
    def _generate_drop_code(self, intent: IntentParameter, columns: List[str]) -> str:
        """生成删除列代码"""
        return f"result_df = df.drop(['{intent.target_column}'])"
    
    def _generate_rename_code(self, intent: IntentParameter, columns: List[str]) -> str:
        """生成重命名代码"""
        new_name = intent.new_column or intent.target_column
        return f"result_df = df.rename({{'{intent.target_column}': '{new_name}'}})"
    
    def _generate_fillna_code(self, intent: IntentParameter, columns: List[str]) -> str:
        """生成填充空值代码"""
        column = intent.target_column
        fill_value = intent.value or 0
        return f"result_df = df.with_columns(pl.col('{column}').fill_null({fill_value}))"
    
    def _generate_custom_code(self, intent: IntentParameter, data_info: Dict[str, Any]) -> str:
        """生成自定义代码"""
        return f"# 自定义操作\nresult_df = df.clone()"
    
    def _fallback_intent_extraction(self, instruction: str, data_info: Dict[str, Any]) -> IntentParameter:
        """回退意图提取方法"""
        instruction_lower = instruction.lower()
        
        # 简单的关键词匹配
        if any(word in instruction_lower for word in ['删除', 'drop', '去掉']):
            return IntentParameter(
                operation='drop',
                target_column=self._extract_column_name(instruction, data_info.get('columns', []))
            )
        elif any(word in instruction_lower for word in ['过滤', '筛选']):
            return IntentParameter(
                operation='filter',
                target_column=self._extract_column_name(instruction, data_info.get('columns', [])),
                condition=instruction
            )
        elif any(word in instruction_lower for word in ['排序', 'sort']):
            return IntentParameter(
                operation='sort',
                target_column=self._extract_column_name(instruction, data_info.get('columns', []))
            )
        else:
            return IntentParameter(operation='custom', target_column=None)
    
    def _extract_number(self, text: str) -> float:
        """从文本中提取数字"""
        numbers = re.findall(r'-?\d+(?:\.\d+)?', str(text))
        return float(numbers[0]) if numbers else 0
    
    def _extract_string(self, text: str) -> str:
        """从文本中提取字符串值"""
        # 简单的引号匹配
        match = re.search(r'["\']([^"\']+)["\']', str(text))
        if match:
            return match.group(1)
        
        # 提取中文词语
        words = re.findall(r'[\u4e00-\u9fff]+', str(text))
        return words[0] if words else ''
    
    def _extract_value(self, text: str) -> Any:
        """提取值（数字或字符串）"""
        try:
            return self._extract_number(text)
        except:
            return self._extract_string(text)
    
    def _extract_column_name(self, text: str, columns: List[str]) -> Optional[str]:
        """从文本中提取列名"""
        text_lower = text.lower()
        for col in columns:
            if col.lower() in text_lower:
                return col
        return columns[0] if columns else None