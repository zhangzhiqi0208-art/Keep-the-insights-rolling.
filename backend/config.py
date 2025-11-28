# 配置文件
import os

# DeepSeek API 配置
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "sk-b7811a92e1554e038b9a8e30529402be")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

# 服务配置
HOST = "0.0.0.0"
PORT = 8001

# 模型配置
MODEL_NAME = "deepseek-chat"
MAX_TOKENS = 1000
TEMPERATURE = 0.3
TIMEOUT = 30
