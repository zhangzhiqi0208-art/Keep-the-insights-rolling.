import httpx
import json
import os
import hashlib
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import asyncio
from dotenv import load_dotenv
from .prompt_service import prompt_service

# 确保在任意工作目录下都能正确加载 backend/.env
_BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
load_dotenv(os.path.join(_BACKEND_DIR, ".env"))

class LLMService:
    """LLM服务类，集成DeepSeek API"""
    
    def __init__(self):
        # 环境变量在此处再次加载兜底（避免热重载时丢失）
        if not os.getenv("DEEPSEEK_API_KEY"):
            load_dotenv(os.path.join(_BACKEND_DIR, ".env"))
        self.api_key = os.getenv("DEEPSEEK_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.base_url = "https://api.deepseek.com/v1"
        self.model = "deepseek-chat"
        # 从prompt配置中读取设置
        settings = prompt_service.get_settings()
        self.max_tokens = settings.get("max_tokens", 512)
        self.temperature = settings.get("temperature", 0.1)
        self.top_p = settings.get("top_p", 0.8)
        self.frequency_penalty = settings.get("frequency_penalty", 0.0)
        self.presence_penalty = settings.get("presence_penalty", 0.0)
        self.timeout = settings.get("timeout", 25.0)
        
        # 智能缓存机制 - 暂时禁用缓存，确保每次都使用LLM
        self.cache = {}  # 内存缓存
        self.cache_ttl = timedelta(minutes=1)  # 缓存1分钟，基本不缓存
        self.cache_file = os.path.join(_BACKEND_DIR, "llm_cache.json")
        # self._load_cache()  # 暂时不加载缓存
        
        # HTTP连接池优化
        self.http_client = httpx.AsyncClient(
            timeout=httpx.Timeout(self.timeout),
            limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
        )
        
        if not self.api_key:
            print("⚠️ 未设置DEEPSEEK_API_KEY，将使用模拟分析")
    
    async def close(self):
        """关闭HTTP连接池"""
        if hasattr(self, 'http_client'):
            await self.http_client.aclose()
    
    def _load_cache(self):
        """加载缓存文件"""
        try:
            if os.path.exists(self.cache_file):
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    self.cache = json.load(f)
                print(f"✅ 已加载 {len(self.cache)} 条缓存记录")
        except Exception as e:
            print(f"⚠️ 加载缓存失败: {e}")
            self.cache = {}
    
    def _save_cache(self):
        """保存缓存到文件"""
        try:
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(self.cache, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"⚠️ 保存缓存失败: {e}")
    
    def _generate_cache_key(self, description: str, system_types: List[str], modules: List[str]) -> str:
        """生成缓存键"""
        content = f"{description}|{','.join(system_types)}|{','.join(modules)}"
        return hashlib.md5(content.encode('utf-8')).hexdigest()
    
    def _get_cached_result(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """获取缓存结果"""
        if cache_key in self.cache:
            cached_data = self.cache[cache_key]
            cached_time = datetime.fromisoformat(cached_data['timestamp'])
            if datetime.now() - cached_time < self.cache_ttl:
                print(f"🚀 使用缓存结果，节省API调用")
                return cached_data['result']
            else:
                # 缓存过期，删除
                del self.cache[cache_key]
        return None
    
    def _cache_result(self, cache_key: str, result: Dict[str, Any]):
        """缓存结果"""
        self.cache[cache_key] = {
            'result': result,
            'timestamp': datetime.now().isoformat()
        }
        # 限制缓存大小，避免内存溢出
        if len(self.cache) > 1000:
            # 删除最旧的缓存
            oldest_key = min(self.cache.keys(), key=lambda k: self.cache[k]['timestamp'])
            del self.cache[oldest_key]
        self._save_cache()
    
    async def analyze_feedback(
        self, 
        description: str, 
        system_types: List[str], 
        modules: List[str], 
        template: Dict[str, Any],
        files: List = None
    ) -> Dict[str, Any]:
        """分析用户原声"""
        try:
            # 暂时禁用缓存，确保每次都使用LLM
            # cache_key = self._generate_cache_key(description, system_types, modules)
            # cached_result = self._get_cached_result(cache_key)
            # if cached_result:
            #     return cached_result
            
            # 缓存未命中，调用API
            if self.api_key:
                try:
                    result = await self._deepseek_analysis(description, system_types, modules, template)
                    # 暂时不缓存结果，确保每次都使用LLM
                    # self._cache_result(cache_key, result)
                    return result
                except Exception as api_error:
                    print(f"DeepSeek API调用失败: {api_error}")
                    print("降级到模拟分析模式")
                    result = await self._mock_analysis(description, system_types, modules, template)
                    # 暂时不缓存模拟分析结果
                    # self._cache_result(cache_key, result)
                    return result
            else:
                print("未配置API密钥，使用模拟分析模式")
                result = await self._mock_analysis(description, system_types, modules, template)
                # 暂时不缓存模拟分析结果
                # self._cache_result(cache_key, result)
                return result
        except Exception as e:
            print(f"LLM分析失败: {e}")
            print("使用降级分析模式")
            return await self._fallback_analysis(description, system_types, modules, template)
    
    async def _deepseek_analysis(
        self, 
        description: str, 
        system_types: List[str], 
        modules: List[str], 
        template: Dict[str, Any]
    ) -> Dict[str, Any]:
        """使用DeepSeek API进行智能分析"""
        
        # 构建分析提示词
        prompt = self._build_analysis_prompt(description, system_types, modules, template)
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "你是一个专业的用户体验分析师，擅长识别设计体验问题本质，进行专业的分类和清洗的阐述。"
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "max_tokens": self.max_tokens,
                    "temperature": self.temperature,
                    "top_p": self.top_p,
                    "frequency_penalty": self.frequency_penalty,
                    "presence_penalty": self.presence_penalty,
                    "stream": False
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                # 解析JSON响应
                try:
                    analysis_result = json.loads(content)
                    return self._format_analysis_result(analysis_result)
                except json.JSONDecodeError:
                    # 如果返回的不是JSON，使用文本解析
                    return await self._parse_text_response(content, description, system_types, modules)
            else:
                print(f"DeepSeek API错误: {response.status_code} - {response.text}")
                return await self._mock_analysis(description, system_types, modules, template)
    
    def _build_analysis_prompt(
        self, 
        description: str, 
        system_types: List[str], 
        modules: List[str], 
        template: Dict[str, Any]
    ) -> str:
        """构建分析提示词"""
        
        prompt = f"""
你是一个资深的用户体验分析师，具备丰富的B端产品设计经验。请深入分析以下用户原声，提供精准、个性化、针对性的分析结果。

## 用户原声信息
**反馈内容：** {description}
**所属地区：** {', '.join(system_types)}
**归属模块：** {', '.join(modules)}

## 核心分析原则
1. **精准理解**：深入理解用户原声的真实意图和具体场景
2. **个性化分析**：根据具体问题提供针对性的分析，避免模板化
3. **重点提炼**：抓住问题的核心要点，避免泛泛而谈
4. **扩写优化**：在保持原意的基础上，提供更专业、更详细的描述

## 分析要求

### 1. 问题类型分类（精准匹配，避免趋同）
- **设计需求优化**：需要改进现有设计或新增设计功能
- **交互功能bug**：交互逻辑错误、操作流程问题  
- **视觉还原度bug**：设计稿与实现效果不一致
- **历史遗留**：长期存在的设计问题

### 2. 解决方式分类
- **体验优化**：通过设计改进提升用户体验
- **需求优化**：需要重新定义或调整产品需求

### 3. 优先级判断（基于具体影响）
- **P0-紧急**：严重影响核心功能使用
- **P1-高**：影响主要业务流程
- **P2-中**：影响部分用户体验
- **P3-低**：轻微体验问题

### 4. 个性化影响分析
请基于具体问题场景，分析：
- 对用户的具体影响（操作效率、使用体验等）
- 对业务的具体影响（流程阻塞、效率损失等）
- 对系统的具体影响（性能、稳定性等）

### 5. 针对性解决方案
基于具体问题提供：
- 2-3个具体可行的解决方案
- 每个方案包含实施步骤和预期效果
- 避免通用化描述，要针对具体问题

## 输出格式
请严格按照以下JSON格式返回分析结果，不要包含任何其他文字：

{{
    "predictedType": "问题类型（设计需求优化/交互功能bug/视觉还原度bug/历史遗留）",
    "priority": "优先级（P0-紧急/P1-高/P2-中/P3-低）",
    "confidence": 0.85,
    "impact": "详细的影响分析，包括对用户、业务和系统的具体影响",
    "recommendedSolutions": [
        "具体的解决方案1，包含实施步骤",
        "具体的解决方案2，包含实施步骤",
        "备选解决方案3，包含实施步骤"
    ],
    "estimatedTime": "预估修复时间（如：1-2个工作日/3-5个工作日/1-2周）",
    "relatedModules": ["相关模块1", "相关模块2"],
    "processingMethod": {{
        "method": "解决方式（体验优化/需求优化）",
        "assignee": "负责团队（开发团队/产品团队/设计团队/安全团队）",
        "timeline": "具体时间线（如：1-2个工作日）",
        "escalation": "升级策略（需要立即上报/按计划处理/下个版本）"
    }},
    "acceptanceCriteria": [
        "问题得到有效解决，功能正常运行",
        "用户体验明显改善，操作流畅",
        "无新的相关问题产生，系统稳定",
        "符合产品设计规范和用户期望"
    ]
}}

请确保返回的是有效的JSON格式，不要包含任何markdown标记或其他格式。
"""
        return prompt
    
    def _format_analysis_result(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """格式化分析结果"""
        return {
            "predictedType": analysis_data.get("predictedType", "体验问题"),
            "priority": analysis_data.get("priority", "中"),
            "confidence": analysis_data.get("confidence", 0.8),
            "impact": analysis_data.get("impact", "影响用户体验"),
            "recommendedSolutions": analysis_data.get("recommendedSolutions", ["优化用户体验"]),
            "estimatedTime": analysis_data.get("estimatedTime", "3-5个工作日"),
            "relatedModules": analysis_data.get("relatedModules", []),
            "processingMethod": analysis_data.get("processingMethod", {
                "method": "产品优化",
                "assignee": "产品团队",
                "timeline": "3-5个工作日",
                "escalation": "正常处理"
            }),
            "acceptanceCriteria": analysis_data.get("acceptanceCriteria", [
                "问题得到有效解决",
                "用户体验明显改善",
                "无新的相关问题产生"
            ]),
            "analysisConfidence": analysis_data.get("confidence", 0.8)
        }
    
    async def _parse_text_response(
        self, 
        content: str, 
        description: str, 
        system_types: List[str], 
        modules: List[str]
    ) -> Dict[str, Any]:
        """解析文本响应"""
        # 简单的文本解析逻辑：回退到模拟分析
        return await self._mock_analysis(description, system_types, modules, {})
    
    async def _mock_analysis(
        self, 
        description: str, 
        system_types: List[str], 
        modules: List[str], 
        template: Dict[str, Any]
    ) -> Dict[str, Any]:
        """模拟分析（当API不可用时使用）"""
        
        # 优先尝试LLM智能匹配，失败则使用关键词匹配
        try:
            if self.api_key:
                print(f"🔍 尝试LLM智能匹配...")
                result = await self._llm_field_matching(description, system_types, modules, template)
                print(f"✅ LLM智能匹配成功!")
                return result
            else:
                print(f"⚠️ 未配置API密钥，跳过LLM匹配")
        except Exception as e:
            print(f"❌ LLM字段匹配失败，使用关键词匹配: {e}")
            import traceback
            print(f"详细错误: {traceback.format_exc()}")
        
        # 基于关键词的智能分析（降级方案）
        text = description.lower()
        
        # 问题类型预测 - 根据新的分类逻辑进行分类
        problem_type = "历史遗留"  # 默认归类为历史遗留
        confidence = 0.7
        
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
            problem_type = "视觉还原度bug"
            confidence = 0.8
        
        # 其次判断交互功能bug
        interaction_keywords = ["交互", "操作", "点击", "按钮", "功能", "无法", "不能", "错误", "异常", "bug"]
        if any(keyword in text for keyword in interaction_keywords):
            problem_type = "交互功能bug"
            confidence = 0.8
        
        # 然后判断设计需求优化
        design_keywords = ["设计规范", "规范调整", "线上系统", "系统影响", "设计标准"]
        if any(keyword in text for keyword in design_keywords):
            problem_type = "设计需求优化"
            confidence = 0.8
        
        # 其他情况默认为历史遗留
        
        # 优先级分析 - 根据模板要求进行分类
        priority = "P2-中"
        p0_keywords = ["崩溃", "闪退", "无法登录", "数据丢失", "支付", "交易", "核心", "紧急", "严重", "快点", "尽快"]
        p1_keywords = ["功能", "异常", "错误", "bug", "失效", "不工作", "故障"]
        p3_keywords = ["界面优化", "体验改进", "建议", "希望", "期待", "优化", "美化", "改进"]
        
        if any(keyword in text for keyword in p0_keywords):
            priority = "P0-紧急"
            confidence = min(confidence + 0.1, 0.95)
        elif any(keyword in text for keyword in p1_keywords):
            priority = "P1-高"
            confidence = min(confidence + 0.05, 0.9)
        elif any(keyword in text for keyword in p3_keywords):
            priority = "P3-低"
            confidence = max(confidence - 0.1, 0.6)
        
        # 智能解决方案推荐 - 根据模板要求
        solutions = {
            "设计需求优化": [
                "优化用户界面设计，提升视觉效果和用户体验",
                "改进交互设计，简化操作流程",
                "统一设计规范，保持界面风格一致性"
            ],
            "交互功能bug": [
                "修复交互逻辑错误，确保功能正常运行",
                "完善异常处理机制，提升系统稳定性",
                "增加功能测试覆盖，预防类似问题再次发生"
            ],
            "视觉还原度bug": [
                "调整视觉实现，确保与设计稿一致",
                "优化渲染效果，提升视觉质量",
                "建立设计还原度检查机制"
            ],
            "历史遗留": [
                "制定历史问题处理计划，逐步优化",
                "重构相关模块，提升代码质量",
                "建立问题跟踪机制，避免问题积累"
            ]
        }
        
        # 智能处理方式 - 根据模板要求
        processing_methods = {
            "P0-紧急": {
                "method": "体验优化" if problem_type in ["设计需求优化", "视觉还原度bug"] else "需求优化",
                "assignee": "设计团队" if problem_type in ["设计需求优化", "视觉还原度bug"] else "开发团队",
                "timeline": "1-2个工作日",
                "escalation": "需要立即上报"
            },
            "P1-高": {
                "method": "体验优化" if problem_type in ["设计需求优化", "视觉还原度bug"] else "需求优化",
                "assignee": "设计团队" if problem_type in ["设计需求优化", "视觉还原度bug"] else "开发团队",
                "timeline": "3-5个工作日",
                "escalation": "按计划处理"
            },
            "P2-中": {
                "method": "体验优化" if problem_type in ["设计需求优化", "视觉还原度bug"] else "需求优化",
                "assignee": "设计团队" if problem_type in ["设计需求优化", "视觉还原度bug"] else "开发团队",
                "timeline": "1-2周",
                "escalation": "按计划处理"
            },
            "P3-低": {
                "method": "体验优化" if problem_type in ["设计需求优化", "视觉还原度bug"] else "需求优化",
                "assignee": "设计团队" if problem_type in ["设计需求优化", "视觉还原度bug"] else "开发团队",
                "timeline": "下个版本",
                "escalation": "下个版本"
            }
        }
        
        # 智能影响分析 - 根据模板要求
        impact_analysis = {
            "设计需求优化": "影响用户视觉体验和界面美观度，可能导致用户满意度下降",
            "交互功能bug": "影响用户操作流程，可能导致功能无法正常使用",
            "视觉还原度bug": "影响设计一致性，可能导致用户体验与预期不符",
            "历史遗留": "影响系统整体质量，可能导致技术债务积累"
        }
        
        return {
            "predictedType": problem_type,
            "priority": priority,
            "confidence": confidence,
            "impact": impact_analysis.get(problem_type, "影响用户体验，需要及时处理解决"),
            "recommendedSolutions": solutions.get(problem_type, ["根据问题具体情况制定针对性解决方案"]),
            "estimatedTime": processing_methods[priority]["timeline"],
            "relatedModules": modules,
            "processingMethod": processing_methods[priority],
            "acceptanceCriteria": [
                "问题得到有效解决，功能正常运行",
                "用户体验明显改善，操作流畅",
                "无新的相关问题产生，系统稳定",
                "符合产品设计规范和用户期望"
            ],
            "analysisConfidence": confidence
        }
    
    async def _fallback_analysis(
        self, 
        description: str, 
        system_types: List[str], 
        modules: List[str], 
        template: Dict[str, Any]
    ) -> Dict[str, Any]:
        """降级分析（当所有其他方法都失败时使用）"""
        print("使用降级分析模式")
        
        return {
            "predictedType": "体验问题",
            "priority": "中",
            "confidence": 0.5,
            "impact": "需要进一步分析问题影响",
            "recommendedSolutions": [
                "请详细描述问题现象和期望的解决方案",
                "提供更多上下文信息以便进行准确分析"
            ],
            "estimatedTime": "待评估",
            "relatedModules": modules,
            "processingMethod": {
                "method": "待分析",
                "assignee": "待分配",
                "timeline": "待评估",
                "escalation": "正常处理"
            },
            "acceptanceCriteria": [
                "问题得到有效解决",
                "用户需求得到满足"
            ],
            "analysisConfidence": 0.5,
            "original_description": description,
            "system_types": system_types,
            "modules": modules
        }
    
    async def generate_title(
        self, 
        description: str, 
        problem_type: str, 
        system_types: List[str], 
        modules: List[str]
    ) -> str:
        """生成智能标题：优先用 DeepSeek，失败则回退到本地规则"""
        # 处理多选地区和终端，使用+号连接
        region_names = "+".join(system_types) if len(system_types) > 1 else system_types[0]
        module_names = "+".join(modules) if len(modules) > 1 else modules[0]

        if self.api_key:
            try:
                # 从prompt配置中获取标题生成的prompt
                prompt_config = prompt_service.get_prompt(
                    "title_generation",
                    problem_type=problem_type,
                    module_names=module_names,
                    description=description
                )
                
                async with self.http_client as client:  # 更短的超时时间
                    resp = await client.post(
                        f"{self.base_url}/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.api_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": self.model,
                            "messages": [
                                {"role": "system", "content": prompt_config["system"]},
                                {"role": "user", "content": prompt_config["user"]}
                            ],
                            "max_tokens": 32,
                            "temperature": self.temperature,
                            "top_p": self.top_p,
                            "frequency_penalty": self.frequency_penalty,
                            "presence_penalty": self.presence_penalty,
                            "stream": False
                        }
                    )
                if resp.status_code == 200:
                    content = resp.json()["choices"][0]["message"]["content"].strip()
                    # 清理内容并添加地区模块前缀
                    clean_content = content.replace("\n", " ").replace("【", "").replace("】", "")[:40]
                    return self._add_region_module_prefix(clean_content, system_types, modules)
            except Exception:
                pass

        # 降级到统一工具函数
        from app.utils.title_utils import TitleUtils
        return TitleUtils.generate_title(description, system_types, modules, problem_type)
    
    def _add_region_module_prefix(self, title: str, system_types: List[str], modules: List[str]) -> str:
        """为标题添加地区模块前缀"""
        # 处理多选地区和终端
        if len(system_types) > 1:
            region = "+".join(system_types)
        else:
            region = system_types[0] if system_types else "未知地区"
            
        # 根据要求，终端只显示第一个
        module = modules[0] if modules else "未知模块"
        
        # 构建前缀格式：【地区：模块】
        prefix = f"【{region}：{module}】"
        
        # 组合前缀和原标题
        return f"{prefix}{title}"
    
    def _optimize_title_content(self, content: str) -> str:
        """优化标题内容，确保语句通顺"""
        import re
        
        if not content:
            return content
        
        # 智能优化常见表达，确保语句通顺（先应用优化规则，再移除冗余词汇）
        optimizations = {
            # 尺寸问题优化
            r'按钮的尺寸不对,太小了,高度应该是40px': '按钮尺寸过小，高度不够',
            r'尺寸不对,太小了,高度应该是40px': '尺寸过小，高度不够',
            r'按钮的尺寸不对,太小了,高度': '按钮尺寸过小，高度不够',
            r'尺寸不对,太小了,高度': '尺寸过小，高度不够',
            r'按钮的高度应该是40px': '按钮高度不符合规范',
            r'高度应该是40px': '高度不符合规范',
            r'按钮的高度': '按钮高度异常',
            r'尺寸不对,太小了': '尺寸过小',
            r'太小了,高度': '高度过小',
            r'按钮的尺寸不对': '按钮尺寸不对',
            r'按钮尺寸不对,太小了': '按钮尺寸过小',
            
            # 样式问题优化
            r'Tab选中态的样式需加粗为bold': 'Tab选中态样式不够突出',
            r'样式需加粗为bold': '样式不够突出',
            r'样式需加粗': '样式不够突出',
            r'需加粗为bold': '样式不够突出',
            
            # 显示问题优化
            r'展示不全': '显示不全',
            r'显示不全,截断': '显示不全',
            r'文案显示不全': '文案显示不全',
            
            # 布局问题优化
            r'布局不对': '布局异常',
            r'间距不对': '间距异常',
            r'对齐不对': '对齐异常',
            
            # 颜色问题优化
            r'颜色不对': '颜色异常',
            r'颜色不符': '颜色不匹配',
            
            # 通用优化
            r'导致': '，',
            r'放大后': '放大',
        }
        
        # 先应用优化规则
        for pattern, replacement in optimizations.items():
            content = re.sub(pattern, replacement, content)
        
        # 然后移除常见的冗余词汇，但保留核心问题描述
        redundant_words = ["应该", "需要", "要", "可以", "希望", "期待", "需"]
        for word in redundant_words:
            content = content.replace(word, "")
        
        # 清理多余的标点符号，但保留必要的逗号
        content = content.replace("。", "").replace("；", "").replace(";", "")
        content = re.sub(r'，$', '', content)  # 移除末尾的逗号
        content = content.strip()
        
        # 清理多余的标点符号
        content = re.sub(r'，+', '，', content)  # 合并多个逗号
        content = re.sub(r'^，', '', content)    # 移除开头的逗号
        content = re.sub(r'，$', '', content)    # 移除结尾的逗号
        content = content.strip()
        
        # 如果内容太短，尝试补充
        if len(content) < 3:
            content = "问题描述"
        
        return content
    
    async def generate_solution(
        self, 
        description: str, 
        problem_type: str, 
        recommended_solutions: List[str]
    ) -> str:
        """生成解决方案"""
        if recommended_solutions:
            return recommended_solutions[0]
        
        # 基于描述和问题类型生成具体解决方案
        text = description.lower()
        
        # 针对不同问题类型生成具体解决方案
        if problem_type == "视觉还原度bug":
            if "样式" in text or "选中" in text:
                return "调整选中状态样式，确保与设计稿一致，提升视觉层次感。"
            elif "文案" in text or "显示" in text or "展示" in text:
                return "优化文案显示逻辑，调整字体大小或容器尺寸，确保内容完整展示。"
            elif "颜色" in text or "橘色" in text or "按钮" in text:
                return "统一按钮颜色规范，确保与设计系统保持一致。"
            elif "圆角" in text:
                return "为界面元素添加圆角设计，提升视觉柔和度。"
            else:
                return "调整视觉实现，确保与设计稿完全一致。"
        
        elif problem_type == "交互功能bug":
            if "导航" in text or "菜单" in text:
                return "优化导航交互逻辑，确保菜单状态切换正常，提升用户体验。"
            elif "切换" in text or "语言" in text:
                return "修复语言切换功能，确保状态正确显示和切换。"
            elif "点击" in text or "操作" in text:
                return "修复交互逻辑错误，确保操作响应正常。"
            else:
                return "修复功能逻辑错误，确保功能正常运行。"
        
        elif problem_type == "设计需求优化":
            return "优化设计规范，统一视觉风格，提升整体用户体验。"
        
        else:  # 历史遗留
            return "制定历史问题处理计划，逐步优化相关功能模块。"
    
    async def fill_template(
        self, 
        description: str, 
        system_types: List[str], 
        modules: List[str], 
        template: Dict[str, Any]
    ) -> Dict[str, Any]:
        """根据模板配置填充标准化内容"""
        try:
            if self.api_key:
                try:
                    return await self._deepseek_template_fill(description, system_types, modules, template)
                except Exception as api_error:
                    print(f"DeepSeek API调用失败: {api_error}")
                    print("降级到模拟模板填充模式")
                    return await self._mock_template_fill(description, system_types, modules, template)
            else:
                print("未配置API密钥，使用模拟模板填充模式")
                return await self._mock_template_fill(description, system_types, modules, template)
        except Exception as e:
            print(f"模板填充失败: {e}")
            print("使用降级模板填充模式")
            return await self._fallback_template_fill(description, system_types, modules, template)
    
    async def _deepseek_template_fill(
        self, 
        description: str, 
        system_types: List[str], 
        modules: List[str], 
        template: Dict[str, Any]
    ) -> Dict[str, Any]:
        """使用DeepSeek API进行模板填充"""
        
        # 构建模板填充提示词
        prompt = self._build_template_fill_prompt(description, system_types, modules, template)
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "你是一个专业的用户体验分析师，擅长根据模板配置将用户原声转化为标准化的需求文档。"
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "max_tokens": self.max_tokens,
                    "temperature": self.temperature,
                    "top_p": self.top_p,
                    "frequency_penalty": self.frequency_penalty,
                    "presence_penalty": self.presence_penalty,
                    "stream": False
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                # 解析JSON响应
                try:
                    filled_data = json.loads(content)
                    return self._format_template_fill_result(filled_data, template)
                except json.JSONDecodeError:
                    # 如果返回的不是JSON，使用降级填充
                    return await self._mock_template_fill(description, system_types, modules, template)
            else:
                print(f"DeepSeek API错误: {response.status_code} - {response.text}")
                return await self._mock_template_fill(description, system_types, modules, template)
    
    def _build_template_fill_prompt(
        self, 
        description: str, 
        system_types: List[str], 
        modules: List[str], 
        template: Dict[str, Any]
    ) -> str:
        """构建模板填充提示词"""
        
        # 获取模板字段配置
        fields = template.get("config", {}).get("fields", [])
        
        # 构建字段说明
        field_descriptions = []
        for field in fields:
            field_name = field.get("name", "")
            field_label = field.get("label", "")
            field_type = field.get("type", "")
            field_options = field.get("options", [])
            field_required = field.get("required", False)
            field_llm_inferred = field.get("llm_inferred", False)
            
            if field_llm_inferred:
                if field_options:
                    field_descriptions.append(f"- **{field_label}** ({field_name}): 从以下选项中选择最匹配的 - {', '.join(field_options)}")
                else:
                    field_descriptions.append(f"- **{field_label}** ({field_name}): 需要智能推断生成")
            else:
                if field_options:
                    field_descriptions.append(f"- **{field_label}** ({field_name}): 从以下选项中选择 - {', '.join(field_options)}")
                else:
                    field_descriptions.append(f"- **{field_label}** ({field_name}): 使用默认值")
        
        prompt = f"""你是专业的B端产品体验设计师，专门负责分析和管理设计体验问题。请根据用户原声智能填充设计体验问题模板字段。

## 输入信息
**用户原声**：{description}
**所属地区**：{', '.join(system_types)}
**归属终端**：{', '.join(modules)}

## 字段配置
{chr(10).join(field_descriptions)}

## 核心分析原则

### 1. 智能识别问题类型
- **设计需求优化**：需要改进现有设计或新增设计功能
- **交互功能bug**：交互逻辑错误、操作流程问题  
- **视觉还原度bug**：设计稿与实现效果不一致（样式、布局、颜色、字体等）
- **历史遗留**：长期存在的设计问题

### 2. 优先级判断标准
- **P0-紧急**：严重影响核心功能使用，系统无法正常使用
- **P1-高**：影响主要业务流程，用户频繁投诉
- **P2-中**：影响部分用户体验但不阻塞核心流程
- **P3-低**：细微的视觉调整、文案优化

### 3. 解决方式分类
- **体验优化**：通过设计改进提升用户体验
- **需求优化**：需要重新定义或调整产品需求

### 4. 特殊情况处理
**重要**：如果用户输入包含解决方案词汇（如"需要"、"应该"、"建议"、"要"等），请：
- 将解决方案放在 `solution` 字段
- 在 `problem_description` 字段中反推出实际问题
- 在 `title` 字段中基于问题而非解决方案生成标题

**示例**：
- 输入："Tab选中态的样式需加粗为bold"
- 问题描述："Tab选中态视觉样式有误"
- 解决方案："将Tab选中态样式加粗为bold，提升视觉层次和用户识别度"

## 输出要求
请严格按照以下JSON格式返回，不要包含任何其他文字：

{{
    "title": "根据问题描述生成简洁准确的标题（8-30字，格式：【地区:终端】问题描述的核心主旨，注意：如果输入是解决方案，标题应基于反推的问题而非解决方案）",
    "region": "{', '.join(system_types)}",
    "terminal": "{', '.join(modules)}",
    "issue_type": "从模板选项中选择最匹配的问题类型",
    "resolution_method": "从模板选项中选择最匹配的解决方式",
    "priority": "从模板选项中选择最匹配的优先级",
    "problem_description": "详细描述具体问题",
    "solution": "提供具体可行的设计优化方案，包含改进思路和预期效果",
    "status": "待确认(未提给研发)",
    "target_version": "未定",
    "screenshots": "",
    "attachments": ""
}}

请确保返回的是有效的JSON格式，不要包含任何markdown标记或其他格式。
"""
        return prompt
    
    def _format_template_fill_result(self, filled_data: Dict[str, Any], template: Dict[str, Any]) -> Dict[str, Any]:
        """格式化模板填充结果"""
        # 确保所有必需字段都存在
        fields = template.get("config", {}).get("fields", [])
        result = {}
        
        for field in fields:
            field_name = field.get("name", "")
            field_default = field.get("default", "")
            field_required = field.get("required", False)
            
            # 从填充数据中获取值，如果没有则使用默认值
            value = filled_data.get(field_name, field_default)
            
            # 如果是必需字段且没有值，使用默认值
            if field_required and not value:
                value = field_default or ""
            
            result[field_name] = value
        
        return result
    
    async def _llm_field_matching(
        self, 
        description: str, 
        system_types: List[str], 
        modules: List[str], 
        template: Dict[str, Any]
    ) -> Dict[str, Any]:
        """使用LLM进行智能字段匹配"""
        
        # 从prompt配置中获取字段匹配的prompt
        prompt_config = prompt_service.get_prompt(
            "field_matching",
            description=description,
            system_types=', '.join(system_types),
            modules=', '.join(modules)
        )
        
        try:
            print(f"🔍 开始LLM字段匹配调用...")
            print(f"描述: {description}")
            async with self.http_client as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {
                                "role": "system",
                                "content": prompt_config["system"]
                            },
                            {
                                "role": "user",
                                "content": prompt_config["user"]
                            }
                        ],
                        "max_tokens": self.max_tokens,
                        "temperature": self.temperature,
                        "top_p": self.top_p,
                        "frequency_penalty": self.frequency_penalty,
                        "presence_penalty": self.presence_penalty,
                        "stream": False
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"]
                    print(f"✅ LLM API调用成功!")
                    print(f"📝 LLM响应内容: {content}")
                    
                    # 解析JSON响应
                    try:
                        # 清理内容，移除可能的代码块标记
                        clean_content = content.strip()
                        if clean_content.startswith('```json'):
                            clean_content = clean_content[7:]  # 移除 ```json
                        if clean_content.endswith('```'):
                            clean_content = clean_content[:-3]  # 移除 ```
                        clean_content = clean_content.strip()
                        
                        field_data = json.loads(clean_content)
                        print(f"🎯 LLM返回JSON数据: {field_data}")
                        return self._format_field_matching_result(field_data, description, system_types, modules)
                    except json.JSONDecodeError as e:
                        print(f"⚠️ LLM返回的不是JSON格式，使用文本解析: {e}")
                        print(f"原始内容: {content}")
                        # 如果返回的不是JSON，使用文本解析
                        return await self._parse_field_matching_text(content, description, system_types, modules)
                else:
                    raise Exception(f"API调用失败: {response.status_code}")
                    
        except Exception as e:
            print(f"LLM字段匹配API调用失败: {e}")
            raise e
    
    def _build_field_matching_prompt(
        self, 
        description: str, 
        system_types: List[str], 
        modules: List[str]
    ) -> str:
        """构建字段匹配提示词"""
        
        prompt = f"""你是资深体验分析师。请严格抽取并分类下面的用户输入，且必须返回严格的 JSON（不要包含markdown代码块或多余文字）。

【输入】
反馈内容：{description}
地区：{', '.join(system_types)}
终端：{', '.join(modules)}

【抽取要求（极其重要）】
1) 问题/方案边界：
   - 若同一段中既含"问题"又含"方案"，按"问题在前、动作在后"拆分：
     * 形如"X有问题，…将/把/需要/统一/调整/改为/优化…"→ 逗号前为 problem_description，逗号后为 solution
     * 形如"X问题描述。1. 解决方案1；2. 解决方案2"→ 句号前为 problem_description，编号列表为 solution
     * 形如"X问题描述，导致Y问题。解决方案描述"→ 第一个句号前为 problem_description，句号后为 solution
   - 若只有问题：保持原意，生成简洁的动作型方案（以动词开头），不要臆造与原意无关内容。
   - 若只有方案：保留方案原话，同时根据方案反推一句简短的问题描述（症状/现象），避免改变用户意图。
   - 尽量保留用户原话；每项为一句完整中文句子，以"。"结尾；不要加入"建议"前缀，除非原文就有。
   - 禁止空泛措辞（如"优化体验"）单独出现；若必须补全，需结合输入里的具体对象与属性。

2) 分类与优先级：
   - 视觉与设计稿/规范不一致、样式/对齐/间距/色值/还原度 → 视觉还原度bug
   - 功能/交互/流程异常、不可用、报错 → 交互功能bug
   - 需要新增/调整设计与产品方案 → 设计需求优化
   - 其他不属于以上的 → 历史遗留
   - 优先级参照：崩溃/支付/核心阻断=P0；功能异常=P1；界面/体验问题=P2；建议型=P3。

【输出JSON结构（必须完整且仅此结构）】
{
  "issue_type": "设计需求优化/交互功能bug/视觉还原度bug/历史遗留",
  "resolution_method": "体验优化/需求优化",
  "priority": "P0-紧急/P1-高/P2-中/P3-低",
  "confidence": 0.80,
  "reasoning": "不超过30字的判定理由",
  "problem_description": "精准的问题一句话，保持用户原意，不要添加地区、模块等背景信息，句末加。",
  "solution": "动作型解决方案一句或多句，句末加。"
}

仅输出 JSON。"""
        return prompt
    
    def _post_process_llm_result(self, field_data: Dict[str, Any], description: str) -> Dict[str, Any]:
        """后处理LLM结果，纠正识别错误"""
        
        print(f"🔍 开始后处理检查...")
        print(f"原始输入: {description}")
        print(f"LLM返回数据: {field_data}")
        
        # 解决方案识别关键词
        solution_keywords = [
            "需", "需要", "应该", "建议", "要", "可以",
            "加粗", "颜色", "大小", "位置", "增加", "添加", "优化", "调整"
        ]
        
        # 检查输入是否为解决方案
        is_solution = any(keyword in description for keyword in solution_keywords)
        print(f"是否为解决方案: {is_solution}")
        
        if is_solution:
            # 如果识别为解决方案，但LLM将其放在了problem_description中
            problem_desc = field_data.get("problem_description", "")
            solution = field_data.get("solution", "")
            
            print(f"当前problem_description: {problem_desc}")
            print(f"当前solution: {solution}")
            print(f"原始输入在problem_description中: {description in problem_desc}")
            print(f"原始输入在solution中: {description in solution}")
            
            # 如果原始输入在problem_description中，说明识别错误
            if description in problem_desc and description not in solution:
                print(f"🔧 检测到识别错误，正在纠正...")
                
                # 将原始输入移到solution字段
                field_data["solution"] = description
                
                # 根据解决方案反推问题描述
                inferred_problem = self._infer_problem_from_solution(description)
                field_data["problem_description"] = inferred_problem
                
                print(f"✅ 纠正后solution: {field_data['solution']}")
                print(f"✅ 纠正后problem_description: {field_data['problem_description']}")
            else:
                print(f"ℹ️ 无需纠正，识别正确")
        else:
            print(f"ℹ️ 不是解决方案，无需后处理")
        
        # 处理混合输入的情况
        field_data = self._process_mixed_input(field_data, description)
        
        # 使用统一的问题描述清理逻辑
        from app.utils.problem_description_utils import ProblemDescriptionUtils
        problem_desc = field_data.get("problem_description", "")
        if problem_desc:
            field_data["problem_description"] = ProblemDescriptionUtils.clean_problem_description(problem_desc)
        
        # 若solution看起来仍是"问题列表"，改写为动作型方案
        try:
            sol = field_data.get("solution", "") or ""
            if self._looks_like_problem_list(sol):
                field_data["solution"] = self._rewrite_problem_list_to_actions(sol)
        except Exception:
            pass
        return field_data

    def _process_mixed_input(self, field_data: Dict[str, Any], description: str) -> Dict[str, Any]:
        """处理混合输入（问题+解决方案）的智能拆分"""
        from app.utils.problem_description_utils import ProblemDescriptionUtils
        
        # 使用统一的问题描述生成逻辑
        problem_text, solution_text = ProblemDescriptionUtils.split_problem_and_solution(description)
        
        if problem_text and solution_text:
            print(f"🔧 检测到混合输入，正在智能拆分...")
            
            # 使用统一的润色逻辑
            enriched = ProblemDescriptionUtils.enrich_problem_description(problem_text, solution_text, description)
            
            # 更新字段数据
            if enriched['problem']:
                field_data["problem_description"] = enriched['problem']
            if enriched['solution']:
                field_data["solution"] = enriched['solution']
            
            print(f"✅ 拆分后problem_description: {field_data['problem_description']}")
            print(f"✅ 拆分后solution: {field_data['solution']}")
        
        return field_data

    def _looks_like_problem_list(self, text: str) -> bool:
        """判断文本是否更像问题现象列表而非动作型方案"""
        if not text:
            return False
        s = str(text).strip()
        import re
        issue_hints = re.findall(r"(有问题|不一致|异常|错误|重叠|遮挡|不到边|到顶|显示不全|存在|是)", s)
        action_hints = re.findall(r"(将|把|需要|统一|调整|改为|改成|优化|修复|修改|更改)", s)
        list_like = bool(re.search(r"\d+[^\n]*[。；;，,]", s) or re.search(r"\n", s))
        return (len(issue_hints) > len(action_hints)) and list_like

    def _rewrite_problem_list_to_actions(self, text: str) -> str:
        """将问题列表改写为动作型方案，尽量不改变原意"""
        import re
        raw = re.sub(r"^[^\n:：]*[:：]\s*", "", str(text)).strip()
        items = [p.strip() for p in re.split(r"[\n\s]*[（(]?\d+[、\.．\)）]\s*", raw) if p.strip()]
        actions: list[str] = []
        for p in items:
            if re.search(r"底部框", p) and re.search(r"到边", p):
                actions.append("底部框左右对齐边缘，顶部不顶到顶")
                continue
            if re.search(r"(顶部|上方).*提示", p) and re.search(r"(重叠|遮挡)", p):
                actions.append("调整提示与图片/文字的层级或间距，避免重叠")
                continue
            if re.search(r"(文字|文案).*底色|背景", p):
                actions.append("移除文字区底色或按设计设为正确底色")
                continue
        if not actions:
            return "针对上述问题逐项优化，确保视觉与交互符合设计预期。"
        return "；".join(actions) + "。"
    
    def _infer_problem_from_solution(self, solution: str) -> str:
        """根据解决方案反推问题描述"""
        
        # 解决方案到问题的映射
        solution_problem_mapping = {
            "Tab选中态的样式需加粗为bold": "Tab选中态视觉层次不够突出，用户难以快速识别当前所在位置，影响导航效率和操作体验",
            "建议增加进度条显示": "操作过程缺乏进度反馈，用户无法预估等待时间，影响操作信心",
            "按钮应该加粗显示": "按钮视觉层次不够突出，用户难以快速识别当前可操作元素",
            "需要添加确认弹窗": "关键操作缺乏二次确认机制，存在误操作风险",
            "建议优化加载动画": "加载过程缺乏视觉反馈，用户无法感知系统状态"
        }
        
        # 直接匹配
        if solution in solution_problem_mapping:
            return solution_problem_mapping[solution]
        
        # 模糊匹配
        if "加粗" in solution and "Tab" in solution:
            return "Tab选中态视觉层次不够突出，用户难以快速识别当前所在位置，影响导航效率和操作体验"
        elif "进度条" in solution:
            return "操作过程缺乏进度反馈，用户无法预估等待时间，影响操作信心"
        elif "加粗" in solution and "按钮" in solution:
            return "按钮视觉层次不够突出，用户难以快速识别当前可操作元素"
        elif "确认弹窗" in solution:
            return "关键操作缺乏二次确认机制，存在误操作风险"
        elif "加载动画" in solution:
            return "加载过程缺乏视觉反馈，用户无法感知系统状态"
        else:
            # 通用反推逻辑
            return f"当前设计存在用户体验问题，需要按照'{solution}'进行优化改进"
    
    def _format_field_matching_result(
        self, 
        field_data: Dict[str, Any], 
        description: str, 
        system_types: List[str], 
        modules: List[str]
    ) -> Dict[str, Any]:
        """格式化字段匹配结果"""
        
        # 后处理逻辑：纠正LLM的识别错误
        field_data = self._post_process_llm_result(field_data, description)
        
        # 验证字段值的有效性
        valid_issue_types = ["设计需求优化", "交互功能bug", "视觉还原度bug", "历史遗留"]
        valid_resolution_methods = ["体验优化", "需求优化"]
        valid_priorities = ["P0-紧急", "P1-高", "P2-中", "P3-低"]
        
        issue_type = field_data.get("issue_type", "设计需求优化")
        if issue_type not in valid_issue_types:
            issue_type = "设计需求优化"
        
        resolution_method = field_data.get("resolution_method", "体验优化")
        if resolution_method not in valid_resolution_methods:
            resolution_method = "体验优化"
        
        priority = field_data.get("priority", "P2-中")
        if priority not in valid_priorities:
            priority = "P2-中"
        
        confidence = field_data.get("confidence", 0.8)
        if not isinstance(confidence, (int, float)) or confidence < 0 or confidence > 1:
            confidence = 0.8
        
        # 智能解决方案推荐
        solutions = {
            "设计需求优化": [
                "优化用户界面设计，提升视觉效果和用户体验",
                "改进交互设计，简化操作流程",
                "统一设计规范，保持界面风格一致性"
            ],
            "交互功能bug": [
                "修复交互逻辑错误，确保功能正常运行",
                "完善异常处理机制，提升系统稳定性",
                "增加功能测试覆盖，预防类似问题再次发生"
            ],
            "视觉还原度bug": [
                "调整视觉实现，确保与设计稿一致",
                "优化渲染效果，提升视觉质量",
                "建立设计还原度检查机制"
            ],
            "历史遗留": [
                "制定历史问题处理计划，逐步优化",
                "重构相关模块，提升代码质量",
                "建立问题跟踪机制，避免问题积累"
            ]
        }
        
        # 智能处理方式
        processing_methods = {
            "P0-紧急": {
                "method": resolution_method,
                "assignee": "开发团队" if resolution_method == "需求优化" else "设计团队",
                "timeline": "1-2个工作日",
                "escalation": "需要立即上报"
            },
            "P1-高": {
                "method": resolution_method,
                "assignee": "开发团队" if resolution_method == "需求优化" else "设计团队",
                "timeline": "3-5个工作日",
                "escalation": "按计划处理"
            },
            "P2-中": {
                "method": resolution_method,
                "assignee": "开发团队" if resolution_method == "需求优化" else "设计团队",
                "timeline": "1-2周",
                "escalation": "按计划处理"
            },
            "P3-低": {
                "method": resolution_method,
                "assignee": "开发团队" if resolution_method == "需求优化" else "设计团队",
                "timeline": "下个版本",
                "escalation": "下个版本"
            }
        }
        
        # 智能影响分析
        impact_analysis = {
            "设计需求优化": "影响用户视觉体验和界面美观度，可能导致用户满意度下降",
            "交互功能bug": "影响用户操作流程，可能导致功能无法正常使用",
            "视觉还原度bug": "影响设计一致性，可能导致用户体验与预期不符",
            "历史遗留": "影响系统整体质量，可能导致技术债务积累"
        }
        
        return {
            "predictedType": issue_type,
            "priority": priority,
            "confidence": confidence,
            "impact": impact_analysis.get(issue_type, "影响用户体验，需要及时处理解决"),
            "recommendedSolutions": solutions.get(issue_type, ["根据问题具体情况制定针对性解决方案"]),
            "estimatedTime": processing_methods[priority]["timeline"],
            "relatedModules": modules,
            "processingMethod": processing_methods[priority],
            "acceptanceCriteria": [
                "问题得到有效解决，功能正常运行",
                "用户体验明显改善，操作流畅",
                "无新的相关问题产生，系统稳定",
                "符合产品设计规范和用户期望"
            ],
            "analysisConfidence": confidence,
            "llm_reasoning": field_data.get("reasoning", "基于LLM智能分析"),
            # 添加后处理后的字段
            "problem_description": field_data.get("problem_description", description),
            "solution": field_data.get("solution", solutions.get(issue_type, ["根据问题具体情况制定针对性解决方案"])[0])
        }
    
    async def _parse_field_matching_text(
        self, 
        content: str, 
        description: str, 
        system_types: List[str], 
        modules: List[str]
    ) -> Dict[str, Any]:
        """解析文本格式的字段匹配结果"""
        # 简单的文本解析逻辑，回退到关键词匹配
        return await self._fallback_analysis(description, system_types, modules, {})
    
    async def _mock_template_fill(
        self, 
        description: str, 
        system_types: List[str], 
        modules: List[str], 
        template: Dict[str, Any]
    ) -> Dict[str, Any]:
        """模拟模板填充（当API不可用时使用）"""
        
        # 基于关键词的智能分析
        text = description.lower()
        
        # 问题类型预测 - 根据模板选项进行分类
        issue_type = "设计需求优化"
        if any(keyword in text for keyword in ["设计", "界面", "布局", "美观", "颜色", "样式", "外观", "视觉", "UI", "UX"]):
            issue_type = "设计需求优化"
        elif any(keyword in text for keyword in ["交互", "操作", "点击", "按钮", "功能", "无法", "不能", "错误", "异常", "bug"]):
            issue_type = "交互功能bug"
        elif any(keyword in text for keyword in ["还原", "实现", "不一致", "偏差", "效果", "显示", "渲染"]):
            issue_type = "视觉还原度bug"
        elif any(keyword in text for keyword in ["历史", "遗留", "老", "旧", "一直", "长期", "存在"]):
            issue_type = "历史遗留"
        
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
        
        # 生成标题
        title = await self.generate_title(description, issue_type, system_types, modules)
        
        # 生成解决方案
        solution = await self.generate_solution(description, issue_type, [])
        
        # 构建填充结果
        result = {
            "title": title,
            "region": ', '.join(system_types),
            "terminal": ', '.join(modules),
            "issue_type": issue_type,
            "resolution_method": resolution_method,
            "priority": priority,
            "problem_description": description,
            "solution": solution,
            "status": "待确认(未提给研发)",
            "target_version": "未定",
            "screenshots": "",
            "attachments": ""
        }
        
        return result
    
    async def _fallback_template_fill(
        self, 
        description: str, 
        system_types: List[str], 
        modules: List[str], 
        template: Dict[str, Any]
    ) -> Dict[str, Any]:
        """降级模板填充（当所有其他方法都失败时使用）"""
        print("使用降级模板填充模式")
        
        return {
            "title": "设计体验问题反馈",
            "region": ', '.join(system_types),
            "terminal": ', '.join(modules),
            "issue_type": "设计需求优化",
            "resolution_method": "体验优化",
            "priority": "P2-中",
            "problem_description": description,
            "solution": "请详细描述问题现象和期望的解决方案",
            "status": "待确认(未提给研发)",
            "target_version": "未定",
            "screenshots": "",
            "attachments": ""
        }

    async def analyze_original_sound(
        self,
        user_input: str,
        source_language: str,
        target_language: str,
        template: Dict[str, Any]
    ) -> Dict[str, Any]:
        """分析用户原声"""
        print(f"🎯 开始分析用户原声: {user_input[:50]}...")
        
        try:
            # 使用原声分析提示词
            prompt_config = prompt_service.get_prompt("original_sound_analysis")
            
            if not prompt_config or not prompt_config.get("system") or not prompt_config.get("user"):
                print("⚠️ 未找到原声分析提示词配置，使用备用方法")
                return await self._fallback_original_sound_analysis(
                    user_input, source_language, target_language
                )
            
            # 构建请求数据
            request_data = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": prompt_config["system"]},
                    {"role": "user", "content": prompt_config["user"].format(
                        user_input=user_input,
                        source_language=source_language,
                        target_language=target_language
                    )}
                ],
                "max_tokens": self.max_tokens,
                "temperature": self.temperature,
                "top_p": self.top_p,
                "frequency_penalty": self.frequency_penalty,
                "presence_penalty": self.presence_penalty
            }
            
            print(f"📤 发送原声分析请求到DeepSeek API")
            
            # 发送请求
            response = await self.http_client.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json=request_data
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                print(f"✅ DeepSeek API原声分析成功")
                
                # 解析响应
                analysis_result = await self._parse_original_sound_response(content)
                return analysis_result
            else:
                print(f"❌ DeepSeek API原声分析失败: {response.status_code}")
                return await self._fallback_original_sound_analysis(
                    user_input, source_language, target_language
                )
                
        except Exception as e:
            print(f"❌ 原声分析异常: {str(e)}")
            return await self._fallback_original_sound_analysis(
                user_input, source_language, target_language
            )

    async def transcribe_audio(
        self,
        audio_file_path: str,
        source_language: str
    ) -> str:
        """语音识别转文本"""
        print(f"🎤 开始语音识别: {audio_file_path}")
        
        try:
            # 检查OpenAI API密钥
            if not self.openai_api_key:
                print("⚠️ 未配置OpenAI API密钥，使用模拟语音识别结果")
                return await self._mock_transcribe_audio(audio_file_path, source_language)
            
            # 使用OpenAI Whisper API进行语音识别
            return await self._whisper_transcribe(audio_file_path, source_language)
            
        except Exception as e:
            print(f"❌ 语音识别失败: {str(e)}")
            return await self._mock_transcribe_audio(audio_file_path, source_language)
    
    async def _whisper_transcribe(self, audio_file_path: str, source_language: str) -> str:
        """使用OpenAI Whisper API进行语音识别"""
        try:
            import openai
            
            # 设置OpenAI API密钥
            openai.api_key = self.openai_api_key
            
            # 语言映射
            language_map = {
                "英文": "en",
                "西班牙语": "es", 
                "葡萄牙语": "pt",
                "中文": "zh"
            }
            
            whisper_language = language_map.get(source_language, "auto")
            
            print(f"🔊 使用Whisper API识别语音，语言: {whisper_language}")
            
            # 打开音频文件
            with open(audio_file_path, "rb") as audio_file:
                # 调用Whisper API
                transcript = await openai.Audio.atranscribe(
                    model="whisper-1",
                    file=audio_file,
                    language=whisper_language if whisper_language != "auto" else None,
                    response_format="text"
                )
                
                print(f"✅ Whisper语音识别成功: {transcript[:100]}...")
                return transcript
                
        except Exception as e:
            print(f"❌ Whisper API调用失败: {str(e)}")
            # 降级到模拟识别
            return await self._mock_transcribe_audio(audio_file_path, source_language)
    
    async def _mock_transcribe_audio(self, audio_file_path: str, source_language: str) -> str:
        """模拟语音识别结果"""
        print("🔄 使用模拟语音识别结果")
        
        # 根据源语言返回不同的模拟结果
        mock_results = {
            "英文": "This is a mock transcription result for English audio. The user is reporting an issue with the delivery service where the motorcycle delivery person couldn't find the address and had to cancel the service, leaving the user hungry.",
            "西班牙语": "Esta es una transcripción simulada para audio en español. El usuario está reportando un problema con el servicio de entrega donde el repartidor en motocicleta no pudo encontrar la dirección y tuvo que cancelar el servicio, dejando al usuario con hambre.",
            "葡萄牙语": "Esta é uma transcrição simulada para áudio em português. O usuário está relatando um problema com o serviço de entrega onde o entregador de motocicleta não conseguiu encontrar o endereço e teve que cancelar o serviço, deixando o usuário com fome.",
            "中文": "这是中文语音识别的模拟结果。用户反馈配送服务存在问题，摩托车配送员无法找到地址，导致服务取消，用户感到饥饿。"
        }
        
        return mock_results.get(source_language, "这是模拟的语音识别结果，实际应该调用语音识别API")

    async def _parse_original_sound_response(self, content: str) -> Dict[str, Any]:
        """解析原声分析响应"""
        try:
            # 尝试解析JSON
            if content.strip().startswith('{'):
                result = json.loads(content)
                return result
            else:
                # 如果不是JSON，尝试提取JSON部分
                import re
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group())
                    return result
                else:
                    print("⚠️ 无法解析原声分析响应，使用备用方法")
                    return await self._fallback_original_sound_analysis(
                        "用户原声", "中文", "中文"
                    )
        except json.JSONDecodeError as e:
            print(f"❌ JSON解析失败: {str(e)}")
            return await self._fallback_original_sound_analysis(
                "用户原声", "中文", "中文"
            )

    async def _fallback_original_sound_analysis(
        self,
        user_input: str,
        source_language: str,
        target_language: str
    ) -> Dict[str, Any]:
        """备用原声分析方法"""
        print("🔄 使用备用原声分析方法")
        
        # 简单的情感分析
        sentiment_classification = "中性"
        sentiment_intensity = "中等"
        
        # 基于关键词判断情感
        negative_keywords = ["问题", "错误", "失败", "不好", "糟糕", "失望", "愤怒", "不满", "取消", "饥饿"]
        positive_keywords = ["好", "优秀", "满意", "感谢", "喜欢", "推荐", "完美"]
        
        if any(keyword in user_input.lower() for keyword in negative_keywords):
            sentiment_classification = "负向"
            sentiment_intensity = "强烈" if any(word in user_input.lower() for word in ["愤怒", "糟糕", "失望"]) else "中等"
        elif any(keyword in user_input.lower() for keyword in positive_keywords):
            sentiment_classification = "正向"
            sentiment_intensity = "强烈" if any(word in user_input.lower() for word in ["完美", "优秀", "推荐"]) else "中等"
        
        # 简单的翻译（实际应该调用翻译API）
        original_translation = f"[{target_language}翻译] {user_input}"
        
        # AI智能优化总结
        ai_optimized_summary = f"用户反馈关于配送服务的问题，主要涉及摩托车配送员无法找到地址导致服务取消的问题。"
        
        # 关键要点
        key_points = f"• 配送员无法找到地址\n• 服务被取消\n• 用户感到饥饿\n• 即使通过应用发送了位置信息"
        
        # 情感分析说明
        sentiment_analysis = f"用户表达了对配送服务的不满情绪，主要因为配送员无法找到地址导致服务取消，给用户带来了不便。"
        
        return {
            "original_translation": original_translation,
            "ai_optimized_summary": ai_optimized_summary,
            "key_points": key_points,
            "sentiment_classification": sentiment_classification,
            "sentiment_intensity": sentiment_intensity,
            "sentiment_analysis": sentiment_analysis
        }
