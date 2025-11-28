from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, delete
from typing import List, Optional
import uuid
from datetime import datetime
from pydantic import BaseModel

from app.models.database import get_db
from app.models.feedback import ConversionHistory

router = APIRouter(prefix="/api/history", tags=["history"])

class SaveHistoryRequest(BaseModel):
    user_id: str
    title: str
    original_description: str
    system_types: List[str]
    modules: List[str]
    analysis_result: dict
    standard_format: dict
    template_id: str = "default"
    files_info: Optional[List[dict]] = None

@router.post("/save")
async def save_conversion_history(
    request: SaveHistoryRequest,
    db: AsyncSession = Depends(get_db)
):
    """保存转化历史记录"""
    try:
        # 创建历史记录
        history_record = ConversionHistory(
            id=str(uuid.uuid4()),
            user_id=request.user_id,
            title=request.title,
            original_description=request.original_description,
            system_types=request.system_types,
            modules=request.modules,
            analysis_result=request.analysis_result,
            standard_format=request.standard_format,
            template_id=request.template_id,
            files_info=request.files_info or [],
            status="completed"
        )
        
        db.add(history_record)
        await db.commit()
        await db.refresh(history_record)
        
        # 清理旧记录，只保留最近50条
        await cleanup_old_records(request.user_id, db)
        
        return {
            "success": True,
            "id": history_record.id,
            "message": "历史记录保存成功"
        }
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"保存历史记录失败: {str(e)}")

@router.get("/list")
async def get_conversion_history(
    user_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """获取用户转化历史记录列表"""
    try:
        # 计算偏移量
        offset = (page - 1) * page_size
        
        # 查询历史记录
        stmt = (
            select(ConversionHistory)
            .where(ConversionHistory.user_id == user_id)
            .order_by(desc(ConversionHistory.created_at))
            .offset(offset)
            .limit(page_size)
        )
        
        result = await db.execute(stmt)
        records = result.scalars().all()
        
        # 查询总数
        count_stmt = select(ConversionHistory).where(ConversionHistory.user_id == user_id)
        count_result = await db.execute(count_stmt)
        total = len(count_result.scalars().all())
        
        # 格式化返回数据
        history_list = []
        for record in records:
            history_list.append({
                "id": record.id,
                "title": record.title,
                "original_description": record.original_description[:100] + "..." if len(record.original_description) > 100 else record.original_description,
                "system_types": record.system_types,
                "modules": record.modules,
                "analysis_result": record.analysis_result,
                "standard_format": record.standard_format,
                "template_id": record.template_id,
                "files_info": record.files_info,
                "status": record.status,
                "created_at": record.created_at.isoformat() if record.created_at else None,
                "updated_at": record.updated_at.isoformat() if record.updated_at else None
            })
        
        return {
            "success": True,
            "data": history_list,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取历史记录失败: {str(e)}")

@router.get("/detail/{record_id}")
async def get_conversion_detail(
    record_id: str,
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """获取转化历史记录详情"""
    try:
        stmt = select(ConversionHistory).where(
            ConversionHistory.id == record_id,
            ConversionHistory.user_id == user_id
        )
        
        result = await db.execute(stmt)
        record = result.scalar_one_or_none()
        
        if not record:
            raise HTTPException(status_code=404, detail="历史记录不存在")
        
        return {
            "success": True,
            "data": {
                "id": record.id,
                "title": record.title,
                "original_description": record.original_description,
                "system_types": record.system_types,
                "modules": record.modules,
                "analysis_result": record.analysis_result,
                "standard_format": record.standard_format,
                "template_id": record.template_id,
                "files_info": record.files_info,
                "status": record.status,
                "created_at": record.created_at.isoformat() if record.created_at else None,
                "updated_at": record.updated_at.isoformat() if record.updated_at else None
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取历史记录详情失败: {str(e)}")

@router.delete("/delete/{record_id}")
async def delete_conversion_history(
    record_id: str,
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """删除转化历史记录"""
    try:
        stmt = select(ConversionHistory).where(
            ConversionHistory.id == record_id,
            ConversionHistory.user_id == user_id
        )
        
        result = await db.execute(stmt)
        record = result.scalar_one_or_none()
        
        if not record:
            raise HTTPException(status_code=404, detail="历史记录不存在")
        
        await db.delete(record)
        await db.commit()
        
        return {
            "success": True,
            "message": "历史记录删除成功"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"删除历史记录失败: {str(e)}")

@router.delete("/clear")
async def clear_user_history(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """清空用户所有历史记录"""
    try:
        stmt = delete(ConversionHistory).where(ConversionHistory.user_id == user_id)
        result = await db.execute(stmt)
        await db.commit()
        
        return {
            "success": True,
            "message": f"已清空 {result.rowcount} 条历史记录"
        }
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"清空历史记录失败: {str(e)}")

async def cleanup_old_records(user_id: str, db: AsyncSession, max_records: int = 50):
    """清理用户的历史记录，只保留最近50条"""
    try:
        # 查询用户的所有记录，按创建时间倒序
        stmt = (
            select(ConversionHistory)
            .where(ConversionHistory.user_id == user_id)
            .order_by(desc(ConversionHistory.created_at))
        )
        
        result = await db.execute(stmt)
        all_records = result.scalars().all()
        
        # 如果记录数超过限制，删除多余的记录
        if len(all_records) > max_records:
            records_to_delete = all_records[max_records:]
            for record in records_to_delete:
                await db.delete(record)
            
            await db.commit()
            print(f"已清理用户 {user_id} 的 {len(records_to_delete)} 条旧历史记录")
            
    except Exception as e:
        print(f"清理历史记录失败: {str(e)}")
        # 不抛出异常，避免影响主要功能
