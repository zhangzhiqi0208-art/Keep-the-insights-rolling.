# 用户原声清洗模板

## 核心分析结果

### 1. 翻译后的用户原声原文
**{target_language}翻译**: {original_translation}  
**源语言**: {source_language}  
**目标语言**: {target_language}  

### 2. AI智能优化总结
**主旨提炼**: {ai_optimized_summary}  
**关键要点**: {key_points}  

### 3. 情感分类
**情感倾向**: {sentiment_classification}  
**情感强度**: {sentiment_intensity}  
**情感分析**: {sentiment_analysis}  

---

## 字段说明（此部分不显示在最终输出中）

### 需要LLM推断填充的字段：

#### 1. 翻译功能
- **{original_translation}**：将原声内容翻译为目标语言
  - **要求**：保持原意，语言流畅，符合目标语言表达习惯
  - **支持语言**：英文、西班牙语、葡萄牙语

#### 2. AI智能优化总结
- **{ai_optimized_summary}**：AI智能提炼用户原声的主旨和重点
  - **要求**：准确提炼核心观点，突出关键信息，保持简洁明了
- **{key_points}**：提取关键要点列表
  - **要求**：以要点形式列出用户反馈的核心内容

#### 3. 情感分类
- **{sentiment_classification}**：识别原声的情感倾向
  - **选项**：正向反馈：表达满意、赞扬、积极态度的反馈、负向反馈：表达不满、批评、消极态度的反馈、中性反馈：客观描述、无明显情感倾向的反馈
  - **要求**：基于原声内容的情感色彩进行准确分类
- **{sentiment_intensity}**：情感强度评估
  - **选项**：强烈、中等、轻微
  - **要求**：评估情感表达的强烈程度
- **{sentiment_analysis}**：详细的情感分析
  - **要求**：提供具体的情感分析说明，解释分类依据

### 输入类型处理：
- **文本原声**：直接进行文本分析和处理
- **录音原声**：先进行语音识别转文本，再进行文本分析
- **Excel文件**：解析Excel内容，提取文本信息进行分析

### 语言支持：
- **源语言**：英文、西班牙语、葡萄牙语
- **目标语言**：中文
- **重点支持**：西班牙语、葡萄牙语等多语言翻译

---

## 模板配置

### 字段配置
```json
{
  "id": "original_sound_cleaning",
  "name": "用户原声清洗模板",
  "description": "用于清洗和分析用户原声反馈的标准化模板",
  "category": "用户原声",
  "input_types": ["text", "audio", "excel"],
  "fields": [
    {
      "name": "source_language",
      "label": "源语言",
      "type": "select",
      "required": true,
      "llm_inferred": false,
      "options": ["英文", "西班牙语", "葡萄牙语"],
      "description": "原声内容的源语言"
    },
    {
      "name": "target_language",
      "label": "目标语言",
      "type": "select",
      "required": true,
      "llm_inferred": false,
      "options": ["中文"],
      "description": "目标输出语言"
    },
    {
      "name": "original_translation",
      "label": "翻译后的用户原声原文",
      "type": "textarea",
      "required": true,
      "llm_inferred": true,
      "description": "将原声内容翻译为目标语言，保持原意和情感色彩"
    },
    {
      "name": "ai_optimized_summary",
      "label": "AI智能优化总结",
      "type": "textarea",
      "required": true,
      "llm_inferred": true,
      "description": "AI智能提炼用户原声的主旨和重点"
    },
    {
      "name": "key_points",
      "label": "关键要点",
      "type": "textarea",
      "required": true,
      "llm_inferred": true,
      "description": "以要点形式列出用户反馈的核心内容"
    },
    {
      "name": "sentiment_classification",
      "label": "情感倾向",
      "type": "select",
      "required": true,
      "llm_inferred": true,
      "options": ["正向反馈：表达满意、赞扬、积极态度的反馈", "负向反馈：表达不满、批评、消极态度的反馈", "中性反馈：客观描述、无明显情感倾向的反馈"],
      "description": "识别原声的情感倾向"
    },
    {
      "name": "sentiment_intensity",
      "label": "情感强度",
      "type": "select",
      "required": true,
      "llm_inferred": true,
      "options": ["强烈", "中等", "轻微"],
      "description": "评估情感表达的强烈程度"
    },
    {
      "name": "sentiment_analysis",
      "label": "情感分析",
      "type": "textarea",
      "required": true,
      "llm_inferred": true,
      "description": "提供具体的情感分析说明，解释分类依据"
    },
 
  ]
}
```

### LLM提示词模板
```
请分析以下用户原声，并返回JSON格式的分析结果：

用户原声：{user_input}
源语言：{source_language}
目标语言：{target_language}

请按照以下JSON格式返回分析结果：
{
    "original_translation": "翻译后的用户原声原文",
    "ai_optimized_summary": "AI智能优化总结",
    "key_points": "关键要点列表",
    "sentiment_classification": "情感倾向（正向/负向/中性）",
    "sentiment_intensity": "情感强度（强烈/中等/轻微）",
    "sentiment_analysis": "详细的情感分析说明"
}

## 核心功能要求：

### 1. 翻译功能
- **要求**：准确翻译原声内容到目标语言
- **重点**：保持原意、语言流畅、符合目标语言表达习惯
- **支持**：西班牙语、葡萄牙语等多语言翻译
- **注意**：保留关键信息和情感色彩

### 2. AI智能优化总结
- **主旨提炼**：准确提炼用户原声的主旨和重点
- **关键要点**：以要点形式列出用户反馈的核心内容
- **要求**：简洁明了，突出关键信息

### 3. 情感分类
- **情感倾向**：准确识别正向/负向/中性
- **情感强度**：评估强烈/中等/轻微
- **分析说明**：提供具体的情感分析，解释分类依据

## 情感分类标准：
- **正向反馈**：表达满意、赞扬、积极态度的反馈
- **负向反馈**：表达不满、批评、消极态度的反馈  
- **中性反馈**：客观描述、无明显情感倾向的反馈

## 情感强度标准：
- **强烈**：使用强烈情感词汇，表达极端态度
- **中等**：有明显情感倾向但表达相对温和
- **轻微**：情感色彩较淡，偏向客观描述

请确保：
1. 翻译准确且符合目标语言习惯
2. 总结简洁且突出核心观点
3. 情感分类准确且分析合理
4. 所有字段都按要求填充完整
```

---

## 使用说明

1. **输入阶段**: 用户选择输入类型（文本/录音/Excel），上传或输入原声内容，选择源语言和目标语言
2. **预处理阶段**: 
   - 文本原声：直接进入分析
   - 录音原声：先进行语音识别转文本
   - Excel文件：解析并提取文本内容
3. **LLM分析阶段**: 系统调用LLM API进行智能分析，推断反馈类型、生成使用建议、进行翻译和总结
4. **结果生成阶段**: 基于分析结果生成标准化文档
5. **用户确认阶段**: 用户可预览和编辑生成的结果
6. **保存导出阶段**: 保存到历史记录或导出文档

---

## 版本信息
- **模板版本**: v1.0.0
- **创建时间**: 2024-01-XX
- **最后更新**: 2024-01-XX
- **适用场景**: 用户原声清洗和分析
