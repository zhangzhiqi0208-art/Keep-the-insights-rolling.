# 🚀 Echoball 开发环境预览地址

## 📱 访问地址

### 🖥️ 本地访问
- **前端页面 (HTML版本)**: http://localhost:5173
- **后端API**: http://localhost:8001
- **API文档**: http://localhost:8001/docs
- **健康检查**: http://localhost:8001/health

### 🌍 局域网访问
- **前端页面 (HTML版本)**: http://172.24.189.160:5173
- **后端API**: http://172.24.189.160:8001
- **API文档**: http://172.24.189.160:8001/docs
- **健康检查**: http://172.24.189.160:8001/health

## 📝 当前版本说明

**当前运行的是今天早上的 HTML 版本**（根目录下的 `index.html`）
- 前端文件：`index.html`, `script.js`, `styles.css`
- 前端服务：Python HTTP Server (端口 5173)
- 后端服务：FastAPI/Uvicorn (端口 8000)

## 🛠️ 服务状态

### 启动服务
使用以下命令启动开发环境：

```bash
./start_dev.sh
```

### 停止服务
按 `Ctrl+C` 停止所有服务，或使用：

```bash
# 停止后端
if [ -f .backend.pid ]; then kill $(cat .backend.pid); rm -f .backend.pid; fi

# 停止前端
if [ -f .frontend.pid ]; then kill $(cat .frontend.pid); rm -f .frontend.pid; fi
```

## 📝 日志文件

- **后端日志**: `backend.log`
- **前端日志**: `frontend.log`

## 💡 提示

- 前端页面会自动连接到后端API（通过Vite代理）
- 修改代码后会自动热重载
- 后端支持自动重载（使用 `--reload` 参数）

## 🔧 技术栈

- **前端**: React + TypeScript + Vite + Ant Design
- **后端**: FastAPI + Python 3.9
- **端口配置**:
  - 前端开发服务器: 5173
  - 后端API服务器: 8000
