"""
Prompt管理服务
用于加载和管理LLM的prompt配置
"""

import json
import os
from typing import Dict, Any, Optional

class PromptService:
    """Prompt管理服务类"""
    
    def __init__(self):
        self.prompts_file = os.path.join(os.path.dirname(__file__), "..", "..", "prompts.json")
        self.prompts_config = self._load_prompts()
    
    def _load_prompts(self) -> Dict[str, Any]:
        """加载prompt配置文件"""
        try:
            if os.path.exists(self.prompts_file):
                with open(self.prompts_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            else:
                print(f"⚠️ Prompt配置文件不存在: {self.prompts_file}")
                return self._get_default_config()
        except Exception as e:
            print(f"❌ 加载prompt配置失败: {e}")
            return self._get_default_config()
    
    def _get_default_config(self) -> Dict[str, Any]:
        """获取默认配置"""
        return {
            "version": "1.0.0",
            "description": "默认LLM Prompt配置",
            "prompts": {},
            "settings": {
                "max_tokens": 512,
                "temperature": 0.1,
                "top_p": 0.8,
                "frequency_penalty": 0.0,
                "presence_penalty": 0.0,
                "timeout": 25.0
            }
        }
    
    def get_prompt(self, prompt_type: str, **kwargs) -> Dict[str, str]:
        """
        获取指定类型的prompt
        
        Args:
            prompt_type: prompt类型 (field_matching, title_generation, solution_generation, template_fill)
            **kwargs: 用于格式化prompt的参数
        
        Returns:
            包含system和user prompt的字典
        """
        prompts = self.prompts_config.get("prompts", {})
        prompt_config = prompts.get(prompt_type, {})
        
        if not prompt_config:
            print(f"⚠️ 未找到prompt类型: {prompt_type}")
            return {"system": "", "user": ""}
        
        system_prompt = prompt_config.get("system", "")
        user_prompt = prompt_config.get("user", "")
        
        # 格式化user prompt中的占位符
        if kwargs and user_prompt:
            try:
                user_prompt = user_prompt.format(**kwargs)
            except KeyError as e:
                print(f"⚠️ Prompt格式化失败，缺少参数: {e}")
        
        return {
            "system": system_prompt,
            "user": user_prompt
        }
    
    def get_settings(self) -> Dict[str, Any]:
        """获取LLM设置"""
        return self.prompts_config.get("settings", {})
    
    def reload_prompts(self) -> bool:
        """重新加载prompt配置"""
        try:
            self.prompts_config = self._load_prompts()
            print("✅ Prompt配置重新加载成功")
            return True
        except Exception as e:
            print(f"❌ 重新加载prompt配置失败: {e}")
            return False
    
    def update_prompt(self, prompt_type: str, system: str = None, user: str = None) -> bool:
        """
        更新指定类型的prompt
        
        Args:
            prompt_type: prompt类型
            system: 系统prompt
            user: 用户prompt
        
        Returns:
            是否更新成功
        """
        try:
            if "prompts" not in self.prompts_config:
                self.prompts_config["prompts"] = {}
            
            if prompt_type not in self.prompts_config["prompts"]:
                self.prompts_config["prompts"][prompt_type] = {}
            
            if system is not None:
                self.prompts_config["prompts"][prompt_type]["system"] = system
            
            if user is not None:
                self.prompts_config["prompts"][prompt_type]["user"] = user
            
            # 保存到文件
            with open(self.prompts_file, 'w', encoding='utf-8') as f:
                json.dump(self.prompts_config, f, ensure_ascii=False, indent=2)
            
            print(f"✅ Prompt类型 {prompt_type} 更新成功")
            return True
            
        except Exception as e:
            print(f"❌ 更新prompt失败: {e}")
            return False
    
    def list_prompt_types(self) -> list:
        """获取所有可用的prompt类型"""
        return list(self.prompts_config.get("prompts", {}).keys())
    
    def get_prompt_info(self, prompt_type: str) -> Dict[str, Any]:
        """获取prompt的详细信息"""
        prompts = self.prompts_config.get("prompts", {})
        return prompts.get(prompt_type, {})

# 全局实例
prompt_service = PromptService()
