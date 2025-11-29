# FeedbackBridge 部署指南

## 🚀 快速部署方案（推荐）

### 方案一：Vercel + Railway（最简单）

#### 前端部署到 Vercel

1. **准备前端文件**
   ```bash
   # 在项目根目录创建前端部署文件夹
   mkdir frontend-deploy
   cd frontend-deploy
   
   # 复制前端文件
   cp ../index.html .
   cp ../script.js .
   cp ../styles.css .
   cp -r ../icon .
   cp -r ../image .
   cp ../xlsx.full.min.js .
   ```

2. **修改 API 地址**
   - 编辑 `script.js`，将后端 API 地址改为 Railway 部署的地址
   - 例如：`const API_BASE_URL = 'https://your-app.railway.app'`

3. **部署到 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 注册/登录账号
   - 点击 "New Project"
   - 选择 "Import Git Repository" 或直接上传文件夹
   - 配置项目名称
   - 点击 "Deploy"

#### 后端部署到 Railway

1. **准备后端文件**
   ```bash
   # 在项目根目录创建后端部署文件夹
   mkdir backend-deploy
   cd backend-deploy
   
   # 复制后端文件
   cp -r ../backend/* .
   ```

2. **创建 Railway 配置文件**
   ```bash
   # 创建 railway.json
   cat > railway.json << EOF
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "python start.py",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   EOF
   ```

3. **部署到 Railway**
   - 访问 [railway.app](https://railway.app)
   - 注册/登录账号
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo" 或上传代码
   - 配置环境变量：
     ```
     DEEPSEEK_API_KEY=your_api_key_here
     ```
   - 点击 "Deploy"

### 方案二：Netlify + Render

#### 前端部署到 Netlify

1. **准备前端文件**（同上）

2. **创建 netlify.toml**
   ```toml
   [build]
     publish = "."
     command = "echo 'Static site'"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **部署到 Netlify**
   - 访问 [netlify.com](https://netlify.com)
   - 注册/登录账号
   - 拖拽文件夹到部署区域
   - 或连接 GitHub 仓库

#### 后端部署到 Render

1. **准备后端文件**（同上）

2. **创建 render.yaml**
   ```yaml
   services:
     - type: web
       name: feedback-bridge-backend
       env: python
       buildCommand: pip install -r requirements.txt
       startCommand: python start.py
       envVars:
         - key: DEEPSEEK_API_KEY
           sync: false
   ```

3. **部署到 Render**
   - 访问 [render.com](https://render.com)
   - 注册/登录账号
   - 选择 "New Web Service"
   - 连接 GitHub 仓库或上传代码

## 🔧 详细部署步骤

### 步骤 1：准备部署文件

```bash
# 创建部署目录
mkdir feedback-bridge-deploy
cd feedback-bridge-deploy

# 创建前端部署包
mkdir frontend
cp ../index.html frontend/
cp ../script.js frontend/
cp ../styles.css frontend/
cp -r ../icon frontend/
cp -r ../image frontend/
cp ../xlsx.full.min.js frontend/

# 创建后端部署包
mkdir backend
cp -r ../backend/* backend/
```

### 步骤 2：配置环境变量

创建 `backend/.env` 文件：
```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEBUG=False
```

### 步骤 3：修改前端 API 地址

编辑 `frontend/script.js`，找到 API 基础地址配置：
```javascript
// 将本地地址改为部署后的地址
const API_BASE_URL = 'https://your-backend-url.railway.app';
```

### 步骤 4：部署后端

#### Railway 部署：
1. 访问 [railway.app](https://railway.app)
2. 创建新项目
3. 上传 backend 文件夹
4. 设置环境变量
5. 等待部署完成

#### Render 部署：
1. 访问 [render.com](https://render.com)
2. 创建 Web Service
3. 连接 GitHub 或上传代码
4. 设置环境变量
5. 等待部署完成

### 步骤 5：部署前端

#### Vercel 部署：
1. 访问 [vercel.com](https://vercel.com)
2. 创建新项目
3. 上传 frontend 文件夹
4. 等待部署完成

#### Netlify 部署：
1. 访问 [netlify.com](https://netlify.com)
2. 拖拽 frontend 文件夹
3. 等待部署完成

## 🌐 获取公开预览地址

部署完成后，您将获得：

- **前端地址**：`https://your-app.vercel.app` 或 `https://your-app.netlify.app`
- **后端地址**：`https://your-app.railway.app` 或 `https://your-app.onrender.com`

## 📱 分享给用户

将前端地址分享给用户进行测试：
```
🎉 FeedbackBridge 智能反馈转化系统已上线！

🔗 访问地址：https://your-app.vercel.app

📝 使用说明：
1. 选择模板类型（设计体验问题/用户原声清洗）
2. 输入问题描述
3. 上传相关图片（可选）
4. 选择地区和模块
5. 点击一键转化

💡 如有问题或建议，请随时反馈！
```

## 🔍 监控和反馈收集

### 1. 使用 Vercel Analytics
- 在 Vercel 控制台启用 Analytics
- 查看用户访问数据

### 2. 使用 Railway Metrics
- 在 Railway 控制台查看后端性能
- 监控 API 调用情况

### 3. 收集用户反馈
- 在应用中添加反馈表单
- 使用 Google Forms 或 Typeform
- 设置反馈邮箱

## 🚨 注意事项

1. **API 密钥安全**：确保 DEEPSEEK_API_KEY 在环境变量中设置
2. **CORS 配置**：后端已配置允许所有来源
3. **文件上传限制**：当前限制为 10MB
4. **数据库**：使用 SQLite，适合小规模使用

## 🔄 更新部署

当需要更新时：
1. 修改代码
2. 重新部署前端和后端
3. 新版本将自动生效

## 📞 技术支持

如遇到部署问题：
1. 检查控制台日志
2. 验证环境变量设置
3. 确认 API 地址配置正确
