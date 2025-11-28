#!/usr/bin/env python3
import uvicorn
from main import app

if __name__ == "__main__":
    print("🚀 启动FeedbackBridge后端服务...")
    print("📍 服务地址: http://localhost:8001")
    print("📚 API文档: http://localhost:8001/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        reload=False,
        log_level="info"
    )

