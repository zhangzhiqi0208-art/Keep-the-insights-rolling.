# Echoball / FeedbackBridge - 智能原声清洗系统

一个基于 AI 的智能原声清洗与问题转化系统，将用户原声快速转化为结构化的需求信息，提升团队协作效率。

当前仓库已经基于 **单页 HTML + 原生 JS 前端 + FastAPI 后端** 的精简架构，去掉了旧的 React/Vite 前端和多余备份目录，下面的说明已按你现在的实际结构重写。

## 🚀 功能特性

- **智能分析**：集成 DeepSeek LLM，对用户原声进行情绪、问题类型、模块等多维度分析
- **模板化管理**：支持多种转化模板（设计体验问题、用户反馈类等）
- **结果结构化**：自动生成结构化字段，便于后续进入问题看板/需求系统
- **一键导出 Excel**：前端直接生成 Excel 文件，方便拉回本地继续编辑
- **历史记录**：后端记录每次转化结果，支持回看与追踪

## 🛠️ 技术栈（现有架构）

### 前端
- **形式**：单页应用（`index.html` + `script.js` + `styles.css`）
- **技术**：原生 HTML / CSS / JavaScript
- **Excel 支持**：SheetJS（`xlsx.full.min.js`）

### 后端
- **框架**：FastAPI
- **运行**：uvicorn
- **数据库**：SQLite + SQLAlchemy
- **LLM**：DeepSeek API（通过自定义服务封装）

## 📦 项目结构（精简后）

```text
Echoball/
├── index.html              # 前端主页面（当前线上效果的源码）
├── script.js               # 前端主逻辑
├── styles.css              # 前端样式
├── xlsx.full.min.js        # Excel 处理库
├── icon/                   # 图标资源
├── image/                  # 图片资源
├── templates/              # 模板 Markdown
├── backend/                # 后端服务
│   ├── app/                # 业务代码（API、services、models 等）
│   ├── main.py             # FastAPI 入口
│   ├── prompts.json        # LLM Prompt 配置
│   ├── requirements.txt    # 后端依赖
│   └── env.example         # 环境变量示例
├── docs/                   # 各类说明文档（部署、备份、路径修复等）
├── tools/                  # 数据/调试用脚本
├── start.sh                # 一键启动脚本（前端 8000 + 后端 8001）
├── start_dev.sh            # 开发模式脚本（可选）
└── quick-deploy.sh         # 生成前端打包目录的脚本
```

## 🚀 快速开始（与你现在的用法一致）

### 环境要求

- Python 3.9+
- DeepSeek API Key（必须，用于真实调用）

### 1. 克隆项目

```bash
git clone <repository-url>
cd Echoball
```

### 2. 安装后端依赖并配置环境变量

```bash
cd backend

# （推荐）创建虚拟环境
python3 -m venv venv
source venv/bin/activate        # Windows 使用: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置 .env
cp env.example .env
# 打开并填写 DEEPSEEK_API_KEY 等配置
```

### 3. 一键启动

```bash
cd ..
./start.sh
```

`start.sh` 会：
- 在后台启动后端：`http://localhost:8001`
- 使用 `python3 -m http.server 8000` 启动前端静态页面：`http://localhost:8000`

### 4. 访问地址

- 🌐 前端页面：`http://localhost:8000`
- 📡 后端 API：`http://localhost:8001`
- 📚 API 文档：`http://localhost:8001/docs`

## 📖 使用流程（HTML 前端）

1. 打开 `http://localhost:8000`
2. 在顶部 Tab 切换「用户原声池 / 问题跟进池」
3. 选择模板（如设计体验问题、用户反馈类）
4. 输入/粘贴原声内容，补充模块、地区、终端等维度
5. 点击转换按钮，等待右侧出现结构化结果
6. 如需导出，点击下载 Excel 按钮，保存本地

## 🔧 开发说明（后端）

```bash
cd backend
source venv/bin/activate

# 启动开发服务器（如果不走 start.sh，也可以手动）
python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

更多 API 细节请参考：
- 运行后访问 `http://localhost:8001/docs`
- 或阅读 `docs/API_IMPLEMENTATION.md`

