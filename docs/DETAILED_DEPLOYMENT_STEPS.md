# FeedbackBridge 详细部署步骤

## 🚀 方案一：Vercel + Railway 详细步骤

### 第一步：部署后端到 Railway

#### 1.1 注册 Railway 账号
1. 打开浏览器，访问 [https://railway.app](https://railway.app)
2. 点击右上角的 **"Login"** 按钮
3. 选择 **"Login with GitHub"**（推荐）或 **"Login with Email"**
4. 如果选择 GitHub，会跳转到 GitHub 授权页面，点击 **"Authorize Railway"**
5. 授权完成后会自动跳转回 Railway 控制台

#### 1.2 创建新项目
1. 在 Railway 控制台首页，点击 **"New Project"** 按钮（蓝色大按钮）
2. 选择 **"Deploy from GitHub repo"** 或 **"Upload from your computer"**
3. 如果选择 GitHub：
   - 连接您的 GitHub 账号（如果还没连接）
   - 选择仓库或创建新仓库
4. 如果选择上传文件：
   - 点击 **"Upload from your computer"**
   - 选择 `deploy-packages/backend` 文件夹
   - 点击 **"Upload"**

#### 1.3 配置项目
1. 项目创建后，Railway 会自动检测到这是一个 Python 项目
2. 在项目设置页面，找到 **"Variables"** 标签页
3. 点击 **"New Variable"** 按钮
4. 添加环境变量：
   - **Name**: `DEEPSEEK_API_KEY`
   - **Value**: `your_deepseek_api_key_here`（替换为您的实际 API 密钥）
5. 点击 **"Add"** 保存

#### 1.4 等待部署完成
1. Railway 会自动开始构建和部署
2. 在 **"Deployments"** 标签页可以看到部署进度
3. 部署完成后，在 **"Settings"** 标签页找到 **"Domains"** 部分
4. 复制生成的域名（类似：`https://your-app-name.railway.app`）
5. **重要**：记录这个后端地址，下一步需要用到

### 第二步：修改前端配置

#### 2.1 编辑前端文件
1. 打开 `deploy-packages/frontend/script.js` 文件
2. 使用文本编辑器（如 VS Code、Sublime Text 等）打开
3. 找到类似这样的代码：
   ```javascript
   const API_BASE_URL = 'http://localhost:8000';
   ```
4. 将其修改为您的 Railway 后端地址：
   ```javascript
   const API_BASE_URL = 'https://your-app-name.railway.app';
   ```
5. 保存文件

#### 2.2 验证修改
1. 确保修改后的地址是正确的
2. 地址应该以 `https://` 开头
3. 地址应该以 `.railway.app` 结尾

### 第三步：部署前端到 Vercel

#### 3.1 注册 Vercel 账号
1. 打开浏览器，访问 [https://vercel.com](https://vercel.com)
2. 点击右上角的 **"Sign Up"** 按钮
3. 选择 **"Continue with GitHub"**（推荐）或 **"Continue with Email"**
4. 如果选择 GitHub，会跳转到 GitHub 授权页面，点击 **"Authorize Vercel"**
5. 授权完成后会自动跳转回 Vercel 控制台

#### 3.2 创建新项目
1. 在 Vercel 控制台首页，点击 **"New Project"** 按钮
2. 选择 **"Import Git Repository"** 或 **"Browse all templates"**
3. 如果选择导入 Git：
   - 连接您的 GitHub 账号（如果还没连接）
   - 选择仓库或创建新仓库
4. 如果选择上传文件：
   - 点击 **"Browse all templates"**
   - 选择 **"Other"** 或 **"Static Site"**
   - 在项目设置中，将 **"Root Directory"** 设置为 `frontend`

#### 3.3 上传前端文件
1. 在 Vercel 项目创建页面，选择 **"Upload"** 选项
2. 将 `deploy-packages/frontend` 文件夹拖拽到上传区域
3. 或者点击 **"Select Files"** 选择整个 frontend 文件夹
4. 点击 **"Deploy"** 开始部署

#### 3.4 等待部署完成
1. Vercel 会自动开始构建和部署
2. 在部署页面可以看到构建进度
3. 部署完成后，会显示部署成功的页面
4. 复制生成的域名（类似：`https://your-app-name.vercel.app`）
5. **重要**：记录这个前端地址，这是您要分享给用户的地址

### 第四步：测试部署

#### 4.1 测试后端
1. 在浏览器中访问您的 Railway 后端地址
2. 应该看到类似这样的响应：
   ```json
   {"message": "FeedbackBridge API is running", "version": "1.0.0"}
   ```
3. 如果看到这个响应，说明后端部署成功

#### 4.2 测试前端
1. 在浏览器中访问您的 Vercel 前端地址
2. 应该看到 FeedbackBridge 的界面
3. 尝试填写一个测试问题并点击转化
4. 如果转化成功，说明前后端连接正常

### 第五步：分享给用户

#### 5.1 准备分享内容
```
🎉 FeedbackBridge 智能反馈转化系统已上线！

🔗 访问地址：https://your-app-name.vercel.app

📝 使用说明：
1. 选择模板类型（设计体验问题/用户原声清洗）
2. 输入问题描述
3. 上传相关图片（可选）
4. 选择地区和模块
5. 点击一键转化

💡 如有问题或建议，请随时反馈！
```

#### 5.2 分享方式
- **微信群/QQ群**：直接发送链接
- **邮件**：发送给相关同事
- **文档**：添加到团队文档中
- **二维码**：生成二维码方便手机访问

## 🔧 常见问题解决

### 问题1：Railway 部署失败
**可能原因**：
- 环境变量未设置
- Python 版本不兼容
- 依赖包安装失败

**解决方法**：
1. 检查环境变量是否正确设置
2. 在 Railway 项目设置中查看构建日志
3. 确保 `requirements.txt` 文件存在且内容正确

### 问题2：Vercel 部署失败
**可能原因**：
- 文件路径错误
- 缺少必要文件
- 构建配置错误

**解决方法**：
1. 确保上传的是完整的 frontend 文件夹
2. 检查 `index.html` 文件是否存在
3. 在 Vercel 项目设置中查看构建日志

### 问题3：前后端连接失败
**可能原因**：
- API 地址配置错误
- CORS 配置问题
- 后端服务未启动

**解决方法**：
1. 检查 `script.js` 中的 API 地址是否正确
2. 确保后端服务正在运行
3. 检查浏览器控制台是否有错误信息

## 📱 移动端访问

部署完成后，用户可以通过以下方式访问：
- **桌面端**：直接在浏览器中打开链接
- **移动端**：在手机浏览器中打开链接
- **微信内**：在微信中打开链接（可能需要点击"在浏览器中打开"）

## 🔄 更新部署

当需要更新时：
1. 修改代码
2. 重新上传到对应的平台
3. 平台会自动重新部署
4. 新版本将自动生效

## 📞 技术支持

如遇到问题：
1. 检查控制台日志
2. 验证环境变量设置
3. 确认 API 地址配置正确
4. 查看部署平台的状态页面
5. 联系技术支持
