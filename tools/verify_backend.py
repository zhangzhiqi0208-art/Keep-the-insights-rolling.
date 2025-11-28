#!/usr/bin/env python3
import requests
import json

def verify_backend():
    print("🔍 验证后端服务状态...")
    
    # 测试健康检查
    try:
        response = requests.get('http://localhost:8001/health')
        if response.status_code == 200:
            print("✅ 后端服务健康检查正常")
        else:
            print(f"❌ 健康检查失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 健康检查异常: {e}")
        return False
    
    # 测试API调用
    try:
        data = {
            'user_input': 'Capaciten a sus motociclistas xq no dan con los domicilios y terminan cancelando los servicios y a uno lo dejan con hambre y eso que hasta con la ubicación que les envía uno a través de su app, gracias',
            'source_language': '西班牙语',
            'target_language': '中文',
            'user_id': 'test_user'
        }
        
        response = requests.post('http://localhost:8001/api/original-sound/process-text', data=data)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ API调用成功")
                print(f"   情感分类: {result['analysis']['sentiment_classification']}")
                print(f"   情感强度: {result['analysis']['sentiment_intensity']}")
                print(f"   翻译结果: {result['analysis']['original_translation'][:50]}...")
                return True
            else:
                print(f"❌ API返回失败: {result.get('message', '未知错误')}")
                return False
        else:
            print(f"❌ API调用失败: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ API调用异常: {e}")
        return False

if __name__ == "__main__":
    if verify_backend():
        print("\n🎉 后端服务完全正常！")
        print("问题在于前端JavaScript缓存，请按照FINAL_SOLUTION.md中的步骤操作。")
    else:
        print("\n❌ 后端服务有问题，请检查服务状态。")

