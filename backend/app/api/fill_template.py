from fastapi import APIRouter, HTTPException, Form
from typing import Dict, Any, List
import json
from app.services.llm_service import LLMService
from app.services.template_service import TemplateService

router = APIRouter(prefix="/api/fill-template", tags=["template-fill"])
llm_service = LLMService()
template_service = TemplateService()

@router.post("/fill")
async def fill_template(
    description: str = Form(...),
    system_types: str = Form(...),
    modules: str = Form(...),
    template_id: str = Form("design_experience_issue")
):
    """根据模板配置填充标准化内容"""
    try:
        # 解析JSON字符串
        system_types_list = json.loads(system_types)
        modules_list = json.loads(modules)
        
        # 验证输入
        if not description or len(description.strip()) < 10:
            raise HTTPException(status_code=400, detail="问题描述至少需要10个字符")
        
        if not system_types_list:
            raise HTTPException(status_code=400, detail="请选择所属地区")
        
        if not modules_list:
            raise HTTPException(status_code=400, detail="请选择归属终端/模块")
        
        # 获取模板配置
        template = await template_service.get_template(template_id)
        if not template:
            raise HTTPException(status_code=404, detail="模板不存在")
        
        # 调用LLM进行模板填充
        filled_data = await llm_service.fill_template(
            description=description,
            system_types=system_types_list,
            modules=modules_list,
            template=template
        )
        
        return {
            "success": True,
            "data": filled_data,
            "template_id": template_id,
            "message": "模板填充完成"
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="参数格式错误")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"模板填充失败: {str(e)}")

@router.get("/template/{template_id}")
async def get_template_config(template_id: str):
    """获取模板配置信息"""
    try:
        template = await template_service.get_template(template_id)
        if not template:
            raise HTTPException(status_code=404, detail="模板不存在")
        
        return {
            "success": True,
            "template": template,
            "message": "模板配置获取成功"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取模板配置失败: {str(e)}")

@router.get("/templates")
async def list_templates():
    """获取所有可用模板列表"""
    try:
        templates = await template_service.get_all_templates()
        return {
            "success": True,
            "templates": templates,
            "message": "模板列表获取成功"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取模板列表失败: {str(e)}")
