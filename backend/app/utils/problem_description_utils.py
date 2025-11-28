"""
统一的问题描述生成工具函数
用于消除重复的问题描述生成逻辑，确保一致性
"""
import re
from typing import List, Dict, Any, Optional, Tuple
from app.config.problem_description_config import (
    PROBLEM_DESCRIPTION_REQUIREMENTS,
    TEXT_CLEANING_RULES,
    PROBLEM_SOLUTION_SEPARATORS,
    PROBLEM_DESCRIPTION_ENRICHMENT,
    SPECIAL_CASES,
    VALIDATION_RULES
)


class ProblemDescriptionUtils:
    """问题描述生成工具类"""
    
    @staticmethod
    def split_problem_and_solution(description: str) -> Tuple[str, str]:
        """
        统一的拆分问题和解决方案逻辑
        处理混合输入（问题+解决方案）的智能拆分
        """
        if not description or not description.strip():
            return "", ""
        
        text = description.strip()
        
        # 使用统一的分隔符规则
        for pattern in PROBLEM_SOLUTION_SEPARATORS:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                problem_text = text[:match.start()].strip()
                solution_text = text[match.start():].strip()
                
                # 特殊处理：如果匹配到"建议"相关的分隔符，保持完整文本
                if '建议' in pattern:
                    solution_text = solution_text
                else:
                    # 其他情况删除匹配的分隔符
                    solution_text = re.sub(pattern, '', solution_text, flags=re.IGNORECASE).strip()
                
                return problem_text, solution_text
        
        # 检查编号列表模式
        numbered_pattern = r'\d+\.\s*[^。]+'
        numbered_matches = re.findall(numbered_pattern, text)
        
        if numbered_matches and len(text) > 50:
            # 按句号拆分
            parts = text.split('。')
            if len(parts) >= 2:
                problem_part = parts[0].strip()
                solution_parts = []
                
                for part in parts[1:]:
                    if part.strip():
                        numbered_items = re.findall(r'\d+\.\s*[^。；]+', part)
                        if numbered_items:
                            solution_parts.extend(numbered_items)
                        else:
                            solution_parts.append(part.strip())
                
                solution_text = '；'.join(solution_parts) if solution_parts else ''
                return problem_part, solution_text
        
        # 默认情况：整个文本作为问题描述
        return text, ""
    
    @staticmethod
    def clean_problem_description(problem_desc: str) -> str:
        """
        统一的文本清理逻辑
        移除问题描述中的背景扩写与截断噪音
        """
        if not problem_desc:
            return ""
        
        cleaned = problem_desc
        
        # 应用清理规则
        for pattern in TEXT_CLEANING_RULES["remove_patterns"]:
            cleaned = re.sub(pattern, '', cleaned)
        
        # 保留重要模式
        for pattern in TEXT_CLEANING_RULES["preserve_patterns"]:
            # 这里可以添加保留逻辑，如果需要的话
            pass
        
        return cleaned.strip()
    
    @staticmethod
    def enrich_problem_description(problem_text: str, solution_text: str, original: str) -> Dict[str, str]:
        """
        精简的文本润色逻辑
        只做必要的清理和格式化
        """
        problem = (problem_text or '').strip()
        solution = (solution_text or '').strip()
        
        # 特殊情况：组件样式对齐/一致的愿望表达
        wish_info = ProblemDescriptionUtils._find_align_wish_info(original or '')
        if wish_info and wish_info.get('component'):
            return {
                'problem': f"{wish_info['component']}需修改。",
                'solution': ProblemDescriptionUtils._normalize_solution_punctuation(
                    wish_info.get('wish', '与对应头图组件样式对齐。')
                )
            }
        
        # 确保问题和解决方案不重复
        if solution and problem and solution in problem:
            clean_problem = problem.replace(solution, '').strip()
            return {
                'problem': clean_problem or '体验问题需要优化',
                'solution': ProblemDescriptionUtils._normalize_solution_punctuation(solution)
            }
        
        # 如果方案为空但原文包含调整词汇，尝试抽取
        if not solution:
            solution = ProblemDescriptionUtils._extract_solution_from_original(original)
        
        # 简单清理问题描述
        enriched_problem = ProblemDescriptionUtils._clean_problem_text(problem)
        
        return {
            'problem': enriched_problem or (original or ''),
            'solution': ProblemDescriptionUtils._normalize_solution_punctuation(solution)
        }
    
    @staticmethod
    def _find_align_wish_info(description: str) -> Optional[Dict[str, str]]:
        """识别对齐样式问题的组件信息"""
        pattern = SPECIAL_CASES["align_wish_pattern"]
        match = re.search(pattern, description)
        
        if match:
            component = match.group(1).strip()
            component = re.sub(r'[的的]$', '', component)
            return {'component': component}
        
        # 特殊处理：Tab选中态的样式需加粗为bold
        if 'Tab选中态' in description and '加粗' in description:
            return {'component': 'Tab选中态'}
        
        return None
    
    @staticmethod
    def _is_short_solution(solution: str) -> bool:
        """判断是否为简短的解决方案"""
        # 颜色代码、像素值、简短词汇
        return (re.match(r'^#?[0-9a-fA-F]{3,8}$', solution) or 
                re.match(r'\d+\s*px$', solution, re.IGNORECASE) or 
                (re.match(r'[\u4e00-\u9fa5A-Za-z]+$', solution) and len(solution) <= 8))
    
    @staticmethod
    def _extract_solution_from_original(original: str) -> str:
        """从原文中提取解决方案"""
        if not original:
            return ""
        
        # 匹配调整词汇
        pattern = r'(?:应当|应该|应为|应是|应|调整为|改为)[:：]?\s*([^。；;\n]+)'
        match = re.search(pattern, original)
        
        if match and match.group(1):
            return f"按设计稿调整为：{match.group(1).strip()}。"
        
        return ""
    
    @staticmethod
    def _clean_problem_text(problem: str) -> str:
        """精简的问题描述清理"""
        if not problem:
            return ""
        
        # 只清理明显的冗余信息
        cleaned = problem
        cleaned = re.sub(r'与?设计稿?存在不一致[，。]*', '', cleaned)
        cleaned = re.sub(r'请核对规范[，。]*', '', cleaned)
        
        # 确保以句号结尾
        if cleaned and not re.search(r'[。.!；;]$', cleaned):
            cleaned += '。'
        
        return cleaned
    
    @staticmethod
    def _normalize_solution_punctuation(solution: str) -> str:
        """标准化解决方案标点符号"""
        if not solution:
            return ""
        
        # 确保以句号结尾
        if not re.search(r'[。.!；;]$', solution):
            solution += '。'
        
        return solution
    
    @staticmethod
    def validate_problem_description(problem_desc: str) -> Dict[str, Any]:
        """
        验证问题描述格式和内容
        """
        if not problem_desc:
            return {
                "valid": False,
                "errors": ["问题描述不能为空"],
                "suggestions": ["请提供详细的问题描述"]
            }
        
        errors = []
        suggestions = []
        
        # 检查长度
        if len(problem_desc) < PROBLEM_DESCRIPTION_REQUIREMENTS["min_length"]:
            errors.append(f"问题描述过短，至少需要{PROBLEM_DESCRIPTION_REQUIREMENTS['min_length']}个字符")
            suggestions.append("请添加更多细节描述")
        
        if len(problem_desc) > PROBLEM_DESCRIPTION_REQUIREMENTS["max_length"]:
            errors.append(f"问题描述过长，最多{PROBLEM_DESCRIPTION_REQUIREMENTS['max_length']}个字符")
            suggestions.append("请精简描述内容")
        
        # 检查必需元素（简化验证）
        for element in VALIDATION_RULES["required_elements"]:
            if element not in problem_desc:
                # 只记录警告，不视为错误
                suggestions.append(f"建议添加{element}的具体描述")
        
        # 检查是否为完整句子
        if VALIDATION_RULES["must_be_complete_sentence"]:
            if not re.search(r'[。.!？?]$', problem_desc):
                errors.append("问题描述必须是完整句子")
                suggestions.append("请以句号结尾")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "suggestions": suggestions
        }
    
    @staticmethod
    def generate_problem_description(
        description: str,
        system_types: List[str] = None,
        modules: List[str] = None
    ) -> str:
        """
        统一的问题描述生成入口
        整合所有问题描述生成逻辑
        """
        if not description:
            return "问题描述缺失"
        
        # 拆分问题和解决方案
        problem_text, solution_text = ProblemDescriptionUtils.split_problem_and_solution(description)
        
        # 润色问题描述
        enriched = ProblemDescriptionUtils.enrich_problem_description(problem_text, solution_text, description)
        
        # 清理问题描述
        cleaned_problem = ProblemDescriptionUtils.clean_problem_description(enriched['problem'])
        
        # 验证问题描述
        validation = ProblemDescriptionUtils.validate_problem_description(cleaned_problem)
        
        if not validation['valid']:
            # 如果验证失败，返回原始描述或默认描述
            return description if description else "体验问题需要进一步分析"
        
        return cleaned_problem
