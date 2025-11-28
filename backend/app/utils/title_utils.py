"""
统一的标题生成工具函数
用于消除重复的标题生成逻辑，确保一致性
"""
import re
from typing import List
from app.config.title_config import (
    TITLE_FORMAT_RULES,
    SPECIAL_CASES,
    SOLUTION_TO_PROBLEM_MAPPING,
    VALIDATION_RULES
)


class TitleUtils:
    """标题生成工具类"""
    
    @staticmethod
    def generate_title(
        description: str,
        system_types: List[str],
        modules: List[str],
        problem_type: str = "设计需求优化"
    ) -> str:
        """
        生成标准格式的标题
        格式：【地区：模块】问题描述
        """
        if not description:
            description = "问题描述需要优化"
        
        # 提取标题内容
        content = TitleUtils._extract_title_content(description, problem_type)
        
        # 格式化前缀
        prefix = TitleUtils.format_region_module_prefix(system_types, modules)
        
        # 组合标题
        title = f"{prefix}{content}"
        
        # 验证并调整长度
        if len(title) > TITLE_FORMAT_RULES["max_length"]:
            # 如果超长，截断内容部分
            max_content_length = TITLE_FORMAT_RULES["max_length"] - len(prefix)
            if max_content_length > 0:
                content = content[:max_content_length]
                title = f"{prefix}{content}"
            else:
                # 如果前缀本身就超长，只保留前缀
                title = prefix
        
        return title
    
    @staticmethod
    def _extract_title_content(description: str, problem_type: str) -> str:
        """
        从描述中提取标题内容
        智能提取核心问题，去除冗余信息
        """
        if not description:
            return "问题描述需要优化"
        
        content = description.strip()
        
        # 移除常见的冗余前缀
        content = re.sub(r'^(用户反馈|问题|反馈|建议)[：:]\s*', '', content)
        
        # 处理特殊情况：对齐希望模式
        align_match = re.search(SPECIAL_CASES["align_wish_pattern"], content)
        if align_match:
            subject = align_match.group(1).strip()
            if subject:
                content = f"{subject}与设计稿不一致"
        
        # 处理设计不一致模式
        if re.search(SPECIAL_CASES["design_inconsistent_pattern"], content):
            # 提取主体部分
            parts = re.split(r'[，。\n]', content)
            for part in parts:
                if '设计' in part or '设计稿' in part:
                    content = part.strip()
                    break
        
        # 移除解决方案关键词开头的部分
        for keyword in SPECIAL_CASES["solution_keywords"]:
            if content.startswith(keyword):
                # 尝试找到问题描述部分
                parts = re.split(r'[，。；\n]', content)
                problem_parts = []
                for part in parts:
                    if not any(kw in part for kw in SPECIAL_CASES["solution_keywords"]):
                        problem_parts.append(part.strip())
                if problem_parts:
                    content = problem_parts[0]
                break
        
        # 应用解决方案到问题的映射
        for solution, problem in SOLUTION_TO_PROBLEM_MAPPING.items():
            if solution in content:
                # 如果内容主要是解决方案，转换为问题描述
                if any(kw in content for kw in SPECIAL_CASES["solution_keywords"]):
                    content = problem
                    break
        
        # 清理和截断
        content = re.sub(r'\s+', ' ', content)  # 合并多个空格
        content = content.strip()
        
        # 限制长度
        max_length = TITLE_FORMAT_RULES["content_max_length"]
        if len(content) > max_length:
            # 尝试在句号、逗号处截断
            truncated = content[:max_length]
            last_punctuation = max(
                truncated.rfind('。'),
                truncated.rfind('，'),
                truncated.rfind('、')
            )
            if last_punctuation > max_length * 0.5:  # 如果标点位置合理
                content = truncated[:last_punctuation + 1]
            else:
                content = truncated
        
        return content if content else "问题描述需要优化"
    
    @staticmethod
    def format_region_module_prefix(system_types: List[str], modules: List[str]) -> str:
        """
        格式化地区模块前缀
        格式：【地区：模块】
        """
        # 处理多选地区
        if len(system_types) > 1:
            region = "+".join(system_types)
        else:
            region = system_types[0] if system_types else "未知地区"
        
        # 根据要求，终端只显示第一个
        module = modules[0] if modules else "未知模块"
        
        # 构建前缀
        prefix = TITLE_FORMAT_RULES["prefix_format"].format(
            region=region,
            module=module
        )
        
        return prefix
    
    @staticmethod
    def validate_title(title: str) -> bool:
        """
        验证标题格式是否符合要求
        """
        if not title or not title.strip():
            return False
        
        title = title.strip()
        
        # 检查长度
        if len(title) < TITLE_FORMAT_RULES["min_length"]:
            return False
        
        if len(title) > TITLE_FORMAT_RULES["max_length"]:
            return False
        
        # 检查前缀（如果要求）
        if VALIDATION_RULES["required_prefix"]:
            if not re.search(r'【.*：.*】', title):
                return False
        
        # 检查内容（如果要求）
        if VALIDATION_RULES["required_content"]:
            # 移除前缀后检查是否有内容
            content = re.sub(r'【.*：.*】', '', title).strip()
            if not content or len(content) < 3:
                return False
        
        # 检查词数
        words = title.split()
        if len(words) < VALIDATION_RULES["min_words"]:
            return False
        
        if len(words) > VALIDATION_RULES["max_words"]:
            return False
        
        return True
