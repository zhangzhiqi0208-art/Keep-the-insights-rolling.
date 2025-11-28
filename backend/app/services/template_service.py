from typing import Dict, List, Any, Optional
import json
import os
from datetime import datetime

class TemplateService:
    """模板管理服务"""
    
    def __init__(self):
        self.templates_dir = "app/templates"
        self.default_templates = self._load_default_templates()
    
    def _load_default_templates(self) -> Dict[str, Dict[str, Any]]:
        """加载默认模板"""
        return {
            "default": {
                "id": "default",
                "name": "设计体验问题模板",
                "description": "将问题快速转化为符合规范并利于团队协同规范的格式",
                "category": "体验问题",
                "config": {
                    "fields": [
                        {"name": "title", "label": "标题", "type": "text", "required": True},
                        {"name": "systemTypes", "label": "所属地区", "type": "select", "required": True},
                        {"name": "modules", "label": "归属终端", "type": "select", "required": True},
                        {"name": "problemType", "label": "问题类型", "type": "select", "required": True},
                        {"name": "solutionMethod", "label": "解决方式", "type": "select", "required": True},
                        {"name": "priority", "label": "优先级", "type": "select", "required": True},
                        {"name": "problem", "label": "问题描述", "type": "textarea", "required": True},
                        {"name": "solution", "label": "解决方案", "type": "textarea", "required": True},
                        {"name": "status", "label": "解决状态", "type": "select", "required": True},
                        {"name": "expectedVersion", "label": "期望修复版本", "type": "select", "required": False},
                        {"name": "screenshots", "label": "体验问题截图", "type": "file", "required": False},
                        {"name": "attachments", "label": "附件", "type": "file", "required": False}
                    ],
                    "options": {
                        "systemTypes": ["BR", "SSL"],
                        "modules": ["管理端", "门店端", "移动端"],
                        "problemType": ["体验问题", "功能问题", "性能问题", "安全问题"],
                        "solutionMethod": ["产品优化", "技术修复", "流程改进", "培训支持"],
                        "priority": ["高", "中", "低"],
                        "status": ["待处理", "处理中", "已完成", "已关闭"],
                        "expectedVersion": ["待定", "v1.0.0", "v1.1.0", "v1.2.0", "v2.0.0"]
                    }
                }
            },
            "design_experience_issue": {
                "id": "design_experience_issue",
                "name": "设计体验问题反馈",
                "description": "用于转化设计体验问题反馈的标准化模板",
                "category": "设计体验",
                "config": {
                    "fields": [
                        {
                            "name": "title",
                            "label": "标题",
                            "type": "text",
                            "required": True,
                            "llm_inferred": True,
                            "description": "根据问题描述生成简洁准确的标题"
                        },
                        {
                            "name": "region",
                            "label": "所属地区",
                            "type": "checkbox",
                            "required": True,
                            "llm_inferred": False,
                            "options": ["BR", "SSL"]
                        },
                        {
                            "name": "terminal",
                            "label": "归属终端",
                            "type": "checkbox",
                            "required": True,
                            "llm_inferred": False,
                            "options": ["管理端", "门店端", "移动端"]
                        },
                        {
                            "name": "issue_type",
                            "label": "问题类型",
                            "type": "select",
                            "required": True,
                            "llm_inferred": True,
                            "options": ["设计需求优化", "交互功能bug", "视觉还原度bug", "历史遗留"],
                            "description": "智能识别问题类型：设计需求优化（设计改进/新增功能）、交互功能bug（操作流程问题）、视觉还原度bug（设计稿与实现不一致）、历史遗留（长期存在的问题）"
                        },
                        {
                            "name": "resolution_method",
                            "label": "解决方式",
                            "type": "select",
                            "required": True,
                            "llm_inferred": True,
                            "options": ["体验优化", "需求优化"]
                        },
                        {
                            "name": "priority",
                            "label": "优先级",
                            "type": "select",
                            "required": True,
                            "llm_inferred": True,
                            "options": ["P0-紧急", "P1-高", "P2-中", "P3-低"],
                            "description": "基于问题严重程度和影响范围判断：P0-紧急（系统无法使用）、P1-高（影响主要业务流程）、P2-中（影响部分用户体验）、P3-低（细微调整）"
                        },
                        {
                            "name": "problem_description",
                            "label": "问题描述",
                            "type": "textarea",
                            "required": True,
                            "llm_inferred": True,
                            "description": "详细描述体验问题，包括用户场景和影响"
                        },
                        {
                            "name": "solution",
                            "label": "解决方案",
                            "type": "textarea",
                            "required": True,
                            "llm_inferred": True,
                            "description": "提供具体的设计优化建议和解决方案"
                        },
                        {
                            "name": "status",
                            "label": "解决状态",
                            "type": "select",
                            "required": True,
                            "llm_inferred": False,
                            "default": "待确认(未提给研发)",
                            "options": ["待确认(未提给研发)", "研发中(已提给研发)", "待走查(已研发完成)", "已解决(走查完成并上线)", "暂不解决"]
                        },
                        {
                            "name": "target_version",
                            "label": "期望修复版本",
                            "type": "select",
                            "required": False,
                            "llm_inferred": False,
                            "default": "未定",
                            "options": ["V1.2.0", "V1.3.0", "V2.0.0", "未定"]
                        },
                        {
                            "name": "screenshots",
                            "label": "体验问题截图",
                            "type": "file",
                            "required": False,
                            "llm_inferred": False,
                            "accept": "image/*"
                        },
                        {
                            "name": "attachments",
                            "label": "其他附件",
                            "type": "file",
                            "required": False,
                            "llm_inferred": False,
                            "accept": "*/*"
                        }
                    ]
                }
            },
            "bug_report": {
                "id": "bug_report",
                "name": "Bug报告模板",
                "description": "用于报告系统Bug和功能异常",
                "category": "功能问题",
                "config": {
                    "fields": [
                        {"name": "title", "label": "Bug标题", "type": "text", "required": True},
                        {"name": "severity", "label": "严重程度", "type": "select", "required": True},
                        {"name": "reproducibility", "label": "复现性", "type": "select", "required": True},
                        {"name": "environment", "label": "环境信息", "type": "text", "required": True},
                        {"name": "steps", "label": "复现步骤", "type": "textarea", "required": True},
                        {"name": "expected", "label": "期望结果", "type": "textarea", "required": True},
                        {"name": "actual", "label": "实际结果", "type": "textarea", "required": True},
                        {"name": "screenshots", "label": "截图", "type": "file", "required": False}
                    ],
                    "options": {
                        "severity": ["严重", "高", "中", "低"],
                        "reproducibility": ["总是", "经常", "偶尔", "很少", "无法复现"]
                    }
                }
            },
            "feature_request": {
                "id": "feature_request",
                "name": "功能需求模板",
                "description": "用于提交新功能需求和建议",
                "category": "功能需求",
                "config": {
                    "fields": [
                        {"name": "title", "label": "功能标题", "type": "text", "required": True},
                        {"name": "category", "label": "功能分类", "type": "select", "required": True},
                        {"name": "priority", "label": "优先级", "type": "select", "required": True},
                        {"name": "description", "label": "功能描述", "type": "textarea", "required": True},
                        {"name": "benefits", "label": "预期收益", "type": "textarea", "required": True},
                        {"name": "targetUsers", "label": "目标用户", "type": "text", "required": True},
                        {"name": "mockups", "label": "设计稿", "type": "file", "required": False}
                    ],
                    "options": {
                        "category": ["用户界面", "业务流程", "数据管理", "系统集成", "其他"],
                        "priority": ["高", "中", "低"]
                    }
                }
            },
            "original_sound_cleaning": {
                "id": "original_sound_cleaning",
                "name": "用户原声清洗模板",
                "description": "用于清洗和分析用户原声反馈的标准化模板，重点支持多语言翻译、AI智能总结和情感分类",
                "category": "用户原声",
                "config": {
                    "fields": [
                        {
                            "name": "source_language",
                            "label": "源语言",
                            "type": "select",
                            "required": True,
                            "llm_inferred": False,
                            "options": ["英文", "西班牙语", "葡萄牙语"],
                            "description": "原声内容的源语言"
                        },
                        {
                            "name": "target_language",
                            "label": "目标语言",
                            "type": "select",
                            "required": True,
                            "llm_inferred": False,
                            "options": ["中文"],
                            "description": "目标输出语言"
                        },
                        {
                            "name": "original_translation",
                            "label": "翻译后的用户原声原文",
                            "type": "textarea",
                            "required": True,
                            "llm_inferred": True,
                            "description": "将原声内容翻译为目标语言，保持原意和情感色彩"
                        },
                        {
                            "name": "ai_optimized_summary",
                            "label": "AI智能优化总结",
                            "type": "textarea",
                            "required": True,
                            "llm_inferred": True,
                            "description": "AI智能提炼用户原声的主旨和重点"
                        },
                        {
                            "name": "key_points",
                            "label": "关键要点",
                            "type": "textarea",
                            "required": True,
                            "llm_inferred": True,
                            "description": "以要点形式列出用户反馈的核心内容"
                        },
                        {
                            "name": "sentiment_classification",
                            "label": "情感倾向",
                            "type": "select",
                            "required": True,
                            "llm_inferred": True,
                            "options": ["正向", "负向", "中性"],
                            "description": "识别原声的情感倾向"
                        },
                        {
                            "name": "sentiment_intensity",
                            "label": "情感强度",
                            "type": "select",
                            "required": True,
                            "llm_inferred": True,
                            "options": ["强烈", "中等", "轻微"],
                            "description": "评估情感表达的强烈程度"
                        },
                        {
                            "name": "sentiment_analysis",
                            "label": "情感分析",
                            "type": "textarea",
                            "required": True,
                            "llm_inferred": True,
                            "description": "提供具体的情感分析说明，解释分类依据"
                        },
                        {
                            "name": "processing_time",
                            "label": "处理时间",
                            "type": "datetime",
                            "required": True,
                            "llm_inferred": False,
                            "description": "原声处理时间"
                        },
                        {
                            "name": "processing_status",
                            "label": "处理状态",
                            "type": "select",
                            "required": True,
                            "llm_inferred": False,
                            "default": "已处理",
                            "options": ["处理中", "已处理", "处理失败"],
                            "description": "原声处理状态"
                        }
                    ]
                }
            }
        }
    
    async def get_all_templates(self) -> List[Dict[str, Any]]:
        """获取所有模板"""
        return list(self.default_templates.values())
    
    async def get_template(self, template_id: str) -> Optional[Dict[str, Any]]:
        """获取特定模板"""
        return self.default_templates.get(template_id)
    
    async def generate_standard_format(
        self, 
        analysis_result: Dict[str, Any], 
        template: Dict[str, Any]
    ) -> Dict[str, Any]:
        """根据模板和分析结果生成标准化格式"""
        
        if not template:
            template = self.default_templates["default"]
        
        # 从分析结果中提取信息
        predicted_type = analysis_result.get("predictedType", "体验问题")
        priority = analysis_result.get("priority", "中")
        impact = analysis_result.get("impact", "影响用户体验")
        recommended_solutions = analysis_result.get("recommendedSolutions", [])
        processing_method = analysis_result.get("processingMethod", {})
        acceptance_criteria = analysis_result.get("acceptanceCriteria", [])
        
        # 生成标题
        title = await self._generate_title(analysis_result)
        
        # 生成背景描述
        background = await self._generate_background(analysis_result)
        
        # 生成解决方案
        solution = recommended_solutions[0] if recommended_solutions else "根据问题具体情况制定针对性解决方案"
        
        # 构建标准化格式
        standard_format = {
            "title": title,
            "background": background,
            "problem": analysis_result.get("original_description", ""),
            "impact": impact,
            "priority": priority,
            "problemType": predicted_type,
            "expectedResult": solution,
            "acceptanceCriteria": acceptance_criteria,
            "estimatedTime": analysis_result.get("estimatedTime", "3-5个工作日"),
            "assignee": processing_method.get("assignee", "产品团队"),
            "status": "待处理",
            "confidence": f"{int(analysis_result.get('analysisConfidence', 0.8) * 100)}%",
            "processingMethod": processing_method.get("method", "产品优化"),
            "escalation": processing_method.get("escalation", "正常处理"),
            "recommendedTimeline": processing_method.get("timeline", "3-5个工作日")
        }
        
        return standard_format
    
    async def _generate_title(self, analysis_result: Dict[str, Any]) -> str:
        """生成标题"""
        from app.utils.title_utils import TitleUtils
        
        predicted_type = analysis_result.get("predictedType", "体验问题")
        system_types = analysis_result.get("system_types", ["BR"])
        modules = analysis_result.get("modules", ["管理端"])
        description = analysis_result.get("original_description", "")
        
        # 使用统一工具函数生成标题
        return TitleUtils.generate_title(description, system_types, modules, predicted_type)
    
    def _extract_title_content(self, description: str) -> str:
        """从描述中提取标题内容"""
        import re
        
        # 智能提取核心问题描述，保留关键对象和问题描述
        content = description
        
        # 覆盖“需要参考设计稿修改/需要…修改(调整)”等表达：改写为“与设计稿不一致”
        # 例："hover时的图例样式，需要参考设计稿修改" -> "hover时的图例样式与设计稿不一致"
        try:
            import re as _re
            # 逗号前为主体，逗号后出现需要/应该/参考设计稿/修改/调整等动作型表达时，改写为“不一致”
            m = _re.match(r"\s*(.+?)[，,]\s*(?:需要|应|应该)?(?:参考)?设计稿.*?(?:修改|调整)", content)
            if m:
                subject = m.group(1).strip()
                if subject:
                    content = f"{subject}与设计稿不一致"
        except Exception:
            pass
        
        # 特殊处理：如果输入是"X问题，调整为Y"格式，保留问题部分
        # 例如："弹窗尺寸太宽了，调整为480px" -> "弹窗尺寸太宽了"
        # 支持中文逗号和英文逗号
        for comma in ['，', ',']:
            if comma in content and any(word in content for word in ['调整', '改为', '修改', '优化', '设置为', '改成']):
                # 找到逗号位置，检查逗号后是否包含解决方案关键词
                comma_pos = content.find(comma)
                if comma_pos > 0:
                    after_comma = content[comma_pos+1:]
                    if any(word in after_comma for word in ['调整', '改为', '修改', '优化', '设置为', '改成']):
                        content = content[:comma_pos].strip()
                        print(f"🔧 特殊处理：保留问题部分 '{content}'")
                        break
        
        # 移除解决方案相关的描述（更彻底的匹配，支持多行）
        # 匹配以"建议"开头的所有内容（包括换行符）
        content = re.sub(r'建议[\s\S]*$', '', content).strip()
        # 匹配以数字开头的建议项（如"1. 优先找产品..."）
        content = re.sub(r'\d+\.\s*[\s\S]*$', '', content).strip()
        # 匹配以"应该"、"需要"、"要"等开头的建议
        content = re.sub(r'(应该|需要|要|可以|希望|期待)[\s\S]*$', '', content).strip()
        # 匹配以"如果"开头的条件建议
        content = re.sub(r'如果[\s\S]*$', '', content).strip()
        # 匹配以"尝试"开头的建议
        content = re.sub(r'尝试[\s\S]*$', '', content).strip()
        # 匹配以"调整"、"改为"、"修改"等开头的解决方案（但不在逗号后的情况）
        content = re.sub(r'^(调整|改为|修改|优化|改为|设置为|改成)[\s\S]*$', '', content).strip()
        # 匹配句号后的解决方案描述
        content = re.sub(r'。[^。]*$', '', content).strip()
        
        # 移除常见的冗余词汇，但保留核心问题描述
        for word in ["应该", "需要", "要", "可以", "希望", "期待", "需"]:
            content = content.replace(word, "")
        
        # 清理多余的标点符号，但保留必要的逗号
        content = content.replace("。", "").replace("；", "").replace(";", "")
        content = re.sub(r'，$', '', content)  # 移除末尾的逗号
        content = content.strip()
        
        # 精简标题内容，移除冗余词汇但保持表意准确
        content = content.replace("导致", "，")  # 将"导致"替换为逗号，更简洁
        content = content.replace("放大后", "放大")  # 精简"放大后"为"放大"
        content = content.replace("展示不全", "显示不全")  # 精简"展示不全"为"显示不全"
        
        # 移除地区和模块信息的重复
        content = re.sub(r'在BR和SSL地区的管理端和门店端[，。]?', '', content)
        content = re.sub(r'在BR地区的管理端和门店端[，。]?', '', content)
        content = re.sub(r'在SSL地区的管理端和门店端[，。]?', '', content)
        content = re.sub(r'在管理端和门店端[，。]?', '', content)
        content = re.sub(r'在BR和SSL地区[，。]?', '', content)
        content = re.sub(r'在BR地区[，。]?', '', content)
        content = re.sub(r'在SSL地区[，。]?', '', content)
        
        # 移除重复的描述内容
        content = re.sub(r'与设计稿存在三处不一致与设计稿存在三处不一致', '与设计稿存在三处不一致', content)
        content = re.sub(r'与设计稿存在.*不一致.*与设计稿存在.*不一致', '与设计稿存在不一致', content)
        
        # 移除编号列表，只保留核心问题描述
        content = re.sub(r'以下三点.*不一致：.*', '与设计稿存在不一致', content)
        content = re.sub(r'以下.*点.*不一致：.*', '与设计稿存在不一致', content)
        content = re.sub(r'\d+、.*', '', content)  # 移除编号列表项
        content = re.sub(r'\n.*', '', content)  # 移除换行后的内容
        
        # 更多精简规则
        content = content.replace("还是", "仍为")  # 精简"还是"为"仍为"
        content = content.replace("应该用", "需用")  # 精简"应该用"为"需用"
        content = content.replace("位置", "处")  # 精简"位置"为"处"
        content = content.replace("截图中的", "")  # 移除"截图中的"
        content = content.replace("语言切换", "切换")  # 精简"语言切换"为"切换"
        content = content.replace("二级菜单", "菜单")  # 精简"二级菜单"为"菜单"
        content = content.replace("选中后", "选中")  # 精简"选中后"为"选中"
        
        # 清理标点符号
        content = re.sub(r'，+', '，', content)  # 合并多个逗号
        content = re.sub(r'^，', '', content)    # 移除开头的逗号
        content = re.sub(r'，$', '', content)    # 移除结尾的逗号
        content = content.strip()
        
        # 确保标题不超过30字
        if len(content) > 30:
            # 尝试智能截断，保留核心信息
            if "，" in content:
                parts = content.split("，")
                if len(parts) >= 2:
                    # 保留第一部分和最后一部分的核心信息
                    first_part = parts[0]
                    last_part = parts[-1]
                    if len(first_part) + len(last_part) <= 30:
                        content = f"{first_part}，{last_part}"
                    else:
                        content = first_part[:30]
            else:
                content = content[:30]
        
        return content or "问题描述"
    
    async def _generate_background(self, analysis_result: Dict[str, Any]) -> str:
        """生成背景描述"""
        predicted_type = analysis_result.get("predictedType", "体验问题")
        system_types = analysis_result.get("system_types", ["BR"])
        modules = analysis_result.get("modules", ["管理端"])
        
        type_map = {
            "体验问题": "用户体验问题",
            "功能问题": "功能异常问题",
            "性能问题": "系统性能问题",
            "安全问题": "系统安全问题"
        }
        
        type_text = type_map.get(predicted_type, "体验问题")
        region_names = "、".join(system_types)
        module_names = "、".join(modules)
        
        impact_map = {
            "体验问题": "影响用户使用体验",
            "功能问题": "影响系统功能正常使用",
            "性能问题": "影响系统运行效率",
            "安全问题": "存在安全风险隐患"
        }
        
        impact_text = impact_map.get(predicted_type, "影响用户体验")
        
        return f"用户原声在{region_names}地区的{module_names}使用过程中发现{type_text}，{impact_text}，需要及时处理解决。"
    
    async def create_template(self, template_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建新模板"""
        template_id = template_data.get("id")
        if not template_id:
            template_id = f"template_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        template = {
            "id": template_id,
            "name": template_data.get("name", "自定义模板"),
            "description": template_data.get("description", ""),
            "category": template_data.get("category", "其他"),
            "config": template_data.get("config", {}),
            "created_at": datetime.now().isoformat()
        }
        
        # 这里应该保存到数据库
        self.default_templates[template_id] = template
        
        return template
    
    async def update_template(self, template_id: str, template_data: Dict[str, Any]) -> Dict[str, Any]:
        """更新模板"""
        if template_id not in self.default_templates:
            raise ValueError("模板不存在")
        
        template = self.default_templates[template_id]
        template.update(template_data)
        template["updated_at"] = datetime.now().isoformat()
        
        return template
    
    async def delete_template(self, template_id: str) -> bool:
        """删除模板"""
        if template_id in self.default_templates:
            del self.default_templates[template_id]
            return True
        return False
    
    async def smart_field_matching(
        self, 
        description: str, 
        system_types: List[str], 
        modules: List[str], 
        template: Dict[str, Any]
    ) -> Dict[str, Any]:
        """使用LLM进行智能字段匹配"""
        try:
            from app.services.llm_service import LLMService
            llm_service = LLMService()
            
            if llm_service.api_key:
                # 使用LLM进行智能字段匹配
                analysis_result = await llm_service._llm_field_matching(description, system_types, modules, template)
                
                # 生成标题和解决方案
                from app.utils.title_utils import TitleUtils
                title = TitleUtils.generate_title(description, system_types, modules, analysis_result.get("predictedType", "设计需求优化"))
                solution = await llm_service.generate_solution(description, analysis_result.get("predictedType", "设计需求优化"), analysis_result.get("recommendedSolutions", []))
                
                # 构建填充结果
                # 统一纠偏：对齐/一致类愿望 & "问题，应该/需要/建议…"句式
                try:
                    from app.services.llm_service import LLMService  # 复用其后处理函数
                    post = {
                        "title": title,
                        "problem_description": analysis_result.get("problem_description", description),
                        "solution": analysis_result.get("solution", solution)
                    }
                    # 应用"问题里带方案"的拆分纠偏
                    post = LLMService()._post_process_llm_result(post, description)
                    title = post.get("title", title)
                    pd = post.get("problem_description", analysis_result.get("problem_description", description))
                    sol = post.get("solution", solution)
                except Exception:
                    pd = analysis_result.get("problem_description", description)
                    sol = analysis_result.get("solution", solution)

                result = {
                    "title": title,
                    "region": ', '.join(system_types),
                    "terminal": ', '.join(modules),
                    "issue_type": analysis_result.get("predictedType", "设计需求优化"),
                    "resolution_method": analysis_result.get("processingMethod", {}).get("method", "体验优化"),
                    "priority": analysis_result.get("priority", "P2-中"),
                    "problem_description": pd,
                    "solution": sol,
                    "status": "待确认(未提给研发)",
                    "target_version": "未定",
                    "screenshots": "",
                    "attachments": ""
                }
                
                return result
            else:
                # 没有API密钥，使用默认值
                return await self._default_template_fill(description, system_types, modules, template)
                
        except Exception as e:
            print(f"LLM智能字段匹配失败: {e}")
            # 降级到默认填充
            return await self._default_template_fill(description, system_types, modules, template)
    
    async def _default_template_fill(
        self, 
        description: str, 
        system_types: List[str], 
        modules: List[str], 
        template: Dict[str, Any]
    ) -> Dict[str, Any]:
        """默认模板填充（降级方案）"""
        
        # 基于关键词的简单分析
        text = description.lower()
        
        # 问题类型预测（按新的分类逻辑）
        issue_type = "历史遗留"  # 默认归类为历史遗留
        
        # 优先判断视觉还原度bug
        visual_keywords = [
            "还原", "实现", "不一致", "偏差", "效果", "显示", "渲染", "颜色", "字体", "尺寸", "对齐",
            "样式", "文案", "展示", "不全", "截断", "溢出", "布局", "排版", "间距", "边距",
            "选中", "状态", "hover", "active", "focus", "外观", "界面", "UI", "设计稿",
            "像素", "px", "大小", "粗细", "字重", "行高", "字间距", "letter-spacing", "line-height",
            "阴影", "圆角", "边框", "背景", "透明度", "渐变", "图标", "图片", "图片显示"
        ]
        # 排除设计需求优化的情况
        design_optimization_keywords = ["设计规范", "规范调整", "线上系统", "系统影响", "设计标准", "建议", "优化", "统一"]
        if any(keyword in text for keyword in visual_keywords) and not any(keyword in text for keyword in design_optimization_keywords):
            issue_type = "视觉还原度bug"
        # 其次判断交互功能bug
        elif any(keyword in text for keyword in ["交互", "操作", "点击", "按钮", "功能", "无法", "不能", "错误", "异常", "bug"]):
            issue_type = "交互功能bug"
        # 然后判断设计需求优化
        elif any(keyword in text for keyword in ["设计规范", "规范调整", "线上系统", "系统影响", "设计标准"]):
            issue_type = "设计需求优化"
        # 其他情况默认为历史遗留
        
        # 解决方式预测
        resolution_method = "体验优化"
        if issue_type in ["设计需求优化", "视觉还原度bug"]:
            resolution_method = "体验优化"
        else:
            resolution_method = "需求优化"
        
        # 优先级预测
        priority = "P2-中"
        if any(keyword in text for keyword in ["崩溃", "闪退", "无法登录", "数据丢失", "支付", "交易", "核心", "紧急", "严重", "快点", "尽快"]):
            priority = "P0-紧急"
        elif any(keyword in text for keyword in ["功能", "异常", "错误", "bug", "失效", "不工作", "故障"]):
            priority = "P1-高"
        elif any(keyword in text for keyword in ["界面优化", "体验改进", "建议", "希望", "期待", "优化", "美化", "改进"]):
            priority = "P3-低"
        
        # 构建填充结果
        result = {
            "title": f"【{', '.join(system_types)} - {', '.join(modules)}】{issue_type}",
            "region": ', '.join(system_types),
            "terminal": ', '.join(modules),
            "issue_type": issue_type,
            "resolution_method": resolution_method,
            "priority": priority,
            "problem_description": description,
            "solution": "根据问题具体情况制定针对性解决方案",
            "status": "待确认(未提给研发)",
            "target_version": "未定",
            "screenshots": "",
            "attachments": ""
        }
        
        return result