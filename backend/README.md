# FeedbackBridge Backend

智能反馈转化系统的后端服务，基于 Python FastAPI 构建。

## 功能特性

- 🚀 FastAPI 高性能 Web 框架
- 🤖 集成 DeepSeek LLM API 进行智能分析
- 📝 模板化管理系统
- 📁 文件上传和管理
- 🗄️ SQLite 数据库支持
- 🔄 异步处理支持

## 技术栈

- **框架**: FastAPI 0.104.1
- **数据库**: SQLite + SQLAlchemy
- **LLM**: DeepSeek API
- **文件处理**: aiofiles
- **异步支持**: uvicorn

## 快速开始

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp env.example .env

# 编辑 .env 文件，设置您的 DeepSeek API 密钥
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 3. 启动服务

```bash
# 方式1: 使用启动脚本
python start.py

# 方式2: 直接使用 uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. 访问服务

- API 文档: http://localhost:8000/docs
- 健康检查: http://localhost:8000/health

## API 接口

### 核心接口

- `POST /api/convert` - 反馈转化
- `GET /api/templates` - 获取模板列表
- `POST /api/upload` - 文件上传
- `GET /api/history` - 获取历史记录

### 详细文档

启动服务后访问 http://localhost:8000/docs 查看完整的 API 文档。

## 项目结构

```
backend/
├── app/
│   ├── api/              # API 路由
│   │   ├── analysis.py   # 分析相关接口
│   │   ├── files.py      # 文件管理接口
│   │   └── templates.py  # 模板管理接口
│   ├── models/           # 数据模型
│   │   ├── database.py   # 数据库配置
│   │   └── feedback.py   # 反馈数据模型
│   └── services/         # 业务逻辑
│       ├── llm_service.py      # LLM 服务
│       └── template_service.py # 模板服务
├── main.py              # 主应用文件
├── start.py             # 启动脚本
├── requirements.txt     # 依赖列表
└── README.md           # 说明文档
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | 无 |
| `DATABASE_URL` | 数据库连接字符串 | sqlite:///./feedback_bridge.db |
| `UPLOAD_DIR` | 文件上传目录 | uploads |
| `MAX_FILE_SIZE` | 最大文件大小 | 10485760 (10MB) |

## 开发说明

### 添加新的 API 接口

1. 在 `app/api/` 目录下创建新的路由文件
2. 在 `main.py` 中注册路由
3. 更新 API 文档

### 添加新的服务

1. 在 `app/services/` 目录下创建服务文件
2. 实现业务逻辑
3. 在需要的地方导入使用

### 数据库迁移

使用 Alembic 进行数据库迁移：

```bash
# 初始化迁移
alembic init migrations

# 创建迁移
alembic revision --autogenerate -m "描述"

# 执行迁移
alembic upgrade head
```

## 故障排除

### 常见问题

1. **API 密钥未设置**
   - 确保在 `.env` 文件中设置了 `DEEPSEEK_API_KEY`
   - 未设置时会使用模拟分析

2. **端口被占用**
   - 修改 `start.py` 中的端口号
   - 或使用 `--port` 参数指定端口

3. **依赖安装失败**
   - 确保使用 Python 3.8+
   - 建议使用虚拟环境

### 日志查看

服务启动后会显示详细的日志信息，包括：
- 请求处理日志
- 错误信息
- 性能指标

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
