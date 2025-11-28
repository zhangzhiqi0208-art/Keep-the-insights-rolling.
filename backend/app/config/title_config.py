"""
标题生成规则配置
集中管理所有标题相关的规则和配置
"""

# 标题格式规则
TITLE_FORMAT_RULES = {
    "max_length": 50,  # 最大长度
    "min_length": 10,   # 最小长度
    "prefix_format": "【{region}：{module}】",  # 前缀格式
    "content_max_length": 30,  # 内容部分最大长度
}

# 特殊情况处理规则
SPECIAL_CASES = {
    "align_wish_pattern": r'([^，。\n]+?)(?:希望|要|需要).*?(?:与|和).*?(?:样式|设计).*?(?:对齐|一致)',
    "design_inconsistent_pattern": r'设计[图稿].*不一致',
    "solution_keywords": ['需要', '应该', '建议', '要', '可以', '希望', '期待'],
}

# 解决方案转问题描述映射
SOLUTION_TO_PROBLEM_MAPPING = {
    "加粗": "样式层次不够突出",
    "进度条": "操作过程缺乏进度反馈", 
    "确认弹窗": "关键操作缺乏二次确认",
    "对齐": "样式不一致",
    "一致": "样式不一致",
}

# 标题生成示例
TITLE_EXAMPLES = {
    "good_examples": [
        "【BR+SSL：管理端】按钮尺寸过小，高度不够",
        "【SSL：门店端】Tab选中态样式不够突出", 
        "【BR：移动端】图片上传组件样式有误",
    ],
    "bad_examples": [
        "按钮问题",  # 太模糊
        "管理端数据导",  # 截断
        "问题",  # 太简单
    ]
}

# 验证规则
VALIDATION_RULES = {
    "required_prefix": True,  # 必须包含前缀
    "required_content": True,  # 必须包含内容
    "max_words": 15,  # 最大词数
    "min_words": 3,   # 最小词数
}
