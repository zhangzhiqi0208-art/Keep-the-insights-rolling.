"""
问题描述生成规则配置
集中管理所有问题描述相关的规则和配置
"""

# 问题描述内容要求
PROBLEM_DESCRIPTION_REQUIREMENTS = {
    "must_include": ["问题"],  # 简化为只要求具体问题
    "description": "详细描述具体问题",
    "min_length": 10,  # 降低最小长度要求
    "max_length": 500,  # 最大长度
}

# 问题描述生成规则
PROBLEM_DESCRIPTION_RULES = {
    "content_requirements": {
        "specific_problem": "详细说明问题的具体表现和现象"
    },
    "format_requirements": {
        "complete_sentence": True,  # 必须是完整句子
        "end_with_period": True,  # 以句号结尾
        "avoid_vague_terms": True,  # 避免模糊词汇
    }
}

# 问题描述示例
PROBLEM_DESCRIPTION_EXAMPLES = {
    "good_examples": [
        "按钮点击后没有视觉反馈",
        "页面加载时间过长",
        "操作流程过于复杂",
        "Tab选中态样式不够突出",
        "图片上传组件样式有误"
    ],
    "bad_examples": [
        "按钮问题",  # 太模糊
        "页面慢",  # 不够详细
        "操作复杂",  # 缺乏具体描述
    ]
}

# 文本清理规则
TEXT_CLEANING_RULES = {
    "remove_patterns": [
        r'在BR和SSL地区的管理端和门店端[，。]?',
        r'在BR地区的管理端和门店端[，。]?',
        r'在SSL地区的管理端和门店端[，。]?',
        r'在管理端和门店端[，。]?',
        r'在BR和SSL地区[，。]?',
        r'在BR地区[，。]?',
        r'在SSL地区[，。]?',
        r'用户.*时[，。]?',
        r'使用过程中[，。]?',
        r'^(?:，|,)?\s*中[，,]\s*',  # 修复截断前缀
        r'与?设计稿?存在不一致[，。]*',
        r'请核对规范[，。]*',
        r'按设计稿|按规范|规范要求[，。]*',
    ],
    "preserve_patterns": [
        r'用户.*操作.*时',  # 保留用户操作场景
        r'在.*过程中',  # 保留使用过程描述
        r'导致.*影响',  # 保留影响描述
    ]
}

# 问题描述生成分隔符
PROBLEM_SOLUTION_SEPARATORS = [
    r'解决方案[:：]',
    r'建议[:：]',
    r'期望[:：]',
    r'希望[:：]',
    r'临时处理[:：]',
    r'调整为[:：]',
    r'改为[:：]',
    r'应(?:该)?(?:为|是)[:：]?',
    r'建议\s*\d+[:：]?',  # 匹配"建议1："这样的格式
    r'^\s*\d+\.\s*建议',  # 匹配"1. 建议"这样的格式
]

# 问题描述润色规则（精简版）
PROBLEM_DESCRIPTION_ENRICHMENT = {
    "remove_duplicates": True,  # 移除重复内容
    "normalize_punctuation": True,  # 标准化标点符号
}

# 特殊情况处理
SPECIAL_CASES = {
    "align_wish_pattern": r'([^，。\n]+?)(?:希望|要|需要).*?(?:与|和).*?(?:样式|设计).*?(?:对齐|一致)',
    "design_inconsistent_pattern": r'设计[图稿].*不一致',
    "solution_keywords": ['需要', '应该', '建议', '要', '可以', '希望', '期待'],
}

# 验证规则
VALIDATION_RULES = {
    "required_elements": ["问题"],  # 简化为只要求具体问题
    "min_words": 3,  # 降低最小词数要求
    "max_words": 100,  # 最大词数
    "must_be_complete_sentence": False,  # 不强制要求完整句子
}
