#!/usr/bin/env python3
from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
import sys
import os

# 添加当前目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 创建FastAPI应用
app = FastAPI(title="FeedbackBridge API", version="1.0.0")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "FeedbackBridge API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/original-sound/process-text")
async def process_text_original_sound(
    user_input: str = Form(...),
    source_language: str = Form(...),
    target_language: str = Form(...),
    user_id: str = Form("default_user")
):
    """处理文本类原声"""
    try:
        print(f"📝 处理文本原声: {user_input[:50]}...")
        print(f"🌐 源语言: {source_language} -> 目标语言: {target_language}")
        
        # 模拟处理结果
        analysis_result = {
            "original_translation": f"[{target_language}翻译] {user_input}",
            "ai_optimized_summary": "用户反馈关于配送服务的问题，主要涉及摩托车配送员无法找到地址导致服务取消的问题。",
            "key_points": "• 配送员无法找到地址\n• 服务被取消\n• 用户感到饥饿\n• 即使通过应用发送了位置信息",
            "sentiment_classification": "负向",
            "sentiment_intensity": "强烈",
            "sentiment_analysis": "用户表达了对配送服务的不满情绪，主要因为配送员无法找到地址导致服务取消，给用户带来了不便。"
        }
        
        return {
            "success": True,
            "analysis": analysis_result,
            "standard_format": "标准化格式内容",
            "message": "文本原声处理完成"
        }
        
    except Exception as e:
        print(f"❌ 处理失败: {e}")
        raise HTTPException(status_code=500, detail=f"处理失败: {str(e)}")

if __name__ == "__main__":
    print("🚀 启动简化FeedbackBridge后端服务...")
    print("📍 服务地址: http://localhost:8001")
    print("📚 API文档: http://localhost:8001/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        reload=False,
        log_level="info"
    )
