#!/bin/bash

# GitHub 仓库清理脚本
# 删除不必要的测试文件和临时文件

echo "🧹 开始清理 GitHub 仓库..."

# 删除测试 HTML 文件
echo "删除测试 HTML 文件..."
rm -f test_*.html
rm -f audio_*.html
rm -f debug_*.html
rm -f click_*.html
rm -f duplicate_*.html
rm -f file_*.html
rm -f final_*.html
rm -f simple_*.html
rm -f three_*.html
rm -f timing_*.html
rm -f upload_*.html
rm -f batch_*.html
rm -f copy_*.html
rm -f card_*.html
rm -f colon_*.html
rm -f dashed_*.html
rm -f element_*.html
rm -f force_*.html
rm -f padding_*.html
rm -f sentiment_*.html
rm -f standalone_*.html
rm -f style_*.html

# 删除测试 Python 文件
echo "删除测试 Python 文件..."
rm -f test_*.py

# 删除临时文件
echo "删除临时文件..."
rm -f *.log
rm -f .DS_Store

# 删除不需要的文档文件（保留重要的）
echo "删除临时文档文件..."
rm -f AUDIO_INTEGRATION_SUMMARY.md
rm -f AUDIO_UPLOAD_FIX.md
rm -f DUPLICATE_EVENTS_FIX.md
rm -f ENHANCED_API_SETUP.md
rm -f FIELD_MAPPING_FIX.md
rm -f FINAL_SOLUTION.md
rm -f HOTFIX_ASYNC_ISSUE.md
rm -f IMPACT_ANALYSIS_SIMPLIFICATION.md
rm -f NEW_SESSION_FEATURE.md
rm -f ORIGINAL_SOUND_TEMPLATE.md
rm -f PASTE_FIX.md
rm -f PROBLEM_DESCRIPTION_ENRICHMENT_SIMPLIFICATION.md
rm -f PROBLEM_DESCRIPTION_REQUIREMENTS.md
rm -f PROBLEM_DESCRIPTION_REQUIREMENT_UPDATE.md
rm -f QUICK_FIX.md
rm -f SOLUTION.md
rm -f STATIC_VERSION_FIX.md
rm -f TEMPLATE_FILL_IMPLEMENTATION.md
rm -f URGENT_FIX.md

echo "✅ 清理完成！"
echo ""
echo "📝 保留的重要文件："
echo "- index.html (主页面)"
echo "- script.js (主要功能)"
echo "- styles.css (样式文件)"
echo "- backend/ (后端代码)"
echo "- templates/ (模板文件)"
echo "- README.md (项目说明)"
echo "- DEPLOYMENT_GUIDE.md (部署指南)"
echo "- DEPLOYMENT_CHECKLIST.md (部署检查清单)"
echo "- QUICK_START_GUIDE.md (快速开始指南)"
echo ""
echo "🗑️ 已删除的文件："
echo "- 所有 test_*.html 测试文件"
echo "- 所有 test_*.py 测试文件"
echo "- 所有临时 HTML 文件"
echo "- 所有临时文档文件"
echo "- 日志文件"
echo ""
echo "下一步："
echo "1. 运行: git add ."
echo "2. 运行: git commit -m 'Clean up repository: remove test files'"
echo "3. 运行: git push origin main"
