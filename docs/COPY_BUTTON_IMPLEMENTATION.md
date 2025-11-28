# 复制按钮功能实现说明

## 功能概述

为设计体验问题模板的预览区域添加了复制按钮功能，包括：

1. **内容详情卡片** - 复制所有字段信息
2. **相关图片卡片** - 复制图片文件名列表

## 实现细节

### 1. HTML结构修改

在 `script.js` 的 `displayPreviewResult` 函数中，为两个卡片的标题行添加了复制按钮：

```html
<!-- 内容详情卡片 -->
<div class="preview-card" id="contentDetailsCard">
    <div class="preview-card-header">
        <h3 class="preview-card-title">内容详情</h3>
        <button class="copy-btn" onclick="copyCardContent('contentDetailsCard')" title="复制内容详情">
            <img src="icon/复制-默认.svg" alt="复制" class="copy-icon" />
        </button>
    </div>
    <!-- 卡片内容 -->
</div>

<!-- 相关图片卡片 -->
<div class="preview-card" id="relatedImagesCard">
    <div class="preview-card-header">
        <h3 class="preview-card-title">相关图片</h3>
        <button class="copy-btn" onclick="copyCardContent('relatedImagesCard')" title="复制相关图片">
            <img src="icon/复制-默认.svg" alt="复制" class="copy-icon" />
        </button>
    </div>
    <!-- 卡片内容 -->
</div>
```

### 2. JavaScript功能实现

添加了 `copyCardContent` 函数来处理复制逻辑：

```javascript
function copyCardContent(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;
    
    let content = '';
    
    if (cardId === 'contentDetailsCard') {
        // 复制内容详情卡片的所有字段
        const detailRows = card.querySelectorAll('.detail-row');
        detailRows.forEach(row => {
            const label = row.querySelector('.detail-label');
            const value = row.querySelector('.detail-display');
            if (label && value) {
                content += `${label.textContent}: ${value.textContent}\n`;
            }
        });
    } else if (cardId === 'relatedImagesCard') {
        // 复制相关图片卡片的信息
        const imageItems = card.querySelectorAll('.image-item');
        if (imageItems.length > 0) {
            content = '相关图片:\n';
            imageItems.forEach(item => {
                const caption = item.querySelector('.image-caption');
                if (caption) {
                    content += `- ${caption.textContent}\n`;
                }
            });
        } else {
            content = '暂无相关图片';
        }
    }
    
    // 复制到剪贴板
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(content).then(() => {
            showNotification('内容已复制到剪贴板', 'success');
        }).catch(err => {
            console.error('复制失败:', err);
            fallbackCopyTextToClipboard(content);
        });
    } else {
        fallbackCopyTextToClipboard(content);
    }
}
```

### 3. CSS样式实现

在 `styles.css` 中添加了复制按钮的样式：

```css
/* 预览卡片复制按钮样式 */
.preview-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.preview-card-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
}

.copy-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
}

.copy-btn:hover {
    background: #f5f5f5;
}

.copy-icon {
    width: 16px;
    height: 16px;
    transition: all 0.2s ease;
}

.copy-btn:hover .copy-icon {
    content: url('icon/复制-悬停.svg');
}
```

## 功能特性

### 1. 图标状态切换
- **默认状态**: 使用 `icon/复制-默认.svg`
- **悬停状态**: 使用 `icon/复制-悬停.svg`

### 2. 复制内容格式

**内容详情卡片复制格式**:
```
标题: 用户体验优化需求
问题描述: 用户在登录页面遇到加载缓慢的问题，影响使用体验
解决方案: 优化登录接口性能，增加缓存机制
所属地区: BR, SSL
归属终端: 管理端, 移动端
问题类型: 设计需求优化
解决方式: 体验优化
优先级: P1-高
解决状态: 待确认(未提给研发)
期望修复版本: v2.1.0
```

**相关图片卡片复制格式**:
```
相关图片:
- login_screenshot.png
- error_message.png
```

### 3. 用户体验
- 点击复制按钮后显示成功通知
- 支持现代浏览器的 Clipboard API
- 提供备用复制方法（兼容旧浏览器）
- 悬停时按钮有视觉反馈

## 测试文件

创建了 `copy_button_test.html` 测试文件，包含：
- 模拟的预览卡片内容
- 复制按钮功能测试
- 用户交互说明

## 使用方法

1. 在预览区域生成内容后，每个卡片标题行右侧会出现复制按钮
2. 点击复制按钮即可将对应卡片的内容复制到剪贴板
3. 悬停在复制按钮上时，图标会变为悬停状态
4. 复制成功后会显示通知消息

## 兼容性

- 支持现代浏览器的 Clipboard API
- 提供 `document.execCommand('copy')` 作为备用方案
- 图标使用 SVG 格式，支持高分辨率显示
