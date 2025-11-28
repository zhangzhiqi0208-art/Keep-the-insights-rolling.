"""
统一的标题生成API
为前端提供统一的标题生成接口
"""
from fastapi import APIRouter, HTTPException, Form
from typing import List
import json
from app.utils.title_utils import TitleUtils

router = APIRouter(prefix="/api/title", tags=["title-generation"])

@router.post("/generate")
async def generate_title(
    description: str = Form(...),
    system_types: str = Form(...),
    modules: str = Form(...),
    problem_type: str = Form("设计需求优化")
):
    """统一的标题生成API"""
    try:
        # 解析JSON字符串
        system_types_list = json.loads(system_types)
        modules_list = json.loads(modules)
        
        # 验证输入
        if not description or len(description.strip()) < 3:
            raise HTTPException(status_code=400, detail="问题描述至少需要3个字符")
        
        if not system_types_list:
            raise HTTPException(status_code=400, detail="请选择所属地区")
        
        if not modules_list:
            raise HTTPException(status_code=400, detail="请选择归属终端/模块")
        
        # 使用统一工具函数生成标题
        title = TitleUtils.generate_title(description, system_types_list, modules_list, problem_type)
        
        # 验证标题格式
        if not TitleUtils.validate_title(title):
            # 如果验证失败，使用默认标题
            title = TitleUtils.format_region_module_prefix(system_types_list, modules_list) + "问题描述需要优化"
        
        return {
            "success": True,
            "title": title,
            "message": "标题生成成功"
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="参数格式错误")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"标题生成失败: {str(e)}")

@router.post("/validate")
async def validate_title(title: str = Form(...)):
    """验证标题格式"""
    try:
        is_valid = TitleUtils.validate_title(title)
        return {
            "success": True,
            "valid": is_valid,
            "message": "标题格式正确" if is_valid else "标题格式需要调整"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"标题验证失败: {str(e)}")
