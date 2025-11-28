# 设计体验问题反馈

## 基本信息
**标题**: {title}  
**所属地区**: {region}  
**归属终端**: {terminal}  
**问题类型**: {issue_type}  
**解决方式**: {resolution_method}  
**优先级**: {priority}  

## 问题详情
**问题描述**: {problem_description}  
**解决方案**: {solution}  

## 跟踪信息
**解决状态**: {status}  
**期望修复版本**: {target_version}  

## 附件
**体验问题截图**: {screenshots}  
**其他附件**: {attachments}  

---

## 字段说明（此部分不显示在最终输出中）

### 需要LLM推断填充的字段：
- **{title}**：根据问题描述生成符合格式要求的标题
  - **长度**：30个字以内，完整表达问题核心
  - **结构**：标题内容，如"订单列表加载性能需要优化"
  - **要求**：根据用户输入中关于问题的描述提炼而成，不需要提炼解决方案，必须是一个完整的句子，不能截断
  - **示例**：
    ✅ "收银界面按钮反馈缺失"
    ✅ "登录页面视觉层次不清晰"
    ❌ "按钮问题" (太模糊)
    ❌ "管理端数据导" (截断)
- **{problem_description}**：详细描述具体问题
- **{solution}**：提供具体的设计优化建议和解决方案

### 特殊情况处理：
当用户只提供解决方案或优化建议时（如"建议增加进度条"、"应该加粗显示"等），LLM需要：
1. **反推问题**：根据解决方案推断出最可能存在的实际问题
2. **逻辑合理**：基于解决方案的合理性推断，避免编造不存在的问题

**反推示例**：
- 解决方案："建议增加进度条显示" → 推断问题："操作过程缺乏进度反馈，用户无法预估等待时间"
- 解决方案："按钮应该加粗显示" → 推断问题："按钮视觉层次不够突出，用户难以快速识别"
- 解决方案："需要添加确认弹窗" → 推断问题："关键操作缺乏二次确认，存在误操作风险"

### 预设选项字段（智能匹配）：
- **{region}**：BR、SSL
- **{terminal}**：管理端、门店端、移动端
- **{issue_type}**：设计需求优化、交互功能bug、视觉还原度bug、历史遗留
- **{resolution_method}**：体验优化、需求优化
- **{priority}**：P0-紧急、P1-高、P2-中、P3-低
- **{status}**：待确认(未提给研发)、研发中(已提给研发)、待走查(已研发完成)、已解决(走查完成并上线)、暂不解决
- **{target_version}**：V1.2.0、V1.3.0、V2.0.0、未定
- **{screenshots}**：截图URL或文件路径
- **{attachments}**：附加文件或链接

---

## 模板配置

