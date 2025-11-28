from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.services.template_service import TemplateService

router = APIRouter(prefix="/api/templates", tags=["templates"])
template_service = TemplateService()

@router.get("/", response_model=List[Dict[str, Any]])
async def get_templates():
    """获取所有可用模板"""
    try:
        templates = await template_service.get_all_templates()
        return templates
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取模板失败: {str(e)}")

@router.get("/{template_id}", response_model=Dict[str, Any])
async def get_template(template_id: str):
    """获取特定模板详情"""
    try:
        template = await template_service.get_template(template_id)
        if not template:
            raise HTTPException(status_code=404, detail="模板不存在")
        return template
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取模板失败: {str(e)}")

@router.post("/", response_model=Dict[str, Any])
async def create_template(template_data: Dict[str, Any]):
    """创建新模板"""
    try:
        template = await template_service.create_template(template_data)
        return template
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建模板失败: {str(e)}")

@router.put("/{template_id}", response_model=Dict[str, Any])
async def update_template(template_id: str, template_data: Dict[str, Any]):
    """更新模板"""
    try:
        template = await template_service.update_template(template_id, template_data)
        return template
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新模板失败: {str(e)}")

@router.delete("/{template_id}")
async def delete_template(template_id: str):
    """删除模板"""
    try:
        success = await template_service.delete_template(template_id)
        if not success:
            raise HTTPException(status_code=404, detail="模板不存在")
        return {"message": "模板删除成功"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除模板失败: {str(e)}")
