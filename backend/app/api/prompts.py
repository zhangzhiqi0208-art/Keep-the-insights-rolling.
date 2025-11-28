"""
Prompt管理API端点
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.prompt_service import prompt_service

router = APIRouter(prefix="/api/prompts", tags=["prompts"])

class PromptUpdateRequest(BaseModel):
    """Prompt更新请求"""
    system: Optional[str] = None
    user: Optional[str] = None

class PromptResponse(BaseModel):
    """Prompt响应"""
    success: bool
    data: Dict[str, Any]
    message: str

@router.get("/list", response_model=PromptResponse)
async def list_prompts():
    """获取所有可用的prompt类型"""
    try:
        prompt_types = prompt_service.list_prompt_types()
        return PromptResponse(
            success=True,
            data={"prompt_types": prompt_types},
            message="获取prompt类型列表成功"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取prompt列表失败: {str(e)}")

@router.get("/{prompt_type}", response_model=PromptResponse)
async def get_prompt(prompt_type: str):
    """获取指定类型的prompt"""
    try:
        prompt_info = prompt_service.get_prompt_info(prompt_type)
        if not prompt_info:
            raise HTTPException(status_code=404, detail=f"未找到prompt类型: {prompt_type}")
        
        return PromptResponse(
            success=True,
            data={"prompt_type": prompt_type, "prompt": prompt_info},
            message="获取prompt成功"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取prompt失败: {str(e)}")

@router.put("/{prompt_type}", response_model=PromptResponse)
async def update_prompt(prompt_type: str, request: PromptUpdateRequest):
    """更新指定类型的prompt"""
    try:
        success = prompt_service.update_prompt(
            prompt_type=prompt_type,
            system=request.system,
            user=request.user
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="更新prompt失败")
        
        return PromptResponse(
            success=True,
            data={"prompt_type": prompt_type},
            message="更新prompt成功"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新prompt失败: {str(e)}")

@router.post("/reload", response_model=PromptResponse)
async def reload_prompts():
    """重新加载prompt配置"""
    try:
        success = prompt_service.reload_prompts()
        if not success:
            raise HTTPException(status_code=500, detail="重新加载prompt配置失败")
        
        return PromptResponse(
            success=True,
            data={},
            message="重新加载prompt配置成功"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"重新加载prompt配置失败: {str(e)}")

@router.get("/config/settings", response_model=PromptResponse)
async def get_settings():
    """获取LLM设置"""
    try:
        settings = prompt_service.get_settings()
        return PromptResponse(
            success=True,
            data={"settings": settings},
            message="获取LLM设置成功"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取LLM设置失败: {str(e)}")
