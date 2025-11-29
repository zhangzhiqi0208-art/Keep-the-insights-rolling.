# FeedbackBridge 部署检查清单

## 📋 部署前准备

### ✅ 环境检查
- [ ] 已注册 Railway 账号
- [ ] 已注册 Vercel 账号
- [ ] 已获得 DeepSeek API 密钥
- [ ] 已准备好部署包文件

### ✅ 文件准备
- [ ] `deploy-packages/backend/` 文件夹已准备
- [ ] `deploy-packages/frontend/` 文件夹已准备
- [ ] 已阅读详细部署步骤

## 🚀 第一步：部署后端到 Railway

### ✅ Railway 账号注册
- [ ] 访问 https://railway.app
- [ ] 点击 "Login" 按钮
- [ ] 选择 "Login with GitHub" 或 "Login with Email"
- [ ] 完成账号注册和授权

### ✅ 创建 Railway 项目
- [ ] 点击 "New Project" 按钮
- [ ] 选择 "Upload from your computer"
- [ ] 选择 `deploy-packages/backend` 文件夹
- [ ] 点击 "Upload" 开始上传

### ✅ 配置环境变量
- [ ] 在项目设置中找到 "Variables" 标签页
- [ ] 点击 "New Variable" 按钮
- [ ] 添加变量：
  - Name: `DEEPSEEK_API_KEY`
  - Value: `your_deepseek_api_key_here`
- [ ] 点击 "Add" 保存

### ✅ 等待部署完成
- [ ] 在 "Deployments" 标签页查看部署进度
- [ ] 部署完成后，在 "Settings" 标签页找到 "Domains" 部分
- [ ] 复制生成的域名（如：`https://your-app-name.railway.app`）
- [ ] **重要**：记录这个后端地址

## 🔧 第二步：修改前端配置

### ✅ 编辑前端文件
- [ ] 打开 `deploy-packages/frontend/script.js` 文件
- [ ] 找到 `const API_BASE_URL = 'http://localhost:8000';`
- [ ] 修改为您的 Railway 后端地址：
  ```javascript
  const API_BASE_URL = 'https://your-app-name.railway.app';
  ```
- [ ] 保存文件

### ✅ 验证修改
- [ ] 确认地址以 `https://` 开头
- [ ] 确认地址以 `.railway.app` 结尾
- [ ] 确认地址正确无误

## 🎨 第三步：部署前端到 Vercel

### ✅ Vercel 账号注册
- [ ] 访问 https://vercel.com
- [ ] 点击 "Sign Up" 按钮
- [ ] 选择 "Continue with GitHub" 或 "Continue with Email"
- [ ] 完成账号注册和授权

### ✅ 创建 Vercel 项目
- [ ] 点击 "New Project" 按钮
- [ ] 选择 "Upload" 选项
- [ ] 将 `deploy-packages/frontend` 文件夹拖拽到上传区域
- [ ] 点击 "Deploy" 开始部署

### ✅ 等待部署完成
- [ ] 在部署页面查看构建进度
- [ ] 部署完成后，复制生成的域名（如：`https://your-app-name.vercel.app`）
- [ ] **重要**：记录这个前端地址

## 🧪 第四步：测试部署

### ✅ 测试后端
- [ ] 在浏览器中访问 Railway 后端地址
- [ ] 应该看到：`{"message": "FeedbackBridge API is running", "version": "1.0.0"}`
- [ ] 如果看到这个响应，说明后端部署成功

### ✅ 测试前端
- [ ] 在浏览器中访问 Vercel 前端地址
- [ ] 应该看到 FeedbackBridge 的界面
- [ ] 尝试填写一个测试问题并点击转化
- [ ] 如果转化成功，说明前后端连接正常

## 📱 第五步：分享给用户

### ✅ 准备分享内容
- [ ] 前端地址：`https://your-app-name.vercel.app`
- [ ] 后端地址：`https://your-app-name.railway.app`
- [ ] 准备分享文案

### ✅ 分享方式
- [ ] 微信群/QQ群分享
- [ ] 邮件发送给同事
- [ ] 添加到团队文档
- [ ] 生成二维码（可选）

## 🔍 问题排查

### ❌ 后端部署失败
**检查项目**：
- [ ] 环境变量是否正确设置
- [ ] 构建日志是否有错误信息
- [ ] `requirements.txt` 文件是否存在
- [ ] Python 版本是否兼容

### ❌ 前端部署失败
**检查项目**：
- [ ] 上传的是否是完整的 frontend 文件夹
- [ ] `index.html` 文件是否存在
- [ ] 构建日志是否有错误信息
- [ ] 文件路径是否正确

### ❌ 前后端连接失败
**检查项目**：
- [ ] `script.js` 中的 API 地址是否正确
- [ ] 后端服务是否正在运行
- [ ] 浏览器控制台是否有错误信息
- [ ] CORS 配置是否正确

## 🎉 部署完成

### ✅ 最终检查
- [ ] 后端服务正常运行
- [ ] 前端界面正常显示
- [ ] 转化功能正常工作
- [ ] 移动端访问正常
- [ ] 分享链接已发送给用户

### ✅ 后续维护
- [ ] 定期检查服务状态
- [ ] 收集用户反馈
- [ ] 根据反馈进行优化
- [ ] 准备更新部署

## 📞 技术支持

如遇到问题，请检查：
1. 控制台日志
2. 环境变量设置
3. API 地址配置
4. 部署平台状态页面

**联系方式**：
- 项目文档：查看 `DETAILED_DEPLOYMENT_STEPS.md`
- 常见问题：查看部署平台帮助文档
- 技术支持：联系项目维护者
