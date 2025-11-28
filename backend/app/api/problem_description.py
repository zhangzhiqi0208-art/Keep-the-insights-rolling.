"""
统一的问题描述生成API
为前端提供统一的问题描述生成接口
"""
from fastapi import APIRouter, HTTPException, Form
from typing import List, Dict, Any
import json
from app.utils.problem_description_utils import ProblemDescriptionUtils

router = APIRouter(prefix="/api/problem-description", tags=["problem-description"])

@router.post("/generate")
async def generate_problem_description(
    description: str = Form(...),
    system_types: str = Form("[]"),
    modules: str = Form("[]")
):
    """统一的问题描述生成API"""
    try:
        # 解析JSON字符串
        system_types_list = json.loads(system_types) if system_types != "[]" else []
        modules_list = json.loads(modules) if modules != "[]" else []
        
        # 验证输入
        if not description or len(description.strip()) < 3:
            raise HTTPException(status_code=400, detail="问题描述至少需要3个字符")
        
        # 使用统一工具函数生成问题描述
        problem_description = ProblemDescriptionUtils.generate_problem_description(
            description, system_types_list, modules_list
        )
        
        # 验证生成的问题描述
        validation = ProblemDescriptionUtils.validate_problem_description(problem_description)
        
        return {
            "success": True,
            "problem_description": problem_description,
            "validation": validation,
            "message": "问题描述生成成功"
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="参数格式错误")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"问题描述生成失败: {str(e)}")

@router.post("/split")
async def split_problem_and_solution(
    description: str = Form(...)
):
    """拆分问题和解决方案API"""
    try:
        if not description or len(description.strip()) < 3:
            raise HTTPException(status_code=400, detail="描述内容至少需要3个字符")
        
        # 使用统一工具函数拆分
        problem_text, solution_text = ProblemDescriptionUtils.split_problem_and_solution(description)
        
        return {
            "success": True,
            "problem_text": problem_text,
            "solution_text": solution_text,
            "message": "拆分成功"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"拆分失败: {str(e)}")

@router.post("/enrich")
async def enrich_problem_description(
    problem_text: str = Form(...),
    solution_text: str = Form(""),
    original: str = Form("")
):
    """润色问题描述API"""
    try:
        # 使用统一工具函数润色
        enriched = ProblemDescriptionUtils.enrich_problem_description(
            problem_text, solution_text, original
        )
        
        return {
            "success": True,
            "enriched_problem": enriched['problem'],
            "enriched_solution": enriched['solution'],
            "message": "润色成功"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"润色失败: {str(e)}")

@router.post("/validate")
async def validate_problem_description(
    problem_description: str = Form(...)
):
    """验证问题描述格式API"""
    try:
        # 使用统一工具函数验证
        validation = ProblemDescriptionUtils.validate_problem_description(problem_description)
        
        return {
            "success": True,
            "validation": validation,
            "message": "验证完成"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"验证失败: {str(e)}")

@router.post("/clean")
async def clean_problem_description(
    problem_description: str = Form(...)
):
    """清理问题描述API"""
    try:
        if not problem_description:
            raise HTTPException(status_code=400, detail="问题描述不能为空")
        
        # 使用统一工具函数清理
        cleaned = ProblemDescriptionUtils.clean_problem_description(problem_description)
        
        return {
            "success": True,
            "cleaned_description": cleaned,
            "message": "清理成功"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"清理失败: {str(e)}")
