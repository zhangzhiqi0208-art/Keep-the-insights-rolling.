#!/usr/bin/env python3
import requests
import json
import time

def create_test_history():
    """创建测试历史记录"""
    base_url = "http://localhost:8000"
    user_id = "user_mgm5llknubf28foduz"  # 使用原始页面的用户ID
    
    print("🧪 创建测试历史记录...")
    
    # 创建多条测试记录
    test_records = [
        {
            "user_id": user_id,
            "title": "导航二级菜单选中样式显示异常",
            "original_description": "导航二级菜单选中后样式不佳，导致放大后文案展示不全。建议1. 优先找产品确认导航文案长度 2. 如果无法修改，尝试缩小字体",
            "system_types": ["BR", "SSL"],
            "modules": ["管理端", "门店端"],
            "analysis_result": {
                "predictedType": "视觉还原度bug",
                "priority": "P2-中"
            },
            "standard_format": {
                "title": "导航二级菜单选中样式显示异常",
                "problem_description": "在BR和SSL地区的管理端和门店端中，用户使用导航功能时，二级菜单选中后样式显示不佳，特别是在放大显示或长文案场景下，菜单项文案展示不全被截断，影响用户快速识别当前所在位置和完整阅读菜单内容，降低了导航系统的可用性。",
                "solution": "1. 优先与产品团队确认导航文案的标准长度限制，从源头控制文案长度；2. 如果文案无法修改，可尝试适当缩小字体大小或调整菜单项宽度，确保在选中状态下所有文案都能完整显示，同时保持视觉层次清晰。"
            },
            "template_id": "default",
            "files_info": []
        },
        {
            "user_id": user_id,
            "title": "页面加载速度过慢影响用户体验",
            "original_description": "用户原声页面加载速度很慢，特别是在网络环境较差的情况下，等待时间过长，影响用户使用体验。",
            "system_types": ["BR"],
            "modules": ["移动端"],
            "analysis_result": {
                "predictedType": "性能问题",
                "priority": "P1-高"
            },
            "standard_format": {
                "title": "页面加载速度过慢影响用户体验",
                "problem_description": "在BR地区的移动端中，用户原声页面加载速度过慢，特别是在网络环境较差的情况下，等待时间过长，严重影响用户使用体验和操作效率。",
                "solution": "1. 优化页面资源加载，压缩图片和CSS/JS文件；2. 实现懒加载和分页加载；3. 优化网络请求，减少不必要的API调用；4. 考虑使用CDN加速静态资源加载。"
            },
            "template_id": "default",
            "files_info": []
        },
        {
            "user_id": user_id,
            "title": "表单验证错误提示不明确",
            "original_description": "用户填写表单时，某些字段验证失败后提示信息不够明确，用户不知道具体哪里出错了，需要改进提示信息。",
            "system_types": ["SSL"],
            "modules": ["管理端", "门店端"],
            "analysis_result": {
                "predictedType": "交互体验问题",
                "priority": "P2-中"
            },
            "standard_format": {
                "title": "表单验证错误提示不明确",
                "problem_description": "在SSL地区的管理端和门店端中，用户填写表单时，某些字段验证失败后提示信息不够明确，用户无法快速定位问题所在，影响表单填写效率和用户体验。",
                "solution": "1. 优化表单验证逻辑，提供更具体的错误提示；2. 在错误字段旁边显示明确的提示信息；3. 使用颜色和图标增强视觉提示；4. 提供示例格式帮助用户理解要求。"
            },
            "template_id": "default",
            "files_info": []
        }
    ]
    
    created_records = []
    
    for i, record in enumerate(test_records):
        print(f"创建第 {i+1} 条记录...")
        
        url = f"{base_url}/api/history/save"
        try:
            response = requests.post(url, json=record)
            print(f"响应状态码: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    created_records.append(result.get("id"))
                    print(f"✅ 记录 {i+1} 创建成功: {result.get('id')}")
                else:
                    print(f"❌ 记录 {i+1} 创建失败: {result}")
            else:
                print(f"❌ 记录 {i+1} 请求失败: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ 记录 {i+1} 请求异常: {e}")
        
        # 添加延迟避免过快请求
        time.sleep(0.5)
    
    print(f"\n📊 创建结果: 成功创建 {len(created_records)} 条记录")
    
    # 验证创建结果
    print("\n🔍 验证创建结果...")
    try:
        list_url = f"{base_url}/api/history/list?user_id={user_id}&page=1&page_size=20"
        response = requests.get(list_url)
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                data = result.get("data", [])
                print(f"✅ 验证成功: 用户 {user_id} 共有 {len(data)} 条历史记录")
                for record in data:
                    print(f"  - {record.get('title')} ({record.get('created_at')})")
            else:
                print(f"❌ 验证失败: {result}")
        else:
            print(f"❌ 验证请求失败: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 验证异常: {e}")

if __name__ == "__main__":
    create_test_history()
