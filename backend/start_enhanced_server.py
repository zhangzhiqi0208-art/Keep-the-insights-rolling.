#!/usr/bin/env python3
"""
启动增强版FeedbackBridge后端服务
支持真实的DeepSeek API调用
"""
import os
import sys
import uvicorn

# 添加当前目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def check_api_key():
    """检查API密钥配置"""
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key or api_key == "sk-your-api-key-here":
        print("⚠️  警告: 未配置DeepSeek API密钥")
        print("请设置环境变量: export DEEPSEEK_API_KEY=your-actual-api-key")
        print("或者修改 config.py 文件中的 DEEPSEEK_API_KEY")
        return False
    return True

def main():
    print("🚀 启动增强版FeedbackBridge后端服务...")
    print("📍 服务地址: http://localhost:8001")
    print("📚 API文档: http://localhost:8001/docs")
    
    # 检查API密钥
    if not check_api_key():
        print("❌ 请先配置API密钥")
        return
    
    print("✅ API密钥配置正确")
    print("🔗 开始启动服务...")
    
    try:
        from enhanced_server import app
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8001,
            reload=False,
            log_level="info"
        )
    except Exception as e:
        print(f"❌ 启动失败: {e}")

if __name__ == "__main__":
    main()

