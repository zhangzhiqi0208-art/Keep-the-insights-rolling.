from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv
import json
from datetime import datetime
import uuid

# 导入自定义模块
from app.models.database import init_db
from app.services.llm_service import LLMService
from app.services.template_service import TemplateService
from app.api import api_router

# 加载环境变量
load_dotenv()

# 创建FastAPI应用
app = FastAPI(
    title="FeedbackBridge API",
    description="智能反馈转化系统API",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源，包括file://协议
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化服务
llm_service = LLMService()
template_service = TemplateService()

# 注册路由
app.include_router(api_router)

# 数据模型
class FeedbackRequest(BaseModel):
    description: str
    system_types: List[str]
    modules: List[str]
    template_id: Optional[str] = "default"

class AnalysisResult(BaseModel):
    id: str
    timestamp: str
    title: str
    description: str
    system_types: List[str]
    modules: List[str]
    analysis: Dict[str, Any]
    standard_format: Dict[str, Any]

class TemplateInfo(BaseModel):
    id: str
    name: str
    description: str
    category: str
    config: Dict[str, Any]

# 启动事件
@app.on_event("startup")
async def startup_event():
    """应用启动时初始化数据库"""
    await init_db()
    print("🚀 FeedbackBridge API 启动成功")

# 健康检查
@app.get("/")
async def root():
    return {"message": "FeedbackBridge API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# 反馈转化API
@app.post("/api/convert", response_model=AnalysisResult)
async def convert_feedback(
    description: str = Form(...),
    system_types: str = Form(...),  # JSON字符串
    modules: str = Form(...),       # JSON字符串
    template_id: str = Form("default"),
    files: List[UploadFile] = File([])
):
    """将用户原声转化为标准化格式"""
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
        
        # 调用LLM进行智能分析
        analysis_result = await llm_service.analyze_feedback(
            description=description,
            system_types=system_types_list,
            modules=modules_list,
            template=template,
            files=files
        )
        
        # 生成标准化格式
        standard_format = await template_service.generate_standard_format(
            analysis_result, template
        )
        
        # 创建结果
        result = AnalysisResult(
            id=str(uuid.uuid4()),
            timestamp=datetime.now().isoformat(),
            title=standard_format.get("title", ""),
            description=description,
            system_types=system_types_list,
            modules=modules_list,
            analysis=analysis_result,
            standard_format=standard_format
        )
        
        return result
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="参数格式错误")
    except Exception as e:
        print(f"转化失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"转化失败: {str(e)}")

# 模板管理API
@app.get("/api/templates", response_model=List[TemplateInfo])
async def get_templates():
    """获取所有可用模板"""
    try:
        templates = await template_service.get_all_templates()
        return templates
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取模板失败: {str(e)}")

@app.get("/api/templates/{template_id}", response_model=TemplateInfo)
async def get_template(template_id: str):
    """获取特定模板详情"""
    try:
        template = await template_service.get_template(template_id)
        if not template:
            raise HTTPException(status_code=404, detail="模板不存在")
        return template
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取模板失败: {str(e)}")

# 历史记录API已移至 app/api/history.py

# 文件上传API
@app.post("/api/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    """上传文件"""
    try:
        uploaded_files = []
        for file in files:
            # 验证文件类型和大小
            if file.size > 10 * 1024 * 1024:  # 10MB
                raise HTTPException(status_code=400, detail=f"文件 {file.filename} 超过10MB限制")
            
            # 保存文件（这里简化处理）
            file_info = {
                "filename": file.filename,
                "size": file.size,
                "content_type": file.content_type,
                "upload_time": datetime.now().isoformat()
            }
            uploaded_files.append(file_info)
        
        return {"message": "上传成功", "files": uploaded_files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"上传失败: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
