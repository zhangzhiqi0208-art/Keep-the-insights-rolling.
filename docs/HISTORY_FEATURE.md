# 历史记录功能说明

## 功能概述

历史记录功能为FeedbackBridge系统添加了完整的转化记录管理能力，支持个人维度的历史记录存储、查询和管理。

## 主要特性

### 1. 自动保存
- 每次转化完成后自动保存到历史记录
- 包含完整的输入和输出信息
- 支持文件信息记录（不存储实际文件）

### 2. 个人维度
- 基于用户ID进行数据隔离
- 每个用户只能查看和管理自己的历史记录
- 自动生成用户标识符

### 3. 数据管理
- 自动清理：只保留最近50条记录
- 支持手动删除单条记录
- 支持清空所有历史记录

### 4. 丰富的交互功能
- 历史记录列表查看
- 详细记录查看
- 从历史记录重新转化
- 复制历史记录内容

## 技术实现

### 后端实现

#### 数据库模型
```python
class ConversionHistory(Base):
    """转化历史记录模型"""
    __tablename__ = "conversion_history"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)  # 用户标识
    title = Column(String(255), nullable=False)
    original_description = Column(Text, nullable=False)
    system_types = Column(JSON, nullable=False)
    modules = Column(JSON, nullable=False)
    analysis_result = Column(JSON, nullable=True)
    standard_format = Column(JSON, nullable=True)
    template_id = Column(String(100), default="default")
    files_info = Column(JSON, nullable=True)  # 文件信息
    status = Column(String(50), default="completed")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

#### API接口
- `POST /api/history/save` - 保存历史记录
- `GET /api/history/list` - 获取历史记录列表
- `GET /api/history/detail/{record_id}` - 获取历史记录详情
- `DELETE /api/history/delete/{record_id}` - 删除历史记录
- `DELETE /api/history/clear` - 清空所有历史记录

### 前端实现

#### 用户标识管理
```javascript
function getCurrentUserId() {
    // 从localStorage获取用户ID，如果没有则生成一个
    let userId = localStorage.getItem('feedbackBridge_userId');
    if (!userId) {
        userId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
        localStorage.setItem('feedbackBridge_userId', userId);
    }
    return userId;
}
```

#### 历史记录UI
- 模态框形式的历史记录列表
- 详细记录查看模态框
- 响应式设计，支持移动端

## 使用流程

### 1. 正常转化流程
1. 用户输入问题描述
2. 选择所属地区和终端模块
3. 点击"一键转化"
4. 系统自动分析并生成结果
5. **自动保存到历史记录**

### 2. 查看历史记录
1. 点击顶部导航的"历史记录"按钮
2. 系统显示历史记录列表
3. 可以查看每条记录的基本信息

### 3. 查看详细记录
1. 在历史记录列表中点击"查看"按钮
2. 显示完整的转化详情
3. 包括原始描述、分析结果、标准化格式等

### 4. 重新转化
1. 在历史记录详情中点击"重新转化"按钮
2. 系统自动填充表单
3. 自动触发转化流程

### 5. 管理历史记录
- 删除单条记录：在列表中点击"删除"按钮
- 清空所有记录：在历史记录页面点击"清空历史"按钮

## 数据存储

### 本地存储
- 用户ID存储在localStorage中
- 草稿数据存储在localStorage中
- 智能分析缓存存储在localStorage中

### 数据库存储
- 历史记录存储在SQLite数据库中
- 支持异步操作
- 自动清理旧记录

## 配置说明

### 历史记录限制
- 每个用户最多保留50条历史记录
- 超过限制时自动删除最旧的记录
- 可通过修改`max_records`参数调整

### 用户标识
- 自动生成用户ID
- 基于时间戳和随机数
- 存储在浏览器localStorage中

## 测试

### 运行测试脚本
```bash
cd /Users/didi/zhangzhiqi/feedback-bridge
python test_history.py
```

### 测试内容
1. 保存历史记录
2. 获取历史记录列表
3. 获取历史记录详情
4. 删除历史记录
5. 清空历史记录

## 注意事项

1. **数据隔离**：每个用户只能访问自己的历史记录
2. **自动清理**：系统会自动清理超过50条的旧记录
3. **文件处理**：只存储文件信息，不存储实际文件内容
4. **错误处理**：历史记录保存失败不会影响主要转化功能
5. **性能优化**：使用分页查询，避免一次性加载大量数据

## 扩展功能

### 可能的改进方向
1. 添加搜索功能
2. 支持历史记录导出
3. 添加标签分类
4. 支持历史记录分享
5. 添加统计分析功能

## 故障排除

### 常见问题
1. **历史记录不显示**：检查后端服务是否正常运行
2. **保存失败**：检查数据库连接和权限
3. **用户ID丢失**：清除浏览器缓存后重新生成

### 调试方法
1. 查看浏览器控制台错误信息
2. 检查网络请求状态
3. 查看后端日志输出
4. 使用测试脚本验证API功能
