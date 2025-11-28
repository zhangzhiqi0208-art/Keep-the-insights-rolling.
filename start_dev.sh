#!/bin/bash

# Echoball 开发环境启动脚本
# 同时启动前后端服务，提供实时预览

echo "🚀 启动 Echoball 开发环境..."
echo ""

# 进入项目目录
cd "$(dirname "$0")"

# 检查 Python 环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 python3，请先安装 Python 3"
    exit 1
fi

# 检查 Node.js 环境
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 node，请先安装 Node.js"
    exit 1
fi

# 检查后端虚拟环境
if [ ! -d "backend/venv" ]; then
    echo "⚠️  警告: 未找到虚拟环境，正在创建..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# 清理之前的进程
if [ -f ".backend.pid" ]; then
    OLD_PID=$(cat .backend.pid)
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo "🛑 停止旧的后端进程..."
        kill $OLD_PID 2>/dev/null
    fi
    rm -f .backend.pid
fi

if [ -f ".frontend.pid" ]; then
    OLD_PID=$(cat .frontend.pid)
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo "🛑 停止旧的前端进程..."
        kill $OLD_PID 2>/dev/null
    fi
    rm -f .frontend.pid
fi

# 启动后端服务器（端口 8000，与 Vite 代理配置一致）
echo "📡 启动后端服务器 (端口 8000)..."
cd backend
source venv/bin/activate
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 3

# 检查后端是否启动成功
if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo "❌ 后端启动失败，请查看 backend.log"
    exit 1
fi

# 检查前端依赖
if [ ! -d "frontend/node_modules" ]; then
    echo "⚠️  警告: 未找到前端依赖，正在安装..."
    cd frontend
    npm install
    cd ..
fi

# 启动前端开发服务器（端口 5173）
echo "🌐 启动前端开发服务器 (端口 5173)..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# 等待前端启动
echo "⏳ 等待前端服务启动..."
sleep 5

# 检查前端是否启动成功
if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
    echo "❌ 前端启动失败，请查看 frontend.log"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 保存进程ID
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

# 获取本机IP地址（用于局域网访问）
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="localhost"
fi

echo ""
echo "✅ 服务启动成功！"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 预览地址："
echo ""
echo "   🖥️  本地访问:"
echo "      🌐 前端页面: http://localhost:5173"
echo "      📡 后端API:  http://localhost:8000"
echo "      📚 API文档:  http://localhost:8000/docs"
echo ""
if [ "$LOCAL_IP" != "localhost" ]; then
    echo "   🌍 局域网访问:"
    echo "      🌐 前端页面: http://$LOCAL_IP:5173"
    echo "      📡 后端API:  http://$LOCAL_IP:8000"
    echo "      📚 API文档:  http://$LOCAL_IP:8000/docs"
    echo ""
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 提示："
echo "   - 前端页面会自动连接到后端API"
echo "   - 修改代码后会自动热重载"
echo "   - 按 Ctrl+C 停止所有服务"
echo "   - 日志文件: backend.log 和 frontend.log"
echo ""
echo "📝 进程ID："
echo "   - 后端: $BACKEND_PID"
echo "   - 前端: $FRONTEND_PID"
echo ""

# 等待用户中断
trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f .backend.pid .frontend.pid; echo '✅ 服务已停止'; exit" INT TERM

# 保持脚本运行
wait




