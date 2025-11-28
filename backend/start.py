#!/usr/bin/env python3
"""
FeedbackBridge Backend Startup Script
"""

import uvicorn
import os
import sys
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def main():
    """启动后端服务"""
    print("🚀 启动 FeedbackBridge 后端服务...")
    
    # 检查环境变量
    if not os.getenv("DEEPSEEK_API_KEY"):
        print("⚠️  警告: 未设置 DEEPSEEK_API_KEY，将使用模拟分析")
        print("   请复制 env.example 为 .env 并设置您的 API 密钥")
    
    # 启动服务
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        access_log=True
    )

if __name__ == "__main__":
    main()
