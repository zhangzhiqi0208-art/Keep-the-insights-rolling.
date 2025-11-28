#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
导入用户原声池预置数据
读取Excel文件并转换为系统可用的JSON格式
"""

import json
import sys
from datetime import datetime

try:
    import openpyxl
except ImportError:
    print("需要安装openpyxl库: pip install openpyxl")
    sys.exit(1)

def read_excel_file(file_path):
    """读取Excel文件"""
    try:
        workbook = openpyxl.load_workbook(file_path)
        sheet = workbook.active
        
        # 读取表头
        headers = []
        for cell in sheet[1]:
            headers.append(cell.value if cell.value else '')
        
        # 读取数据
        data = []
        for row in sheet.iter_rows(min_row=2, values_only=True):
            if not any(row):  # 跳过空行
                continue
            
            row_data = {}
            for i, value in enumerate(row):
                if i < len(headers):
                    row_data[headers[i]] = value if value is not None else ''
            data.append(row_data)
        
        return data, headers
    except Exception as e:
        print(f"读取Excel文件失败: {e}")
        sys.exit(1)

def convert_to_voice_pool_format(data):
    """将Excel数据转换为用户原声池格式"""
    # 情感分类映射
    emotion_map = {
        '负向': {'type': 'negative', 'label': '负向', 'level': 'strong'},
        '负面': {'type': 'negative', 'label': '负向', 'level': 'strong'},
        '中性': {'type': 'neutral', 'label': '中性', 'level': 'slight'},
        '正向': {'type': 'positive', 'label': '正向', 'level': 'slight'},
        '正面': {'type': 'positive', 'label': '正向', 'level': 'slight'},
    }
    
    # 分析状态映射
    status_map = {
        '待评估': {'text': '待评估', 'type': 'pending'},
        '关键反馈': {'text': '关键反馈', 'type': 'key'},
        '暂不解决': {'text': '暂不解决', 'type': 'unresolved'},
    }
    
    converted_data = []
    
    for index, row in enumerate(data):
        # 尝试匹配各种可能的列名
        summary = ''
        emotion_text = '中性'
        module = ''
        issues = '--'
        status_text = '待评估'
        original_text = ''
        original_detail = ''
        translated_text = ''
        original_translation = ''
        key_analysis = ''
        key_points = ''
        sentiment_analysis = ''
        
        # 查找列名（支持多种可能的列名）
        for key, value in row.items():
            if not key:
                continue
            
            key_lower = str(key).lower()
            value_str = str(value).strip() if value else ''
            
            if '总结' in key or 'summary' in key_lower:
                summary = value_str
            elif '情感' in key and '分类' in key or 'emotion' in key_lower or ('sentiment' in key_lower and 'classification' in key_lower):
                emotion_text = value_str if value_str else '中性'
            elif '模块' in key or 'module' in key_lower:
                module = value_str
            elif '问题' in key and '关联' in key or 'issues' in key_lower:
                issues = value_str if value_str else '--'
            elif '状态' in key and ('分析' in key or '分析状态' in key) or 'status' in key_lower:
                status_text = value_str if value_str else '待评估'
            elif '原声详情' in key or 'originaldetail' in key_lower or ('original' in key_lower and 'detail' in key_lower):
                original_detail = value_str
            elif '原始' in key or '原文' in key or ('original' in key_lower and 'text' in key_lower):
                original_text = value_str
            elif '原声转译' in key or 'originaltranslation' in key_lower or ('original' in key_lower and 'translation' in key_lower):
                original_translation = value_str
            elif '翻译' in key or 'translation' in key_lower or 'translated' in key_lower:
                translated_text = value_str
            elif '重点分析' in key or 'keypoints' in key_lower or ('key' in key_lower and 'points' in key_lower):
                key_points = value_str
            elif '关键分析' in key or 'keyanalysis' in key_lower or ('key' in key_lower and 'analysis' in key_lower):
                key_analysis = value_str
            elif '情感分析' in key or 'sentimentanalysis' in key_lower or ('sentiment' in key_lower and 'analysis' in key_lower):
                sentiment_analysis = value_str
        
        # 如果没有找到总结，尝试使用第一个非空字段
        if not summary:
            for key, value in row.items():
                if value and str(value).strip():
                    summary = str(value).strip()
                    break
        
        # 设置默认值
        if not summary:
            summary = f'原声数据 {index + 1}'
        if not original_text and not original_detail:
            original_text = summary
        elif original_detail and not original_text:
            original_text = original_detail
        
        # 优先使用原声详情，如果没有则使用原始文本
        final_original_detail = original_detail if original_detail else original_text
        
        # 优先使用原声转译，如果没有则使用翻译文本
        final_translation = original_translation if original_translation else translated_text
        
        # 优先使用重点分析，如果没有则使用关键分析
        final_key_points = key_points if key_points else key_analysis
        
        # 映射情感和状态
        emotion = emotion_map.get(emotion_text, {'type': 'neutral', 'label': '中性', 'level': 'slight'})
        status = status_map.get(status_text, {'text': '待评估', 'type': 'pending'})
        
        # 生成唯一ID
        item_id = f'preset_{int(datetime.now().timestamp() * 1000)}_{index}'
        
        converted_item = {
            'id': item_id,
            'summary': summary,
            'emotion': emotion,
            'module': module,
            'issues': issues if issues else '--',
            'status': status,
            'originalText': original_text,
            'originalDetail': final_original_detail,  # 详情页字段
            'originalDescription': final_original_detail,  # 兼容字段
            'translatedText': final_translation,
            'originalTranslation': original_translation if original_translation else final_translation,  # 详情页字段
            'translation': final_translation,  # 兼容字段
            'keyAnalysis': key_analysis,
            'keyPoints': final_key_points,  # 详情页字段
            'sentimentAnalysis': sentiment_analysis,  # 详情页字段
            'sentiment': sentiment_analysis,  # 兼容字段
            'createdAt': datetime.now().isoformat()
        }
        
        converted_data.append(converted_item)
    
    return converted_data

def main():
    excel_file = '用户原声池-预置数据.xlsx'
    
    print(f"正在读取 {excel_file}...")
    data, headers = read_excel_file(excel_file)
    
    print(f"成功读取 {len(data)} 条数据")
    print(f"列名: {headers}")
    
    print("\n正在转换数据格式...")
    converted_data = convert_to_voice_pool_format(data)
    
    print(f"成功转换 {len(converted_data)} 条数据")
    
    # 保存为JSON文件
    output_file = 'voice_pool_preset_data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(converted_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n数据已保存到 {output_file}")
    
    # 生成JavaScript代码用于导入
    js_code = f"""
// 用户原声池预置数据导入代码
// 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

const presetData = {json.dumps(converted_data, ensure_ascii=False, indent=2)};

// 获取现有数据
let existingData = [];
try {{
    const stored = localStorage.getItem('voicePoolData');
    if (stored) {{
        existingData = JSON.parse(stored);
    }}
}} catch (e) {{
    console.error('读取现有数据失败:', e);
}}

// 合并数据（预置数据在前）
const allData = [...presetData, ...existingData];

// 保存到localStorage
localStorage.setItem('voicePoolData', JSON.stringify(allData));

console.log(`成功导入 ${{presetData.length}} 条预置数据！`);
console.log('当前共有', allData.length, '条数据');
"""
    
    js_file = 'import_voice_pool_preset.js'
    with open(js_file, 'w', encoding='utf-8') as f:
        f.write(js_code)
    
    print(f"JavaScript导入代码已保存到 {js_file}")
    print("\n使用方法:")
    print("1. 在浏览器控制台中运行 import_voice_pool_preset.js 的内容")
    print("2. 或者打开 import_default_data.html 使用可视化工具导入")
    print(f"3. 或者直接使用JSON文件: {output_file}")

if __name__ == '__main__':
    main()

