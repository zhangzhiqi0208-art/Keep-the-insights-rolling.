@echo off
chcp 65001 >nul

echo 🚀 启动 FeedbackBridge 智能反馈转化系统...

REM 检查 Node.js 是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装 Node.js 16+
    pause
    exit /b 1
)

REM 检查 Python 是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 3 未安装，请先安装 Python 3.8+
    pause
    exit /b 1
)

REM 检查 npm 是否安装
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm 未安装，请先安装 npm
    pause
    exit /b 1
)

echo ✅ 环境检查通过

REM 启动后端服务
echo 🔧 启动后端服务...
cd backend

REM 检查虚拟环境
if not exist "venv" (
    echo 📦 创建 Python 虚拟环境...
    python -m venv venv
)

REM 激活虚拟环境
call venv\Scripts\activate.bat

REM 安装依赖
echo 📦 安装后端依赖...
pip install -r requirements.txt

REM 检查环境变量文件
if not exist ".env" (
    echo ⚙️  创建环境变量文件...
    copy env.example .env
    echo ⚠️  请编辑 backend\.env 文件，设置您的 DEEPSEEK_API_KEY
)

REM 启动后端服务（后台运行）
echo 🚀 启动后端服务 (http://localhost:8000)...
start /b python start.py

REM 等待后端服务启动
timeout /t 3 /nobreak >nul

REM 启动前端服务
echo 🎨 启动前端服务...
cd ..\frontend

REM 检查 node_modules
if not exist "node_modules" (
    echo 📦 安装前端依赖...
    npm install
)

REM 启动前端服务
echo 🚀 启动前端服务 (http://localhost:5173)...
start /b npm run dev

REM 等待前端服务启动
timeout /t 5 /nobreak >nul

echo.
echo 🎉 FeedbackBridge 启动成功！
echo.
echo 📱 前端应用: http://localhost:5173
echo 🔧 后端API: http://localhost:8000
echo 📖 API文档: http://localhost:8000/docs
echo.
echo 按任意键停止服务...

pause >nul

echo 🛑 正在停止服务...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
echo ✅ 服务已停止
