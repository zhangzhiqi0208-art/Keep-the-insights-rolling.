"""
智能填充问题API
根据关联原声数据，使用DeepSeek API提炼核心问题，生成问题标题和问题描述
"""
from fastapi import APIRouter, HTTPException, Form
from typing import Dict, Any
import json
from app.services.llm_service import LLMService

router = APIRouter(prefix="/api/smart-fill-problem", tags=["smart-fill-problem"])
llm_service = LLMService()

@router.post("/fill")
async def smart_fill_problem(
    original_sound: str = Form(...)
):
    """根据原声数据智能填充问题标题和问题描述"""
    try:
        # 验证输入
        if not original_sound or len(original_sound.strip()) < 3:
            raise HTTPException(status_code=400, detail="原声内容至少需要3个字符")
        
        # 构建提示词，使用专业的用户洞察分析师prompt
        prompt = f"""# Role: 用户洞察分析师

## Background & Goal
你是一名专业的用户洞察分析师，擅长从用户的原始反馈中洞察本质、挖掘核心矛盾与真实期望。你的任务是将一段用户原声，提炼并转化为结构化的"问题标题"和"问题描述"。

## Original User Input
{original_sound}

请遵循以下步骤进行分析：

1.  **信息提取与 paraphrase：** 首先，用自己的话简要重述用户陈述的核心事实，确保理解无误。
2.  **本质与矛盾分析：** 基于重述，深入分析：
    - **根本问题/本质：** 这反映了什么深层问题？（如：机制缺陷、信息不对称、体验断层、期望落差等）
    - **核心矛盾：** 用户面临的冲突是什么？（如："想省钱"与"怕麻烦"的矛盾，"追求效率"与"系统复杂"的矛盾等）
    - **真实期望：** 用户真正希望达成的状态或获得的体验是什么？
3.  **结构化输出：** 将上述分析结果，严格遵循以下格式要求，转化为两个字段。

## Output Format Requirements
**必须**使用以下Markdown格式输出，不要有任何多余的说明或思考过程。

```markdown
**问题标题：** [在这里填写提炼出的问题标题]
**问题描述：** [在这里填写详细的问题描述]
```"""

        # 调用DeepSeek API
        try:
            import httpx
            import os
            
            api_key = os.getenv("DEEPSEEK_API_KEY")
            if not api_key:
                raise HTTPException(status_code=500, detail="未配置DeepSeek API密钥")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.deepseek.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "deepseek-chat",
                        "messages": [
                            {
                                "role": "system",
                                "content": "你是一名专业的用户洞察分析师，擅长从用户的原始反馈中洞察本质、挖掘核心矛盾与真实期望。你的任务是将用户原声提炼并转化为结构化的'问题标题'和'问题描述'。"
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "max_tokens": 1000,
                        "temperature": 0.7,
                        "stream": False
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"].strip()
                    
                    # 解析Markdown格式的输出
                    title = ""
                    description = ""
                    
                    # 移除markdown代码块标记（如果有）
                    if content.startswith("```markdown"):
                        content = content.replace("```markdown", "").replace("```", "").strip()
                    elif content.startswith("```"):
                        content = content.replace("```", "").strip()
                    
                    # 提取问题标题
                    title_match = None
                    if "**问题标题：**" in content:
                        title_match = content.split("**问题标题：**")[1].split("**问题描述：**")[0].strip()
                    elif "问题标题：" in content:
                        title_match = content.split("问题标题：")[1].split("问题描述：")[0].strip()
                    
                    if title_match:
                        title = title_match.strip()
                    
                    # 提取问题描述
                    desc_match = None
                    if "**问题描述：**" in content:
                        desc_match = content.split("**问题描述：**")[1].strip()
                    elif "问题描述：" in content:
                        desc_match = content.split("问题描述：")[1].strip()
                    
                    if desc_match:
                        # 移除可能的markdown格式标记
                        description = desc_match.replace("**", "").strip()
                    
                    # 如果解析失败，使用降级方案
                    if not title or not description:
                        # 尝试从原始内容中提取
                        lines = [line.strip() for line in content.split("\n") if line.strip()]
                        if not title and lines:
                            title = lines[0].replace("**问题标题：**", "").replace("问题标题：", "").replace("**", "").strip()
                        if not description and len(lines) > 1:
                            description = "\n".join(lines[1:]).replace("**问题描述：**", "").replace("问题描述：", "").replace("**", "").strip()
                    
                    # 最终降级方案
                    if not title:
                        title = original_sound[:30] if len(original_sound) > 30 else original_sound
                    if not description:
                        description = original_sound
                    
                    return {
                        "success": True,
                        "title": title,
                        "description": description,
                        "message": "智能填充成功"
                    }
                else:
                    raise HTTPException(status_code=response.status_code, detail=f"DeepSeek API调用失败: {response.text}")
                    
        except Exception as api_error:
            print(f"DeepSeek API调用失败: {api_error}")
            # 降级方案：使用简单的规则生成
            title = original_sound[:30] if len(original_sound) > 30 else original_sound
            description = original_sound
            
            return {
                "success": True,
                "title": title,
                "description": description,
                "message": "智能填充完成（使用降级方案）"
            }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"智能填充失败: {str(e)}")

