#!/bin/bash

# Echoball 快速启动脚本

echo "🚀 启动 Echoball 服务..."
echo ""

# 进入项目目录
cd "$(dirname "$0")"

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 python3，请先安装 Python 3"
    exit 1
fi

# 检查后端虚拟环境
if [ ! -d "backend/venv" ]; then
    echo "⚠️  警告: 未找到虚拟环境，请先创建："
    echo "   cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# 启动后端服务器（端口8001）
echo "📡 启动后端服务器 (端口 8001)..."
cd backend
source venv/bin/activate
python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 3

# 启动前端服务器（端口8000）
echo "🌐 启动前端服务器 (端口 8000)..."
python3 -m http.server 8000 > frontend.log 2>&1 &
FRONTEND_PID=$!

# 等待前端启动
sleep 2

echo ""
echo "✅ 服务启动成功！"
echo ""
echo "📱 访问地址："
echo "   🌐 前端页面: http://localhost:8000"
echo "   📡 后端API:  http://localhost:8001"
echo "   📚 API文档:  http://localhost:8001/docs"
echo ""
echo "💡 提示："
echo "   - 前端页面会自动连接到后端API"
echo "   - 按 Ctrl+C 停止所有服务"
echo ""
echo "📝 进程ID："
echo "   - 后端: $BACKEND_PID"
echo "   - 前端: $FRONTEND_PID"
echo ""

# 保存进程ID以便后续停止
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

# 等待用户中断
trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f .backend.pid .frontend.pid; echo '✅ 服务已停止'; exit" INT TERM

# 保持脚本运行
wait