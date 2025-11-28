# FeedbackBridge 快速部署指南

## 🚀 5分钟快速部署

### 第一步：部署后端（2分钟）

#### 1.1 访问 Railway
- 打开浏览器，访问：**https://railway.app**
- 点击右上角 **"Login"** 按钮
- 选择 **"Login with GitHub"**（推荐）

#### 1.2 创建项目
- 点击 **"New Project"** 按钮（蓝色大按钮）
- 选择 **"Upload from your computer"**
- 选择 `deploy-packages/backend` 文件夹
- 点击 **"Upload"**

#### 1.3 设置环境变量
- 在项目页面，点击 **"Variables"** 标签页
- 点击 **"New Variable"**
- 添加：
  - **Name**: `DEEPSEEK_API_KEY`
  - **Value**: `your_deepseek_api_key_here`
- 点击 **"Add"**

#### 1.4 获取后端地址
- 等待部署完成（约1-2分钟）
- 在 **"Settings"** 标签页找到 **"Domains"**
- 复制地址（如：`https://your-app-name.railway.app`）
- **记录这个地址，下一步需要用到**

### 第二步：修改前端配置（1分钟）

#### 2.1 编辑配置文件
- 打开 `deploy-packages/frontend/script.js` 文件
- 找到这行代码：
  ```javascript
  const API_BASE_URL = 'http://localhost:8000';
  ```
- 修改为您的 Railway 后端地址：
  ```javascript
  const API_BASE_URL = 'https://your-app-name.railway.app';
  ```
- 保存文件

### 第三步：部署前端（2分钟）

#### 3.1 访问 Vercel
- 打开浏览器，访问：**https://vercel.com**
- 点击右上角 **"Sign Up"** 按钮
- 选择 **"Continue with GitHub"**（推荐）

#### 3.2 创建项目
- 点击 **"New Project"** 按钮
- 选择 **"Upload"** 选项
- 将 `deploy-packages/frontend` 文件夹拖拽到上传区域
- 点击 **"Deploy"**

#### 3.3 获取前端地址
- 等待部署完成（约1-2分钟）
- 复制生成的地址（如：`https://your-app-name.vercel.app`）
- **这就是您要分享给用户的地址**

### 第四步：测试和分享

#### 4.1 测试功能
- 在浏览器中访问您的前端地址
- 填写一个测试问题
- 点击转化按钮
- 如果转化成功，说明部署完成

#### 4.2 分享给用户
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

## 🔧 常见问题

### 问题1：找不到 Railway 的 "New Project" 按钮
**解决方法**：
- 确保已登录 Railway 账号
- 在控制台首页，寻找蓝色的 **"New Project"** 按钮
- 如果找不到，尝试刷新页面

### 问题2：找不到 Vercel 的 "New Project" 按钮
**解决方法**：
- 确保已登录 Vercel 账号
- 在控制台首页，寻找 **"New Project"** 按钮
- 如果找不到，尝试刷新页面

### 问题3：部署失败
**解决方法**：
- 检查环境变量是否正确设置
- 查看部署日志中的错误信息
- 确保上传的文件完整

### 问题4：前后端连接失败
**解决方法**：
- 检查 `script.js` 中的 API 地址是否正确
- 确保后端服务正在运行
- 检查浏览器控制台是否有错误信息

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
1. 查看详细部署步骤：`DETAILED_DEPLOYMENT_STEPS.md`
2. 查看部署检查清单：`DEPLOYMENT_CHECKLIST.md`
3. 检查控制台日志
4. 验证环境变量设置
5. 确认 API 地址配置正确

## 🎉 完成！

现在您可以将前端地址分享给用户进行测试和收集反馈了！

**总时间**：约5-10分钟
**总成本**：免费
**支持平台**：桌面端、移动端、微信内
