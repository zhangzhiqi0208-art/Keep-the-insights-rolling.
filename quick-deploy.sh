#!/bin/bash

# FeedbackBridge 快速部署脚本
# 用于快速生成公开预览地址

echo "🚀 FeedbackBridge 快速部署脚本"
echo "================================"

# 检查必要工具
check_requirements() {
    echo "🔍 检查部署环境..."
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git 未安装，请先安装 Git"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python 3 未安装，请先安装 Python 3"
        exit 1
    fi
    
    echo "✅ 环境检查通过"
}

# 创建部署包
create_deployment_packages() {
    echo "📦 创建部署包..."
    
    # 清理旧的部署文件
    rm -rf deploy-packages
    mkdir -p deploy-packages
    
    # 创建前端部署包
    echo "📁 准备前端文件..."
    mkdir -p deploy-packages/frontend
    cp index.html deploy-packages/frontend/
    cp script.js deploy-packages/frontend/
    cp styles.css deploy-packages/frontend/
    cp xlsx.full.min.js deploy-packages/frontend/
    cp -r icon deploy-packages/frontend/
    cp -r image deploy-packages/frontend/
    
    # 创建后端部署包
    echo "📁 准备后端文件..."
    mkdir -p deploy-packages/backend
    cp -r backend/* deploy-packages/backend/
    
    # 创建前端部署说明
    cat > deploy-packages/frontend/README.md << EOF
# FeedbackBridge 前端部署包

## 部署到 Vercel
1. 访问 https://vercel.com
2. 注册/登录账号
3. 点击 "New Project"
4. 拖拽此文件夹到部署区域
5. 点击 "Deploy"

## 部署到 Netlify
1. 访问 https://netlify.com
2. 注册/登录账号
3. 拖拽此文件夹到部署区域
4. 等待部署完成

## 注意事项
- 部署前需要先部署后端
- 部署后需要修改 script.js 中的 API_BASE_URL
EOF

    # 创建后端部署说明
    cat > deploy-packages/backend/README.md << EOF
# FeedbackBridge 后端部署包

## 部署到 Railway
1. 访问 https://railway.app
2. 注册/登录账号
3. 点击 "New Project"
4. 上传此文件夹
5. 设置环境变量：DEEPSEEK_API_KEY=your_api_key
6. 点击 "Deploy"

## 部署到 Render
1. 访问 https://render.com
2. 注册/登录账号
3. 选择 "New Web Service"
4. 上传此文件夹
5. 设置环境变量：DEEPSEEK_API_KEY=your_api_key
6. 点击 "Deploy"

## 环境变量
- DEEPSEEK_API_KEY: 您的 DeepSeek API 密钥
- DEBUG: False (生产环境)
EOF

    echo "✅ 部署包创建完成"
}

# 生成部署指南
generate_deployment_guide() {
    echo "📝 生成部署指南..."
    
    cat > deploy-packages/DEPLOYMENT_STEPS.md << EOF
# FeedbackBridge 部署步骤

## 🎯 快速部署（5分钟完成）

### 步骤 1：部署后端
1. 访问 https://railway.app 或 https://render.com
2. 注册/登录账号
3. 创建新项目
4. 上传 \`backend\` 文件夹
5. 设置环境变量：\`DEEPSEEK_API_KEY=your_api_key\`
6. 等待部署完成，记录后端地址

### 步骤 2：修改前端配置
1. 编辑 \`frontend/script.js\`
2. 找到 \`API_BASE_URL\` 配置
3. 将地址改为您的后端地址

### 步骤 3：部署前端
1. 访问 https://vercel.com 或 https://netlify.com
2. 注册/登录账号
3. 创建新项目
4. 上传 \`frontend\` 文件夹
5. 等待部署完成

### 步骤 4：分享链接
将前端地址分享给用户进行测试！

## 🔧 详细说明

### 后端部署选项
- **Railway**：推荐，免费额度充足
- **Render**：稳定，免费额度有限
- **Heroku**：老牌服务，需要信用卡

### 前端部署选项
- **Vercel**：推荐，部署简单
- **Netlify**：功能丰富，免费额度大
- **GitHub Pages**：免费，但功能有限

## 📱 分享给用户

部署完成后，您将获得类似这样的地址：
- 前端：https://your-app.vercel.app
- 后端：https://your-app.railway.app

## 🎉 完成！

现在您可以将前端地址分享给用户进行测试和收集反馈了！
EOF

    echo "✅ 部署指南生成完成"
}

# 显示部署选项
show_deployment_options() {
    echo ""
    echo "🎯 部署选项："
    echo "============="
    echo ""
    echo "📦 部署包已创建在 deploy-packages/ 目录"
    echo ""
    echo "🚀 推荐部署方案："
    echo "1. 后端：Railway (https://railway.app)"
    echo "2. 前端：Vercel (https://vercel.com)"
    echo ""
    echo "📁 文件结构："
    echo "deploy-packages/"
    echo "├── frontend/     # 前端部署包"
    echo "├── backend/      # 后端部署包"
    echo "└── DEPLOYMENT_STEPS.md  # 详细部署步骤"
    echo ""
    echo "📝 下一步："
    echo "1. 查看 DEPLOYMENT_STEPS.md 了解详细步骤"
    echo "2. 先部署后端，记录地址"
    echo "3. 修改前端 API 地址"
    echo "4. 部署前端"
    echo "5. 分享前端地址给用户"
    echo ""
    echo "💡 提示：整个过程大约需要 5-10 分钟"
}

# 主函数
main() {
    check_requirements
    create_deployment_packages
    generate_deployment_guide
    show_deployment_options
    
    echo ""
    echo "🎉 准备完成！现在可以开始部署了"
    echo "📖 详细步骤请查看 deploy-packages/DEPLOYMENT_STEPS.md"
}

# 运行主函数
main