### 字段配置
```json
{
  "id": "design_experience_issue",
  "name": "设计体验问题反馈",
  "description": "用于转化设计体验问题反馈的标准化模板",
  "category": "设计体验",
  "fields": [
    {
      "name": "title",
      "label": "标题",
      "type": "text",
      "required": true,
      "llm_inferred": true,
      "description": "根据问题描述生成符合格式要求的标题，格式：从问题描述中提炼，完整句子，不要和问题描述完全一致"
    },
    {
      "name": "region",
      "label": "所属地区",
      "type": "checkbox",
      "required": true,
      "llm_inferred": false,
      "options": ["BR", "SSL"]
    },
    {
      "name": "terminal",
      "label": "归属终端",
      "type": "checkbox",
      "required": true,
      "llm_inferred": false,
      "options": ["管理端", "门店端", "移动端"]
    },
    {
      "name": "issue_type",
      "label": "问题类型",
      "type": "select",
      "required": true,
      "llm_inferred": true,
      "options": ["设计需求优化", "交互功能bug", "视觉还原度bug", "历史遗留"]
    },
    {
      "name": "resolution_method",
      "label": "解决方式",
      "type": "select",
      "required": true,
      "llm_inferred": true,
      "options": ["体验优化", "需求优化"]
    },
    {
      "name": "priority",
      "label": "优先级",
      "type": "select",
      "required": true,
      "llm_inferred": true,
      "options": ["P0-紧急", "P1-高", "P2-中", "P3-低"]
    },
    {
      "name": "problem_description",
      "label": "问题描述",
      "type": "textarea",
      "required": true,
      "llm_inferred": true,
      "description": "详细描述体验问题，包括用户场景和影响"
    },
    {
      "name": "solution",
      "label": "解决方案",
      "type": "textarea",
      "required": true,
      "llm_inferred": true,
      "description": "提供具体的设计优化建议和解决方案"
    },
    {
      "name": "status",
      "label": "解决状态",
      "type": "select",
      "required": true,
      "llm_inferred": false,
      "default": "待确认(未提给研发)",
      "options": ["待确认(未提给研发)", "、研发中(已提给研发)", "待走查(已研发完成)", "已解决(走查完成并上线)", "暂不解决"]
    },
    {
      "name": "target_version",
      "label": "期望修复版本",
      "type": "select",
      "required": false,
      "llm_inferred": false,
      "default": "未定",
      "options": ["V1.2.0", "V1.3.0", "V2.0.0", "未定"]
    },
    {
      "name": "screenshots",
      "label": "体验问题截图",
      "type": "file",
      "required": false,
      "llm_inferred": false,
      "accept": "image/*"
    },
    {
      "name": "attachments",
      "label": "其他附件",
      "type": "file",
      "required": false,
      "llm_inferred": false,
      "accept": "*/*"
    }
  ]
}
```

### LLM提示词模板
```
请分析以下设计体验问题反馈，并返回JSON格式的分析结果：

用户原声：{user_input}
所属地区：{region}
归属终端：{terminal}

请按照以下JSON格式返回分析结果：
{
    "title": "根据问题描述生成符合格式要求的标题",
    "issue_type": "问题类型（设计需求优化/交互功能bug/视觉还原度bug/历史遗留）",
    "resolution_method": "解决方式（体验优化/需求优化）",
    "priority": "优先级（P0-紧急/P1-高/P2-中/P3-低）",
    "problem_description": "详细描述体验问题，包括用户场景和影响",
    "solution": "提供具体的设计优化建议和解决方案"
}

## 标题生成规则（重要）：
- **长度**：30个字以内，完整表达问题核心
- **结构**：标题内容，如"订单列表加载性能需要优化"
- **要求**：根据用户输入中关于问题的描述提炼而成，不需要提炼解决方案，必须是一个完整的句子，不能截断
- **示例**：
  ✅ "收银界面按钮反馈缺失"
  ✅ "登录页面视觉层次不清晰"
  ❌ "按钮问题" (太模糊)
  ❌ "管理端数据导" (截断)

请确保：
1. 标题严格按照上述格式要求生成
2. 问题类型从预设选项中选择：设计需求优化、交互功能bug、视觉还原度bug、历史遗留
3. 解决方式从预设选项中选择：体验优化、需求优化
4. 优先级基于问题严重程度和影响范围：P0-紧急、P1-高、P2-中、P3-低
5. 问题描述详细且包含用户使用场景
6. 解决方案具体可操作，包含设计改进建议
```

---

## 使用说明

1. **用户输入阶段**: 用户填写问题描述、选择地区和终端、上传截图
2. **LLM分析阶段**: 系统调用LLM API进行智能分析，推断标题、问题类型、解决方式、优先级、问题描述和解决方案
3. **结果生成阶段**: 基于分析结果生成标准化文档
4. **用户确认阶段**: 用户可预览和编辑生成的结果
5. **保存导出阶段**: 保存到历史记录或导出文档

---

## 版本信息
- **模板版本**: v1.0.0
- **创建时间**: 2024-01-XX
- **最后更新**: 2024-01-XX
- **适用场景**: 设计体验问题反馈转化
