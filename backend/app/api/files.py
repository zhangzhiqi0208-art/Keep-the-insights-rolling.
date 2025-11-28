from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List, Dict, Any
import os
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/files", tags=["files"])

# 文件上传配置
UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/avi"]
ALLOWED_DOCUMENT_TYPES = ["application/pdf", "text/plain", "application/msword"]

@router.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    """上传文件"""
    try:
        # 确保上传目录存在
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        uploaded_files = []
        
        for file in files:
            # 验证文件大小
            if file.size > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400, 
                    detail=f"文件 {file.filename} 超过10MB限制"
                )
            
            # 验证文件类型
            if not _is_allowed_file_type(file.content_type):
                raise HTTPException(
                    status_code=400,
                    detail=f"不支持的文件类型: {file.content_type}"
                )
            
            # 生成唯一文件名
            file_extension = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            # 保存文件
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # 记录文件信息
            file_info = {
                "id": str(uuid.uuid4()),
                "original_name": file.filename,
                "stored_name": unique_filename,
                "file_path": file_path,
                "size": file.size,
                "content_type": file.content_type,
                "upload_time": datetime.now().isoformat()
            }
            
            uploaded_files.append(file_info)
        
        return {
            "message": "上传成功",
            "files": uploaded_files,
            "total_size": sum(f["size"] for f in uploaded_files)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"上传失败: {str(e)}")

@router.post("/upload-single")
async def upload_single_file(file: UploadFile = File(...)):
    """上传单个文件"""
    try:
        # 确保上传目录存在
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # 验证文件大小
        if file.size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"文件 {file.filename} 超过10MB限制"
            )
        
        # 验证文件类型
        if not _is_allowed_file_type(file.content_type):
            raise HTTPException(
                status_code=400,
                detail=f"不支持的文件类型: {file.content_type}"
            )
        
        # 生成唯一文件名
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # 保存文件
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # 返回文件信息
        file_info = {
            "id": str(uuid.uuid4()),
            "original_name": file.filename,
            "stored_name": unique_filename,
            "file_path": file_path,
            "size": file.size,
            "content_type": file.content_type,
            "upload_time": datetime.now().isoformat()
        }
        
        return {
            "message": "上传成功",
            "file": file_info
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"上传失败: {str(e)}")

@router.get("/{file_id}")
async def get_file_info(file_id: str):
    """获取文件信息"""
    try:
        # 这里应该从数据库获取文件信息
        # 暂时返回模拟数据
        return {
            "id": file_id,
            "message": "文件信息获取功能待实现"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取文件信息失败: {str(e)}")

@router.delete("/{file_id}")
async def delete_file(file_id: str):
    """删除文件"""
    try:
        # 这里应该从数据库和文件系统删除文件
        # 暂时返回成功
        return {"message": "文件删除成功"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除文件失败: {str(e)}")

def _is_allowed_file_type(content_type: str) -> bool:
    """检查文件类型是否允许"""
    allowed_types = (
        ALLOWED_IMAGE_TYPES + 
        ALLOWED_VIDEO_TYPES + 
        ALLOWED_DOCUMENT_TYPES
    )
    return content_type in allowed_types

def _get_file_category(content_type: str) -> str:
    """获取文件分类"""
    if content_type in ALLOWED_IMAGE_TYPES:
        return "image"
    elif content_type in ALLOWED_VIDEO_TYPES:
        return "video"
    elif content_type in ALLOWED_DOCUMENT_TYPES:
        return "document"
    else:
        return "other"
