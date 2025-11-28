// 全局变量
let uploadedFiles = [];
let isConverting = false;

// Toast提示功能
function showToast(message, type = 'success') {
    // 移除已存在的toast
    const existingToast = document.getElementById('toast-container');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 创建toast容器
    const toast = document.createElement('div');
    toast.id = 'toast-container';
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // 添加到页面
    document.body.appendChild(toast);
    
    // 显示动画
    setTimeout(() => {
        toast.classList.add('toast-show');
    }, 10);
    
    // 自动隐藏
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2000);
}

// 模板状态管理
const TemplateStateManager = {
    states: {
        design: {
            formData: {},
            previewContent: '',
            uploadedFiles: [],
            buttonGroup: 'design'
        },
        feedback: {
            text: {
                formData: {},
                previewContent: '',
                uploadedFiles: [],
                buttonGroup: 'text'
            },
            excel: {
                formData: {},
                previewContent: '',
                uploadedFiles: [],
                buttonGroup: 'excel'
            }
        }
    },
    
    // 保存当前模板状态
    saveCurrentState() {
        const templateType = getCurrentTemplateType();
        const inputType = getCurrentInputType();
        
        console.log('保存模板状态 - 模板类型:', templateType, '输入类型:', inputType);
        console.log('当前激活的tab:', document.querySelector('.nav-tab.active'));
        console.log('当前激活的输入类型tab:', document.querySelector('.input-type-tab.active'));
        
        if (templateType === 'design') {
            // 保存设计体验问题模板状态
            const formData = this.getFormData();
            console.log('保存设计体验问题模板状态 - 表单数据:', formData);
            this.states.design.formData = formData;
            this.states.design.previewContent = document.getElementById('previewContent').innerHTML;
            this.states.design.uploadedFiles = [...uploadedFiles];
        } else if (templateType === 'feedback') {
            // 保存用户原声清洗模板状态
            if (inputType === 'text') {
                this.states.feedback.text.formData = this.getFormData();
                this.states.feedback.text.previewContent = document.getElementById('previewContent').innerHTML;
                this.states.feedback.text.uploadedFiles = [...uploadedFiles];
            } else if (inputType === 'excel') {
                this.states.feedback.excel.formData = this.getFormData();
                this.states.feedback.excel.previewContent = document.getElementById('previewContent').innerHTML;
                this.states.feedback.excel.uploadedFiles = [...uploadedFiles];
            }
        }
        
        console.log('模板状态已保存:', this.states);
    },
    
    // 恢复模板状态
    restoreState(templateType, inputType = null) {
        console.log('恢复模板状态 - 模板类型:', templateType, '输入类型:', inputType);
        
        if (templateType === 'design') {
            // 恢复设计体验问题模板状态
            this.restoreDesignState();
        } else if (templateType === 'feedback' && inputType) {
            // 恢复用户原声清洗模板状态
            this.restoreFeedbackState(inputType);
        }
    },
    
    // 恢复设计体验问题模板状态
    restoreDesignState() {
        const state = this.states.design;
        console.log('恢复设计体验问题模板状态:', state);
        console.log('恢复的表单数据:', state.formData);
        
        // 恢复表单数据
        this.fillFormData(state.formData);
        
        // 恢复预览内容（仅在当前激活模板为设计体验问题模板时展示按钮）
        if (state.previewContent && 
            !state.previewContent.includes('转化后的标准化内容将在此处显示') &&
            !state.previewContent.includes('转化好的内容将会按照标准化的模板在此处展示') &&
            !state.previewContent.includes('preview-empty-state') &&
            !state.previewContent.includes('预览空占位.png')) {
            document.getElementById('previewContent').innerHTML = state.previewContent;
            const activeTemplate = getCurrentTemplateType && getCurrentTemplateType();
            if (activeTemplate === 'design') {
                showPreviewActions();
            } else {
                hidePreviewActions();
            }
        } else {
            hidePreviewActions();
        }
        
        // 恢复上传的文件
        uploadedFiles = [...state.uploadedFiles];
        this.updateUploadedFilesDisplay();
    },
    
    // 恢复用户原声清洗模板状态
    restoreFeedbackState(inputType) {
        const state = this.states.feedback[inputType];
        if (!state) return;
        
        console.log(`恢复用户原声清洗模板状态 (${inputType}):`, state);
        
        // 恢复表单数据
        this.fillFormData(state.formData);
        
        // 恢复预览内容（仅在当前激活输入类型与恢复类型一致时展示按钮）
        if (state.previewContent && 
            !state.previewContent.includes('转化后的标准化内容将在此处显示') &&
            !state.previewContent.includes('转化好的内容将会按照标准化的模板在此处展示') &&
            !state.previewContent.includes('preview-empty-state') &&
            !state.previewContent.includes('预览空占位.png')) {
            document.getElementById('previewContent').innerHTML = state.previewContent;
            const activeInputType = getCurrentInputType && getCurrentInputType();
            if (activeInputType === inputType) {
                showPreviewActions();
            } else {
                hidePreviewActions();
            }
        } else {
            hidePreviewActions();
        }
        
        // 恢复上传的文件
        uploadedFiles = [...state.uploadedFiles];
        this.updateUploadedFilesDisplay();
    },
    
    // 获取当前表单数据
    getFormData() {
        const formData = {};
        const templateType = getCurrentTemplateType();
        const inputType = getCurrentInputType();
        
        console.log('TemplateStateManager.getFormData() - 模板类型:', templateType, '输入类型:', inputType);
        
        if (templateType === 'design') {
            // 只获取设计体验问题模板的数据
            const issueDescription = document.getElementById('issueDescription');
            if (issueDescription && issueDescription.value.trim()) {
                formData.issueDescription = issueDescription.value.trim();
            }
            
            // 获取地区和模块选择
            const systemTypes = Array.from(document.querySelectorAll('input[name="systemType"]:checked')).map(cb => cb.value);
            if (systemTypes.length > 0) {
                formData.systemType = systemTypes;
            }
            
            const modules = Array.from(document.querySelectorAll('input[name="module"]:checked')).map(cb => cb.value);
            if (modules.length > 0) {
                formData.module = modules;
            }
            
        } else if (templateType === 'feedback') {
            // 只获取用户原声清洗模板的数据
            if (inputType === 'text') {
                const originalSoundText = document.getElementById('originalSoundText');
                console.log('检查用户原声文本输入框:', originalSoundText);
                console.log('用户原声文本输入框的值:', originalSoundText ? originalSoundText.value : '元素不存在');
                if (originalSoundText && originalSoundText.value.trim()) {
                    formData.originalSoundText = originalSoundText.value.trim();
                    console.log('保存用户原声文本:', formData.originalSoundText);
                } else {
                    console.log('用户原声文本为空或元素不存在');
                }
                
                // 获取语言选择
                const sourceLanguageValue = getSourceLanguageValue();
                if (sourceLanguageValue) {
                    formData.sourceLanguage = sourceLanguageValue;
                }
                
                const targetLanguageValue = getTargetLanguageValue();
                if (targetLanguageValue) {
                    formData.targetLanguage = targetLanguageValue;
                }
            }
            // Excel输入类型暂时不需要特殊处理
        }
        
        console.log('TemplateStateManager.getFormData() 返回:', formData);
        return formData;
    },
    
    // 填充表单数据
    fillFormData(formData) {
        console.log('填充表单数据:', formData);
        console.log('表单数据详情:', JSON.stringify(formData, null, 2));
        
        // 填充设计体验问题模板数据
        if (formData.issueDescription) {
            console.log('填充设计体验问题模板数据:', formData.issueDescription);
            const issueDescription = document.getElementById('issueDescription');
            if (issueDescription) {
                issueDescription.value = formData.issueDescription;
                console.log('设计体验问题模板数据已填充');
            } else {
                console.log('找不到设计体验问题模板输入框');
            }
        }
        
        // 填充用户原声清洗模板数据
        if (formData.originalSoundText) {
            console.log('填充用户原声清洗模板数据:', formData.originalSoundText);
            const originalSoundText = document.getElementById('originalSoundText');
            if (originalSoundText) {
                originalSoundText.value = formData.originalSoundText;
                console.log('用户原声清洗模板数据已填充');
            } else {
                console.log('找不到用户原声清洗模板输入框');
            }
        }
        
        // 填充语言选择
        if (formData.sourceLanguage) {
            setSourceLanguageValue(formData.sourceLanguage);
        }
        
        if (formData.targetLanguage) {
            setTargetLanguageValue(formData.targetLanguage);
        }
        
        // 填充地区和模块选择
        if (formData.systemType) {
            formData.systemType.forEach(value => {
                const checkbox = document.querySelector(`input[name="systemType"][value="${value}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
        
        if (formData.module) {
            formData.module.forEach(value => {
                const checkbox = document.querySelector(`input[name="module"][value="${value}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
    },
    
    // 更新上传文件显示
    updateUploadedFilesDisplay() {
        const container = document.getElementById('uploadedImagesContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        uploadedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'uploaded-image-item';
            fileItem.innerHTML = `
                <div class="image-preview">
                    <img src="${file.url}" alt="${file.name}" />
                </div>
                <div class="image-info">
                    <span class="image-name">${file.name}</span>
                    <button class="remove-image-btn" onclick="removeUploadedFile(${index})">×</button>
                </div>
            `;
            container.appendChild(fileItem);
        });
    }
};

// 页面路由状态
let currentPage = 'voice-pool'; // 'voice-pool' | 'problem-pool' | 'ai-voice' | 'ai-problem' | 'manual-voice' | 'manual-problem'
let currentMainPage = 'voice-pool'; // 当前主页

// 用户原声池筛选状态
let currentVoicePoolFilter = 'all'; // 'all' | 'pending' | 'key' | 'unresolved'
let currentFilterConditions = {
    emotion: [], // 情感分类筛选
    module: [], // 所属模块筛选
    status: [] // 分析状态筛选
};

// 用户原声池分组状态
let currentGroupBy = 'none'; // 'none' | 'emotion' | 'module' | 'status'

let hasHandledVoiceDetailParam = false;

// 用户原声池视图状态
let currentViewType = 'list'; // 'list' | 'kanban'

// 问题跟进池问题类型状态
let currentProblemType = 'feedback'; // 'feedback' | 'design'

// 问题跟进池解决状态筛选状态
let currentProblemStatusFilter = 'all'; // 'all' | 'pending' | 'processing' | 'review' | 'resolved'

// 问题跟进池视图状态
let currentProblemViewType = 'list'; // 'list' | 'kanban'

// 手动录入问题页选择器选项缓存
let manualProblemSelectorsCache = {
    feedback: {
        region: [],
        terminal: [],
        assignee: '',
        resolutionStatus: '待确认',
        relatedSound: ''
    },
    design: {
        region: [],
        terminal: [],
        problemType: '',
        priority: '',
        assignee: '',
        resolutionStatus: '待确认'
    },
    activeTab: 'feedback'
};

// 切换主页
function switchMainPage(pageType) {
    console.log('switchMainPage 被调用，页面类型:', pageType);
    
    try {
        // 保存当前状态（如果在工作页面）
        if (currentPage === 'ai-voice' || currentPage === 'ai-problem' || currentPage === 'manual-voice' || currentPage === 'manual-problem') {
            TemplateStateManager.saveCurrentState();
        }
        
        // 显示tab切换，隐藏工作页面导航
        const navTabs = document.getElementById('navTabs');
        const navWorkHeader = document.getElementById('navWorkHeader');
        if (navTabs) navTabs.style.display = 'flex';
        if (navWorkHeader) navWorkHeader.style.display = 'none';
        
        // 移除所有tab的active状态
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // 添加当前tab的active状态
        const currentTab = document.querySelector(`[data-page="${pageType}"]`);
        if (currentTab) {
            currentTab.classList.add('active');
            console.log('激活标签:', currentTab.textContent);
        }
        
        // 隐藏所有页面
        document.querySelectorAll('.home-page').forEach(page => {
            page.style.display = 'none';
        });
        const workPageContainer = document.getElementById('work-page-container');
        if (workPageContainer) {
            workPageContainer.style.display = 'none';
        }
        
        // 显示对应的主页
        const homePage = document.getElementById(`${pageType}-home`);
        if (homePage) {
            homePage.style.display = 'flex';
            currentPage = pageType;
            currentMainPage = pageType;
            
            // 如果切换到用户原声池主页，重新应用筛选
            if (pageType === 'voice-pool') {
                let allData = [];
                try {
                    const stored = localStorage.getItem('voicePoolData');
                    if (stored) {
                        allData = JSON.parse(stored);
                    }
                } catch (error) {
                    console.error('读取数据失败:', error);
                    allData = [];
                }
                applyVoicePoolFilter(currentVoicePoolFilter, allData);
            }
            
            // 如果切换到问题跟进池主页，渲染问题表格或看板
            if (pageType === 'problem-pool') {
                // 重置筛选状态为默认值
                currentProblemStatusFilter = 'all';
                // 重置filter-tab的激活状态
                const filterTabs = document.querySelectorAll('#problem-pool-home .filter-tab');
                filterTabs.forEach(tab => {
                    tab.classList.remove('active');
                    if (tab.getAttribute('data-filter') === 'all') {
                        tab.classList.add('active');
                    }
                });
                // 根据当前视图类型渲染
                if (currentProblemViewType === 'list') {
                    renderProblemPoolTable();
                } else {
                    renderProblemPoolKanbanView();
                }
                updateProblemPoolStats();
            }
        }
        
        // 在主页时隐藏历史记录按钮，显示搜索和通知按钮
        const searchBtn = document.getElementById('searchBtn');
        const notificationBtn = document.getElementById('notificationBtn');
        const historyBtn = document.getElementById('historyBtn');
        if (searchBtn) searchBtn.style.display = 'flex';
        if (notificationBtn) notificationBtn.style.display = 'flex';
        if (historyBtn) historyBtn.style.display = 'none';
        
        console.log('已切换到主页:', pageType);
    } catch (error) {
        console.error('switchMainPage 错误:', error);
    }
}

// 进入AI录入页面
function enterAIIntake(type) {
    console.log('enterAIIntake 被调用，类型:', type);
    
    try {
        // 隐藏所有主页
        document.querySelectorAll('.home-page').forEach(page => {
            page.style.display = 'none';
        });
        
        // 显示工作页面
        const workPageContainer = document.getElementById('work-page-container');
        if (workPageContainer) {
            workPageContainer.style.display = 'block';
        }
        
        // 隐藏tab切换，显示工作页面导航（返回按钮+标题）
        const navTabs = document.getElementById('navTabs');
        const navWorkHeader = document.getElementById('navWorkHeader');
        const navWorkTitle = document.getElementById('navWorkTitle');
        
        if (navTabs) navTabs.style.display = 'none';
        if (navWorkHeader) navWorkHeader.style.display = 'flex';
        
        // 确保显示输入区和预览区，隐藏手动录入容器
        const inputSection = document.querySelector('.input-section');
        const previewSection = document.querySelector('.preview-section');
        const manualInputContainer = document.getElementById('manualInputContainer');
        
        if (inputSection) inputSection.style.display = 'block';
        if (previewSection) previewSection.style.display = 'block';
        if (manualInputContainer) manualInputContainer.style.display = 'none';
        
        // 根据类型设置页面标题和切换模板
        if (type === 'voice') {
            currentPage = 'ai-voice';
            if (navWorkTitle) navWorkTitle.textContent = 'AI录入原声';
            switchTab('feedback');
            
            // 清空输入区和预览区，但保留tab选择状态
            clearAIVoiceInputAndPreview();
            
            // 恢复用户上次选择的输入类型tab（文本原声/Excel文件）
            restoreLastInputTypeTab();
            
            // 隐藏logo
            const navBrand = document.querySelector('.nav-brand');
            if (navBrand) navBrand.style.display = 'none';
            // 隐藏搜索和通知按钮，只显示历史记录按钮，隐藏手动录入按钮组
            const searchBtn = document.getElementById('searchBtn');
            const notificationBtn = document.getElementById('notificationBtn');
            const historyBtn = document.getElementById('historyBtn');
            const manualInputBtnGroup = document.getElementById('manualInputBtnGroup');
            if (searchBtn) searchBtn.style.display = 'none';
            if (notificationBtn) notificationBtn.style.display = 'none';
            if (historyBtn) historyBtn.style.display = 'flex';
            if (manualInputBtnGroup) manualInputBtnGroup.style.display = 'none';

            // 隐藏走查问题页的输入类型头部（只在AI录入走查问题页展示）
            const designInputTypeGroup = document.getElementById('designInputTypeGroup');
            if (designInputTypeGroup) {
                designInputTypeGroup.style.display = 'none';
            }
        } else if (type === 'problem') {
            currentPage = 'ai-problem';
            if (navWorkTitle) navWorkTitle.textContent = 'AI录入走查问题';
            
            // 先清空输入区和预览区，恢复至初始状态（必须在switchTab之前，避免恢复之前的状态）
            clearAIProblemInputAndPreview();
            
            // 然后切换tab
            switchTab('design');
            
            // 隐藏logo（与AI录入原声页面保持一致）
            const navBrand = document.querySelector('.nav-brand');
            if (navBrand) navBrand.style.display = 'none';
            // 隐藏搜索和通知按钮，只显示历史记录按钮（与AI录入原声页面保持一致），隐藏手动录入按钮组
            const searchBtn = document.getElementById('searchBtn');
            const notificationBtn = document.getElementById('notificationBtn');
            const historyBtn = document.getElementById('historyBtn');
            const manualInputBtnGroup = document.getElementById('manualInputBtnGroup');
            if (searchBtn) searchBtn.style.display = 'none';
            if (notificationBtn) notificationBtn.style.display = 'none';
            if (historyBtn) historyBtn.style.display = 'flex';
            if (manualInputBtnGroup) manualInputBtnGroup.style.display = 'none';

            // 显示走查问题页的输入类型头部
            const designInputTypeGroup = document.getElementById('designInputTypeGroup');
            if (designInputTypeGroup) {
                designInputTypeGroup.style.display = '';
            }
        }
        
        console.log('已进入AI录入页面:', type);
    } catch (error) {
        console.error('enterAIIntake 错误:', error);
    }
}

// 进入手动录入页面
function enterManualInput(type) {
    console.log('enterManualInput 被调用，类型:', type);
    
    try {
        // 隐藏所有主页
        document.querySelectorAll('.home-page').forEach(page => {
            page.style.display = 'none';
        });
        
        // 显示工作页面
        const workPageContainer = document.getElementById('work-page-container');
        if (workPageContainer) {
            workPageContainer.style.display = 'block';
        }
        
        // 隐藏tab切换，显示工作页面导航（返回按钮+标题）
        const navTabs = document.getElementById('navTabs');
        const navWorkHeader = document.getElementById('navWorkHeader');
        const navWorkTitle = document.getElementById('navWorkTitle');
        
        if (navTabs) navTabs.style.display = 'none';
        if (navWorkHeader) navWorkHeader.style.display = 'flex';
        
        // 根据类型设置页面标题和切换模板
        if (type === 'voice') {
            currentPage = 'manual-voice';
            if (navWorkTitle) navWorkTitle.textContent = '手动录入原声';
            
            // 隐藏左侧输入区和右侧预览区
            const inputSection = document.querySelector('.input-section');
            const previewSection = document.querySelector('.preview-section');
            const manualInputContainer = document.getElementById('manualInputContainer');
            const manualProblemInputContainer = document.getElementById('manualProblemInputContainer');
            
            if (inputSection) inputSection.style.display = 'none';
            if (previewSection) previewSection.style.display = 'none';
            if (manualInputContainer) manualInputContainer.style.display = 'block';
            if (manualProblemInputContainer) manualProblemInputContainer.style.display = 'none';
            
            // 隐藏logo
            const navBrand = document.querySelector('.nav-brand');
            if (navBrand) navBrand.style.display = 'none';
            // 隐藏搜索、通知和历史记录按钮，显示手动录入按钮组
            const searchBtn = document.getElementById('searchBtn');
            const notificationBtn = document.getElementById('notificationBtn');
            const historyBtn = document.getElementById('historyBtn');
            const manualInputBtnGroup = document.getElementById('manualInputBtnGroup');
            if (searchBtn) searchBtn.style.display = 'none';
            if (notificationBtn) notificationBtn.style.display = 'none';
            if (historyBtn) historyBtn.style.display = 'none';
            if (manualInputBtnGroup) manualInputBtnGroup.style.display = 'flex';
            
            // 初始化实时翻译功能
            setTimeout(() => {
                initManualInputTranslation();
            }, 100);
        } else if (type === 'problem') {
            currentPage = 'manual-problem';
            if (navWorkTitle) navWorkTitle.textContent = '手动录入问题';
            
            // 隐藏左侧输入区和右侧预览区
            const inputSection = document.querySelector('.input-section');
            const previewSection = document.querySelector('.preview-section');
            const manualInputContainer = document.getElementById('manualInputContainer');
            const manualProblemInputContainer = document.getElementById('manualProblemInputContainer');
            
            if (inputSection) inputSection.style.display = 'none';
            if (previewSection) previewSection.style.display = 'none';
            if (manualInputContainer) manualInputContainer.style.display = 'none';
            if (manualProblemInputContainer) manualProblemInputContainer.style.display = 'block';
            
            // 隐藏logo
            const navBrand = document.querySelector('.nav-brand');
            if (navBrand) navBrand.style.display = 'none';
            // 隐藏搜索、通知和历史记录按钮，显示手动录入按钮组
            const searchBtn = document.getElementById('searchBtn');
            const notificationBtn = document.getElementById('notificationBtn');
            const historyBtn = document.getElementById('historyBtn');
            const manualInputBtnGroup = document.getElementById('manualInputBtnGroup');
            if (searchBtn) searchBtn.style.display = 'none';
            if (notificationBtn) notificationBtn.style.display = 'none';
            if (historyBtn) historyBtn.style.display = 'none';
            if (manualInputBtnGroup) manualInputBtnGroup.style.display = 'flex';
            
            // 初始化关联原声选择器
            initRelatedSoundSelector();
            
            // 初始化问题类型切换
            initManualProblemTypeSwitch();
            
            // 初始化问题录入表单验证监听
            setupManualProblemValidation();
            
            // 初始化选择器颜色状态
            initManualProblemSelectColors();
            
            // 初始化文件上传功能
            initManualProblemFileUpload();
            
            // 清空输入框内容，保留选择器选项
            clearManualProblemInputs();
        }
        
        console.log('已进入手动录入页面:', type);
    } catch (error) {
        console.error('enterManualInput 错误:', error);
    }
}

// 初始化手动录入问题页的问题类型切换
function initManualProblemTypeSwitch() {
    const problemTypeTabs = document.querySelectorAll('#manualProblemInputContainer .view-tab[data-problem-type]');
    
    problemTypeTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            const problemType = this.getAttribute('data-problem-type');
            
            // 更新tab的激活状态
            const viewContainer = this.closest('.view-container');
            if (viewContainer) {
                viewContainer.querySelectorAll('.view-tab').forEach(t => {
                    t.classList.remove('active');
                });
                this.classList.add('active');
            }
            
            // 切换内容显示
            const feedbackContent = document.getElementById('manualProblemFeedbackContent');
            const designContent = document.getElementById('manualProblemDesignContent');
            
            if (problemType === 'feedback') {
                if (feedbackContent) feedbackContent.style.display = 'block';
                if (designContent) designContent.style.display = 'none';
            } else if (problemType === 'design') {
                if (feedbackContent) feedbackContent.style.display = 'none';
                if (designContent) designContent.style.display = 'block';
            }
        });
    });
}

// 初始化关联原声选择器
function initRelatedSoundSelector() {
    const relatedSoundSelect = document.getElementById('manualProblemRelatedSound');
    if (!relatedSoundSelect) return;
    
    // 清空现有选项（保留第一个"请选择"选项）
    relatedSoundSelect.innerHTML = '<option value="">请选择关联原声</option>';
    
    // 从localStorage读取用户原声池数据
    let voicePoolData = [];
    try {
        const stored = localStorage.getItem('voicePoolData');
        if (stored) {
            voicePoolData = JSON.parse(stored);
        }
    } catch (error) {
        console.error('读取用户原声池数据失败:', error);
        return;
    }
    
    // 提取所有原声总结，去重并排序
    const summaries = [...new Set(voicePoolData.map(item => item.summary).filter(summary => summary && summary.trim()))];
    summaries.sort();
    
    // 填充选项
    summaries.forEach(summary => {
        const option = document.createElement('option');
        option.value = summary;
        option.textContent = summary;
        relatedSoundSelect.appendChild(option);
    });
    
    console.log('关联原声选择器已初始化，共', summaries.length, '个选项');
}

// 手动录入原声 - 实时翻译功能
let translationTimeout = null;
let isTranslating = false;
let lastTranslationText = '';
let lastTranslationSource = '';
let lastTranslationTarget = '';

// 语言映射函数 - 将手动录入页面的语言值映射到后端API期望的格式
function mapLanguageForAPI(language) {
    const languageMap = {
        '自动检测': '自动检测',
        '葡萄牙语': '葡语',
        '西班牙语': '西语',
        '英语': '英语',
        '简体中文': '中文',
        '繁体中文': '中文'
    };
    return languageMap[language] || language;
}

// 获取情感分类显示HTML（统一的样式：文字+icon）
function getSentimentDisplayHTML(sentimentValue) {
    const sentimentMap = {
        '负向': { icon: 'icon/负向.svg', text: '负向' },
        'negative': { icon: 'icon/负向.svg', text: '负向' },
        '中性': { icon: 'icon/中性.svg', text: '中性' },
        'neutral': { icon: 'icon/中性.svg', text: '中性' },
        '正向': { icon: 'icon/正向.svg', text: '正向' },
        'positive': { icon: 'icon/正向.svg', text: '正向' }
    };
    
    const sentiment = sentimentMap[sentimentValue] || { icon: 'icon/中性.svg', text: sentimentValue || '中性' };
    
    return `
        <span class="sentiment-display">
            <img src="${sentiment.icon}" alt="${sentiment.text}" class="sentiment-icon" />
            <span class="sentiment-text">${sentiment.text}</span>
        </span>
    `;
}

// 防抖翻译函数
function debounceTranslate() {
    if (translationTimeout) {
        clearTimeout(translationTimeout);
    }
    
    translationTimeout = setTimeout(() => {
        performRealTimeTranslation();
    }, 500); // 500ms防抖延迟
}

// 执行实时翻译
async function performRealTimeTranslation() {
    const originalText = document.getElementById('manualOriginalText');
    const translatedText = document.getElementById('manualTranslatedText');
    const targetLanguage = document.getElementById('manualTargetLanguage');
    
    if (!originalText || !translatedText || !targetLanguage) {
        return;
    }
    
    const text = originalText.value.trim();
    const sourceLang = '自动检测'; // 使用自动检测作为源语言
    const targetLang = targetLanguage.value;
    
    // 如果文本为空，清空翻译结果并恢复输入框状态
    if (!text) {
        translatedText.value = '';
        translatedText.disabled = false;
        translatedText.style.cursor = 'text';
        const translatedTextItem = translatedText.closest('.text-input-item');
        if (translatedTextItem) {
            translatedTextItem.classList.remove('translating');
        }
        lastTranslationText = '';
        return;
    }
    
    // 如果内容和语言都没有变化，跳过翻译
    if (text === lastTranslationText && 
        sourceLang === lastTranslationSource && 
        targetLang === lastTranslationTarget) {
        return;
    }
    
    // 如果正在翻译中，跳过
    if (isTranslating) {
        return;
    }
    
    try {
        isTranslating = true;
        
        // 禁用原声转译输入框
        translatedText.disabled = true;
        
        // 获取原声转译输入框的父容器，添加loading状态
        const translatedTextItem = translatedText.closest('.text-input-item');
        if (translatedTextItem) {
            translatedTextItem.classList.add('translating');
        }
        
        // 显示翻译中状态
        translatedText.value = '翻译中...';
        translatedText.style.color = '#999';
        translatedText.style.cursor = 'not-allowed';
        
        // 调用后端翻译API - 映射语言格式
        const formData = new FormData();
        formData.append('user_input', text);
        formData.append('source_language', mapLanguageForAPI(sourceLang));
        formData.append('target_language', mapLanguageForAPI(targetLang));
        formData.append('user_id', 'manual_input_user');
        
        const response = await fetch('http://localhost:8001/api/original-sound/process-text', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`翻译失败: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result && result.success) {
            // 提取翻译结果 - 后端返回结构为 {success: true, analysis: {original_translation: ...}}
            const translation = (result.analysis && result.analysis.original_translation) || 
                              (result.data && result.data.original_translation) || 
                              (result.data && result.data.translation) || '';
            
            if (translation) {
                translatedText.value = translation;
                translatedText.style.color = '#333';
                
                // 更新缓存
                lastTranslationText = text;
                lastTranslationSource = sourceLang;
                lastTranslationTarget = targetLang;
            } else {
                translatedText.value = '';
                translatedText.style.color = '#999';
            }
        } else {
            throw new Error('翻译结果格式错误');
        }
        
    } catch (error) {
        console.error('实时翻译失败:', error);
        translatedText.value = '翻译失败，请稍后重试';
        translatedText.style.color = '#ff4d4f';
        
        // 3秒后恢复为空
        setTimeout(() => {
            if (translatedText.value === '翻译失败，请稍后重试') {
                translatedText.value = '';
                translatedText.style.color = '#333';
            }
        }, 3000);
    } finally {
        // 恢复原声转译输入框状态
        translatedText.disabled = false;
        translatedText.style.cursor = 'text';
        
        // 移除loading状态
        const translatedTextItem = translatedText.closest('.text-input-item');
        if (translatedTextItem) {
            translatedTextItem.classList.remove('translating');
        }
        
        isTranslating = false;
    }
}

// 初始化手动录入原声页面的实时翻译功能
function initManualInputTranslation() {
    const originalText = document.getElementById('manualOriginalText');
    const targetLanguage = document.getElementById('manualTargetLanguage');
    
    if (!originalText || !targetLanguage) {
        return;
    }
    
    // 监听原声详情输入框的变化
    originalText.addEventListener('input', () => {
        debounceTranslate();
        clearManualInputError('manualOriginalText');
    });
    
    // 监听目标语言选择器的变化
    targetLanguage.addEventListener('change', () => {
        lastTranslationText = ''; // 清除缓存，强制重新翻译
        debounceTranslate();
    });
    
    // 设置手动录入原声表单验证监听
    setupManualInputValidation();
}

// 显示手动录入原声字段错误提示
function showManualInputError(fieldId, message) {
    const errorEl = document.getElementById(`${fieldId}Error`);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
    
    // 添加错误样式到输入框或选择器
    const inputEl = document.getElementById(fieldId);
    if (inputEl) {
        inputEl.classList.add('manual-input-error');
    }
}

// 清除手动录入原声字段错误提示
function clearManualInputError(fieldId) {
    const errorEl = document.getElementById(`${fieldId}Error`);
    if (errorEl) {
        errorEl.style.display = 'none';
    }
    
    // 移除错误样式
    const inputEl = document.getElementById(fieldId);
    if (inputEl) {
        inputEl.classList.remove('manual-input-error');
    }
}

// 清除所有手动录入原声错误提示
function clearManualInputErrors() {
    clearManualInputError('manualOriginalText');
    clearManualInputError('manualSentiment');
    clearManualInputError('manualModule');
    clearManualInputError('manualSummary');
}

// 设置手动录入原声表单验证监听
function setupManualInputValidation() {
    const originalText = document.getElementById('manualOriginalText');
    const sentiment = document.getElementById('manualSentiment');
    const module = document.getElementById('manualModule');
    const summary = document.getElementById('manualSummary');
    
    // 监听原声详情输入变化，清除错误提示
    if (originalText) {
        originalText.addEventListener('input', () => {
            clearManualInputError('manualOriginalText');
        });
        originalText.addEventListener('change', () => {
            clearManualInputError('manualOriginalText');
        });
    }
    
    // 监听情感分类选择变化，清除错误提示
    if (sentiment) {
        sentiment.addEventListener('change', () => {
            clearManualInputError('manualSentiment');
        });
    }
    
    // 监听所属模块选择变化，清除错误提示
    if (module) {
        module.addEventListener('change', () => {
            clearManualInputError('manualModule');
        });
    }
    
    // 监听原声总结输入变化，清除错误提示
    if (summary) {
        summary.addEventListener('input', () => {
            clearManualInputError('manualSummary');
        });
        summary.addEventListener('change', () => {
            clearManualInputError('manualSummary');
        });
    }
}

// 手动录入原声 - 录入按钮点击事件
function submitManualInput() {
    console.log('提交手动录入，当前页面:', currentPage);
    
    // 根据当前页面类型执行不同的提交逻辑
    if (currentPage === 'manual-problem') {
        submitManualProblem();
        return;
    }
    
    console.log('提交手动录入原声');
    
    // 清除所有错误提示
    clearManualInputErrors();
    
    // 获取所有必填字段
    const originalText = document.getElementById('manualOriginalText');
    const sentiment = document.getElementById('manualSentiment');
    const module = document.getElementById('manualModule');
    const summary = document.getElementById('manualSummary');
    
    let hasError = false;
    
    // 验证必填字段
    if (!originalText || !originalText.value.trim()) {
        showManualInputError('manualOriginalText', '请填写原声详情');
        originalText?.focus();
        hasError = true;
    }
    
    if (!sentiment || !sentiment.value) {
        showManualInputError('manualSentiment', '请选择情感分类');
        sentiment?.focus();
        hasError = true;
    }
    
    if (!module || !module.value) {
        showManualInputError('manualModule', '请选择所属模块');
        module?.focus();
        hasError = true;
    }
    
    if (!summary || !summary.value.trim()) {
        showManualInputError('manualSummary', '请填写原声总结');
        summary?.focus();
        hasError = true;
    }
    
    // 如果有错误，停止提交
    if (hasError) {
        return;
    }
    
    // 获取其他字段
    const translatedText = document.getElementById('manualTranslatedText');
    const analysisStatus = document.getElementById('manualAnalysisStatus');
    const keyAnalysis = document.getElementById('manualKeyAnalysis');
    
    // 映射情感分类到表格格式
    const sentimentMap = {
        '负向': { type: 'negative', label: '负向' },
        '中性': { type: 'neutral', label: '中性' },
        '正向': { type: 'positive', label: '正向' }
    };
    
    // 映射分析状态到表格格式
    const statusMap = {
        '待评估': { text: '待评估', type: 'pending' },
        '关键反馈': { text: '关键反馈', type: 'key' },
        '暂不解决': { text: '暂不解决', type: 'unresolved' }
    };
    
    const emotion = sentimentMap[sentiment.value] || { type: 'neutral', label: sentiment.value };
    const status = statusMap[analysisStatus?.value || '待评估'] || { text: '待评估', type: 'pending' };
    
    // 构建新数据项
    const newData = {
        id: Date.now().toString(), // 生成唯一ID
        summary: summary.value.trim(),
        emotion: emotion,
        module: module.value,
        issues: '--', // 关联问题默认为'--'
        status: status,
        // 保存完整数据用于详情查看
        originalText: originalText.value.trim(),
        translatedText: translatedText?.value.trim() || '',
        keyAnalysis: keyAnalysis?.value.trim() || '',
        createdAt: new Date().toISOString()
    };
    
    // 获取现有数据
    let voicePoolData = [];
    try {
        const stored = localStorage.getItem('voicePoolData');
        if (stored) {
            voicePoolData = JSON.parse(stored);
        } else {
            // 如果没有存储数据，使用初始示例数据
            voicePoolData = [
                {
                    id: '1',
                    summary: '订单分配存在延迟问题,影响配送效率',
                    emotion: { type: 'negative', level: 'strong', label: '负面·强烈' },
                    module: '订单与骑手配送',
                    issues: '--',
                    status: { text: '待评估', type: 'pending' }
                },
                {
                    id: '2',
                    summary: '用户投诉订单不完整问题频发,报告流程复杂且商店回复无效,要求简化处理流程',
                    emotion: { type: 'negative', level: 'strong', label: '负面·强烈' },
                    module: '骑手接单',
                    issues: '--',
                    status: { text: '待评估', type: 'pending' }
                },
                {
                    id: '3',
                    summary: '用户反馈搜索功能完全失效,搜索结果与查询内容完全不匹配',
                    emotion: { type: 'neutral', level: 'slight', label: '中性·轻微' },
                    module: '全局功能',
                    issues: '订单分配算法优化及分配逻辑...',
                    status: { text: '关键反馈', type: 'key' }
                }
            ];
        }
    } catch (error) {
        console.error('读取数据失败:', error);
        voicePoolData = [];
    }
    
    // 添加新数据到数组开头
    voicePoolData.unshift(newData);
    
    // 保存到localStorage
    try {
        localStorage.setItem('voicePoolData', JSON.stringify(voicePoolData));
    } catch (error) {
        console.error('保存数据失败:', error);
    }
    
    // 确保当前主页是原声池
    currentMainPage = 'voice-pool';
    
    // 更新表格显示
    renderVoicePoolTable(voicePoolData);
    
    // 更新统计数据
    updateVoicePoolStats(voicePoolData);
    
    // 显示toast提示并返回主页
    showToast('录入成功！', 'success');
    
    // 延迟返回主页，让用户看到toast
    setTimeout(() => {
        backToHome();
    }, 500);
}

// 手动录入问题 - 录入按钮点击事件
function submitManualProblem() {
    console.log('提交手动录入问题');
    
    // 清除所有错误提示
    clearManualProblemErrors();
    
    // 获取当前激活的问题类型tab
    const activeTab = document.querySelector('#manualProblemInputContainer .view-tab[data-problem-type].active');
    if (!activeTab) {
        showToast('请选择问题类型', 'error');
        return;
    }
    
    const problemType = activeTab.getAttribute('data-problem-type');
    let hasError = false;
    
    if (problemType === 'feedback') {
        // 用户反馈类的校验
        hasError = validateManualProblemFeedback();
    } else if (problemType === 'design') {
        // 设计走查类的校验
        hasError = validateManualProblemDesign();
    }
    
    // 如果有错误，停止提交
    if (hasError) {
        return;
    }
    
    // 获取数据并保存
    let problemData = {};
    
    if (problemType === 'feedback') {
        problemData = getManualProblemFeedbackData();
    } else if (problemType === 'design') {
        problemData = getManualProblemDesignData();
    }
    
    // 保存数据到localStorage
    saveProblemData(problemData);
    
    // 保存问题类型，用于返回主页时自动选中对应的tab
    const savedProblemType = problemType;
    
    // 保存选择器选项
    saveManualProblemSelectors();
    
    // 更新表格显示
    if (currentProblemViewType === 'list') {
        renderProblemPoolTable();
    } else {
        renderProblemPoolKanbanView();
    }
    updateProblemPoolStats();
    
    // 显示toast提示并返回主页
    showToast('录入成功！', 'success');
    
    // 延迟返回主页，让用户看到toast
    setTimeout(() => {
        backToHomeWithProblemType(savedProblemType);
    }, 500);
}

// 校验用户反馈类必填项
function validateManualProblemFeedback() {
    let hasError = false;
    
    // 所属地区
    const regionCheckboxes = document.querySelectorAll('#manualProblemRegion input[type="checkbox"]:checked');
    if (regionCheckboxes.length === 0) {
        showManualInputError('manualProblemRegion', '请选择所属地区');
        hasError = true;
    }
    
    // 归属终端
    const terminalCheckboxes = document.querySelectorAll('#manualProblemTerminal input[type="checkbox"]:checked');
    if (terminalCheckboxes.length === 0) {
        showManualInputError('manualProblemTerminal', '请选择归属终端');
        hasError = true;
    }
    
    // 问题标题
    const title = document.getElementById('manualProblemTitle');
    if (!title || !title.value.trim()) {
        showManualInputError('manualProblemTitle', '请填写问题标题');
        title?.focus();
        hasError = true;
    }
    
    // 问题描述
    const description = document.getElementById('manualProblemDescription');
    if (!description || !description.value.trim()) {
        showManualInputError('manualProblemDescription', '请填写问题描述');
        description?.focus();
        hasError = true;
    }
    
    return hasError;
}

// 校验设计走查类必填项
function validateManualProblemDesign() {
    let hasError = false;
    
    // 所属地区
    const regionCheckboxes = document.querySelectorAll('#manualProblemDesignRegion input[type="checkbox"]:checked');
    if (regionCheckboxes.length === 0) {
        showManualInputError('manualProblemDesignRegion', '请选择所属地区');
        hasError = true;
    }
    
    // 归属终端
    const terminalCheckboxes = document.querySelectorAll('#manualProblemDesignTerminal input[type="checkbox"]:checked');
    if (terminalCheckboxes.length === 0) {
        showManualInputError('manualProblemDesignTerminal', '请选择归属终端');
        hasError = true;
    }
    
    // 问题类型
    const problemType = document.getElementById('manualProblemDesignType');
    if (!problemType || !problemType.value) {
        showManualInputError('manualProblemDesignType', '请选择问题类型');
        problemType?.focus();
        hasError = true;
    }
    
    // 指派给
    const assignee = document.getElementById('manualProblemDesignAssignee');
    if (!assignee || !assignee.value) {
        showManualInputError('manualProblemDesignAssignee', '请选择指派给');
        assignee?.focus();
        hasError = true;
    }
    
    // 标题
    const title = document.getElementById('manualProblemDesignTitle');
    if (!title || !title.value.trim()) {
        showManualInputError('manualProblemDesignTitle', '请填写标题');
        title?.focus();
        hasError = true;
    }
    
    // 问题描述
    const description = document.getElementById('manualProblemDesignDescription');
    if (!description || !description.value.trim()) {
        showManualInputError('manualProblemDesignDescription', '请填写问题描述');
        description?.focus();
        hasError = true;
    }
    
    // 解决方案
    const solution = document.getElementById('manualProblemDesignSolution');
    if (!solution || !solution.value.trim()) {
        showManualInputError('manualProblemDesignSolution', '请填写解决方案');
        solution?.focus();
        hasError = true;
    }
    
    return hasError;
}

// 获取用户反馈类数据
function getManualProblemFeedbackData() {
    const regions = Array.from(document.querySelectorAll('#manualProblemRegion input[type="checkbox"]:checked')).map(cb => cb.value);
    const terminals = Array.from(document.querySelectorAll('#manualProblemTerminal input[type="checkbox"]:checked')).map(cb => cb.value);
    const assignee = document.getElementById('manualProblemAssignee')?.value || '';
    const resolutionStatus = document.getElementById('manualProblemResolutionStatus')?.value || '待确认';
    const title = document.getElementById('manualProblemTitle')?.value.trim() || '';
    const description = document.getElementById('manualProblemDescription')?.value.trim() || '';
    const relatedSound = document.getElementById('manualProblemRelatedSound')?.value || '';
    
    // 获取上传的文件信息
    const files = (manualProblemUploadedFiles && manualProblemUploadedFiles.feedback) ? manualProblemUploadedFiles.feedback.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
    })) : [];
    
    return {
        problemType: 'feedback',
        regions: regions,
        terminals: terminals,
        assignTo: assignee,
        resolutionStatus: resolutionStatus,
        title: title,
        description: description,
        relatedOriginalSound: relatedSound,
        files: files,
        fileObjects: (manualProblemUploadedFiles && manualProblemUploadedFiles.feedback) ? manualProblemUploadedFiles.feedback : [],
        createdAt: new Date().toISOString()
    };
}

// 获取设计走查类数据
function getManualProblemDesignData() {
    const regions = Array.from(document.querySelectorAll('#manualProblemDesignRegion input[type="checkbox"]:checked')).map(cb => cb.value);
    const terminals = Array.from(document.querySelectorAll('#manualProblemDesignTerminal input[type="checkbox"]:checked')).map(cb => cb.value);
    const problemType = document.getElementById('manualProblemDesignType')?.value || '';
    const priority = document.getElementById('manualProblemDesignPriority')?.value || '';
    const assignee = document.getElementById('manualProblemDesignAssignee')?.value || '';
    const resolutionStatus = document.getElementById('manualProblemDesignResolutionStatus')?.value || '待确认';
    const title = document.getElementById('manualProblemDesignTitle')?.value.trim() || '';
    const description = document.getElementById('manualProblemDesignDescription')?.value.trim() || '';
    const solution = document.getElementById('manualProblemDesignSolution')?.value.trim() || '';
    
    return {
        problemType: 'design',
        regions: regions,
        terminals: terminals,
        problemTypeValue: problemType,
        priority: priority,
        assignTo: assignee,
        resolutionStatus: resolutionStatus,
        title: title,
        description: description,
        solution: solution,
        files: (manualProblemUploadedFiles && manualProblemUploadedFiles.design) ? manualProblemUploadedFiles.design.map(file => ({
            name: file.name,
            type: file.type,
            size: file.size
        })) : [],
        fileObjects: (manualProblemUploadedFiles && manualProblemUploadedFiles.design) ? manualProblemUploadedFiles.design : [],
        createdAt: new Date().toISOString()
    };
}

// 保存问题数据
function saveProblemData(problemData) {
    const generatedId = Date.now().toString();
    problemData.id = generatedId;
    
    if (!Array.isArray(problemData.relatedOriginalSounds)) {
        if (problemData.relatedOriginalSound && problemData.relatedOriginalSound !== '--') {
            problemData.relatedOriginalSounds = [{
                id: problemData.relatedOriginalSoundId || null,
                summary: problemData.relatedOriginalSound
            }];
        } else {
            problemData.relatedOriginalSounds = [];
        }
    }
    
    // 获取现有数据
    let problems = [];
    try {
        const stored = localStorage.getItem('definedProblems');
        if (stored) {
            problems = JSON.parse(stored);
        }
    } catch (error) {
        console.error('读取问题数据失败:', error);
        problems = [];
    }
    
    // 添加新数据到数组开头
    problems.unshift(problemData);
    
    // 保存到localStorage
    try {
        localStorage.setItem('definedProblems', JSON.stringify(problems));
    } catch (error) {
        console.error('保存数据失败:', error);
    }
    
    return generatedId;
}

// 清除手动录入问题错误提示
function clearManualProblemErrors() {
    // 用户反馈类错误
    clearManualInputError('manualProblemRegion');
    clearManualInputError('manualProblemTerminal');
    clearManualInputError('manualProblemTitle');
    clearManualInputError('manualProblemDescription');
    
    // 设计走查类错误
    clearManualInputError('manualProblemDesignRegion');
    clearManualInputError('manualProblemDesignTerminal');
    clearManualInputError('manualProblemDesignType');
    clearManualInputError('manualProblemDesignAssignee');
    clearManualInputError('manualProblemDesignTitle');
    clearManualInputError('manualProblemDesignDescription');
    clearManualInputError('manualProblemDesignSolution');
}

// 保存手动录入问题页的选择器选项
function saveManualProblemSelectors() {
    const activeTab = document.querySelector('#manualProblemInputContainer .view-tab[data-problem-type].active');
    if (!activeTab) return;
    
    const problemType = activeTab.getAttribute('data-problem-type');
    
    if (problemType === 'feedback') {
        // 保存用户反馈类的选择器选项
        const regionCheckboxes = document.querySelectorAll('#manualProblemRegion input[type="checkbox"]:checked');
        manualProblemSelectorsCache.feedback.region = Array.from(regionCheckboxes).map(cb => cb.value);
        
        const terminalCheckboxes = document.querySelectorAll('#manualProblemTerminal input[type="checkbox"]:checked');
        manualProblemSelectorsCache.feedback.terminal = Array.from(terminalCheckboxes).map(cb => cb.value);
        
        const assignee = document.getElementById('manualProblemAssignee');
        if (assignee) manualProblemSelectorsCache.feedback.assignee = assignee.value || '';
        
        const resolutionStatus = document.getElementById('manualProblemResolutionStatus');
        if (resolutionStatus) manualProblemSelectorsCache.feedback.resolutionStatus = resolutionStatus.value || '待确认';
        
        const relatedSound = document.getElementById('manualProblemRelatedSound');
        if (relatedSound) manualProblemSelectorsCache.feedback.relatedSound = relatedSound.value || '';
        
        manualProblemSelectorsCache.activeTab = 'feedback';
    } else if (problemType === 'design') {
        // 保存设计走查类的选择器选项
        const regionCheckboxes = document.querySelectorAll('#manualProblemDesignRegion input[type="checkbox"]:checked');
        manualProblemSelectorsCache.design.region = Array.from(regionCheckboxes).map(cb => cb.value);
        
        const terminalCheckboxes = document.querySelectorAll('#manualProblemDesignTerminal input[type="checkbox"]:checked');
        manualProblemSelectorsCache.design.terminal = Array.from(terminalCheckboxes).map(cb => cb.value);
        
        const problemType = document.getElementById('manualProblemDesignType');
        if (problemType) manualProblemSelectorsCache.design.problemType = problemType.value || '';
        
        const priority = document.getElementById('manualProblemDesignPriority');
        if (priority) manualProblemSelectorsCache.design.priority = priority.value || '';
        
        const assignee = document.getElementById('manualProblemDesignAssignee');
        if (assignee) manualProblemSelectorsCache.design.assignee = assignee.value || '';
        
        const resolutionStatus = document.getElementById('manualProblemDesignResolutionStatus');
        if (resolutionStatus) manualProblemSelectorsCache.design.resolutionStatus = resolutionStatus.value || '待确认';
        
        manualProblemSelectorsCache.activeTab = 'design';
    }
}

// 恢复手动录入问题页的选择器选项
function restoreManualProblemSelectors() {
    // 先清空所有复选框
    document.querySelectorAll('#manualProblemRegion input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('#manualProblemTerminal input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('#manualProblemDesignRegion input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('#manualProblemDesignTerminal input[type="checkbox"]').forEach(cb => cb.checked = false);
    
    // 恢复用户反馈类的选择器选项
    if (manualProblemSelectorsCache.feedback.region.length > 0) {
        manualProblemSelectorsCache.feedback.region.forEach(value => {
            const checkbox = document.querySelector(`#manualProblemRegion input[type="checkbox"][value="${value}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    if (manualProblemSelectorsCache.feedback.terminal.length > 0) {
        manualProblemSelectorsCache.feedback.terminal.forEach(value => {
            const checkbox = document.querySelector(`#manualProblemTerminal input[type="checkbox"][value="${value}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    const feedbackAssignee = document.getElementById('manualProblemAssignee');
    if (feedbackAssignee && manualProblemSelectorsCache.feedback.assignee) {
        feedbackAssignee.value = manualProblemSelectorsCache.feedback.assignee;
    }
    
    const feedbackResolutionStatus = document.getElementById('manualProblemResolutionStatus');
    if (feedbackResolutionStatus && manualProblemSelectorsCache.feedback.resolutionStatus) {
        feedbackResolutionStatus.value = manualProblemSelectorsCache.feedback.resolutionStatus;
    }
    
    const feedbackRelatedSound = document.getElementById('manualProblemRelatedSound');
    if (feedbackRelatedSound && manualProblemSelectorsCache.feedback.relatedSound) {
        feedbackRelatedSound.value = manualProblemSelectorsCache.feedback.relatedSound;
    }
    
    // 恢复设计走查类的选择器选项
    if (manualProblemSelectorsCache.design.region.length > 0) {
        manualProblemSelectorsCache.design.region.forEach(value => {
            const checkbox = document.querySelector(`#manualProblemDesignRegion input[type="checkbox"][value="${value}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    if (manualProblemSelectorsCache.design.terminal.length > 0) {
        manualProblemSelectorsCache.design.terminal.forEach(value => {
            const checkbox = document.querySelector(`#manualProblemDesignTerminal input[type="checkbox"][value="${value}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    const designProblemType = document.getElementById('manualProblemDesignType');
    if (designProblemType && manualProblemSelectorsCache.design.problemType) {
        designProblemType.value = manualProblemSelectorsCache.design.problemType;
    }
    
    const designPriority = document.getElementById('manualProblemDesignPriority');
    if (designPriority && manualProblemSelectorsCache.design.priority) {
        designPriority.value = manualProblemSelectorsCache.design.priority;
    }
    
    const designAssignee = document.getElementById('manualProblemDesignAssignee');
    if (designAssignee && manualProblemSelectorsCache.design.assignee) {
        designAssignee.value = manualProblemSelectorsCache.design.assignee;
    }
    
    const designResolutionStatus = document.getElementById('manualProblemDesignResolutionStatus');
    if (designResolutionStatus && manualProblemSelectorsCache.design.resolutionStatus) {
        designResolutionStatus.value = manualProblemSelectorsCache.design.resolutionStatus;
    }
    
    // 恢复激活的tab（延迟执行，确保DOM已更新）
    if (manualProblemSelectorsCache.activeTab) {
        setTimeout(() => {
            const activeTab = document.querySelector(`#manualProblemInputContainer .view-tab[data-problem-type="${manualProblemSelectorsCache.activeTab}"]`);
            if (activeTab && !activeTab.classList.contains('active')) {
                // 触发tab切换
                activeTab.click();
            }
        }, 50);
    }
}

// 清空手动录入问题页的输入框内容（保留选择器选项）
function clearManualProblemInputs() {
    // 清空用户反馈类的输入框
    const feedbackTitle = document.getElementById('manualProblemTitle');
    const feedbackDescription = document.getElementById('manualProblemDescription');
    
    if (feedbackTitle) feedbackTitle.value = '';
    if (feedbackDescription) feedbackDescription.value = '';
    
    // 清空设计走查类的输入框
    const designTitle = document.getElementById('manualProblemDesignTitle');
    const designDescription = document.getElementById('manualProblemDesignDescription');
    const designSolution = document.getElementById('manualProblemDesignSolution');
    
    if (designTitle) designTitle.value = '';
    if (designDescription) designDescription.value = '';
    if (designSolution) designSolution.value = '';
    
    // 清空上传的文件
    const feedbackFileContainer = document.getElementById('manualProblemUploadedFilesContainer');
    const designFileContainer = document.getElementById('manualProblemDesignUploadedFilesContainer');
    
    if (feedbackFileContainer) feedbackFileContainer.innerHTML = '';
    if (designFileContainer) designFileContainer.innerHTML = '';
    
    // 恢复之前保存的选择器选项
    restoreManualProblemSelectors();
}

// 设置手动录入问题表单验证监听
function setupManualProblemValidation() {
    // 用户反馈类字段监听
    const feedbackTitle = document.getElementById('manualProblemTitle');
    const feedbackDescription = document.getElementById('manualProblemDescription');
    const feedbackRegion = document.getElementById('manualProblemRegion');
    const feedbackTerminal = document.getElementById('manualProblemTerminal');
    
    if (feedbackTitle) {
        feedbackTitle.addEventListener('input', () => clearManualInputError('manualProblemTitle'));
        feedbackTitle.addEventListener('change', () => clearManualInputError('manualProblemTitle'));
    }
    
    if (feedbackDescription) {
        feedbackDescription.addEventListener('input', () => clearManualInputError('manualProblemDescription'));
        feedbackDescription.addEventListener('change', () => clearManualInputError('manualProblemDescription'));
    }
    
    if (feedbackRegion) {
        feedbackRegion.addEventListener('change', () => clearManualInputError('manualProblemRegion'));
    }
    
    if (feedbackTerminal) {
        feedbackTerminal.addEventListener('change', () => clearManualInputError('manualProblemTerminal'));
    }
    
    // 设计走查类字段监听
    const designTitle = document.getElementById('manualProblemDesignTitle');
    const designDescription = document.getElementById('manualProblemDesignDescription');
    const designSolution = document.getElementById('manualProblemDesignSolution');
    const designType = document.getElementById('manualProblemDesignType');
    const designAssignee = document.getElementById('manualProblemDesignAssignee');
    const designRegion = document.getElementById('manualProblemDesignRegion');
    const designTerminal = document.getElementById('manualProblemDesignTerminal');
    
    if (designTitle) {
        designTitle.addEventListener('input', () => clearManualInputError('manualProblemDesignTitle'));
        designTitle.addEventListener('change', () => clearManualInputError('manualProblemDesignTitle'));
    }
    
    if (designDescription) {
        designDescription.addEventListener('input', () => clearManualInputError('manualProblemDesignDescription'));
        designDescription.addEventListener('change', () => clearManualInputError('manualProblemDesignDescription'));
    }
    
    if (designSolution) {
        designSolution.addEventListener('input', () => clearManualInputError('manualProblemDesignSolution'));
        designSolution.addEventListener('change', () => clearManualInputError('manualProblemDesignSolution'));
    }
    
    if (designType) {
        designType.addEventListener('change', () => clearManualInputError('manualProblemDesignType'));
    }
    
    if (designAssignee) {
        designAssignee.addEventListener('change', () => clearManualInputError('manualProblemDesignAssignee'));
    }
    
    if (designRegion) {
        designRegion.addEventListener('change', () => clearManualInputError('manualProblemDesignRegion'));
    }
    
    if (designTerminal) {
        designTerminal.addEventListener('change', () => clearManualInputError('manualProblemDesignTerminal'));
    }
}

// 初始化手动录入问题页选择器颜色状态
function initManualProblemSelectColors() {
    const container = document.getElementById('manualProblemInputContainer');
    if (!container) return;
    
    // 找到所有需要处理的选择器
    const selectors = [
        'manualProblemAssignee',
        'manualProblemRelatedSound',
        'manualProblemDesignType',
        'manualProblemDesignPriority',
        'manualProblemDesignAssignee'
    ];
    
    selectors.forEach(selectorId => {
        const select = document.getElementById(selectorId);
        if (select) {
            // 初始状态检查
            updateSelectColor(select);
            
            // 监听变化
            select.addEventListener('change', function() {
                updateSelectColor(this);
            });
        }
    });
}

// 更新选择器颜色
function updateSelectColor(select) {
    if (!select) return;
    
    if (select.value === '' || select.value === '请选择指派给' || select.value === '请选择关联原声' || select.value === '请选择问题类型' || select.value === '请选择优先级') {
        select.classList.add('empty-value');
    } else {
        select.classList.remove('empty-value');
    }
}

// 手动录入问题页的文件数组
let manualProblemUploadedFiles = {
    feedback: [],
    design: []
};

// 初始化手动录入问题页文件上传功能
function initManualProblemFileUpload() {
    // 用户反馈类的上传区域
    const feedbackUploadArea = document.getElementById('manualProblemFileUploadArea');
    const feedbackFileInput = document.getElementById('manualProblemFileInput');
    const feedbackContainer = document.getElementById('manualProblemUploadedFilesContainer');
    
    if (feedbackUploadArea && feedbackFileInput) {
        setupFileUpload(feedbackUploadArea, feedbackFileInput, feedbackContainer, 'feedback');
    }
    
    // 设计走查类的上传区域
    const designUploadArea = document.getElementById('manualProblemDesignFileUploadArea');
    const designFileInput = document.getElementById('manualProblemDesignFileInput');
    const designContainer = document.getElementById('manualProblemDesignUploadedFilesContainer');
    
    if (designUploadArea && designFileInput) {
        setupFileUpload(designUploadArea, designFileInput, designContainer, 'design');
    }
}

// 设置文件上传事件监听器
function setupFileUpload(uploadArea, fileInput, container, type) {
    if (!uploadArea || !fileInput) return;
    
    // 点击上传区域
    uploadArea.addEventListener('click', (e) => {
        if (!e.target.closest('.uploaded-image-item') && !e.target.closest('.remove-image-btn')) {
            uploadArea.focus();
            fileInput.click();
        }
    });
    
    // 文件选择
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        processManualProblemFiles(files, container, type);
        fileInput.value = '';
    });
    
    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        processManualProblemFiles(files, container, type);
    });
    
    // 粘贴上传
    uploadArea.addEventListener('paste', (e) => {
        const items = e.clipboardData.items;
        const files = [];
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();
                if (file) {
                    files.push(file);
                }
            }
        }
        
        if (files.length > 0) {
            e.preventDefault();
            processManualProblemFiles(files, container, type);
        }
    });
}

// 处理手动录入问题页的文件
function processManualProblemFiles(files, container, type) {
    files.forEach((file) => {
        if (validateFile(file)) {
            if (!manualProblemUploadedFiles[type]) {
                manualProblemUploadedFiles[type] = [];
            }
            manualProblemUploadedFiles[type].push(file);
            displayManualProblemFile(file, container, type);
        }
    });
}

// 显示手动录入问题页的文件
function displayManualProblemFile(file, container, type) {
    if (!container) return;
    
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-item-container';
            imageContainer.dataset.fileName = file.name;
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = file.name;
            img.className = 'uploaded-image';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'image-delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.onclick = function() {
                removeManualProblemFile(file.name, container, type);
            };
            
            imageContainer.appendChild(img);
            imageContainer.appendChild(deleteBtn);
            
            container.appendChild(imageContainer);
            
            // 显示容器
            container.style.display = 'flex';
        };
        reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
        // 视频文件显示文件名
        const fileItem = document.createElement('div');
        fileItem.className = 'image-item-container';
        fileItem.dataset.fileName = file.name;
        fileItem.style.cssText = 'padding: 8px; background: #f5f5f5; border-radius: 8px; display: flex; align-items: center; justify-content: space-between;';
        fileItem.innerHTML = `
            <span style="font-size: 12px; color: #333;">${file.name}</span>
            <button class="image-delete-btn" style="position: static; margin-left: 8px;" onclick="removeManualProblemFile('${file.name}', this.closest('.uploaded-images-container'), '${type}')">×</button>
        `;
        container.appendChild(fileItem);
        
        // 显示容器
        container.style.display = 'flex';
    }
}

// 删除手动录入问题页的文件
function removeManualProblemFile(fileName, container, type) {
    // 从数组中移除
    if (manualProblemUploadedFiles[type]) {
        manualProblemUploadedFiles[type] = manualProblemUploadedFiles[type].filter(file => file.name !== fileName);
    }
    
    // 从DOM中移除
    if (container) {
        const fileItem = container.querySelector(`[data-file-name="${fileName}"]`);
        if (fileItem) {
            fileItem.remove();
        }
    }
    
    showNotification('文件已删除', 'success');
}

// 更新用户原声池统计数据
function updateVoicePoolStats(data) {
    const total = data.length;
    const pending = data.filter(item => item.status.type === 'pending').length;
    const key = data.filter(item => item.status.type === 'key').length;
    const problem = data.filter(item => item.issues && item.issues !== '--').length;
    
    const totalEl = document.getElementById('voice-pool-total');
    const pendingEl = document.getElementById('voice-pool-pending');
    const keyEl = document.getElementById('voice-pool-key');
    const problemEl = document.getElementById('voice-pool-problem');
    
    if (totalEl) totalEl.textContent = total;
    if (pendingEl) pendingEl.textContent = pending;
    if (keyEl) keyEl.textContent = key;
    if (problemEl) problemEl.textContent = problem;
}

// 返回主页
function backToHome() {
    console.log('backToHome 被调用');
    
    try {
        // 保存当前状态
        if (currentPage === 'ai-voice' || currentPage === 'ai-problem' || currentPage === 'manual-voice' || currentPage === 'manual-problem') {
            TemplateStateManager.saveCurrentState();
            
            // 如果是AI录入原声页面，保存当前选择的输入类型tab
            if (currentPage === 'ai-voice') {
                saveCurrentInputTypeTab();
            }
            
            // 如果是AI录入走查问题页面，保存当前选择的所属地区和归属模块
            if (currentPage === 'ai-problem') {
                const systemTypes = Array.from(document.querySelectorAll('input[name="systemType"]:checked')).map(cb => cb.value);
                const modules = Array.from(document.querySelectorAll('input[name="module"]:checked')).map(cb => cb.value);
                
                try {
                    localStorage.setItem('aiProblemLastSystemTypes', JSON.stringify(systemTypes));
                    localStorage.setItem('aiProblemLastModules', JSON.stringify(modules));
                    console.log('保存所属地区和归属模块选择:', { systemTypes, modules });
                } catch (error) {
                    console.error('保存所属地区和归属模块选择失败:', error);
                }
            }
        }
        
        // 隐藏工作页面
        const workPageContainer = document.getElementById('work-page-container');
        if (workPageContainer) {
            workPageContainer.style.display = 'none';
        }
        
        // 恢复显示输入区和预览区，隐藏手动录入容器
        const inputSection = document.querySelector('.input-section');
        const previewSection = document.querySelector('.preview-section');
        const manualInputContainer = document.getElementById('manualInputContainer');
        const manualProblemInputContainer = document.getElementById('manualProblemInputContainer');
        
        if (inputSection) inputSection.style.display = 'block';
        if (previewSection) previewSection.style.display = 'block';
        if (manualInputContainer) manualInputContainer.style.display = 'none';
        if (manualProblemInputContainer) manualProblemInputContainer.style.display = 'none';
        
        // 显示tab切换，隐藏工作页面导航
        const navTabs = document.getElementById('navTabs');
        const navWorkHeader = document.getElementById('navWorkHeader');
        if (navTabs) navTabs.style.display = 'flex';
        if (navWorkHeader) navWorkHeader.style.display = 'none';
        
        // 恢复显示logo
        const navBrand = document.querySelector('.nav-brand');
        if (navBrand) navBrand.style.display = 'flex';
        
        // 在主页时隐藏历史记录按钮和手动录入按钮组，显示搜索和通知按钮
        const searchBtn = document.getElementById('searchBtn');
        const notificationBtn = document.getElementById('notificationBtn');
        const historyBtn = document.getElementById('historyBtn');
        const manualInputBtnGroup = document.getElementById('manualInputBtnGroup');
        if (searchBtn) searchBtn.style.display = 'flex';
        if (notificationBtn) notificationBtn.style.display = 'flex';
        if (historyBtn) historyBtn.style.display = 'none';
        if (manualInputBtnGroup) manualInputBtnGroup.style.display = 'none';
        
        // 显示对应的主页
        const homePage = document.getElementById(`${currentMainPage}-home`);
        if (homePage) {
            homePage.style.display = 'flex';
            currentPage = currentMainPage;
            
            // 如果返回到用户原声池主页，重新应用筛选
            if (currentMainPage === 'voice-pool') {
                let allData = [];
                try {
                    const stored = localStorage.getItem('voicePoolData');
                    if (stored) {
                        allData = JSON.parse(stored);
                    }
                } catch (error) {
                    console.error('读取数据失败:', error);
                    allData = [];
                }
                applyVoicePoolFilter(currentVoicePoolFilter, allData);
            }
        }
        
        console.log('已返回主页:', currentMainPage);
    } catch (error) {
        console.error('backToHome 错误:', error);
    }
}

// 返回主页并自动选中问题类型tab
function backToHomeWithProblemType(problemType) {
    console.log('backToHomeWithProblemType 被调用，问题类型:', problemType);
    
    // 先调用backToHome返回主页
    backToHome();
    
    // 如果当前主页是问题跟进池，且有问题类型参数，则自动选中对应的tab
    if (currentMainPage === 'problem-pool' && problemType) {
        // 延迟执行，确保页面已切换完成
        setTimeout(() => {
            // 更新问题类型状态
            currentProblemType = problemType;
            
            // 更新tab的激活状态
            const problemTypeTabs = document.querySelectorAll('#problem-pool-home .view-tab[data-problem-type]');
            problemTypeTabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.getAttribute('data-problem-type') === problemType) {
                    tab.classList.add('active');
                }
            });
            
            // 重新渲染表格和统计数据
            if (currentProblemViewType === 'list') {
                renderProblemPoolTable();
            } else {
                renderProblemPoolKanbanView();
            }
            updateProblemPoolStats();
        }, 100);
    }
}

// 简化的Tab切换函数 - 全局函数（用于工作页面内的模板切换）
function switchTab(templateType) {
    console.log('switchTab 被调用，模板类型:', templateType);
    
    try {
        // 保存当前模板状态
        TemplateStateManager.saveCurrentState();
        
        // 移除所有tab的active状态（如果存在旧的tab）
        document.querySelectorAll('.nav-tab[data-template]').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // 根据模板类型更新界面内容
        updateTemplateContent(templateType);
        
        // 如果是用户原声清洗模板，确保输入类型标签被激活
        if (templateType === 'feedback') {
            // 移除所有输入类型标签的active状态
            document.querySelectorAll('.input-type-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // 激活默认的文本输入类型标签
            const textInputTab = document.querySelector('.input-type-tab[data-type="text"]');
            if (textInputTab) {
                textInputTab.classList.add('active');
                console.log('激活文本输入类型标签');
            }
        }
        
        // 隐藏预览操作按钮（切换模板时隐藏）
        hidePreviewActions();
        
        // 恢复目标模板的状态
        if (templateType === 'design') {
            TemplateStateManager.restoreState('design');
        } else if (templateType === 'feedback') {
            // 用户原声清洗模板需要确定输入类型
            const inputType = getCurrentInputType();
            TemplateStateManager.restoreState('feedback', inputType);
        }
        
        // 显示切换提示
        const templateName = templateType === 'design' ? 'AI录入走查问题' : 'AI录入原声';
        console.log('已切换到:', templateName);
    } catch (error) {
        console.error('switchTab 错误:', error);
    }
}

// 更新模板内容 - 全局函数
function updateTemplateContent(templateType) {
    console.log('更新模板内容:', templateType);
    
    if (templateType === 'design') {
        // 显示设计体验问题模板
        console.log('切换到设计体验问题模板');
        
        // 隐藏用户原声清洗模板相关元素
        const originalSoundElements = [
            'originalSoundInputGroup',
            'originalSoundConvertBtn'
        ];
        
        originalSoundElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
                console.log('隐藏元素:', id);
            }
        });
        
        // 显示所有input-card元素
        const inputCards = document.querySelectorAll('.input-card');
        inputCards.forEach(card => {
            // 移除内联样式，让CSS的display: flex生效
            card.style.display = '';
            console.log('显示input-card元素');
        });
        
        // 显示设计体验问题模板相关元素
        const designElements = [
            'designInputGroup',
            'designFileUploadGroup',
            'designSystemTypeGroup',
            'designModuleGroup',
            'convertBtn'
        ];
        
        designElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                // 移除内联样式，让CSS的display: flex生效
                element.style.display = '';
                console.log('显示元素:', id);
            }
        });
        
        // 清空预览区域
        const previewContent = document.getElementById('previewContent');
        if (previewContent) {
            previewContent.innerHTML = `
                <div class="preview-empty-state" id="previewEmptyState">
                    <img src="image/预览空占位.png" alt="预览空状态" class="empty-state-image" />
                    <p class="empty-state-text">转化好的内容将会按照标准化的模板在此处展示</p>
                </div>
            `;
            // 清空预览区域时隐藏所有按钮
            hidePreviewActions();
        }
        
    } else if (templateType === 'feedback') {
        // 显示用户原声清洗模板
        console.log('切换到用户原声清洗模板');
        
        // 隐藏设计体验问题模板相关元素
        const designElements = [
            'designInputGroup',
            'designFileUploadGroup',
            'designSystemTypeGroup',
            'designModuleGroup',
            'convertBtn'
        ];
        
        designElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
                console.log('隐藏元素:', id);
            }
        });
        
        // 隐藏所有input-card元素，但保留用户原声卡片的控制权给switchInputType函数
        const inputCards = document.querySelectorAll('.input-card');
        inputCards.forEach(card => {
            // 跳过用户原声卡片，让switchInputType函数来控制它的显示
            if (card.id !== 'userOriginalSoundCard') {
                card.style.display = 'none';
                console.log('隐藏input-card元素:', card.id);
            }
        });
        
        // 确保用户原声卡片默认显示（文本输入类型）
        const userOriginalSoundCard = document.getElementById('userOriginalSoundCard');
        if (userOriginalSoundCard) {
            userOriginalSoundCard.style.display = '';
            userOriginalSoundCard.style.visibility = 'visible';
            userOriginalSoundCard.style.opacity = '1';
            console.log('确保用户原声卡片默认显示');
        }
        
        // 显示用户原声清洗模板相关元素
        const originalSoundElements = [
            'originalSoundInputGroup',
            'originalSoundConvertBtn'
        ];
        
        originalSoundElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                // 移除内联样式，让CSS的display: flex生效
                element.style.display = '';
                console.log('显示元素:', id, '元素存在:', !!element);
            } else {
                console.log('元素不存在:', id);
            }
        });
        
        // 清空预览区域
        const previewContent = document.getElementById('previewContent');
        if (previewContent) {
            previewContent.innerHTML = `
                <div class="preview-empty-state" id="previewEmptyState">
                    <img src="image/预览空占位.png" alt="预览空状态" class="empty-state-image" />
                    <p class="empty-state-text">转化好的内容将会按照标准化的模板在此处展示</p>
                </div>
            `;
            // 清空预览区域时隐藏所有按钮
            hidePreviewActions();
        }
        
        // 初始化用户原声清洗模板并设置正确的输入类型
        if (typeof OriginalSoundTemplate !== 'undefined') {
            if (!OriginalSoundTemplate.initialized) {
                OriginalSoundTemplate.init();
            }
            // 智能选择应激活的输入类型：优先激活当前激活标签；
            // 若当前没有有效预览，则优先展示已有预览内容的类型（excel优先于text），否则回退到text
            let targetType = (typeof getCurrentInputType === 'function') ? getCurrentInputType() : 'text';
            const pc = OriginalSoundTemplate.previewContent || {};
            const hasValid = (html) => !!(html && typeof html === 'string' && html.trim() !== '' && !html.includes('转化后的标准化内容将在此处显示'));
            if (!hasValid(OriginalSoundTemplate.previewContent && OriginalSoundTemplate.previewContent[targetType])) {
                if (hasValid(pc.excel)) {
                    targetType = 'excel';
                } else if (hasValid(pc.text)) {
                    targetType = 'text';
                } else {
                    targetType = 'text';
                }
            }
            OriginalSoundTemplate.switchInputType(targetType);
        }
    }
}

// 智能分析引擎
const SmartAnalysisEngine = {
    // 学习缓存
    learningCache: {
        userPreferences: {},
        commonPatterns: {},
        successRates: {}
    },

    // 初始化学习缓存
    initLearningCache() {
        const cached = localStorage.getItem('smartAnalysis_learningCache');
        if (cached) {
            try {
                this.learningCache = { ...this.learningCache, ...JSON.parse(cached) };
            } catch (error) {
                console.warn('Failed to load learning cache:', error);
            }
        }
    },

    // 保存学习缓存
    saveLearningCache() {
        try {
            localStorage.setItem('smartAnalysis_learningCache', JSON.stringify(this.learningCache));
        } catch (error) {
            console.warn('Failed to save learning cache:', error);
        }
    },

    // 记录用户原声
    recordUserFeedback(analysis, userAction) {
        const feedback = {
            timestamp: new Date().toISOString(),
            analysis: {
                predictedType: analysis.predictedType,
                priority: analysis.priority,
                confidence: analysis.analysisConfidence
            },
            userAction: userAction, // 'accepted', 'modified', 'rejected'
            success: userAction === 'accepted'
        };

        // 更新成功率统计
        const key = `${analysis.predictedType}_${analysis.priority}`;
        if (!this.learningCache.successRates[key]) {
            this.learningCache.successRates[key] = { total: 0, success: 0 };
        }
        
        this.learningCache.successRates[key].total++;
        if (feedback.success) {
            this.learningCache.successRates[key].success++;
        }

        // 保存缓存
        this.saveLearningCache();
    },

    // 获取成功率
    getSuccessRate(problemType, priority) {
        const key = `${problemType}_${priority}`;
        const stats = this.learningCache.successRates[key];
        if (!stats || stats.total === 0) return 0.5; // 默认50%
        return stats.success / stats.total;
    },
    // 问题类型预测模型（根据设计体验问题模板）
    problemTypePatterns: {
        '设计需求优化': [
            '设计', '界面', '布局', '美观', '颜色', '样式', '外观', '视觉', 'UI', 'UX',
            '按钮', '图标', '字体', '间距', '配色', '风格', '主题', '品牌'
        ],
        '交互功能bug': [
            '交互', '操作', '点击', '按钮', '功能', '无法', '不能', '错误', '异常', 'bug',
            '失效', '不工作', '故障', '报错', '崩溃', '闪退', '白屏', '显示', '数据', '保存', '提交'
        ],
        '视觉还原度bug': [
            '还原', '实现', '不一致', '偏差', '效果', '显示', '渲染', '像素', '对齐',
            '尺寸', '位置', '比例', '清晰度', '分辨率',
            // 颜色/品牌色相关关键词（增强视觉类判断）
            '颜色', '色值', '配色', '品牌色', '主色', '辅色', '高亮色',
            '黄色', '橙色', '橘色', '蓝色', '绿色', '红色',
            // 字体/字号/像素等
            '字体', '字号', '字重', '粗细', 'px', '像素', '大小', 'line-height', 'letter-spacing', '行高', '字间距', '间距',
            // 英文/混写常见词
            'button', 'btn', 'icon color', 'text color', 'background color'
        ],
        '历史遗留': [
            '历史', '遗留', '老', '旧', '一直', '长期', '存在', '之前', '以前', '早就',
            '很久', '持续', '反复', '多次'
        ]
    },

    // 优先级分析规则（根据设计体验问题模板）
    priorityRules: {
        'P0-紧急': [
            '崩溃', '闪退', '无法登录', '数据丢失', '安全漏洞', '支付', '交易',
            '核心功能', '主要流程', '影响所有用户', '快点', '尽快', '紧急', '严重'
        ],
        'P1-高': [
            '功能', '异常', '错误', 'bug', '失效', '不工作', '故障', '卡顿', '加载慢'
        ],
        'P2-中': [
            '界面问题', '操作不便', '功能异常', '显示错误', '部分用户', '非核心功能'
        ],
        'P3-低': [
            '界面优化', '体验改进', '细节调整', '建议', '优化建议', '小问题'
        ]
    },

    // 解决方案模板库（根据设计体验问题模板）
    solutionTemplates: {
        '设计需求优化': [
            '优化用户界面设计，提升视觉效果和用户体验',
            '改进交互设计，简化操作流程',
            '统一设计规范，保持界面风格一致性',
            '调整视觉元素，提升界面美观度'
        ],
        '交互功能bug': [
            '修复交互逻辑错误，确保功能正常运行',
            '完善异常处理机制，提升系统稳定性',
            '优化数据处理流程，确保数据准确性',
            '增强功能容错性，提升用户体验'
        ],
        '视觉还原度bug': [
            '调整视觉实现，确保与设计稿一致',
            '优化渲染效果，提升视觉质量',
            '建立设计还原度检查机制',
            '完善像素级对齐和尺寸控制'
        ],
        '历史遗留': [
            '制定历史问题处理计划，逐步优化',
            '重构相关模块，提升代码质量',
            '建立问题跟踪机制，避免问题积累',
            '系统性解决长期存在的设计问题'
        ]
    },

    // 影响分析模板（精简版）
    impactAnalysis: {
        'P0-紧急': '严重影响用户体验',
        'P1-高': '影响主要业务流程',
        'P2-中': '影响部分用户体验',
        'P3-低': '轻微影响用户体验'
    },

    // 智能分析主函数
    async analyzeProblem(description, systemTypes, modules) {
        console.log('开始智能分析...');
        
        // 1. 问题类型预测
        const predictedType = this.predictProblemType(description);
        
        // 2. 优先级分析
        const priority = this.analyzePriority(description, predictedType);
        
        // 3. 解决方案推荐
        const recommendedSolutions = this.recommendSolutions(predictedType, description);
        
        // 4. 影响分析
        const impact = this.analyzeImpact(priority, description);
        
        // 5. 预估时间
        const estimatedTime = this.estimateTime(priority, predictedType);
        
        // 6. 相关模块分析
        const relatedModules = this.analyzeRelatedModules(description, modules);
        
        // 7. 历史相似问题分析
        const similarIssues = this.findSimilarIssues(description);
        
        // 8. 智能推荐处理方式
        const processingMethod = this.recommendProcessingMethod(description, predictedType, priority);
        
        // 9. 计算最终置信度
        const analysisConfidence = this.calculateConfidence(description, predictedType, priority);
        
        return {
            predictedType,
            priority,
            recommendedSolutions,
            impact,
            estimatedTime,
            relatedModules,
            similarIssues,
            processingMethod,
            analysisConfidence
        };
    },

    // 问题类型预测
    predictProblemType(description) {
        const text = description.toLowerCase();
        // 强优先规则：视觉/颜色措辞直接判为视觉还原度bug
        const strongVisualPatterns = [
            '颜色', '色值', '配色', '品牌色', '主色', '辅色', '高亮色',
            '黄色', '橙色', '橘色', '蓝色', '绿色', '红色',
            '对齐', '不一致', '还原', '还原度', '视觉', '像素', '间距', '阴影', '圆角',
            '字体', '字号', '字重', '粗细', 'px', '大小', '行高', '字间距', 'letter-spacing', 'line-height',
            'button 颜色', 'btn 颜色', 'icon 颜色', 'text color', 'background color', '浅', '深',
            '样式', '文案', '展示', '不全', '截断', '溢出', '布局', '排版', '边距',
            '选中', '状态', 'hover', 'active', 'focus', '外观', '界面', 'UI', '设计稿',
            '透明度', '渐变', '图标', '图片', '图片显示'
        ];
        if (strongVisualPatterns.some(k => text.includes(k))) {
            return '视觉还原度bug';
        }

        let maxScore = 0;
        let predictedType = '设计需求优化';
        for (const [type, patterns] of Object.entries(this.problemTypePatterns)) {
            let score = 0;
            patterns.forEach(pattern => {
                if (text.includes(pattern)) {
                    score += 1;
                }
            });
            if (score > maxScore) {
                maxScore = score;
                predictedType = type;
            }
        }
        return predictedType;
    },

    // 优先级分析
    analyzePriority(description, problemType) {
        const text = description.toLowerCase();
        
        for (const [priority, keywords] of Object.entries(this.priorityRules)) {
            for (const keyword of keywords) {
                if (text.includes(keyword)) {
                    return priority;
                }
            }
        }
        
        // 根据问题类型默认优先级（根据设计体验问题模板）
        const defaultPriority = {
            '交互功能bug': 'P1-高',
            '视觉还原度bug': 'P2-中',
            '设计需求优化': 'P2-中',
            '历史遗留': 'P3-低'
        };
        
        return defaultPriority[problemType] || 'P2-中';
    },

    // 解决方案推荐 - 增强个性化分析
    recommendSolutions(problemType, description) {
        const text = description.toLowerCase();
        
        // 基于具体问题场景生成针对性解决方案
        const personalizedSolutions = this.generatePersonalizedSolutions(description, problemType);
        if (personalizedSolutions.length > 0) {
            return personalizedSolutions;
        }
        
        // 降级到模板匹配
        const templates = this.solutionTemplates[problemType] || this.solutionTemplates['设计需求优化'];
        const relevantSolutions = templates.filter(solution => {
            const solutionKeywords = solution.split('，')[0].toLowerCase();
            return text.includes(solutionKeywords.split(' ')[0]) || Math.random() > 0.5;
        });
        
        return relevantSolutions.length > 0 ? relevantSolutions : templates.slice(0, 2);
    },

    // 生成个性化解决方案
    generatePersonalizedSolutions(description, problemType) {
        const text = description.toLowerCase();
        const solutions = [];
        
        // 针对具体问题场景的解决方案
        if (text.includes('导航') && text.includes('菜单')) {
            if (text.includes('样式') || text.includes('选中')) {
                solutions.push('优化导航菜单选中状态样式，确保视觉层次清晰，提升用户识别度');
                solutions.push('调整导航文案长度限制，避免文案截断问题，保证信息完整性');
            }
        }
        
        if (text.includes('字体') || text.includes('字号')) {
            solutions.push('根据设计规范调整字体大小和字重，确保文字清晰可读');
            solutions.push('优化文字排版和行高，提升阅读体验和视觉舒适度');
        }
        
        if (text.includes('颜色') || text.includes('色值')) {
            solutions.push('按设计稿规范调整颜色值，确保品牌色彩一致性');
            solutions.push('优化颜色对比度，提升可访问性和视觉层次');
        }
        
        if (text.includes('按钮') || text.includes('点击')) {
            solutions.push('检查并修复按钮点击事件绑定与触发逻辑，避免事件被遮挡或冒泡阻断');
            solutions.push('为关键操作提供交互反馈（禁用按钮/Loading/Toast），并添加异常兜底与重试');
        }
        
        if (text.includes('加载') || text.includes('慢')) {
            solutions.push('优化页面加载性能，减少用户等待时间');
            solutions.push('添加加载状态提示，改善用户等待体验');
        }
        
        if (text.includes('弹窗') || text.includes('对话框')) {
            solutions.push('优化弹窗交互逻辑，确保操作流程顺畅');
            solutions.push('调整弹窗尺寸和位置，避免遮挡重要信息');
        }
        
        // 根据问题类型补充通用解决方案
        if (solutions.length === 0) {
            const typeSpecificSolutions = {
                '视觉还原度bug': [
                    '按设计稿规范进行视觉还原，确保实现效果与设计一致',
                    '建立设计走查机制，及时发现和修复视觉偏差'
                ],
                '交互功能bug': [
                    '修复交互逻辑错误，确保功能正常运行',
                    '优化操作流程，提升用户操作效率'
                ],
                '设计需求优化': [
                    '基于用户原声优化设计方案，提升用户体验',
                    '建立用户原声收集机制，持续改进产品设计'
                ]
            };
            
            solutions.push(...(typeSpecificSolutions[problemType] || []));
        }
        
        return solutions.slice(0, 3); // 最多返回3个解决方案
    },

    // 影响分析 - 精简版
    analyzeImpact(priority, description) {
        const baseImpact = this.impactAnalysis[priority];
        const text = description.toLowerCase();
        
        // 简化的场景识别
        if (text.includes('导航') || text.includes('菜单')) {
            return '影响导航体验';
        } else if (text.includes('字体') || text.includes('字号')) {
            return '影响文字可读性';
        } else if (text.includes('按钮') || text.includes('点击')) {
            return '影响操作体验';
        } else if (text.includes('加载') || text.includes('慢')) {
            return '影响响应速度';
        } else if (text.includes('样式') || text.includes('外观')) {
            return '影响视觉效果';
        }
        
        return baseImpact;
    },

    // 预估时间（根据设计体验问题模板）
    estimateTime(priority, problemType) {
        const timeMap = {
            'P0-紧急': {
                '交互功能bug': '1-2个工作日',
                '视觉还原度bug': '1-2个工作日',
                '设计需求优化': '1-2个工作日',
                '历史遗留': '2-3个工作日'
            },
            'P1-高': {
                '交互功能bug': '2-3个工作日',
                '视觉还原度bug': '2-3个工作日',
                '设计需求优化': '2-3个工作日',
                '历史遗留': '3-5个工作日'
            },
            'P2-中': {
                '交互功能bug': '3-5个工作日',
                '视觉还原度bug': '3-5个工作日',
                '设计需求优化': '3-5个工作日',
                '历史遗留': '5-7个工作日'
            },
            'P3-低': {
                '交互功能bug': '5-7个工作日',
                '视觉还原度bug': '5-7个工作日',
                '设计需求优化': '5-7个工作日',
                '历史遗留': '7-10个工作日'
            }
        };
        
        return timeMap[priority]?.[problemType] || '3-5个工作日';
    },

    // 相关模块分析
    analyzeRelatedModules(description, selectedModules) {
        const text = description.toLowerCase();
        const moduleKeywords = {
            '管理端': ['管理', '后台', 'admin', '配置', '设置'],
            '门店端': ['门店', '收银', 'pos', '销售', '库存'],
            '移动端': ['手机', 'app', '移动', '客户端', '扫码']
        };
        
        const relatedModules = [...selectedModules];
        
        // 根据描述内容推荐相关模块
        for (const [module, keywords] of Object.entries(moduleKeywords)) {
            if (!relatedModules.includes(module)) {
                for (const keyword of keywords) {
                    if (text.includes(keyword)) {
                        relatedModules.push(module);
                        break;
                    }
                }
            }
        }
        
        return relatedModules;
    },

    // 查找相似问题
    findSimilarIssues(description) {
        const history = JSON.parse(localStorage.getItem('feedbackBridge_history') || '[]');
        const text = description.toLowerCase();
        
        // 使用更精准的相似度算法
        const similarIssues = history.map(issue => {
            const issueText = issue.description?.toLowerCase() || '';
            const similarity = this.calculateSimilarity(text, issueText);
            return { ...issue, similarity };
        })
        .filter(issue => issue.similarity > 0.3) // 相似度阈值
        .sort((a, b) => b.similarity - a.similarity) // 按相似度排序
        .slice(0, 3);
        
        return similarIssues.map(issue => ({
            title: issue.standardFormat?.title || '历史问题',
            description: issue.description?.substring(0, 100) + '...',
            solution: issue.standardFormat?.expectedResult || '已解决',
            similarity: Math.round(issue.similarity * 100) + '%'
        }));
    },

    // 计算文本相似度
    calculateSimilarity(text1, text2) {
        if (!text1 || !text2) return 0;
        
        // 分词
        const words1 = this.tokenize(text1);
        const words2 = this.tokenize(text2);
        
        // 计算Jaccard相似度
        const set1 = new Set(words1);
        const set2 = new Set(words2);
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return intersection.size / union.size;
    },

    // 文本分词
    tokenize(text) {
        // 简单的中文分词，基于常见词汇
        const commonWords = [
            '登录', '支付', '订单', '商品', '用户', '界面', '操作', '功能',
            '性能', '速度', '安全', '数据', '文件', '上传', '下载', '卡顿',
            '慢', '加载', '响应', '错误', '异常', 'bug', '故障', '崩溃',
            '闪退', '白屏', '显示', '保存', '提交', '管理', '后台', '配置',
            '设置', '门店', '收银', 'pos', '销售', '库存', '手机', 'app',
            '移动', '客户端', '扫码', '权限', '密码', '验证', '加密', '泄露'
        ];
        
        const words = [];
        
        // 提取常见词汇
        commonWords.forEach(word => {
            if (text.includes(word)) {
                words.push(word);
            }
        });
        
        // 提取其他有意义的词汇（长度大于1的连续字符）
        const otherWords = text.match(/[\u4e00-\u9fa5]{2,}/g) || [];
        words.push(...otherWords);
        
        return words;
    },

    // 智能推荐处理方式
    recommendProcessingMethod(description, problemType, priority) {
        const text = description.toLowerCase();
        
        // 根据问题类型和优先级推荐处理方式（根据设计体验问题模板）
        const recommendations = {
            'P0-紧急': {
                '交互功能bug': {
                    method: '体验优化',
                    assignee: '开发团队',
                    timeline: '1-2个工作日',
                    escalation: '需要立即上报'
                },
                '视觉还原度bug': {
                    method: '体验优化',
                    assignee: '开发团队',
                    timeline: '1-2个工作日',
                    escalation: '优先处理'
                },
                '设计需求优化': {
                    method: '需求优化',
                    assignee: '产品团队',
                    timeline: '1-2个工作日',
                    escalation: '快速响应'
                },
                '历史遗留': {
                    method: '体验优化',
                    assignee: '产品团队',
                    timeline: '2-3个工作日',
                    escalation: '监控处理'
                }
            },
            'P1-高': {
                '交互功能bug': {
                    method: '体验优化',
                    assignee: '开发团队',
                    timeline: '2-3个工作日',
                    escalation: '正常处理'
                },
                '视觉还原度bug': {
                    method: '体验优化',
                    assignee: '开发团队',
                    timeline: '2-3个工作日',
                    escalation: '按计划处理'
                },
                '设计需求优化': {
                    method: '需求优化',
                    assignee: '产品团队',
                    timeline: '2-3个工作日',
                    escalation: '计划处理'
                },
                '历史遗留': {
                    method: '体验优化',
                    assignee: '产品团队',
                    timeline: '3-5个工作日',
                    escalation: '优化处理'
                }
            },
            'P2-中': {
                '交互功能bug': {
                    method: '体验优化',
                    assignee: '开发团队',
                    timeline: '3-5个工作日',
                    escalation: '下个版本'
                },
                '视觉还原度bug': {
                    method: '体验优化',
                    assignee: '开发团队',
                    timeline: '3-5个工作日',
                    escalation: '下个版本'
                },
                '设计需求优化': {
                    method: '需求优化',
                    assignee: '产品团队',
                    timeline: '3-5个工作日',
                    escalation: '下个版本'
                },
                '历史遗留': {
                    method: '体验优化',
                    assignee: '产品团队',
                    timeline: '5-7个工作日',
                    escalation: '下个版本'
                }
            },
            'P3-低': {
                '交互功能bug': {
                    method: '体验优化',
                    assignee: '开发团队',
                    timeline: '5-7个工作日',
                    escalation: '下个版本'
                },
                '视觉还原度bug': {
                    method: '体验优化',
                    assignee: '开发团队',
                    timeline: '5-7个工作日',
                    escalation: '下个版本'
                },
                '设计需求优化': {
                    method: '需求优化',
                    assignee: '产品团队',
                    timeline: '5-7个工作日',
                    escalation: '下个版本'
                },
                '历史遗留': {
                    method: '体验优化',
                    assignee: '产品团队',
                    timeline: '7-10个工作日',
                    escalation: '下个版本'
                }
            }
        };
        
        return recommendations[priority]?.[problemType] || recommendations['P2-中']['设计需求优化'];
    },

    // 计算分析置信度
    calculateConfidence(description, predictedType, priority) {
        const text = description.toLowerCase();
        let confidence = 0.5; // 基础置信度
        
        // 根据描述长度调整置信度
        if (description.length > 50) confidence += 0.1;
        if (description.length > 100) confidence += 0.1;
        
        // 根据关键词匹配调整置信度
        const allKeywords = Object.values(this.problemTypePatterns).flat();
        const matchedKeywords = allKeywords.filter(keyword => text.includes(keyword));
        confidence += matchedKeywords.length * 0.05;
        
        // 根据历史成功率调整置信度
        const successRate = this.getSuccessRate(predictedType, priority);
        confidence = (confidence + successRate) / 2;
        
        return Math.min(confidence, 0.95);
    }
};

// DOM 元素
const elements = {
    issueDescription: document.getElementById('issueDescription'),
    fileUploadArea: document.getElementById('fileUploadArea'),
    fileInput: document.getElementById('fileInput'),
    // 对应右侧已上传图片容器，真实ID为 uploadedImagesContainer
    uploadedFiles: document.getElementById('uploadedImagesContainer'),
    systemTypeSelect: document.getElementById('systemTypeSelect'),
    moduleSelect: document.getElementById('moduleSelect'),
    convertBtn: document.getElementById('convertBtn'),
    previewContent: document.getElementById('previewContent'),
    previewActions: document.getElementById('previewActions'),
    loadingModal: document.getElementById('loadingModal'),
    historyBtn: document.getElementById('historyBtn'),
    draftsBtn: document.getElementById('draftsBtn'),
    newSessionBtn: document.getElementById('newSessionBtn'),
    newOriginalSoundSessionBtn: document.getElementById('newOriginalSoundSessionBtn'),
    inputSection: document.querySelector('.input-section'),
};

const ORIGINAL_SOUND_QUICK_TRY_TEXT = 'Deberian de hacer  algo para  garantizar  los tiempos de entrega  prometidos y que estos no cambien conforme salen otros pedidos, aveces las personas tienen tiempos contados devido a sus labores y el que cambien a  su voluntad , ocaciona  que no puedan disfrutar sus alimentos o lo hagan apresurados.';
const DESIGN_ISSUE_QUICK_TRY_TEXT = '导航二级菜单选中后样式不佳，导致放大后文案展示不全。1. 优先找产品确认导航文案长度；2. 如果无法修改，尝试缩小字体。';
const EXCEL_QUICK_TRY_FILE_PATH = 'excel_quick_try.xlsx';

function getSourceLanguageValue() {
    const select = document.getElementById('sourceLanguageSelect');
    return select ? select.value : '';
}

function getTargetLanguageValue() {
    const select = document.getElementById('targetLanguageSelect');
    return select ? select.value : '';
}

function setSourceLanguageValue(value) {
    const select = document.getElementById('sourceLanguageSelect');
    if (select && value) {
        select.value = value;
    }
}

function setTargetLanguageValue(value) {
    const select = document.getElementById('targetLanguageSelect');
    if (select && value) {
        select.value = value;
    }
}

// 控制输入区域禁用状态
function setInputAreaDisabled(disabled) {
    if (disabled) {
        if (elements.inputSection) {
            elements.inputSection.classList.add('disabled');
        }
        // 禁用所有输入元素
        if (elements.issueDescription) {
            elements.issueDescription.disabled = true;
        }
        if (elements.fileInput) {
            elements.fileInput.disabled = true;
        }
        if (elements.newSessionBtn) {
            elements.newSessionBtn.disabled = true;
        }
        
        // 禁用所有复选框
        if (elements.inputSection) {
            const checkboxes = elements.inputSection.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.disabled = true;
            });
        }
    } else {
        if (elements.inputSection) {
            elements.inputSection.classList.remove('disabled');
        }
        // 启用所有输入元素
        if (elements.issueDescription) {
            elements.issueDescription.disabled = false;
        }
        if (elements.fileInput) {
            elements.fileInput.disabled = false;
        }
        if (elements.newSessionBtn) {
            elements.newSessionBtn.disabled = false;
        }
        
        // 启用所有复选框
        if (elements.inputSection) {
            const checkboxes = elements.inputSection.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.disabled = false;
            });
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化智能分析引擎
    SmartAnalysisEngine.initLearningCache();
    
    initializeEventListeners();
    attachOriginalSoundQuickTryListener();
    attachDesignIssueQuickTryListener();
    attachExcelQuickTryListener();
    loadDraftData();
    
    // 初始化页面显示：显示默认主页
    initPageDisplay();
    
    // 初始化看板卡片点击事件（原声池 & 问题池）
    initKanbanCardClickHandlers();
    
    // 初始化动态tooltip
    initDynamicTooltips();
    
    // 使用MutationObserver监听DOM变化，重新初始化tooltip
    const observer = new MutationObserver(function(mutations) {
        // 检查是否有新的带有data-tooltip的元素被添加
        const hasNewTooltipElements = Array.from(mutations).some(mutation => {
            return Array.from(mutation.addedNodes).some(node => {
                if (node.nodeType === 1) { // Element node
                    return node.hasAttribute && node.hasAttribute('data-tooltip') ||
                           node.querySelector && node.querySelector('[data-tooltip]');
                }
                return false;
            });
        });
        
        if (hasNewTooltipElements) {
            // 延迟执行，确保DOM已完全更新
            setTimeout(() => {
                initDynamicTooltips();
            }, 100);
        }
    });
    
    // 开始观察整个文档的变化
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // 用户原声卡片的显示状态将由switchInputType函数控制
});

// 初始化看板卡片点击事件处理
function initKanbanCardClickHandlers() {
    const voiceKanban = document.getElementById('voice-pool-kanban-view');
    if (voiceKanban && !voiceKanban.dataset.kanbanClickBound) {
        voiceKanban.dataset.kanbanClickBound = 'true';
        voiceKanban.addEventListener('click', (event) => {
            const card = event.target.closest('.kanban-card');
            if (!card || !voiceKanban.contains(card)) return;
            // 如果点击的是按钮，不触发卡片点击
            if (event.target.closest('button')) return;
            const itemId = card.getAttribute('data-item-id');
            if (itemId) {
                viewVoiceDetail(itemId);
            }
        });
    }
    
    const problemKanban = document.getElementById('problem-pool-kanban-view');
    if (problemKanban && !problemKanban.dataset.kanbanClickBound) {
        problemKanban.dataset.kanbanClickBound = 'true';
        problemKanban.addEventListener('click', (event) => {
            const card = event.target.closest('.kanban-card');
            if (!card || !problemKanban.contains(card)) return;
            // 如果点击的是按钮，不触发卡片点击
            if (event.target.closest('button')) return;
            const problemId = card.getAttribute('data-problem-id');
            if (problemId) {
                viewProblemDetail(problemId);
            }
        });
    }
    
    // 点击页面其他区域关闭状态下拉面板
    document.addEventListener('click', (e) => {
        const statusDropdown = document.querySelector('.kanban-status-dropdown');
        if (statusDropdown && !statusDropdown.contains(e.target)) {
            const isClickOnTransitionBtn = e.target.closest && e.target.closest('.kanban-action-btn-transition');
            if (!isClickOnTransitionBtn) {
                statusDropdown.remove();
            }
        }
    });
}

function attachOriginalSoundQuickTryListener() {
    const quickTryBtn = document.getElementById('originalSoundQuickTryBtn');
    if (!quickTryBtn) return;
    if (quickTryBtn.dataset.quickTryBound === 'true') return;
    
    quickTryBtn.dataset.quickTryBound = 'true';
    quickTryBtn.addEventListener('click', () => {
        const textarea = document.getElementById('originalSoundText');
        if (!textarea) return;
        
        textarea.value = ORIGINAL_SOUND_QUICK_TRY_TEXT;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.focus();
    });
}

function attachDesignIssueQuickTryListener() {
    const quickTryBtn = document.getElementById('designIssueQuickTryBtn');
    if (!quickTryBtn) return;
    if (quickTryBtn.dataset.quickTryBound === 'true') return;
    
    quickTryBtn.dataset.quickTryBound = 'true';
    quickTryBtn.addEventListener('click', () => {
        const textarea = document.getElementById('issueDescription');
        if (!textarea) return;
        
        textarea.value = DESIGN_ISSUE_QUICK_TRY_TEXT;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.focus();
    });
    
    // 初始化AI录入走查问题页的tab和新会话按钮
    const designInputTypeGroup = document.getElementById('designInputTypeGroup');
    if (designInputTypeGroup) {
        // 确保走查问题tab始终保持选中状态
        const problemTab = designInputTypeGroup.querySelector('.input-type-tab[data-type="problem"]');
        if (problemTab) {
            problemTab.addEventListener('click', (e) => {
                e.preventDefault();
                // 确保tab保持选中状态
                problemTab.classList.add('active');
            });
        }
        
        // 新会话按钮事件
        const newSessionBtn = document.getElementById('newDesignSessionBtn');
        if (newSessionBtn && !newSessionBtn.dataset.listenerAdded) {
            newSessionBtn.dataset.listenerAdded = 'true';
            newSessionBtn.addEventListener('click', () => {
                if (typeof startNewSession === 'function') {
                    startNewSession();
                }
            });
        }
    }
}

function attachExcelQuickTryListener() {
    const quickTryBtn = document.getElementById('excelQuickTryBtn');
    if (!quickTryBtn) return;
    if (quickTryBtn.dataset.quickTryBound === 'true') return;
    
    quickTryBtn.dataset.quickTryBound = 'true';
    quickTryBtn.addEventListener('click', async () => {
        try {
            const file = await loadExcelQuickTryFile();
            if (!file) {
                showNotification('示例Excel加载失败', 'error');
                return;
            }
            
            if (typeof OriginalSoundTemplate === 'undefined') {
                showNotification('OriginalSoundTemplate 未初始化', 'error');
                return;
            }
            
            OriginalSoundTemplate.displayUploadedFile(file, 'excelUploadedFiles');
            window.selectedExcelFile = file;
            showNotification('已添加示例Excel，可直接一键转化', 'success');
        } catch (error) {
            console.error('Excel快速试用失败:', error);
            showNotification('快速试用失败: ' + error.message, 'error');
        }
    });
}

async function loadExcelQuickTryFile() {
    const cacheBustingQuery = `_ts=${Date.now()}`;
    const filePath = EXCEL_QUICK_TRY_FILE_PATH.includes('?')
        ? `${EXCEL_QUICK_TRY_FILE_PATH}&${cacheBustingQuery}`
        : `${EXCEL_QUICK_TRY_FILE_PATH}?${cacheBustingQuery}`;
    
    const response = await fetch(filePath);
    if (!response.ok) {
        throw new Error(`无法加载示例文件（${response.status}）`);
    }
    const blob = await response.blob();
    const filename = decodeURIComponent(EXCEL_QUICK_TRY_FILE_PATH.split('/').pop());
    return new File([blob], filename, {
        type: blob.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
}

// 初始化页面显示
function initPageDisplay() {
    console.log('初始化页面显示');
    
    // 隐藏工作页面
    const workPageContainer = document.getElementById('work-page-container');
    if (workPageContainer) {
        workPageContainer.style.display = 'none';
    }
    
    // 隐藏所有主页
    document.querySelectorAll('.home-page').forEach(page => {
        page.style.display = 'none';
    });
    
    // 显示默认主页（用户原声池）
    const defaultHomePage = document.getElementById('voice-pool-home');
    if (defaultHomePage) {
        defaultHomePage.style.display = 'flex';
        currentPage = 'voice-pool';
        currentMainPage = 'voice-pool';
    }
    
    // 确保导航tab正确激活，显示tab切换，隐藏工作页面导航
    const defaultTab = document.querySelector('[data-page="voice-pool"]');
    if (defaultTab) {
        defaultTab.classList.add('active');
    }
    const navTabs = document.getElementById('navTabs');
    const navWorkHeader = document.getElementById('navWorkHeader');
    if (navTabs) navTabs.style.display = 'flex';
    if (navWorkHeader) navWorkHeader.style.display = 'none';
    
    // 在主页时隐藏历史记录按钮，显示搜索和通知按钮
    const searchBtn = document.getElementById('searchBtn');
    const notificationBtn = document.getElementById('notificationBtn');
    const historyBtn = document.getElementById('historyBtn');
    if (searchBtn) searchBtn.style.display = 'flex';
    if (notificationBtn) notificationBtn.style.display = 'flex';
    if (historyBtn) historyBtn.style.display = 'none';
    
    // 初始化表格数据
    initTableData();
}

// 初始化表格数据
function initTableData() {
    // 从localStorage读取数据，如果没有则使用示例数据
    let voicePoolData = [];
    try {
        const stored = localStorage.getItem('voicePoolData');
        if (stored) {
            voicePoolData = JSON.parse(stored);
        } else {
    // 用户原声池预置数据（从"用户原声池-预置数据.xlsx"导入，包含原声详情、原声转译、重点分析、情感分析）
            voicePoolData = [
        {
            id: 'preset_1764318523643_0',
            summary: "订单分配存在延迟问题，影响配送效率",
            emotion: { type: 'negative', level: 'strong', label: "负向" },
            module: "骑手配送",
            issues: "--",
            status: { text: "待评估", type: 'pending' },
            originalText: "Capaciten a sus motociclistas xq no dan con los domicilios y terminan cancelando los servicios y a uno lo dejan con hambre y eso que hasta con la ubicación que les envía uno a través de su app, gracias",
            originalDetail: "Capaciten a sus motociclistas xq no dan con los domicilios y terminan cancelando los servicios y a uno lo dejan con hambre y eso que hasta con la ubicación que les envía uno a través de su app, gracias",
            originalDescription: "Capaciten a sus motociclistas xq no dan con los domicilios y terminan cancelando los servicios y a uno lo dejan con hambre y eso que hasta con la ubicación que les envía uno a través de su app, gracias",
            translatedText: "请培训你们的摩托车骑手，因为他们找不到送货地址，最终取消了服务，让人饿着肚子，尽管我们通过你们的应用程序发送了定位信息，谢谢",
            originalTranslation: "请培训你们的摩托车骑手，因为他们找不到送货地址，最终取消了服务，让人饿着肚子，尽管我们通过你们的应用程序发送了定位信息，谢谢",
            translation: "请培训你们的摩托车骑手，因为他们找不到送货地址，最终取消了服务，让人饿着肚子，尽管我们通过你们的应用程序发送了定位信息，谢谢",
            keyAnalysis: "",
            keyPoints: "骑手经常找不到送货地址；服务被取消导致用户挨饿；已通过应用程序提供定位信息；要求培训骑手",
            sentimentAnalysis: "用户表达强烈不满，使用'让人饿着肚子'等情感化语言，批评骑手能力不足和服务取消问题，尽管结尾有'谢谢'，但整体语气充满抱怨和指责，情感强度强烈",
            sentiment: "用户表达强烈不满，使用'让人饿着肚子'等情感化语言，批评骑手能力不足和服务取消问题，尽管结尾有'谢谢'，但整体语气充满抱怨和指责，情感强度强烈",
            createdAt: '2025-11-28T16:28:43.643997'
        },
        {
            id: 'preset_1764318523644_1',
            summary: "用户投诉订单不完整问题频发，报告流程复杂且商店回复无效，要求简化处理流程",
            emotion: { type: 'negative', level: 'strong', label: "负向" },
            module: "订单相关",
            issues: "--",
            status: { text: "待评估", type: 'pending' },
            originalText: "Cuando hay alguna queja, cómo pedidos incompletos que sea más fácil ya que varias veces que no llegan los pedidos completos y no es fácil hacer los reportes y las respuestas de las tiendas no son de ayuda",
            originalDetail: "Cuando hay alguna queja, cómo pedidos incompletos que sea más fácil ya que varias veces que no llegan los pedidos completos y no es fácil hacer los reportes y las respuestas de las tiendas no son de ayuda",
            originalDescription: "Cuando hay alguna queja, cómo pedidos incompletos que sea más fácil ya que varias veces que no llegan los pedidos completos y no es fácil hacer los reportes y las respuestas de las tiendas no son de ayuda",
            translatedText: "当有投诉时，比如订单不完整，希望能更容易处理，因为多次订单没有完整送达，而且报告不容易提交，商店的回复也没有帮助",
            originalTranslation: "当有投诉时，比如订单不完整，希望能更容易处理，因为多次订单没有完整送达，而且报告不容易提交，商店的回复也没有帮助",
            translation: "当有投诉时，比如订单不完整，希望能更容易处理，因为多次订单没有完整送达，而且报告不容易提交，商店的回复也没有帮助",
            keyAnalysis: "",
            keyPoints: "订单多次不完整送达；报告提交困难；商店回复无帮助；需要简化投诉流程",
            sentimentAnalysis: "用户通过'多次''不容易''没有帮助'等词汇表达持续不满，批评订单配送、报告机制和客服响应，情感倾向明确但未使用极端词汇，属于中等强度负面反馈",
            sentiment: "用户通过'多次''不容易''没有帮助'等词汇表达持续不满，批评订单配送、报告机制和客服响应，情感倾向明确但未使用极端词汇，属于中等强度负面反馈",
            createdAt: '2025-11-28T16:28:43.644005'
        },
        {
            id: 'preset_1764318523644_2',
            summary: "用户反馈搜索功能完全失效，搜索结果与查询内容完全不匹配",
            emotion: { type: 'neutral', level: 'slight', label: "中性" },
            module: "基础功能",
            issues: "搜索功能失效，搜索结果与查询内容完全不匹配",
            status: { text: "待评估", type: 'pending' },
            originalText: "Nunca aparece lo que uno busca y las opciones que dan nada que ver con lo que uno busca",
            originalDetail: "Nunca aparece lo que uno busca y las opciones que dan nada que ver con lo que uno busca",
            originalDescription: "Nunca aparece lo que uno busca y las opciones que dan nada que ver con lo que uno busca",
            translatedText: "搜索的内容从来不会出现，给出的选项与搜索内容毫无关系",
            originalTranslation: "搜索的内容从来不会出现，给出的选项与搜索内容毫无关系",
            translation: "搜索的内容从来不会出现，给出的选项与搜索内容毫无关系",
            keyAnalysis: "",
            keyPoints: "搜索结果从未显示用户搜索的内容；提供的选项与用户实际搜索内容完全无关",
            sentimentAnalysis: "用户使用'从来不会'和'毫无关系'等绝对化表述，表达了对搜索功能的极度失望和强烈不满，情感色彩非常鲜明且负面情绪强烈",
            sentiment: "用户使用'从来不会'和'毫无关系'等绝对化表述，表达了对搜索功能的极度失望和强烈不满，情感色彩非常鲜明且负面情绪强烈",
            createdAt: '2025-11-28T16:28:43.644010'
        },
        {
            id: 'preset_1764318523644_3',
            summary: "用户高度赞扬该应用是订餐领域的最佳选择",
            emotion: { type: 'positive', level: 'slight', label: "正向" },
            module: "基础功能",
            issues: "--",
            status: { text: "待评估", type: 'pending' },
            originalText: "Estoy 5 con el buen servicio de didi food y sus recomendaciones muchas gracias",
            originalDetail: "Estoy 5 con el buen servicio de didi food y sus recomendaciones muchas gracias",
            originalDescription: "Estoy 5 con el buen servicio de didi food y sus recomendaciones muchas gracias",
            translatedText: "我对Didi Food的良好服务和推荐非常满意，非常感谢",
            originalTranslation: "我对Didi Food的良好服务和推荐非常满意，非常感谢",
            translation: "我对Didi Food的良好服务和推荐非常满意，非常感谢",
            keyAnalysis: "",
            keyPoints: "对Didi Food服务满意；赞赏推荐功能；表达感谢",
            sentimentAnalysis: "用户使用'非常满意'和'非常感谢'等强烈积极词汇，明确表达了对服务的赞赏和感激之情，情感表达直接且热情",
            sentiment: "用户使用'非常满意'和'非常感谢'等强烈积极词汇，明确表达了对服务的赞赏和感激之情，情感表达直接且热情",
            createdAt: '2025-11-28T16:28:43.644015'
        },
        {
            id: 'preset_1764318523644_4',
            summary: "建议餐厅在点餐系统中增加特殊备注功能，方便顾客个性化需求",
            emotion: { type: 'positive', level: 'slight', label: "正向" },
            module: "点餐体验",
            issues: "--",
            status: { text: "关键反馈", type: 'key' },
            originalText: "Recomendar a los restaurantes poner la opción de poner notas especiales a las comidas",
            originalDetail: "Recomendar a los restaurantes poner la opción de poner notas especiales a las comidas",
            originalDescription: "Recomendar a los restaurantes poner la opción de poner notas especiales a las comidas",
            translatedText: "用户建议餐厅在点餐系统中增加特殊备注功能，方便顾客个性化需求",
            originalTranslation: "用户建议餐厅在点餐系统中增加特殊备注功能，方便顾客个性化需求",
            translation: "用户建议餐厅在点餐系统中增加特殊备注功能，方便顾客个性化需求",
            keyAnalysis: "",
            keyPoints: "建议餐厅增加为餐食添加特殊备注的选项",
            sentimentAnalysis: "用户以建议的方式表达了对功能改进的期待，语气积极且具有建设性，体现了对餐厅服务提升的关心和支持",
            sentiment: "用户以建议的方式表达了对功能改进的期待，语气积极且具有建设性，体现了对餐厅服务提升的关心和支持",
            createdAt: '2025-11-28T16:28:43.644019'
        },
        {
            id: 'preset_1764318523644_5',
            summary: "强烈批评配送服务，抱怨配送员行为霸道、订单处理混乱、退款过程困难，并决定卸载应用",
            emotion: { type: 'negative', level: 'strong', label: "负向" },
            module: "骑手配送",
            issues: "配送服务的质量参差不齐，需要加强SOP及行为规范培训",
            status: { text: "关键反馈", type: 'key' },
            originalText: "Pésimo servicio de los repartidores son abusivosbagarran de aire ocho pedidos al mismo tiempo cancelan cuando quieren y para que te devuelvan tu dinero a tu tarjeta es un viacrucis pésimos ya quitaré la aplicación",
            originalDetail: "Pésimo servicio de los repartidores son abusivosbagarran de aire ocho pedidos al mismo tiempo cancelan cuando quieren y para que te devuelvan tu dinero a tu tarjeta es un viacrucis pésimos ya quitaré la aplicación",
            originalDescription: "Pésimo servicio de los repartidores son abusivosbagarran de aire ocho pedidos al mismo tiempo cancelan cuando quieren y para que te devuelvan tu dinero a tu tarjeta es un viacrucis pésimos ya quitaré la aplicación",
            translatedText: "配送员的服务太糟糕了，他们很霸道，同时拖延八个订单，想取消就取消，要把钱退回到你的卡上简直是一场折磨，太差劲了，我要卸载这个应用了。",
            originalTranslation: "配送员的服务太糟糕了，他们很霸道，同时拖延八个订单，想取消就取消，要把钱退回到你的卡上简直是一场折磨，太差劲了，我要卸载这个应用了。",
            translation: "配送员的服务太糟糕了，他们很霸道，同时拖延八个订单，想取消就取消，要把钱退回到你的卡上简直是一场折磨，太差劲了，我要卸载这个应用了。",
            keyAnalysis: "",
            keyPoints: "配送员服务差劲；同时处理多个订单导致拖延；随意取消订单；退款过程繁琐；计划卸载应用",
            sentimentAnalysis: "用户使用'pésimo'（太糟糕）、'abusivos'（霸道）、'viacrucis'（折磨）等强烈负面词汇，表达了对配送服务、订单管理和退款流程的极度不满，情感强度高，并明确表示要卸载应用，显示出强烈的负面情绪和失望。",
            sentiment: "用户使用'pésimo'（太糟糕）、'abusivos'（霸道）、'viacrucis'（折磨）等强烈负面词汇，表达了对配送服务、订单管理和退款流程的极度不满，情感强度高，并明确表示要卸载应用，显示出强烈的负面情绪和失望。",
            createdAt: '2025-11-28T16:28:43.644024'
        },
        {
            id: 'preset_1764318523644_6',
            summary: "配送员多次盗窃订单且身份信息不符",
            emotion: { type: 'negative', level: 'strong', label: "负向" },
            module: "骑手配送",
            issues: "配送服务的质量参差不齐，需要加强SOP及行为规范培训",
            status: { text: "关键反馈", type: 'key' },
            originalText: "Los repartidores varias veces me han robado el pedido y no concuerdan con la fotografía del repartidor",
            originalDetail: "Los repartidores varias veces me han robado el pedido y no concuerdan con la fotografía del repartidor",
            originalDescription: "Los repartidores varias veces me han robado el pedido y no concuerdan con la fotografía del repartidor",
            translatedText: "配送员多次偷了我的订单，而且与配送员的照片不符",
            originalTranslation: "配送员多次偷了我的订单，而且与配送员的照片不符",
            translation: "配送员多次偷了我的订单，而且与配送员的照片不符",
            keyAnalysis: "",
            keyPoints: "配送员多次盗窃订单；配送员实际身份与平台照片不符",
            sentimentAnalysis: "用户使用'多次'和'偷了'等强烈负面词汇，表达了对配送员盗窃行为和身份不符的严重不满，情感强度强烈，显示出对服务安全性的深度担忧和愤怒",
            sentiment: "用户使用'多次'和'偷了'等强烈负面词汇，表达了对配送员盗窃行为和身份不符的严重不满，情感强度强烈，显示出对服务安全性的深度担忧和愤怒",
            createdAt: '2025-11-28T16:28:43.644028'
        },
        {
            id: 'preset_1764318523644_7',
            summary: "配送时间频繁变更问题，要求平台确保承诺送达时间的稳定性，避免因时间变动影响用餐",
            emotion: { type: 'negative', level: 'strong', label: "负向" },
            module: "骑手配送",
            issues: "配送服务的质量参差不齐，需要加强SOP及行为规范培训",
            status: { text: "关键反馈", type: 'key' },
            originalText: "Deberian de hacer  algo para  garantizar  los tiempos de entrega  prometidos y que estos no cambien conforme salen otros pedidos, aveces las personas tienen tiempos contados debido a sus labores y el que cambien a  su voluntad , ocaciona  que no puedan disfrutar sus alimentos o lo hagan apresurados",
            originalDetail: "Deberian de hacer  algo para  garantizar  los tiempos de entrega  prometidos y que estos no cambien conforme salen otros pedidos, aveces las personas tienen tiempos contados debido a sus labores y el que cambien a  su voluntad , ocaciona  que no puedan disfrutar sus alimentos o lo hagan apresurados",
            originalDescription: "Deberian de hacer  algo para  garantizar  los tiempos de entrega  prometidos y que estos no cambien conforme salen otros pedidos, aveces las personas tienen tiempos contados debido a sus labores y el que cambien a  su voluntad , ocaciona  que no puedan disfrutar sus alimentos o lo hagan apresurados",
            translatedText: "应该采取一些措施来保证承诺的送达时间，并且这些时间不会因为其他订单的出现而改变。有时候人们由于工作原因时间很紧张，而他们随意改变时间会导致人们无法享受食物或者只能匆忙用餐。",
            originalTranslation: "应该采取一些措施来保证承诺的送达时间，并且这些时间不会因为其他订单的出现而改变。有时候人们由于工作原因时间很紧张，而他们随意改变时间会导致人们无法享受食物或者只能匆忙用餐。",
            translation: "应该采取一些措施来保证承诺的送达时间，并且这些时间不会因为其他订单的出现而改变。有时候人们由于工作原因时间很紧张，而他们随意改变时间会导致人们无法享受食物或者只能匆忙用餐。",
            keyAnalysis: "",
            keyPoints: "1. 要求保障承诺配送时间的稳定性\n2. 配送时间不应因新订单随意变更\n3. 时间变更影响用户用餐安排\n4. 可能导致无法正常享受食物或匆忙用餐",
            sentimentAnalysis: "用户表达了对配送时间频繁变更的强烈不满，使用'deberían'(应该)、'garantizar'(保证)等词语体现诉求的迫切性，通过描述'无法享受食物'、'匆忙用餐'等具体影响来强调问题的严重性，整体语气带有明显的批评和抱怨色彩。",
            sentiment: "用户表达了对配送时间频繁变更的强烈不满，使用'deberían'(应该)、'garantizar'(保证)等词语体现诉求的迫切性，通过描述'无法享受食物'、'匆忙用餐'等具体影响来强调问题的严重性，整体语气带有明显的批评和抱怨色彩。",
            createdAt: '2025-11-28T16:28:43.644033'
        },
        {
            id: 'preset_1764318523644_8',
            summary: "投诉产品质量低劣且配料不完整，与菜单描述不符",
            emotion: { type: 'negative', level: 'strong', label: "负向" },
            module: "商家经营",
            issues: "菜单图文描述的管控需要提升，配料不完整、与菜单描述不符等现象频发",
            status: { text: "暂不解决", type: 'unresolved' },
            originalText: "Muy mala calidad de productos y no llegan todos los ingredientes que dicen en los menús cuando pides algo",
            originalDetail: "Muy mala calidad de productos y no llegan todos los ingredientes que dicen en los menús cuando pides algo",
            originalDescription: "Muy mala calidad de productos y no llegan todos los ingredientes que dicen en los menús cuando pides algo",
            translatedText: "产品质量非常差，点餐时菜单上列出的配料并没有全部送到",
            originalTranslation: "产品质量非常差，点餐时菜单上列出的配料并没有全部送到",
            translation: "产品质量非常差，点餐时菜单上列出的配料并没有全部送到",
            keyAnalysis: "",
            keyPoints: "产品质量差；配料缺失；与菜单描述不一致",
            sentimentAnalysis: "用户使用'muy mala'（非常差）等强烈负面词汇，表达了对产品质量和配料完整性的极度不满，情感表达直接且强烈",
            sentiment: "用户使用'muy mala'（非常差）等强烈负面词汇，表达了对产品质量和配料完整性的极度不满，情感表达直接且强烈",
            createdAt: '2025-11-28T16:28:43.644037'
        },
        {
            id: 'preset_1764318523644_9',
            summary: "希望在点餐系统中增加特殊备注功能，方便顾客个性化需求",
            emotion: { type: 'neutral', level: 'slight', label: "中性" },
            module: "点餐体验",
            issues: "--",
            status: { text: "暂不解决", type: 'unresolved' },
            originalText: "Recomendar a los restaurantes poner la opción de poner notas especiales a las comidas",
            originalDetail: "Recomendar a los restaurantes poner la opción de poner notas especiales a las comidas",
            originalDescription: "Recomendar a los restaurantes poner la opción de poner notas especiales a las comidas",
            translatedText: "用户建议餐厅在点餐系统中增加特殊备注功能，方便顾客个性化需求",
            originalTranslation: "用户建议餐厅在点餐系统中增加特殊备注功能，方便顾客个性化需求",
            translation: "用户建议餐厅在点餐系统中增加特殊备注功能，方便顾客个性化需求",
            keyAnalysis: "",
            keyPoints: "建议餐厅增加为餐食添加特殊备注的选项",
            sentimentAnalysis: "用户以建议的方式表达了对功能改进的期待，语气积极且具有建设性，体现了对餐厅服务提升的关心和支持",
            sentiment: "用户以建议的方式表达了对功能改进的期待，语气积极且具有建设性，体现了对餐厅服务提升的关心和支持",
            createdAt: '2025-11-28T16:28:43.644041'
        }
    ];
            // 保存预置数据到localStorage
            localStorage.setItem('voicePoolData', JSON.stringify(voicePoolData));
        }
    } catch (error) {
        console.error('读取数据失败:', error);
        voicePoolData = [];
    }
    
    // 应用当前筛选并渲染表格
    applyVoicePoolFilter(currentVoicePoolFilter, voicePoolData);
    updateVoicePoolStats(voicePoolData);
    
    // 更新筛选按钮样式
    updateFilterButtonStyle();
    
    // 更新分组按钮样式
    updateGroupButtonStyle();
    
    // 初始化视图状态
    switchViewType(currentViewType);
    
    handleVoiceDetailParam();
    handleProblemDetailParam();
}

// 渲染用户原声池表格
function renderVoicePoolTable(data) {
    const tbody = document.getElementById('voice-pool-table-body');
    if (!tbody) return;
    
    let rowIndex = 0; // 全局行索引计数器
    
    // 如果没有分组，直接渲染
    if (currentGroupBy === 'none') {
        tbody.innerHTML = data.map((item, index) => {
            rowIndex = index + 1;
            return renderTableRow(item, rowIndex);
        }).join('');
        return;
    }
    
    // 分组渲染
    let html = '';
    
    if (currentGroupBy === 'emotion') {
        // 按情感分类分组：负向、中性、正向
        const emotionOrder = ['negative', 'neutral', 'positive'];
        const emotionLabels = {
            'negative': '负向',
            'neutral': '中性',
            'positive': '正向'
        };
        
        emotionOrder.forEach(emotionType => {
            const groupData = data.filter(item => {
                const itemEmotionType = item.emotion?.type || 'neutral';
                return itemEmotionType === emotionType;
            });
            
            if (groupData.length > 0) {
                // 添加分组标题行
                html += renderGroupHeader(emotionLabels[emotionType], groupData.length, 'emotion');
                // 添加该分组的数据行
                groupData.forEach(item => {
                    rowIndex++;
                    html += renderTableRow(item, rowIndex);
                });
            }
        });
    } else if (currentGroupBy === 'module') {
        // 按所属模块分组
        const moduleGroups = {};
        data.forEach(item => {
            const module = item.module || '未分类';
            if (!moduleGroups[module]) {
                moduleGroups[module] = [];
            }
            moduleGroups[module].push(item);
        });
        
        // 按模块名称排序
        const sortedModules = Object.keys(moduleGroups).sort();
        
        sortedModules.forEach(module => {
            const groupData = moduleGroups[module];
            // 添加分组标题行
            html += renderGroupHeader(module, groupData.length, 'module');
            // 添加该分组的数据行
            groupData.forEach(item => {
                rowIndex++;
                html += renderTableRow(item, rowIndex);
            });
        });
    } else if (currentGroupBy === 'status') {
        // 按状态分组：待评估、关键反馈、暂不解决
        const statusOrder = ['pending', 'key', 'unresolved'];
        const statusLabels = {
            'pending': '待评估',
            'key': '关键反馈',
            'unresolved': '暂不解决'
        };
        
        statusOrder.forEach(statusType => {
            const groupData = data.filter(item => {
                const itemStatus = item.status?.type || 'pending';
                return itemStatus === statusType;
            });
            
            if (groupData.length > 0) {
                // 添加分组标题行
                html += renderGroupHeader(statusLabels[statusType], groupData.length, 'status');
                // 添加该分组的数据行
                groupData.forEach(item => {
                    rowIndex++;
                    html += renderTableRow(item, rowIndex);
                });
            }
        });
    }
    
    tbody.innerHTML = html;
    
    // 绑定批量操作事件
    bindBatchOperationEvents();
    
    // 初始化批量操作工具栏状态
    updateBatchToolbar();
    
    // 绑定表格标题点击事件（用于打开/切换详情抽屉）
    bindTableTitleClickEvents();
}

// 绑定批量操作事件
function bindBatchOperationEvents() {
    // 全选复选框
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
    }
    
    // 行复选框
    document.querySelectorAll('.row-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateBatchToolbar);
    });
    
    // 批量复制按钮
    const batchCopyBtn = document.getElementById('batch-copy-btn');
    if (batchCopyBtn) {
        batchCopyBtn.addEventListener('click', handleBatchCopy);
    }
    
    // 批量删除按钮
    const batchDeleteBtn = document.getElementById('batch-delete-btn');
    if (batchDeleteBtn) {
        batchDeleteBtn.addEventListener('click', handleBatchDelete);
    }
    
    // 批量操作工具栏按钮（data-toolbar中的）
    const batchCreateProblemBtn = document.getElementById('batch-create-problem-btn');
    if (batchCreateProblemBtn) {
        batchCreateProblemBtn.addEventListener('click', handleBatchCreateProblem);
    }
    
    const batchLinkProblemBtn = document.getElementById('batch-link-problem-btn');
    if (batchLinkProblemBtn) {
        batchLinkProblemBtn.addEventListener('click', handleBatchLinkProblem);
    }
    
    const batchCancelBtn = document.getElementById('batch-cancel-btn');
    if (batchCancelBtn) {
        batchCancelBtn.addEventListener('click', handleBatchCancel);
    }
}

// 批量新建为问题
function handleBatchCreateProblem() {
    const selectedIds = getSelectedItemIds();
    if (selectedIds.length === 0) {
        showToast('请先选择要操作的项目', 'error');
        return;
    }
    
    // TODO: 实现批量新建为问题的功能
    showToast(`将 ${selectedIds.length} 条原声新建为问题`, 'success');
    console.log('批量新建为问题，选中的ID:', selectedIds);
}

// 批量关联已有问题
function handleBatchLinkProblem() {
    const selectedIds = getSelectedItemIds();
    if (selectedIds.length === 0) {
        showToast('请先选择要操作的项目', 'error');
        return;
    }
    
    // TODO: 实现批量关联已有问题的功能
    showToast(`将 ${selectedIds.length} 条原声关联到已有问题`, 'success');
    console.log('批量关联已有问题，选中的ID:', selectedIds);
}

// 取消批量操作
function handleBatchCancel() {
    // 取消所有选择（包括列表视图和看板视图）
    document.querySelectorAll('.row-checkbox, .kanban-card-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    }
    updateBatchToolbar();
}

// 全选/取消全选
function handleSelectAll(event) {
    const checked = event.target.checked;
    // 列表视图的复选框
    document.querySelectorAll('.row-checkbox').forEach(checkbox => {
        checkbox.checked = checked;
    });
    // 看板视图的复选框
    document.querySelectorAll('.kanban-card-checkbox').forEach(checkbox => {
        checkbox.checked = checked;
    });
    updateBatchToolbar();
}

// 更新批量操作工具栏
function updateBatchToolbar() {
    // 只在用户原声池主页中更新
    const voicePoolHome = document.getElementById('voice-pool-home');
    if (!voicePoolHome || voicePoolHome.style.display === 'none') {
        return;
    }
    
    const selectedCheckboxes = voicePoolHome.querySelectorAll('.row-checkbox:checked, .kanban-card-checkbox:checked');
    const selectedCount = selectedCheckboxes.length;
    const batchToolbar = document.getElementById('voice-pool-batch-toolbar');
    const batchCountSpan = document.getElementById('batch-selected-count');
    const batchToolbarInline = document.getElementById('voice-pool-batch-toolbar-inline');
    const batchCountSpanInline = document.getElementById('batch-selected-count-inline');
    const toolbarNormal = document.getElementById('voice-pool-toolbar-normal');
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    
    // 更新选中数量（表格上方的工具栏）
    if (batchCountSpan) {
        batchCountSpan.textContent = selectedCount;
    }
    
    // 更新选中数量（data-toolbar中的内联工具栏）
    if (batchCountSpanInline) {
        batchCountSpanInline.textContent = selectedCount;
    }
    
    // 显示/隐藏表格上方的批量操作工具栏
    if (batchToolbar) {
        if (selectedCount > 0) {
            batchToolbar.style.display = 'flex';
        } else {
            batchToolbar.style.display = 'none';
        }
    }
    
    // 切换data-toolbar中的工具栏
    if (selectedCount > 0) {
        // 显示批量操作工具栏，隐藏正常工具栏
        if (batchToolbarInline) {
            batchToolbarInline.style.display = 'flex';
        }
        if (toolbarNormal) {
            toolbarNormal.style.display = 'none';
        }
    } else {
        // 隐藏批量操作工具栏，显示正常工具栏
        if (batchToolbarInline) {
            batchToolbarInline.style.display = 'none';
        }
        if (toolbarNormal) {
            toolbarNormal.style.display = 'flex';
        }
    }
    
    // 更新全选复选框状态
    if (selectAllCheckbox) {
        const totalCheckboxes = voicePoolHome.querySelectorAll('.row-checkbox, .kanban-card-checkbox').length;
        selectAllCheckbox.checked = totalCheckboxes > 0 && selectedCount === totalCheckboxes;
        selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < totalCheckboxes;
    }
}

// 获取选中的项目ID
function getSelectedItemIds() {
    const selectedCheckboxes = document.querySelectorAll('.row-checkbox:checked, .kanban-card-checkbox:checked');
    return Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-item-id'));
}

// 批量复制
function handleBatchCopy() {
    const selectedIds = getSelectedItemIds();
    if (selectedIds.length === 0) {
        showToast('请先选择要复制的项目', 'error');
        return;
    }
    
    // 从localStorage读取数据
    let allData = [];
    try {
        const stored = localStorage.getItem('voicePoolData');
        if (stored) {
            allData = JSON.parse(stored);
        }
    } catch (error) {
        console.error('读取数据失败:', error);
        showToast('读取数据失败', 'error');
        return;
    }
    
    // 获取选中的数据
    const selectedData = allData.filter(item => selectedIds.includes(item.id));
    
    // 复制数据（生成新的ID）
    const copiedData = selectedData.map(item => ({
        ...item,
        id: 'copy_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    }));
    
    // 添加到数据列表
    allData.push(...copiedData);
    
    // 保存到localStorage
    try {
        localStorage.setItem('voicePoolData', JSON.stringify(allData));
        showToast(`成功复制 ${copiedData.length} 条数据`, 'success');
        
        // 取消所有选择
        document.querySelectorAll('.row-checkbox, .kanban-card-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        const selectAllCheckbox = document.getElementById('select-all-checkbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }
        updateBatchToolbar();
        
        // 重新渲染视图
        applyVoicePoolFilter(currentVoicePoolFilter, allData);
        updateVoicePoolStats(allData);
    } catch (error) {
        console.error('保存数据失败:', error);
        showToast('保存数据失败', 'error');
    }
}

// 批量删除
function handleBatchDelete() {
    const selectedIds = getSelectedItemIds();
    if (selectedIds.length === 0) {
        showToast('请先选择要删除的项目', 'error');
        return;
    }
    
    // 确认删除
    if (!confirm(`确定要删除选中的 ${selectedIds.length} 条数据吗？`)) {
        return;
    }
    
    // 从localStorage读取数据
    let allData = [];
    try {
        const stored = localStorage.getItem('voicePoolData');
        if (stored) {
            allData = JSON.parse(stored);
        }
    } catch (error) {
        console.error('读取数据失败:', error);
        showToast('读取数据失败', 'error');
        return;
    }
    
    // 删除选中的数据
    const filteredData = allData.filter(item => !selectedIds.includes(item.id));
    
    // 保存到localStorage
    try {
        localStorage.setItem('voicePoolData', JSON.stringify(filteredData));
        showToast(`成功删除 ${selectedIds.length} 条数据`, 'success');
        
        // 取消所有选择
        document.querySelectorAll('.row-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        const selectAllCheckbox = document.getElementById('select-all-checkbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }
        updateBatchToolbar();
        
        // 重新渲染表格
        applyVoicePoolFilter(currentVoicePoolFilter, filteredData);
        updateVoicePoolStats(filteredData);
    } catch (error) {
        console.error('保存数据失败:', error);
        showToast('保存数据失败', 'error');
    }
}

// 渲染表格行
function renderTableRow(item, rowIndex) {
        // 处理情感分类显示 - 使用统一的样式（文字+icon）
    const emotionLabel = item.emotion?.label || '中性';
    const emotionType = item.emotion?.type || 'neutral';
        const emotionIcon = emotionType === 'negative' ? 'icon/负向.svg' : 
                           emotionType === 'positive' ? 'icon/正向.svg' : 
                           'icon/中性.svg';
        const emotionDisplay = `
            <span class="sentiment-display">
                <img src="${emotionIcon}" alt="${emotionLabel}" class="sentiment-icon" />
                <span class="sentiment-text">${emotionLabel}</span>
            </span>
        `;
        
        // 处理分析状态
    const statusClass = item.status?.type === 'pending' ? 'status-pending' :
                       item.status?.type === 'key' ? 'status-key' : 'status-unresolved';
        
        // 处理关联问题显示 - 使用标签样式（icon + 文字）
        const issuesText = item.issues && item.issues !== '--' ? item.issues : '--';
        const issuesDisplay = `
            <span class="issues-tag" title="${issuesText}">
                <img src="icon/关联问题.svg" alt="关联问题" class="issues-tag-icon" />
                <span class="issues-tag-text">${issuesText}</span>
            </span>
        `;
        
        return `
        <tr data-row-id="${item.id}">
            <td class="col-checkbox">
                <input type="checkbox" class="row-checkbox" data-item-id="${item.id}" />
                <span class="row-index">${rowIndex}</span>
            </td>
                <td class="col-summary">
                    <span class="summary-link" onclick="viewVoiceDetail('${item.id}')" style="cursor: pointer;">${item.summary || '--'}</span>
                </td>
                <td class="col-emotion">
                    ${emotionDisplay}
                </td>
                <td class="col-module">${item.module || '--'}</td>
                <td class="col-issues">${issuesDisplay}</td>
                <td class="col-status">
                <span class="status-badge ${statusClass}">${item.status?.text || '待评估'}</span>
                </td>
                <td class="col-actions">
                <button class="action-btn action-btn-define" title="定义为问题" onclick="defineAsProblem('${item.id}')">
                    <img src="icon/列表-定义为问题-默认.svg" alt="定义为问题" class="action-icon" />
                    </button>
                <button class="action-btn action-btn-view" title="查看详情" onclick="viewVoiceDetail('${item.id}')">
                    <img src="icon/列表-查看详情-默认.svg" alt="查看详情" class="action-icon" />
                    </button>
                </td>
            </tr>
        `;
}

// 渲染分组标题行
function renderGroupHeader(groupName, count, groupType) {
    let iconHtml = '';
    if (groupType === 'emotion') {
        // 根据情感类型显示对应图标
        const emotionIcons = {
            '负向': 'icon/负向.svg',
            '中性': 'icon/中性.svg',
            '正向': 'icon/正向.svg'
        };
        const icon = emotionIcons[groupName] || 'icon/中性.svg';
        iconHtml = `<img src="${icon}" alt="${groupName}" class="group-header-icon" />`;
    }
    
    return `
        <tr class="group-header-row">
            <td colspan="7" class="group-header-cell">
                <div class="group-header-content">
                    ${iconHtml}
                    <span class="group-header-name">${groupName}</span>
                    <span class="group-header-count">(${count})</span>
                </div>
            </td>
        </tr>
    `;
}

// 查看原声详情
function viewVoiceDetail(id) {
    // 获取数据
    const stored = localStorage.getItem('voicePoolData');
    let voicePoolData = [];
    if (stored) {
        voicePoolData = JSON.parse(stored);
    }
    const item = voicePoolData.find(item => item.id === id);
    
    if (!item) {
        showToast('未找到数据项', 'error');
        return;
    }
    
    // 显示详情抽屉
    showVoiceDetailDrawer(item, voicePoolData);
}

// 显示用户原声详情抽屉
function showVoiceDetailDrawer(item, allData) {
    // 如果已存在抽屉，先移除
    const existingDrawer = document.getElementById('voiceDetailDrawerOverlay');
    if (existingDrawer) {
        existingDrawer.remove();
    }
    
    // 创建抽屉HTML
    const drawerHtml = createVoiceDetailDrawerHtml(item, allData);
    document.body.insertAdjacentHTML('beforeend', drawerHtml);
    
    // 添加样式（如果还没有）
    addVoiceDetailDrawerStyles();
    
    // 显示抽屉动画
    setTimeout(() => {
        const overlay = document.getElementById('voiceDetailDrawerOverlay');
        const drawer = document.getElementById('voiceDetailDrawer');
        if (overlay && drawer) {
            overlay.classList.add('show');
            drawer.classList.add('show');
        }
    }, 10);
    
    // 绑定切换事件
    bindVoiceDetailSwitchEvents(allData);
    
    // 绑定字段编辑事件
    bindVoiceDetailFieldEditEvents();
}

// 创建用户原声详情抽屉HTML
function createVoiceDetailDrawerHtml(item, allData) {
    // 获取当前索引
    const currentIndex = allData.findIndex(d => d.id === item.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < allData.length - 1;
    
    // 状态类型和类名
    const statusType = item.status?.type || 'pending';
    const statusClass = statusType === 'pending' ? 'status-pending' :
                       statusType === 'key' ? 'status-key' : 'status-unresolved';
    
    // 状态标签
    const statusBadge = statusType === 'pending' ? 
        '<span class="status-tag status-pending-tag">待评估</span>' :
        statusType === 'key' ? 
        '<span class="status-tag status-key-tag">关键反馈</span>' :
        '<span class="status-tag status-unresolved-tag">暂不解决</span>';
    
    // 情感标签
    const emotionType = item.emotion?.type || 'neutral';
    const emotionLabel = item.emotion?.label || '中性';
    const emotionIcon = emotionType === 'negative' ? 'icon/负向.svg' : 
                       emotionType === 'positive' ? 'icon/正向.svg' : 
                       'icon/中性.svg';
    const emotionBadge = `<span class="status-tag emotion-tag">
        <img src="${emotionIcon}" alt="${emotionLabel}" style="width: 12px; height: 12px; margin-right: 4px; vertical-align: middle;" />
        ${emotionLabel}
    </span>`;
    
    // 固定模块选项（只保留这六个选项）
    const fixedModules = ['基础功能', '骑手配送', '订单相关', '点餐体验', '商家经营', '履约流程'];
    
    // 生成模块下拉选择器（只使用固定选项）
    const moduleSelectOptions = fixedModules.map(module => 
        `<option value="${module}" ${item.module === module ? 'selected' : ''}>${module}</option>`
    ).join('');
    
    // 从数据中获取字段值，如果没有映射则为空
    const originalDetail = item.originalDetail || item.originalText || item.originalDescription || null;
    const originalTranslation = item.originalTranslation || item.translatedText || item.translation || null;
    const keyPoints = item.keyPoints || null;
    const sentimentAnalysis = item.sentimentAnalysis || item.sentiment || null;
    
    // 处理重点分析：如果是数组则转换为HTML，如果是字符串则直接显示
    let keyPointsHtml = '';
    if (keyPoints) {
        if (Array.isArray(keyPoints) && keyPoints.length > 0) {
            keyPointsHtml = keyPoints.map(point => `<div class="key-point-item">${point}</div>`).join('');
        } else if (typeof keyPoints === 'string' && keyPoints.trim()) {
            keyPointsHtml = `<div class="key-point-item">${keyPoints}</div>`;
        }
    }
    
    // 创建时间（模拟数据）
    const createdAt = item.createdAt || new Date().toISOString();
    const createdBy = item.createdBy || 'Bob';
    const createdTime = new Date(createdAt).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).replace(/\//g, '-');
    
    // 生成关联问题HTML
    let relatedIssuesHtml = '<div class="empty-state">暂无关联问题</div>';
    const problems = getProblemsFromStorage();
    
    if (item.relatedIssues && Array.isArray(item.relatedIssues) && item.relatedIssues.length > 0) {
        // 新数据格式：使用relatedIssues数组
        const relatedProblems = item.relatedIssues.map(issue => {
            return problems.find(p => p.id === issue.id);
        }).filter(Boolean);
        
        if (relatedProblems.length > 0) {
            relatedIssuesHtml = relatedProblems.map(problem => createRelatedIssueItemHtml(problem)).join('');
        }
    } else if (item.issues && item.issues !== '--') {
        // 兼容旧数据格式：issues是字符串
        const problem = problems.find(p => p.title === item.issues);
        if (problem) {
            relatedIssuesHtml = createRelatedIssueItemHtml(problem);
        } else {
            // 如果找不到问题对象，显示简单文本
            relatedIssuesHtml = `<div class="related-issue-item"><div class="related-issue-title">${item.issues}</div></div>`;
        }
    }
    
    return `
        <div class="voice-detail-drawer-overlay" id="voiceDetailDrawerOverlay">
            <div class="voice-detail-drawer" id="voiceDetailDrawer">
                <!-- 抽屉头部 -->
                <div class="voice-detail-drawer-header">
                    <div class="voice-detail-header-top">
                        <div class="voice-detail-header-left">
                            <input type="text" class="voice-detail-title voice-detail-title-editable" 
                                value="${item.summary || ''}" 
                                placeholder="请输入标题"
                                data-field="summary"
                                data-item-id="${item.id}" />
                            <div class="voice-detail-header-actions">
                                <button class="voice-detail-delete-btn" onclick="deleteVoiceItem('${item.id}')" title="删除">
                                    <img src="icon/删除-默认.svg" alt="删除" class="delete-icon" />
                                </button>
                                <button class="voice-detail-close-btn" onclick="closeVoiceDetailDrawer()" title="关闭">
                                    <img src="icon/关闭-默认.svg" alt="关闭" class="close-icon" />
                                </button>
                            </div>
                        </div>
                        <div class="voice-detail-tags">
                            <div class="voice-detail-tags-left">
                                <select class="voice-detail-status-select voice-detail-header-editable ${statusClass}" 
                                    data-field="status"
                                    data-item-id="${item.id}">
                                    <option value="pending" ${statusType === 'pending' ? 'selected' : ''}>待评估</option>
                                    <option value="key" ${statusType === 'key' ? 'selected' : ''}>关键反馈</option>
                                    <option value="unresolved" ${statusType === 'unresolved' ? 'selected' : ''}>暂不解决</option>
                                </select>
                                <div class="voice-detail-emotion-wrapper">
                                    <span class="voice-detail-emotion-display sentiment-display">
                                        <img src="${emotionIcon}" alt="${emotionLabel}" class="sentiment-icon" />
                                        <span class="sentiment-text">${emotionLabel}</span>
                                    </span>
                                    <select class="voice-detail-emotion-select voice-detail-header-editable" 
                                        data-field="emotion"
                                        data-item-id="${item.id}">
                                        <option value="negative" ${emotionType === 'negative' ? 'selected' : ''}>负向</option>
                                        <option value="neutral" ${emotionType === 'neutral' ? 'selected' : ''}>中性</option>
                                        <option value="positive" ${emotionType === 'positive' ? 'selected' : ''}>正向</option>
                                    </select>
                                </div>
                                <select class="voice-detail-module-select voice-detail-header-editable" 
                                    data-field="module"
                                    data-item-id="${item.id}">
                                    <option value="">--</option>
                                    ${moduleSelectOptions}
                                </select>
                            </div>
                            <div class="voice-detail-tags-right">
                                <span class="voice-detail-creator">创建于 ${createdTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 抽屉内容 -->
                <div class="voice-detail-drawer-body">
                    <!-- 原声详情区域 -->
                    <div class="voice-detail-section-header">
                        <span class="voice-detail-section-title active">原声详情</span>
                    </div>
                    <div class="voice-detail-section-content voice-detail-original-content">
                        <!-- 原声详情 -->
                        <div class="voice-detail-field">
                            <div class="voice-detail-field-label">原声详情</div>
                            <textarea class="voice-detail-field-value voice-detail-field-editable" 
                                data-field="originalDetail" 
                                data-item-id="${item.id}"
                                placeholder="--">${originalDetail || ''}</textarea>
                        </div>
                        
                        <!-- 原声转译 -->
                        <div class="voice-detail-field">
                            <div class="voice-detail-field-label">原声转译</div>
                            <textarea class="voice-detail-field-value voice-detail-field-editable" 
                                data-field="originalTranslation" 
                                data-item-id="${item.id}"
                                placeholder="--">${originalTranslation || ''}</textarea>
                        </div>
                        
                        <!-- 重点分析 -->
                        <div class="voice-detail-field">
                            <div class="voice-detail-field-label">重点分析</div>
                            <textarea class="voice-detail-field-value voice-detail-field-editable" 
                                data-field="keyPoints" 
                                data-item-id="${item.id}"
                                placeholder="--">${Array.isArray(keyPoints) ? keyPoints.join('\n') : (keyPoints || '')}</textarea>
                        </div>
                        
                        <!-- 情感分析 -->
                        <div class="voice-detail-field">
                            <div class="voice-detail-field-label">情感分析</div>
                            <textarea class="voice-detail-field-value voice-detail-field-editable" 
                                data-field="sentimentAnalysis" 
                                data-item-id="${item.id}"
                                placeholder="--">${sentimentAnalysis || ''}</textarea>
                        </div>
                    </div>
                    
                    <!-- 其他内容区域 -->
                    <div class="voice-detail-section-content voice-detail-other-content">
                        <!-- Tab导航 -->
                        <div class="voice-detail-tabs-container">
                            <div class="voice-detail-tabs-left">
                                <button class="voice-detail-filter-tab active" data-tab="related-issues">关联问题</button>
                                <button class="voice-detail-filter-tab" data-tab="operation-records">操作记录</button>
                            </div>
                            <div class="voice-detail-tab-actions">
                                <button class="voice-detail-action-btn link-btn" onclick="openRelatedIssueModal('${item.id}')">
                                    <img src="icon/关联原声.svg" alt="关联" class="action-btn-icon" />
                                    <span>关联问题</span>
                                </button>
                                <button class="voice-detail-action-btn create-btn" onclick="defineAsProblem('${item.id}')">
                                    <img src="icon/看板-定义为问题.svg" alt="定义为问题" class="action-btn-icon" />
                                    <span>定义为问题</span>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Tab内容 -->
                        <div class="voice-detail-tab-content">
                            <div class="voice-detail-tab-pane active" id="related-issues-tab">
                                <div class="related-issues-list">
                                    ${relatedIssuesHtml}
                                </div>
                            </div>
                            <div class="voice-detail-tab-pane" id="operation-records-tab">
                                <div class="empty-state">暂无操作记录</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 切换用户原声详情
function switchVoiceDetail(id) {
    const stored = localStorage.getItem('voicePoolData');
    let voicePoolData = [];
    if (stored) {
        voicePoolData = JSON.parse(stored);
    }
    const item = voicePoolData.find(item => item.id === id);
    
    if (!item) {
        return;
    }
    
    // 更新抽屉内容
    const drawerHtml = createVoiceDetailDrawerHtml(item, voicePoolData);
    const overlay = document.getElementById('voiceDetailDrawerOverlay');
    if (overlay) {
        overlay.outerHTML = drawerHtml;
    }
    
    // 重新绑定事件
    bindVoiceDetailSwitchEvents(voicePoolData);
    
    // 重新绑定字段编辑事件
    bindVoiceDetailFieldEditEvents();
}

// 绑定用户原声详情切换事件
function bindVoiceDetailSwitchEvents(allData) {
    // 绑定标签页切换
    const tabButtons = document.querySelectorAll('.voice-detail-filter-tab');
    tabButtons.forEach(btn => {
        // 移除旧的事件监听器
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // 更新按钮状态
            document.querySelectorAll('.voice-detail-filter-tab').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 更新内容显示
            document.querySelectorAll('.voice-detail-tab-pane').forEach(pane => pane.classList.remove('active'));
            const targetPane = document.getElementById(`${tabName}-tab`);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

// 绑定字段编辑事件
function bindVoiceDetailFieldEditEvents() {
    // 绑定所有可编辑字段的失焦事件
    const editableFields = document.querySelectorAll('.voice-detail-field-editable');
    editableFields.forEach(field => {
        // 移除旧的事件监听器（通过克隆节点）
        const newField = field.cloneNode(true);
        field.parentNode.replaceChild(newField, field);
        
        newField.addEventListener('blur', function() {
            const fieldName = this.getAttribute('data-field');
            const itemId = this.getAttribute('data-item-id');
            const value = this.value.trim();
            
            if (!itemId || !fieldName) return;
            
            // 获取数据
            const stored = localStorage.getItem('voicePoolData');
            let voicePoolData = [];
            if (stored) {
                voicePoolData = JSON.parse(stored);
            }
            
            // 找到对应的数据项
            const item = voicePoolData.find(item => item.id === itemId);
            if (!item) return;
            
            // 保存字段值
            if (fieldName === 'keyPoints') {
                // 重点分析：如果是多行，转换为数组；否则保持字符串
                if (value) {
                    const lines = value.split('\n').filter(line => line.trim());
                    item.keyPoints = lines.length > 1 ? lines : value;
                } else {
                    item.keyPoints = null;
                }
            } else {
                item[fieldName] = value || null;
            }
            
            // 保存到localStorage
            localStorage.setItem('voicePoolData', JSON.stringify(voicePoolData));
            
            console.log(`已保存字段 ${fieldName}:`, value);
            
            refreshVoicePoolDisplay(voicePoolData);
        });
    });
    
    // 更新状态选择器的样式
    function updateStatusSelectStyle(selectElement) {
        const value = selectElement.value;
        // 移除所有状态类
        selectElement.classList.remove('status-pending', 'status-key', 'status-unresolved');
        
        if (value === 'pending') {
            selectElement.classList.add('status-pending');
        } else if (value === 'key') {
            selectElement.classList.add('status-key');
        } else if (value === 'unresolved') {
            selectElement.classList.add('status-unresolved');
        }
    }
    
    // 更新情感选择器的显示
    function updateEmotionSelectDisplay(selectElement) {
        const wrapper = selectElement.closest('.voice-detail-emotion-wrapper');
        if (!wrapper) return;
        
        const displayElement = wrapper.querySelector('.voice-detail-emotion-display');
        if (!displayElement) return;
        
        const value = selectElement.value;
        const emotionMap = {
            'negative': { type: 'negative', label: '负向', icon: 'icon/负向.svg' },
            'neutral': { type: 'neutral', label: '中性', icon: 'icon/中性.svg' },
            'positive': { type: 'positive', label: '正向', icon: 'icon/正向.svg' }
        };
        
        const emotion = emotionMap[value] || emotionMap['neutral'];
        const iconElement = displayElement.querySelector('.sentiment-icon');
        const textElement = displayElement.querySelector('.sentiment-text');
        
        if (iconElement) {
            iconElement.src = emotion.icon;
            iconElement.alt = emotion.label;
        }
        if (textElement) {
            textElement.textContent = emotion.label;
        }
    }
    
    // 绑定header字段的编辑事件
    const headerEditableFields = document.querySelectorAll('.voice-detail-header-editable');
    headerEditableFields.forEach(field => {
        const newField = field.cloneNode(true);
        field.parentNode.replaceChild(newField, field);
        
        // 如果是状态选择器，初始化样式
        if (newField.classList.contains('voice-detail-status-select')) {
            updateStatusSelectStyle(newField);
        }
        
        // 如果是情感选择器，初始化显示
        if (newField.classList.contains('voice-detail-emotion-select')) {
            updateEmotionSelectDisplay(newField);
        }
        
        newField.addEventListener('change', function() {
            const fieldName = this.getAttribute('data-field');
            const itemId = this.getAttribute('data-item-id');
            let value = this.value.trim();
            
            if (!itemId || !fieldName) return;
            
            // 如果是状态选择器，更新样式
            if (fieldName === 'status' && this.classList.contains('voice-detail-status-select')) {
                updateStatusSelectStyle(this);
            }
            
            // 如果是情感选择器，更新显示
            if (fieldName === 'emotion' && this.classList.contains('voice-detail-emotion-select')) {
                updateEmotionSelectDisplay(this);
            }
            
            // 获取数据
            const stored = localStorage.getItem('voicePoolData');
            let voicePoolData = [];
            if (stored) {
                voicePoolData = JSON.parse(stored);
            }
            
            // 找到对应的数据项
            const item = voicePoolData.find(item => item.id === itemId);
            if (!item) return;
            
            // 保存字段值
            if (fieldName === 'summary') {
                item.summary = value || null;
            } else if (fieldName === 'status') {
                // 状态映射
                const statusMap = {
                    'pending': { text: '待评估', type: 'pending' },
                    'key': { text: '关键反馈', type: 'key' },
                    'unresolved': { text: '暂不解决', type: 'unresolved' }
                };
                item.status = statusMap[value] || statusMap['pending'];
            } else if (fieldName === 'emotion') {
                // 情感映射
                const emotionMap = {
                    'negative': { type: 'negative', label: '负向' },
                    'neutral': { type: 'neutral', label: '中性' },
                    'positive': { type: 'positive', label: '正向' }
                };
                item.emotion = emotionMap[value] || emotionMap['neutral'];
            } else if (fieldName === 'module') {
                item.module = value || null;
            }
            
            // 保存到localStorage
            localStorage.setItem('voicePoolData', JSON.stringify(voicePoolData));
            
            console.log(`已保存header字段 ${fieldName}:`, value);
            
            refreshVoicePoolDisplay(voicePoolData);
        });
    });
    
    // 绑定标题输入框的失焦事件
    const titleInput = document.querySelector('.voice-detail-title-editable');
    if (titleInput) {
        const newTitleInput = titleInput.cloneNode(true);
        titleInput.parentNode.replaceChild(newTitleInput, titleInput);
        
        newTitleInput.addEventListener('blur', function() {
            const itemId = this.getAttribute('data-item-id');
            const value = this.value.trim();
            
            if (!itemId) return;
            
            // 获取数据
            const stored = localStorage.getItem('voicePoolData');
            let voicePoolData = [];
            if (stored) {
                voicePoolData = JSON.parse(stored);
            }
            
            // 找到对应的数据项
            const item = voicePoolData.find(item => item.id === itemId);
            if (!item) return;
            
            // 保存标题
            item.summary = value || null;
            
            // 保存到localStorage
            localStorage.setItem('voicePoolData', JSON.stringify(voicePoolData));
            
            console.log('已保存标题:', value);
            
            refreshVoicePoolDisplay(voicePoolData);
        });
    }
}

function refreshVoicePoolDisplay(updatedData) {
    if (currentMainPage !== 'voice-pool') {
        return;
    }
    let data = updatedData;
    if (!data) {
        data = getVoicePoolDataFromStorage();
    }
    applyVoicePoolFilter(currentVoicePoolFilter, data);
}

// 绑定表格标题点击事件
function bindTableTitleClickEvents() {
    const tableBody = document.getElementById('voice-pool-table-body');
    if (!tableBody) return;
    
    // 使用事件委托处理所有标题点击
    tableBody.addEventListener('click', function(e) {
        const summaryLink = e.target.closest('.summary-link');
        if (summaryLink) {
            e.preventDefault();
            e.stopPropagation();
            const row = summaryLink.closest('tr');
            if (row) {
                const itemId = row.getAttribute('data-row-id');
                if (itemId) {
                    // 如果抽屉已打开，切换内容；否则打开抽屉
                    const drawer = document.getElementById('voiceDetailDrawer');
                    if (drawer && drawer.classList.contains('show')) {
                        switchVoiceDetail(itemId);
                    } else {
                        viewVoiceDetail(itemId);
                    }
                }
            }
        }
    });
}

// 显示用户原声详情更多菜单
function showVoiceDetailMoreMenu() {
    // TODO: 实现更多菜单功能
    console.log('显示更多菜单');
}

// 删除用户原声
function deleteVoiceItem(id) {
    // 确认删除
    if (!confirm('确定要删除这条原声吗？')) {
        return;
    }
    
    // 从localStorage读取数据
    let allData = [];
    try {
        const stored = localStorage.getItem('voicePoolData');
        if (stored) {
            allData = JSON.parse(stored);
        }
    } catch (error) {
        console.error('读取数据失败:', error);
        if (typeof showNotification === 'function') {
            showNotification('读取数据失败', 'error');
        }
        return;
    }
    
    // 删除数据
    const filteredData = allData.filter(item => item.id !== id);
    
    // 保存到localStorage
    try {
        localStorage.setItem('voicePoolData', JSON.stringify(filteredData));
        if (typeof showNotification === 'function') {
            showNotification('删除成功', 'success');
        }
        
        // 关闭抽屉
        closeVoiceDetailDrawer();
        
        // 重新渲染表格（如果表格存在）
        if (typeof applyVoicePoolFilter === 'function' && typeof currentVoicePoolFilter !== 'undefined') {
            applyVoicePoolFilter(currentVoicePoolFilter, filteredData);
        }
        if (typeof updateVoicePoolStats === 'function') {
            updateVoicePoolStats(filteredData);
        }
    } catch (error) {
        console.error('保存数据失败:', error);
        if (typeof showNotification === 'function') {
            showNotification('保存数据失败', 'error');
        }
    }
}

// 关闭用户原声详情抽屉
function closeVoiceDetailDrawer() {
    const overlay = document.getElementById('voiceDetailDrawerOverlay');
    const drawer = document.getElementById('voiceDetailDrawer');
    
    if (overlay && drawer) {
        overlay.classList.remove('show');
        drawer.classList.remove('show');
        
        // 等待动画完成后移除元素
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 300);
    }
}

// 添加用户原声详情抽屉样式
function addVoiceDetailDrawerStyles() {
    // 检查样式是否已添加
    if (document.getElementById('voiceDetailDrawerStyles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'voiceDetailDrawerStyles';
    style.textContent = `
        .voice-detail-drawer-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            z-index: 2000;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        }
        
        .voice-detail-drawer-overlay.show {
            opacity: 1;
        }
        
        .voice-detail-drawer-overlay.show .voice-detail-drawer {
            pointer-events: auto;
        }
        
        .voice-detail-drawer {
            position: fixed;
            top: 0;
            right: 0;
            width: 660px;
            height: 100vh;
            background: #ffffff;
            box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .voice-detail-drawer.show {
            transform: translateX(0);
        }
        
        .voice-detail-drawer-header {
            flex-shrink: 0;
            min-height: 110px;
            padding: 24px;
            border-bottom: 1px solid #F2F2F5;
            background: linear-gradient(135deg, #F4F1FF 0%, #FFFFFF 50%, #FAFFE1 100%);
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
        }
        
        .voice-detail-header-top {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .voice-detail-header-left {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
        }
        
        .voice-detail-title {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            color: #333;
            line-height: 1.4;
            flex: 1;
        }
        
        .voice-detail-title-editable {
            width: 100%;
            border: none;
            background: transparent;
            font-size: 24px;
            font-weight: 600;
            color: #333;
            line-height: 1.4;
            padding: 0;
            outline: none;
            flex: 1;
            font-family: inherit;
        }
        
        .voice-detail-title-editable:focus {
            background: rgba(255, 255, 255, 0.5);
            border-radius: 4px;
            padding: 2px 4px;
        }
        
        .voice-detail-header-actions {
            display: flex;
            gap: 12px;
            align-items: center;
        }
        
        .voice-detail-more-btn,
        .voice-detail-close-btn,
        .voice-detail-delete-btn {
            width: 28px;
            height: 28px;
            border: none;
            background: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all 0.2s ease;
            padding: 0;
        }
        
        .voice-detail-more-btn:hover {
            background: #f5f5f5;
        }
        
        .more-icon {
            width: 28px;
            height: 28px;
            color: #333;
            transition: all 0.2s ease;
        }
        
        .voice-detail-more-btn:hover .more-icon {
            color: #1890ff;
        }
        
        .nav-icon,
        .close-icon,
        .delete-icon {
            width: 28px;
            height: 28px;
            transition: all 0.2s ease;
        }
        
        .voice-detail-close-btn:hover .close-icon {
            content: url('icon/关闭-悬停.svg');
        }
        
        .voice-detail-delete-btn:hover .delete-icon {
            content: url('icon/删除-悬停.svg');
        }
        
        .voice-detail-tags {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
        }
        
        .voice-detail-tags-left {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
        }
        
        .voice-detail-tags-right {
            display: flex;
            align-items: center;
            margin-left: auto;
        }
        
        .voice-detail-creator {
            color: #BABABF;
            font-size: 12px;
            line-height: 18px;
            white-space: nowrap;
        }
        
        .status-tag {
            display: inline-flex;
            align-items: center;
            padding: 0;
            border: none;
            background: transparent;
            font-size: 12px;
            line-height: 18px;
            font-weight: 400;
            color: #8A8A91;
        }
        
        .status-pending-tag {
            color: #8A8A91;
        }
        
        .status-key-tag {
            color: #8A8A91;
        }
        
        .status-unresolved-tag {
            color: #8A8A91;
        }
        
        .emotion-tag {
            color: #8A8A91;
        }
        
        .module-tag {
            color: #8A8A91;
        }
        
        /* Header可编辑字段样式 */
        .voice-detail-header-editable {
            display: inline-flex;
            align-items: center;
            padding: 0 4px;
            border: 1px solid transparent;
            background: transparent;
            font-size: 12px;
            line-height: 18px;
            font-weight: 400;
            color: #8A8A91;
            border-radius: 4px;
            transition: all 0.2s ease;
            font-family: inherit;
        }
        
        .voice-detail-status-select,
        .voice-detail-emotion-select,
        .voice-detail-module-select {
            appearance: none;
            background-image: none;
            background-repeat: no-repeat;
            background-position: right 4px center;
            background-size: 12px;
            padding: 0 4px;
            cursor: pointer;
            height: 22px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid transparent;
            background-color: transparent;
            border-radius: 4px;
            font-size: 12px;
            line-height: 18px;
            font-weight: 500;
            box-sizing: border-box;
        }
        
        /* 状态选择器 - 标签样式，默认宽度60px，默认显示彩色边框 */
        .voice-detail-status-select {
            min-width: 60px;
            width: auto;
            border: 1px solid;
        }
        
        /* 状态选择器的颜色类 - 标签样式（彩色文字和边框） */
        .voice-detail-status-select.status-pending {
            color: #83AF3B;
            border-color: #83AF3B;
        }
        
        .voice-detail-status-select.status-key {
            color: #A794FF;
            border-color: #A794FF;
        }
        
        .voice-detail-status-select.status-unresolved {
            color: #BABABF;
            border-color: #BABABF;
        }
        
        /* 情感选择器包装器 - 默认宽度60px，可动态变化 */
        .voice-detail-emotion-wrapper {
            position: relative;
            display: inline-flex;
            align-items: center;
            min-width: 60px;
            width: auto;
            height: 22px;
        }
        
        /* 情感选择器显示层 - icon+文字样式 */
        .voice-detail-emotion-display {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            pointer-events: none;
            z-index: 1;
            padding: 0 4px;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            position: relative;
        }
        
        .voice-detail-emotion-display .sentiment-icon {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
            border-radius: 4px;
        }
        
        .voice-detail-emotion-display .sentiment-text {
            font-size: 12px;
            line-height: 18px;
            font-weight: 400;
            color: #8A8A91;
        }
        
        /* 情感选择器下拉按钮 - 默认隐藏 */
        .voice-detail-emotion-display::after {
            content: '';
            display: none;
            width: 12px;
            height: 12px;
            margin-left: 4px;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23BABABF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: center;
            background-size: contain;
            flex-shrink: 0;
        }
        
        /* 悬停时显示下拉按钮 */
        .voice-detail-emotion-wrapper:hover .voice-detail-emotion-display::after {
            display: block;
        }
        
        /* 情感选择器select覆盖在显示层上 */
        .voice-detail-emotion-wrapper .voice-detail-emotion-select {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            z-index: 2;
            cursor: pointer;
            padding: 0;
        }
        
        /* 模块选择器 - 纯文本样式，文字颜色8A8A91 */
        .voice-detail-module-select {
            color: #8A8A91;
            font-weight: 400;
        }
        
        /* 悬停时显示白色背景和下拉按钮 */
        .voice-detail-status-select:hover,
        .voice-detail-module-select:hover {
            background-color: #ffffff;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23BABABF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
            padding-right: 20px;
        }
        
        /* 悬停时情感选择器显示层背景 */
        .voice-detail-emotion-wrapper:hover {
            background-color: #ffffff;
        }
        
        .voice-detail-emotion-wrapper:hover .voice-detail-emotion-display {
            background-color: #ffffff;
        }
        
        /* 悬停时状态选择器保持彩色边框 */
        .voice-detail-status-select.status-pending:hover {
            border-color: #83AF3B;
        }
        
        .voice-detail-status-select.status-key:hover {
            border-color: #A794FF;
        }
        
        .voice-detail-status-select.status-unresolved:hover {
            border-color: #BABABF;
        }
        
        .voice-detail-status-select:focus,
        .voice-detail-emotion-select:focus,
        .voice-detail-module-select:focus {
            outline: none;
            background-color: #ffffff;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23BABABF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
            padding-right: 20px;
        }
        
        /* 聚焦时状态选择器保持彩色边框 */
        .voice-detail-status-select.status-pending:focus {
            border-color: #83AF3B;
        }
        
        .voice-detail-status-select.status-key:focus {
            border-color: #A794FF;
        }
        
        .voice-detail-status-select.status-unresolved:focus {
            border-color: #BABABF;
        }
        
        /* 聚焦时情感选择器显示层背景 */
        .voice-detail-emotion-wrapper:focus-within .voice-detail-emotion-display {
            background-color: #ffffff;
        }
        
        .voice-detail-module-select {
            min-width: 80px;
        }
        
        
        .voice-detail-drawer-body {
            flex: 1;
            overflow-y: auto;
            padding: 20px 24px;
            display: flex;
            flex-direction: column;
            gap: 24px;
        }
        
        .voice-detail-section-header {
            background: transparent;
            padding: 0;
            border-bottom: none;
            flex-shrink: 0;
        }
        
        .voice-detail-section-title {
            padding: 6px 0;
            border: none;
            background: transparent;
            border-radius: 6px;
            font-size: 16px;
            line-height: 20px;
            font-weight: 400;
            color: #8A8A91;
            cursor: default;
            position: relative;
            z-index: 1;
        }
        
        .voice-detail-section-title.active {
            background: transparent;
            color: #000000;
            font-weight: bold;
            z-index: 2;
        }
        
        .voice-detail-section-title.active::after {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%) rotate(2deg);
            width: 70px;
            height: 10px;
            background-color: #D7FE03;
            border-radius: 4px;
            z-index: -1;
            box-shadow: 0 4px 10px 0 rgba(215, 254, 3, 0.3);
        }
        
        .voice-detail-section-content {
            padding: 20px 0;
            border-radius: 0;
        }
        
        .voice-detail-original-content {
            max-height: 520px;
            overflow-y: auto;
            padding: 0;
        }
        
        .voice-detail-other-content {
            padding-top: 0;
            margin-top: 8px;
        }
        
        .voice-detail-other-content .voice-detail-tabs-container {
            margin-top: 0;
        }
        
        .voice-detail-field {
            margin-bottom: 20px;
        }
        
        .voice-detail-field:last-child {
            margin-bottom: 0;
        }
        
        .voice-detail-field-label {
            font-size: 14px;
            font-weight: 500;
            line-height: 20px;
            color: #000;
            margin-bottom: 8px;
        }
        
        .voice-detail-field-value {
            font-size: 14px;
            color: #333;
            line-height: 1.6;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 6px;
            min-height: 20px;
        }
        
        .voice-detail-field-value:empty::before {
            content: '--';
            color: #999;
        }
        
        .voice-detail-field-editable {
            width: 100%;
            border: 1px solid #F4F4F4;
            resize: vertical;
            font-family: inherit;
            font-size: 14px;
            color: #333;
            line-height: 1.6;
            padding: 12px;
            background: #fff;
            border-radius: 8px;
            min-height: 60px;
            transition: all 0.2s ease;
            outline: none;
            box-sizing: border-box;
        }
        
        .voice-detail-field-editable:hover {
            border-color: #D9D9DE;
        }
        
        .voice-detail-field-editable:focus {
            border-color: #000;
            background: #ffffff;
            box-shadow: none;
        }
        
        .voice-detail-field-editable::placeholder {
            color: #999;
        }
        
        .key-point-item {
            font-size: 14px;
            color: #333;
            line-height: 1.6;
            margin-bottom: 4px;
        }
        
        .key-point-item:last-child {
            margin-bottom: 0;
        }
        
        
        .voice-detail-tabs-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            overflow: visible;
            margin-bottom: 16px;
        }
        
        .voice-detail-tabs-left {
            display: flex;
            align-items: center;
            gap: 24px;
        }
        
        .voice-detail-filter-tab {
            padding: 6px 0;
            border: none;
            background: transparent;
            border-radius: 6px;
            font-size: 16px;
            line-height: 20px;
            font-weight: 400;
            color: #8A8A91;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            z-index: 1;
        }
        
        .voice-detail-filter-tab:hover {
            background: #f5f5f5;
            color: #333;
        }
        
        .voice-detail-filter-tab.active {
            background: transparent;
            color: #000000;
            font-weight: bold;
            z-index: 2;
        }
        
        .voice-detail-filter-tab.active::after {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%) rotate(2deg);
            width: 70px;
            height: 10px;
            background-color: #D7FE03;
            border-radius: 4px;
            z-index: -1;
            box-shadow: 0 4px 10px 0 rgba(215, 254, 3, 0.3);
        }
        
        .voice-detail-tab-content {
            position: relative;
        }
        
        .voice-detail-tab-pane {
            display: none;
        }
        
        .voice-detail-tab-pane.active {
            display: block;
        }
        
        .voice-detail-tab-actions {
            display: flex;
            gap: 12px;
        }
        
        .voice-detail-action-btn {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 6px 16px;
            border: 1px solid #d9d9d9;
            border-radius: 8px;
            background: #ffffff;
            font-size: 14px;
            line-height: 20px;
            font-weight: bold;
            color: #333;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .voice-detail-action-btn:hover {
            border-color: #1890ff;
            color: #1890ff;
        }
        
        .voice-detail-action-btn.create-btn {
            background: #000000;
            color: #ffffff;
            border-color: #000000;
        }
        
        .voice-detail-action-btn.create-btn:hover {
            background: #333333;
            border-color: #333333;
            color: #ffffff;
        }
        
        .voice-detail-action-btn.link-btn {
            background: #ffffff;
            color: #333;
        }
        
        .voice-detail-action-btn.link-btn:hover {
            border-color: #BABABF;
            color: #000;
        }
        
        .action-btn-icon {
            width: 16px;
            height: 16px;
        }
        
        .voice-detail-action-btn.create-btn .action-btn-icon {
            filter: brightness(0) invert(1);
        }
        
        .related-issues-list {
            min-height: 120px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .related-issue-item {
            padding: 12px;
            border: 1px solid #F2F2F5;
            border-radius: 8px;
            background: transparent;
            display: flex;
            flex-direction: column;
            gap: 4px;
            transition: border-color 0.2s ease, background 0.2s ease;
        }
        
        .related-issue-item:hover {
            border-color: #BABABF;
            background: #ffffff;
        }
        
        .related-issue-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .related-issue-title,
        .related-issue-title-link {
            font-size: 14px;
            font-weight: 500;
            color: #000;
            text-decoration: none;
        }
        
        .related-issue-title-link:hover {
            color: #1890ff;
        }
        
        .related-issue-meta-row {
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
        }
        
        .related-issue-status .kanban-emotion-text {
            color: #8A8A91;
        }
        
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #999;
            font-size: 14px;
        }
        
        .summary-link {
            color: #000;
            text-decoration: none;
            transition: color 0.2s ease;
            font-weight: 500;
        }
        
        .summary-link:hover {
            color: #000;
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);
}

// 定义为问题
function defineAsProblem(id) {
    console.log('定义为问题:', id);
    
    // 获取数据项
    const stored = localStorage.getItem('voicePoolData');
    let voicePoolData = [];
    if (stored) {
        voicePoolData = JSON.parse(stored);
    }
    const item = voicePoolData.find(item => item.id === id);
    
    if (!item) {
        showToast('未找到数据项', 'error');
        return;
    }
    
    // 显示模态弹窗
    displayDefineProblemModal(item);
}

// 显示定义为问题模态弹窗
function displayDefineProblemModal(item) {
    // 如果已存在模态弹窗，先移除
    const existingModal = document.getElementById('defineProblemModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 构建关联原声选项（从所有数据中获取）
    const stored = localStorage.getItem('voicePoolData');
    let voicePoolData = [];
    if (stored) {
        voicePoolData = JSON.parse(stored);
    }
    
    const originalSoundOptions = voicePoolData.map(v => ({
        id: v.id,
        summary: v.summary || '--'
    }));
    
    // 当前选中的关联原声
    const currentOriginalSound = item.summary || '--';
    
    const modalHtml = `
        <div class="define-problem-modal-overlay" id="defineProblemModalOverlay" onclick="closeDefineProblemModal()">
            <div class="define-problem-modal" id="defineProblemModal" onclick="event.stopPropagation()">
                <div class="define-problem-modal-header">
                    <h2 class="define-problem-modal-title">定义为问题</h2>
                    <div class="define-problem-modal-header-actions">
                        <button class="define-problem-close-btn" onclick="closeDefineProblemModal()">
                            <img src="icon/关闭-默认.svg" alt="关闭" class="close-icon" />
                        </button>
                    </div>
                </div>
                
                <div class="define-problem-modal-body">
                    <!-- 问题详情 -->
                    <div class="define-problem-section">
                        <div class="define-problem-section-header">
                            <div class="define-problem-section-title">问题详情</div>
                            <button class="define-problem-smart-fill-btn" onclick="smartFillProblem('${item.id}')">
                                <img src="icon/AI录入.svg" alt="智能填充" class="smart-fill-icon" />
                                <span>智能填充问题</span>
                            </button>
                        </div>
                        <div class="define-problem-form-group">
                            <label class="define-problem-label">关联原声</label>
                            <div class="define-problem-select-wrapper">
                                <select class="define-problem-select" id="relatedOriginalSound">
                                    ${originalSoundOptions.map(opt => 
                                        `<option value="${opt.id}" ${opt.summary === currentOriginalSound ? 'selected' : ''}>${opt.summary}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="define-problem-form-group">
                            <label class="define-problem-label">问题标题 <span class="required-mark">*</span></label>
                            <input type="text" class="define-problem-input" id="problemTitle" placeholder="请输入" />
                            <div class="define-problem-error-message" id="problemTitleError" style="display: none;"></div>
                        </div>
                        <div class="define-problem-form-group">
                            <label class="define-problem-label">问题描述</label>
                            <textarea class="manual-textarea define-problem-textarea" id="problemDescription" placeholder="请输入" rows="4"></textarea>
                        </div>
                        <div class="define-problem-form-group define-problem-resolution-status-group">
                            <label class="define-problem-label">解决状态</label>
                            <div class="define-problem-select-wrapper">
                                <select class="define-problem-select" id="resolutionStatus">
                                    <option value="待确认" selected>待确认</option>
                                    <option value="开发中">开发中</option>
                                    <option value="待走查">待走查</option>
                                    <option value="已解决">已解决</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 归属信息 -->
                    <div class="define-problem-section">
                        <div class="define-problem-section-title">归属信息</div>
                        <div class="define-problem-form-group">
                            <label class="define-problem-label">所属地区 <span class="required-mark">*</span></label>
                            <div class="define-problem-checkbox-group">
                                <label class="define-problem-checkbox-label">
                                    <input type="checkbox" name="region" value="BR" class="define-problem-checkbox" />
                                    <span>BR</span>
                                </label>
                                <label class="define-problem-checkbox-label">
                                    <input type="checkbox" name="region" value="SSL" class="define-problem-checkbox" />
                                    <span>SSL</span>
                                </label>
                            </div>
                            <div class="define-problem-error-message" id="regionError" style="display: none;"></div>
                        </div>
                        <div class="define-problem-form-group">
                            <label class="define-problem-label">归属终端 <span class="required-mark">*</span></label>
                            <div class="define-problem-checkbox-group">
                                <label class="define-problem-checkbox-label">
                                    <input type="checkbox" name="terminal" value="门店端" class="define-problem-checkbox" />
                                    <span>门店端</span>
                                </label>
                                <label class="define-problem-checkbox-label">
                                    <input type="checkbox" name="terminal" value="管理端" class="define-problem-checkbox" />
                                    <span>管理端</span>
                                </label>
                                <label class="define-problem-checkbox-label">
                                    <input type="checkbox" name="terminal" value="BD-App" class="define-problem-checkbox" />
                                    <span>BD-App</span>
                                </label>
                            </div>
                            <div class="define-problem-error-message" id="terminalError" style="display: none;"></div>
                        </div>
                        <div class="define-problem-form-group">
                            <label class="define-problem-label">指派给</label>
                            <div class="define-problem-select-wrapper">
                                <select class="define-problem-select" id="assignTo">
                                    <option value="">请选择指派给</option>
                                    <option value="Amy">Amy</option>
                                    <option value="Bob">Bob</option>
                                    <option value="Charlie">Charlie</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="define-problem-modal-footer">
                    <button class="define-problem-btn define-problem-btn-cancel" onclick="closeDefineProblemModal()">取消</button>
                    <button class="define-problem-btn define-problem-btn-create" id="createProblemBtn" onclick="createProblem('${item.id}')">新建</button>
                </div>
            </div>
        </div>
    `;
    
    // 插入模态弹窗
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 添加样式
    addDefineProblemModalStyles();
    
    // 添加表单验证逻辑
    setupProblemFormValidation();
}

// 设置问题表单验证
function setupProblemFormValidation() {
    const titleInput = document.getElementById('problemTitle');
    
    if (!titleInput) return;
    
    // 监听问题标题输入变化，清除错误提示
    titleInput.addEventListener('input', () => {
        clearFieldError('problemTitle');
    });
    titleInput.addEventListener('change', () => {
        clearFieldError('problemTitle');
    });
    
    // 监听所属地区复选框变化，清除错误提示
    const regionCheckboxes = document.querySelectorAll('input[name="region"]');
    regionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            clearFieldError('region');
        });
    });
    
    // 监听归属终端复选框变化，清除错误提示
    const terminalCheckboxes = document.querySelectorAll('input[name="terminal"]');
    terminalCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            clearFieldError('terminal');
        });
    });
}

// 显示字段错误提示
function showFieldError(fieldId, message) {
    const errorEl = document.getElementById(`${fieldId}Error`);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
    
    // 添加错误样式到输入框
    const inputEl = document.getElementById(fieldId);
    if (inputEl) {
        inputEl.classList.add('define-problem-input-error');
    }
    
    // 如果是复选框组，给容器添加错误样式
    if (fieldId === 'region' || fieldId === 'terminal') {
        const checkboxGroup = document.querySelector(`input[name="${fieldId}"]`)?.closest('.define-problem-checkbox-group');
        if (checkboxGroup) {
            checkboxGroup.classList.add('define-problem-checkbox-group-error');
        }
    }
}

// 清除字段错误提示
function clearFieldError(fieldId) {
    const errorEl = document.getElementById(`${fieldId}Error`);
    if (errorEl) {
        errorEl.style.display = 'none';
    }
    
    // 移除错误样式
    const inputEl = document.getElementById(fieldId);
    if (inputEl) {
        inputEl.classList.remove('define-problem-input-error');
    }
    
    // 如果是复选框组，移除错误样式
    if (fieldId === 'region' || fieldId === 'terminal') {
        const checkboxGroup = document.querySelector(`input[name="${fieldId}"]`)?.closest('.define-problem-checkbox-group');
        if (checkboxGroup) {
            checkboxGroup.classList.remove('define-problem-checkbox-group-error');
        }
    }
}

// 清除所有错误提示
function clearAllErrors() {
    clearFieldError('problemTitle');
    clearFieldError('region');
    clearFieldError('terminal');
}

// 添加定义为问题模态弹窗样式
function addDefineProblemModalStyles() {
    // 检查样式是否已添加
    if (document.getElementById('defineProblemModalStyles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'defineProblemModalStyles';
    style.textContent = `
        .define-problem-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.2s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .define-problem-modal {
            background: #ffffff;
            border-radius: 8px;
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            animation: slideUp 0.3s ease;
            overflow: hidden;
        }
        
        @keyframes slideUp {
            from {
                transform: translateY(20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .define-problem-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px 12px 24px;
        }
        
        .define-problem-modal-title {
            font-size: 18px;
            font-weight: 700;
            color: #333;
            margin: 0;
        }
        
        .define-problem-modal-header-actions {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .define-problem-section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
        }
        
        .define-problem-smart-fill-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            height: 30px;
            padding: 0 16px;
            background: #D7FE03;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            color: #333;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
        }
        
        .define-problem-smart-fill-btn:hover:not(:disabled) {
            background: #C4E603;
        }
        
        .define-problem-smart-fill-btn:disabled {
            cursor: not-allowed;
        }
        
        .define-problem-smart-fill-btn img {
            width: 16px;
            height: 16px;
            display: block;
        }
        
        .smart-fill-loading-icon {
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* 智能填充禁用状态样式 */
        .smart-fill-disabled {
            background-color: #F6F8FB !important;
            cursor: not-allowed;
        }
        
        .smart-fill-disabled:focus {
            outline: none;
            border-color: #F4F4F4 !important;
        }
        
        /* 智能填充完成后的高亮效果 - 旋转渐变边框 */
        @keyframes rotate-gradient-border {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
        
        .smart-fill-highlight {
            position: relative !important;
            border-radius: 8px;
            border: 1.5px solid transparent !important;
            background: linear-gradient(#fff, #fff) padding-box,
                        linear-gradient(90deg, #EFCFFC, #C9E1FF, #CEF5E2, #EFCFFC) border-box !important;
            background-clip: padding-box, border-box !important;
            background-origin: padding-box, border-box !important;
        }
        
        .smart-fill-icon {
            width: 16px;
            height: 16px;
        }
        
        .define-problem-close-btn {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .define-problem-close-btn:hover {
            background: transparent;
        }
        
        .define-problem-close-btn:hover .close-icon {
            content: url('icon/关闭-悬停.svg');
        }
        
        .close-icon {
            width: 24px;
            height: 24px;
        }
        
        .define-problem-modal-body {
            flex: 1;
            overflow-y: auto;
            padding: 0 24px;
        }
        
        .define-problem-section {
            margin-bottom: 20px;
        }
        
        .define-problem-section:last-child {
            margin-bottom: 0;
        }
        
        .define-problem-section-title {
            font-size: 16px;
            font-weight: 700;
            color: #333;
            margin-bottom: 0;
            padding-bottom: 8px;
            display: inline-block;
            position: relative;
            z-index: 1;
        }
        
        .define-problem-section > .define-problem-section-title {
            margin-bottom: 12px;
        }
        
        .define-problem-section-title::after {
            content: '';
            position: absolute;
            bottom: 6px;
            left: 50%;
            transform: translateX(-50%) rotate(2deg);
            width: 63px;
            height: 10px;
            background-color: #D7FE03;
            border-radius: 4px;
            z-index: -1;
            box-shadow: 0 4px 10px 0 rgba(215, 254, 3, 0.3);
        }
        
        .define-problem-form-group {
            margin-bottom: 16px;
        }
        
        .define-problem-form-group:last-child {
            margin-bottom: 0;
        }
        
        .define-problem-resolution-status-group {
            margin-bottom: 24px;
        }
        
        .define-problem-label {
            display: block;
            font-size: 14px;
            font-weight: 400;
            color: #8A8A91;
            margin-bottom: 8px;
        }
        
        .required-mark {
            color: #FF4D4F;
        }
        
        .define-problem-input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #F4F4F4;
            border-radius: 8px;
            font-size: 14px;
            color: #333;
            background: #fff;
            font-family: inherit;
            transition: all 0.2s ease;
            box-sizing: border-box;
            position: relative;
            z-index: 1;
        }
        
        .define-problem-input::placeholder {
            color: #bfbfbf;
        }
        
        .define-problem-input:focus {
            outline: none;
            border-color: #000;
        }
        
        .define-problem-input.smart-fill-highlight {
            border: 1.5px solid transparent !important;
            background: linear-gradient(#fff, #fff) padding-box,
                        linear-gradient(90deg, #EFCFFC, #C9E1FF, #CEF5E2, #EFCFFC) border-box !important;
            background-clip: padding-box, border-box !important;
            background-origin: padding-box, border-box !important;
        }
        
        .define-problem-input.smart-fill-highlight:focus {
            border: 1.5px solid transparent !important;
            outline: none;
            background: linear-gradient(#fff, #fff) padding-box,
                        linear-gradient(90deg, #EFCFFC, #C9E1FF, #CEF5E2, #EFCFFC) border-box !important;
            background-clip: padding-box, border-box !important;
            background-origin: padding-box, border-box !important;
        }
        
        .define-problem-textarea.smart-fill-highlight,
        .manual-textarea.smart-fill-highlight {
            border: 1.5px solid transparent !important;
            background: linear-gradient(#fff, #fff) padding-box,
                        linear-gradient(90deg, #EFCFFC, #C9E1FF, #CEF5E2, #EFCFFC) border-box !important;
            background-clip: padding-box, border-box !important;
            background-origin: padding-box, border-box !important;
        }
        
        .define-problem-textarea.smart-fill-highlight:focus,
        .manual-textarea.smart-fill-highlight:focus {
            border: 1.5px solid transparent !important;
            outline: none;
            background: linear-gradient(#fff, #fff) padding-box,
                        linear-gradient(90deg, #EFCFFC, #C9E1FF, #CEF5E2, #EFCFFC) border-box !important;
            background-clip: padding-box, border-box !important;
            background-origin: padding-box, border-box !important;
        }
        
        .define-problem-textarea {
            min-height: 68px;
            height: 68px;
            position: relative;
            z-index: 1;
        }
        
        .define-problem-select-wrapper {
            position: relative;
        }
        
        .define-problem-select {
            width: 100%;
            padding: 8px 32px 8px 12px;
            border: 1px solid #F4F4F4;
            border-radius: 8px;
            font-size: 14px;
            color: #333;
            background: #fff;
            cursor: pointer;
            transition: all 0.2s ease;
            appearance: none;
            background-image: var(--manual-select-arrow);
            background-repeat: no-repeat;
            background-position: calc(100% - 12px) center;
            box-sizing: border-box;
        }
        
        .define-problem-select:hover {
            border-color: #D9D9DE;
        }
        
        .define-problem-select:focus {
            outline: none;
            border-color: #000;
        }
        
        .define-problem-checkbox-group {
            display: flex;
            gap: 24px;
            flex-wrap: wrap;
        }
        
        .define-problem-checkbox-label {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-size: 14px;
            color: #333;
        }
        
        .define-problem-checkbox {
            width: 16px;
            height: 16px;
            cursor: pointer;
            accent-color: #000;
        }
        
        .define-problem-modal-footer {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 12px;
            padding: 20px 24px;
            border-top: 1px solid #F0F0F0;
        }
        
        .define-problem-btn {
            padding: 8px 16px;
            height: 36px;
            min-width: 20px;
            border-radius: 8px;
            font-size: 14px;
            line-height: 20px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid #D9D9DE;
            background: #fff;
            color: #333;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
        }
        
        .define-problem-btn-cancel {
            background: #fff;
            color: #333;
        }
        
        .define-problem-btn-cancel:hover {
            background: #F5F5F5;
        }
        
        .define-problem-btn-create {
            background: #000000;
            color: #fff;
            border-color: #000000;
        }
        
        .define-problem-btn-create:hover {
            background: #333333;
            border-color: #333333;
        }
        
        .define-problem-error-message {
            color: #FF4D4F;
            font-size: 12px;
            line-height: 16px;
            margin-top: 4px;
            display: none;
        }
        
        .define-problem-input-error {
            border-color: #FF4D4F !important;
        }
        
        .define-problem-input-error:focus {
            border-color: #FF4D4F !important;
        }
        
        .define-problem-checkbox-group-error {
            border: 1px solid #FF4D4F;
            border-radius: 8px;
            padding: 8px;
            margin-top: -8px;
        }
    `;
    
    document.head.appendChild(style);
}

// 关闭定义为问题模态弹窗
function closeDefineProblemModal() {
    const modal = document.getElementById('defineProblemModalOverlay');
    if (modal) {
        modal.remove();
    }
}

// 智能填充问题
async function smartFillProblem(id) {
    console.log('智能填充问题:', id);
    
    // 获取数据项
    const stored = localStorage.getItem('voicePoolData');
    let voicePoolData = [];
    if (stored) {
        voicePoolData = JSON.parse(stored);
    }
    const item = voicePoolData.find(item => item.id === id);
    
    if (!item) {
        showToast('未找到数据项', 'error');
        return;
    }
    
    // 获取相关元素
    const smartFillBtn = document.querySelector('.define-problem-smart-fill-btn');
    const relatedOriginalSoundSelect = document.getElementById('relatedOriginalSound');
    const titleInput = document.getElementById('problemTitle');
    const descriptionTextarea = document.getElementById('problemDescription');
    
    // 获取关联原声内容
    let selectedItem = item;
    
    // 如果选择了其他关联原声，获取对应的内容
    if (relatedOriginalSoundSelect && relatedOriginalSoundSelect.value !== id) {
        const selectedId = relatedOriginalSoundSelect.value;
        const foundItem = voicePoolData.find(item => item.id === selectedId);
        if (foundItem) {
            selectedItem = foundItem;
        }
    }
    
    // 优先使用originalText，如果没有则使用summary
    let originalSoundText = selectedItem.originalText || selectedItem.summary || '';
    
    if (!originalSoundText || originalSoundText.trim() === '') {
        showToast('关联原声内容为空，无法进行智能填充', 'error');
        return;
    }
    
    // 保存原始状态
    const originalBtnHTML = smartFillBtn ? smartFillBtn.innerHTML : '';
    const originalBtnOpacity = smartFillBtn ? smartFillBtn.style.opacity : '';
    
    // 设置加载状态：显示loading图标和"智能填充中..."文案
    if (smartFillBtn) {
        smartFillBtn.disabled = true;
        smartFillBtn.innerHTML = `
            <img src="icon/AI录入.svg" alt="智能填充" class="smart-fill-icon smart-fill-loading-icon" />
            <span>智能填充中...</span>
        `;
        smartFillBtn.classList.add('smart-fill-loading');
    }
    
    // 禁用相关字段
    if (relatedOriginalSoundSelect) {
        relatedOriginalSoundSelect.disabled = true;
        relatedOriginalSoundSelect.classList.add('smart-fill-disabled');
    }
    if (titleInput) {
        titleInput.disabled = true;
        titleInput.classList.add('smart-fill-disabled');
    }
    if (descriptionTextarea) {
        descriptionTextarea.disabled = true;
        descriptionTextarea.classList.add('smart-fill-disabled');
    }
    
    try {
        // 调用后端API进行智能填充
        const formData = new FormData();
        formData.append('original_sound', originalSoundText);
        
        const response = await fetch('http://localhost:8001/api/smart-fill-problem/fill', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            
            if (result.success) {
                // 清除所有错误提示
                clearAllErrors();
                
                // 填充问题标题
                if (titleInput && result.title) {
                    titleInput.value = result.title;
                    // 触发input事件以清除错误提示和更新按钮状态
                    titleInput.dispatchEvent(new Event('input'));
                }
                
                // 填充问题描述
                if (descriptionTextarea && result.description) {
                    descriptionTextarea.value = result.description;
                }
                
                // 恢复字段状态（移除禁用）
                if (relatedOriginalSoundSelect) {
                    relatedOriginalSoundSelect.disabled = false;
                    relatedOriginalSoundSelect.classList.remove('smart-fill-disabled');
                }
                if (titleInput) {
                    titleInput.disabled = false;
                    titleInput.classList.remove('smart-fill-disabled');
                }
                if (descriptionTextarea) {
                    descriptionTextarea.disabled = false;
                    descriptionTextarea.classList.remove('smart-fill-disabled');
                }
                
                // 添加填充完成后的高亮效果
                if (titleInput) {
                    titleInput.classList.add('smart-fill-highlight');
                    console.log('已添加高亮样式到问题标题:', titleInput.classList.contains('smart-fill-highlight'));
                }
                if (descriptionTextarea) {
                    descriptionTextarea.classList.add('smart-fill-highlight');
                    console.log('已添加高亮样式到问题描述:', descriptionTextarea.classList.contains('smart-fill-highlight'));
                }
                
                showToast('智能填充完成', 'success');
            } else {
                showToast(result.message || '智能填充失败', 'error');
                // 填充失败时也恢复字段状态
                if (relatedOriginalSoundSelect) {
                    relatedOriginalSoundSelect.disabled = false;
                    relatedOriginalSoundSelect.classList.remove('smart-fill-disabled');
                }
                if (titleInput) {
                    titleInput.disabled = false;
                    titleInput.classList.remove('smart-fill-disabled');
                }
                if (descriptionTextarea) {
                    descriptionTextarea.disabled = false;
                    descriptionTextarea.classList.remove('smart-fill-disabled');
                }
            }
        } else {
            // 处理404错误
            if (response.status === 404) {
                console.error('API端点未找到，请确保后端服务器已启动并包含smart-fill-problem路由');
                showToast('API端点未找到，请检查后端服务器是否正常运行', 'error');
            } else {
                const errorData = await response.json().catch(() => ({ detail: `请求失败: ${response.status}` }));
                showToast(errorData.detail || `智能填充失败: ${response.status}`, 'error');
            }
            // 错误时恢复字段状态
            if (relatedOriginalSoundSelect) {
                relatedOriginalSoundSelect.disabled = false;
                relatedOriginalSoundSelect.classList.remove('smart-fill-disabled');
            }
            if (titleInput) {
                titleInput.disabled = false;
                titleInput.classList.remove('smart-fill-disabled');
            }
            if (descriptionTextarea) {
                descriptionTextarea.disabled = false;
                descriptionTextarea.classList.remove('smart-fill-disabled');
            }
        }
    } catch (error) {
        console.error('智能填充错误:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showToast('无法连接到后端服务器，请确保服务器正在运行', 'error');
        } else {
            showToast('智能填充失败，请稍后重试', 'error');
        }
        // 异常时恢复字段状态
        if (relatedOriginalSoundSelect) {
            relatedOriginalSoundSelect.disabled = false;
            relatedOriginalSoundSelect.classList.remove('smart-fill-disabled');
        }
        if (titleInput) {
            titleInput.disabled = false;
            titleInput.classList.remove('smart-fill-disabled');
        }
        if (descriptionTextarea) {
            descriptionTextarea.disabled = false;
            descriptionTextarea.classList.remove('smart-fill-disabled');
        }
    } finally {
        // 恢复按钮状态
        if (smartFillBtn) {
            smartFillBtn.disabled = false;
            smartFillBtn.style.opacity = originalBtnOpacity || '';
            smartFillBtn.innerHTML = originalBtnHTML || '<img src="icon/AI录入.svg" alt="智能填充" class="smart-fill-icon" /><span>智能填充问题</span>';
            smartFillBtn.style.opacity = originalBtnOpacity || '';
            smartFillBtn.classList.remove('smart-fill-loading');
        }
    }
}

// 创建问题
function createProblem(id) {
    console.log('创建问题:', id);
    
    // 清除所有错误提示
    clearAllErrors();
    
    // 获取表单数据
    const titleInput = document.getElementById('problemTitle');
    const descriptionTextarea = document.getElementById('problemDescription');
    const resolutionStatus = document.getElementById('resolutionStatus');
    const relatedOriginalSound = document.getElementById('relatedOriginalSound');
    const assignTo = document.getElementById('assignTo');
    
    let hasError = false;
    
    // 验证必填项
    if (!titleInput || !titleInput.value.trim()) {
        showFieldError('problemTitle', '请输入问题标题');
        hasError = true;
    }
    
    // 获取选中的地区和终端
    const regions = Array.from(document.querySelectorAll('input[name="region"]:checked')).map(cb => cb.value);
    const terminals = Array.from(document.querySelectorAll('input[name="terminal"]:checked')).map(cb => cb.value);
    
    // 验证所属地区
    if (regions.length === 0) {
        showFieldError('region', '请至少选择一个所属地区');
        hasError = true;
    }
    
    // 验证归属终端
    if (terminals.length === 0) {
        showFieldError('terminal', '请至少选择一个归属终端');
        hasError = true;
    }
    
    // 如果有错误，停止提交
    if (hasError) {
        return;
    }
    
    // 获取关联原声文本（如果选择了其他关联原声，使用选择的；否则使用当前原声的summary）
    let relatedSoundText = '';
    if (relatedOriginalSound && relatedOriginalSound.value && relatedOriginalSound.value !== '') {
        // 如果选择了其他关联原声，使用选择的文本
        const selectedOption = relatedOriginalSound.options[relatedOriginalSound.selectedIndex];
        relatedSoundText = selectedOption.text || selectedOption.value;
    } else {
        // 否则使用当前原声的summary
        const stored = localStorage.getItem('voicePoolData');
        let voicePoolData = [];
        if (stored) {
            voicePoolData = JSON.parse(stored);
        }
        const item = voicePoolData.find(item => item.id === id);
        if (item && item.summary) {
            relatedSoundText = item.summary;
        }
    }
    
    // 构建问题数据（字段映射到问题跟进池表格）
    const relatedSoundIdValue = relatedOriginalSound && relatedOriginalSound.value ? relatedOriginalSound.value : id;
    const relatedSoundEntries = relatedSoundText && relatedSoundText !== '--' ? [{
        id: relatedSoundIdValue,
        summary: relatedSoundText
    }] : [];
    
    const problemData = {
        id: Date.now().toString(),
        problemType: 'feedback', // 用户反馈类
        title: titleInput.value.trim(),
        description: descriptionTextarea ? descriptionTextarea.value.trim() : '',
        resolutionStatus: resolutionStatus ? resolutionStatus.value : '待确认',
        relatedOriginalSoundId: relatedSoundIdValue,
        relatedOriginalSound: relatedSoundText || '--', // 关联原声文本
        relatedOriginalSounds: relatedSoundEntries,
        regions: regions,
        terminals: terminals,
        assignTo: assignTo ? assignTo.value : '',
        createdAt: new Date().toISOString()
    };
    
    console.log('创建的问题数据:', problemData);
    
    // 保存到localStorage（使用unshift将新数据添加到数组开头，与手动录入保持一致）
    let problems = [];
    const storedProblems = localStorage.getItem('definedProblems');
    if (storedProblems) {
        problems = JSON.parse(storedProblems);
    }
    problems.unshift(problemData); // 使用unshift而不是push
    localStorage.setItem('definedProblems', JSON.stringify(problems));
    
    // 更新原声数据，标记为已定义为问题
    const stored = localStorage.getItem('voicePoolData');
    let voicePoolData = [];
    if (stored) {
        voicePoolData = JSON.parse(stored);
    }
    const item = voicePoolData.find(item => item.id === id);
    if (item) {
        item.issues = problemData.title;
        localStorage.setItem('voicePoolData', JSON.stringify(voicePoolData));
    }
    
    // 关闭模态弹窗
    closeDefineProblemModal();
    
    // 显示成功提示
    showToast('问题创建成功', 'success');
    
    // 刷新原声池表格显示
    renderVoicePoolTable(voicePoolData);
    updateVoicePoolStats(voicePoolData);
    
    // 如果当前在问题跟进池主页，切换到用户反馈类tab并刷新显示
    const problemPoolHome = document.getElementById('problem-pool-home');
    if (problemPoolHome && problemPoolHome.style.display !== 'none') {
        // 切换到用户反馈类tab
        currentProblemType = 'feedback';
        const feedbackTab = document.querySelector('#problem-pool-home .view-tab[data-problem-type="feedback"]');
        const designTab = document.querySelector('#problem-pool-home .view-tab[data-problem-type="design"]');
        if (feedbackTab) feedbackTab.classList.add('active');
        if (designTab) designTab.classList.remove('active');
    }
    
    // 刷新问题跟进池表格
    if (currentProblemViewType === 'list') {
        renderProblemPoolTable();
    } else {
        renderProblemPoolKanbanView();
    }
    updateProblemPoolStats();
}

// 渲染问题跟进池表格表头
function renderProblemPoolTableHeader() {
    const thead = document.getElementById('problem-pool-table-head');
    if (!thead) return;
    
    const dataTable = thead.closest('.data-table');
    
    if (currentProblemType === 'design') {
        // 设计走查类表头
        thead.innerHTML = `
            <tr>
                <th class="col-checkbox"></th>
                <th class="col-title">问题标题</th>
                <th class="col-priority">优先级</th>
                <th class="col-problem-type">走查问题类型</th>
                <th class="col-region">所属地区</th>
                <th class="col-terminal">归属终端</th>
                <th class="col-assignee">指派给</th>
                <th class="col-resolution-status">解决状态</th>
                <th class="col-actions">操作</th>
            </tr>
        `;
        if (dataTable) {
            dataTable.setAttribute('data-problem-type', 'design');
        }
    } else {
        // 用户反馈类表头（默认）
        thead.innerHTML = `
            <tr>
                <th class="col-checkbox"></th>
                <th class="col-title">问题标题</th>
                <th class="col-related-sound">关联原声</th>
                <th class="col-region">所属地区</th>
                <th class="col-terminal">归属终端</th>
                <th class="col-assignee">指派给</th>
                <th class="col-resolution-status">解决状态</th>
                <th class="col-actions">操作</th>
            </tr>
        `;
        if (dataTable) {
            dataTable.removeAttribute('data-problem-type');
        }
    }
}

// 生成优先级显示（圆形+文案）
function renderPriorityDisplay(priority) {
    if (!priority || priority === '--') {
        return '--';
    }
    
    // 从优先级值中提取P0、P1、P2等
    const priorityMatch = priority.match(/P([0-2])/);
    if (!priorityMatch) {
        return priority;
    }
    
    const priorityLevel = priorityMatch[0]; // P0, P1, 或 P2
    
    // 根据优先级设置圆形颜色
    let circleColor = '#8A8A91'; // 默认灰色
    if (priorityLevel === 'P0') {
        circleColor = '#FF1965'; // P0颜色
    } else if (priorityLevel === 'P1') {
        circleColor = '#FF8C19'; // P1颜色
    } else if (priorityLevel === 'P2') {
        circleColor = '#D9D9DE'; // P2颜色
    }
    
    return `
        <span class="priority-display">
            <span class="priority-circle" style="background-color: ${circleColor};"></span>
            <span class="priority-text">${priorityLevel}</span>
        </span>
    `;
}

// 生成看板卡片优先级显示（圆形+文案，12px、8A8A91）
function renderKanbanPriorityDisplay(priority) {
    if (!priority || priority === '--') {
        return '';
    }
    
    // 从优先级值中提取P0、P1、P2等
    const priorityMatch = priority.match(/P([0-2])/);
    if (!priorityMatch) {
        return '';
    }
    
    const priorityLevel = priorityMatch[0]; // P0, P1, 或 P2
    
    // 根据优先级设置圆形颜色
    let circleColor = '#8A8A91'; // 默认灰色
    if (priorityLevel === 'P0') {
        circleColor = '#FF1965'; // P0颜色
    } else if (priorityLevel === 'P1') {
        circleColor = '#FF8C19'; // P1颜色
    } else if (priorityLevel === 'P2') {
        circleColor = '#D9D9DE'; // P2颜色
    }
    
    return `
        <div class="kanban-card-field-item kanban-priority-item">
            <span class="kanban-priority-circle" style="background-color: ${circleColor};"></span>
            <span class="kanban-priority-text">${priorityLevel}</span>
        </div>
    `;
}

// 渲染问题跟进池表格
function renderProblemPoolTable() {
    const tbody = document.getElementById('problem-pool-table-body');
    if (!tbody) return;
    
    addProblemTitleLinkStyles();
    
    // 先渲染表头
    renderProblemPoolTableHeader();
    
    // 从localStorage读取问题数据
    let problems = [];
    try {
        const stored = localStorage.getItem('definedProblems');
        if (stored) {
            problems = JSON.parse(stored);
        }
    } catch (error) {
        console.error('读取问题数据失败:', error);
        problems = [];
    }
    
    // 根据当前选中的问题类型过滤数据
    if (currentProblemType) {
        problems = problems.filter(problem => problem.problemType === currentProblemType);
    }
    
    // 根据当前选中的解决状态过滤数据
    if (currentProblemStatusFilter && currentProblemStatusFilter !== 'all') {
        const statusMap = {
            'pending': '待确认',
            'processing': '开发中',
            'review': '待走查',
            'resolved': '已解决'
        };
        const targetStatus = statusMap[currentProblemStatusFilter];
        if (targetStatus) {
            problems = problems.filter(problem => problem.resolutionStatus === targetStatus);
        }
    }
    
    if (problems.length === 0) {
        const colspan = currentProblemType === 'design' ? 9 : 8;
        tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align: center; padding: 40px; color: #8A8A91;">暂无问题数据</td></tr>`;
        return;
    }
    
    // 按创建时间倒序排列（最新的在前）
    problems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 渲染表格行
    tbody.innerHTML = problems.map((problem, index) => {
        const regions = Array.isArray(problem.regions) ? problem.regions.join('、') : (problem.regions || '--');
        const terminals = Array.isArray(problem.terminals) ? problem.terminals.join('、') : (problem.terminals || '--');
        const assignTo = problem.assignTo || '--';
        const resolutionStatus = problem.resolutionStatus || '待确认';
        const relatedSound = problem.relatedOriginalSound || '--';
        
        // 处理关联原声显示 - 使用标签样式（icon + 文字），与关联问题列样式一致
        const relatedSoundDisplay = `
            <span class="issues-tag" title="${relatedSound}">
                <img src="icon/关联原声标签.svg" alt="关联原声" class="issues-tag-icon" />
                <span class="issues-tag-text">${relatedSound}</span>
            </span>
        `;
        
        if (currentProblemType === 'design') {
            // 设计走查类表格行
            const priority = problem.priority || '--';
            const problemTypeValue = problem.problemTypeValue || '--';
            
            return `
                <tr data-problem-id="${problem.id}">
                    <td class="col-checkbox">
                        <input type="checkbox" class="row-checkbox" data-problem-id="${problem.id}" />
                        <span class="row-index">${index + 1}</span>
                    </td>
                    <td class="col-title">
                        <button type="button" class="problem-title-link" onclick="handleProblemTitleClick('${problem.id}', event)">
                            ${problem.title || '--'}
                        </button>
                    </td>
                    <td class="col-priority">${renderPriorityDisplay(priority)}</td>
                    <td class="col-problem-type">${problemTypeValue}</td>
                    <td class="col-region">${regions}</td>
                    <td class="col-terminal">${terminals}</td>
                    <td class="col-assignee">${assignTo}</td>
                    <td class="col-resolution-status">
                        ${getResolutionStatusBadge(resolutionStatus)}
                    </td>
                    <td class="col-actions">
                        <button class="action-btn action-btn-view" title="查看详情" onclick="viewProblemDetail('${problem.id}')">
                            <img src="icon/列表-查看详情-默认.svg" alt="查看详情" class="action-icon" />
                        </button>
                    </td>
                </tr>
            `;
        } else {
            // 用户反馈类表格行（默认）
            return `
                <tr data-problem-id="${problem.id}">
                    <td class="col-checkbox">
                        <input type="checkbox" class="row-checkbox" data-problem-id="${problem.id}" />
                        <span class="row-index">${index + 1}</span>
                    </td>
                    <td class="col-title">
                        <button type="button" class="problem-title-link" onclick="handleProblemTitleClick('${problem.id}', event)">
                            ${problem.title || '--'}
                        </button>
                    </td>
                    <td class="col-related-sound">${relatedSoundDisplay}</td>
                    <td class="col-region">${regions}</td>
                    <td class="col-terminal">${terminals}</td>
                    <td class="col-assignee">${assignTo}</td>
                    <td class="col-resolution-status">
                        ${getResolutionStatusBadge(resolutionStatus)}
                    </td>
                    <td class="col-actions">
                        <button class="action-btn action-btn-view" title="查看详情" onclick="viewProblemDetail('${problem.id}')">
                            <img src="icon/列表-查看详情-默认.svg" alt="查看详情" class="action-icon" />
                        </button>
                    </td>
                </tr>
            `;
        }
    }).join('');
}

function addProblemTitleLinkStyles() {
    if (document.getElementById('problemTitleLinkStyles')) {
        return;
    }
    const style = document.createElement('style');
    style.id = 'problemTitleLinkStyles';
    style.textContent = `
        .problem-title-link {
            border: none;
            background: none;
            padding: 0;
            margin: 0;
            font-size: 14px;
            line-height: 20px;
            color: #000;
            font-weight: 500;
            cursor: pointer;
            text-align: left;
        }
        
        .problem-title-link:hover {
            text-decoration: underline;
            color: #000;
        }
        
        .problem-title-link:focus {
            outline: none;
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);
}

// 获取解决状态标签（使用与用户原声池分析状态一致的样式）
function getResolutionStatusBadge(status) {
    let statusClass = '';
    if (status === '待确认') {
        statusClass = 'status-pending';
    } else if (status === '开发中') {
        statusClass = 'status-processing';
    } else if (status === '待走查') {
        statusClass = 'status-key';
    } else if (status === '已解决') {
        statusClass = 'status-unresolved';
    }
    return `<span class="status-badge ${statusClass}">${status}</span>`;
}

// 更新问题跟进池统计数据
function updateProblemPoolStats() {
    let problems = [];
    try {
        const stored = localStorage.getItem('definedProblems');
        if (stored) {
            problems = JSON.parse(stored);
        }
    } catch (error) {
        console.error('读取问题数据失败:', error);
        problems = [];
    }
    
    // 根据当前选中的问题类型过滤数据
    if (currentProblemType) {
        problems = problems.filter(problem => problem.problemType === currentProblemType);
    }
    
    // 根据当前选中的解决状态过滤数据（统计数据使用全部数据，不应用状态筛选）
    const allProblemsForStats = [...problems];
    
    if (currentProblemStatusFilter && currentProblemStatusFilter !== 'all') {
        const statusMap = {
            'pending': '待确认',
            'processing': '开发中',
            'review': '待走查',
            'resolved': '已解决'
        };
        const targetStatus = statusMap[currentProblemStatusFilter];
        if (targetStatus) {
            problems = problems.filter(problem => problem.resolutionStatus === targetStatus);
        }
    }
    
    const total = allProblemsForStats.length;
    const pending = allProblemsForStats.filter(p => p.resolutionStatus === '待确认').length;
    const processing = allProblemsForStats.filter(p => p.resolutionStatus === '开发中' || p.resolutionStatus === '待走查').length;
    const resolved = allProblemsForStats.filter(p => p.resolutionStatus === '已解决').length;
    
    const totalEl = document.getElementById('problem-pool-total');
    const pendingEl = document.getElementById('problem-pool-pending');
    const processingEl = document.getElementById('problem-pool-processing');
    const resolvedEl = document.getElementById('problem-pool-resolved');
    
    if (totalEl) totalEl.textContent = total;
    if (pendingEl) pendingEl.textContent = pending;
    if (processingEl) processingEl.textContent = processing;
    if (resolvedEl) resolvedEl.textContent = resolved;
}

// 查看问题详情
function viewProblemDetail(id) {
    console.log('查看问题详情:', id);
    
    // 从localStorage读取问题数据
    const stored = localStorage.getItem('definedProblems');
    let problems = [];
    if (stored) {
        problems = JSON.parse(stored);
    }
    
    // 找到对应的问题
    const problem = problems.find(p => p.id === id);
    if (!problem) {
        console.error('未找到问题:', id);
        return;
    }
    
    // 显示详情抽屉
    showProblemDetailDrawer(problem, problems);
}

function buildVoiceDetailLink(voiceId) {
    if (!voiceId || typeof window === 'undefined') {
        return '#';
    }
    const url = new URL(window.location.href);
    url.searchParams.set('voiceDetailId', voiceId);
    return url.toString();
}

// 构建问题详情链接
function buildProblemDetailLink(problemId, problemType = 'feedback') {
    if (!problemId || typeof window === 'undefined') {
        return '#';
    }
    const url = new URL(window.location.href);
    url.searchParams.set('problemDetailId', problemId);
    url.searchParams.set('problemType', problemType);
    return url.toString();
}

function handleVoiceDetailParam() {
    if (hasHandledVoiceDetailParam || typeof window === 'undefined') {
        return;
    }
    const params = new URLSearchParams(window.location.search || '');
    const voiceId = params.get('voiceDetailId');
    if (!voiceId) {
        hasHandledVoiceDetailParam = true;
        return;
    }
    
    setTimeout(() => {
        viewVoiceDetail(voiceId);
    }, 500);
    
    params.delete('voiceDetailId');
    const newSearch = params.toString();
    const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', newUrl);
    hasHandledVoiceDetailParam = true;
}

// 处理问题详情URL参数
let hasHandledProblemDetailParam = false;
function handleProblemDetailParam() {
    if (hasHandledProblemDetailParam || typeof window === 'undefined') {
        return;
    }
    const params = new URLSearchParams(window.location.search || '');
    const problemId = params.get('problemDetailId');
    const problemType = params.get('problemType') || 'feedback';
    
    if (!problemId) {
        hasHandledProblemDetailParam = true;
        return;
    }
    
    // 切换到问题跟进池页面
    if (currentMainPage !== 'problem-pool') {
        switchMainPage('problem-pool');
    }
    
    // 延迟执行，确保页面切换完成后再选中tab和打开详情
    setTimeout(() => {
        // 更新问题类型状态
        currentProblemType = problemType;
        
        // 更新tab的激活状态
        const problemTypeTabs = document.querySelectorAll('#problem-pool-home .view-tab[data-problem-type]');
        problemTypeTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-problem-type') === problemType) {
                tab.classList.add('active');
            }
        });
        
        // 重新渲染表格和统计数据
        if (currentProblemViewType === 'list') {
            renderProblemPoolTable();
        } else {
            renderProblemPoolKanbanView();
        }
        updateProblemPoolStats();
        
        // 打开问题详情抽屉
        setTimeout(() => {
            viewProblemDetail(problemId);
        }, 200);
    }, 300);
    
    params.delete('problemDetailId');
    params.delete('problemType');
    const newSearch = params.toString();
    const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', newUrl);
    hasHandledProblemDetailParam = true;
}

function getVoicePoolDataFromStorage() {
    try {
        const stored = localStorage.getItem('voicePoolData');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('读取原声数据失败:', error);
        return [];
    }
}

function getProblemsFromStorage() {
    try {
        const stored = localStorage.getItem('definedProblems');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('读取问题数据失败:', error);
        return [];
    }
}

function getVoiceStatusLabel(statusType) {
    if (statusType === 'pending') return '待评估';
    if (statusType === 'key') return '关键反馈';
    if (statusType === 'unresolved') return '暂不解决';
    return '--';
}

function createRelatedSoundItemHtml(sound, voiceData) {
    const summary = sound.summary || voiceData?.summary || '--';
    const voiceId = sound.id || voiceData?.id || '';
    const titleHtml = voiceId ? `
        <a class="related-sound-title-link" href="${buildVoiceDetailLink(voiceId)}" target="_blank" rel="noopener noreferrer">
            ${summary}
        </a>
    ` : `<div class="related-sound-title">${summary}</div>`;
    
    const emotionType = voiceData?.emotion?.type || 'neutral';
    const emotionLabel = voiceData?.emotion?.label || (emotionType === 'negative' ? '负向' : emotionType === 'positive' ? '正向' : '中性');
    const emotionIcon = emotionType === 'negative' ? 'icon/负向.svg' : 
                        emotionType === 'positive' ? 'icon/正向.svg' : 
                        'icon/中性.svg';
    const moduleText = voiceData?.module || sound.module || '--';
    const statusText = voiceData?.status?.text || getVoiceStatusLabel(voiceData?.status?.type) || '--';
    
    return `
        <div class="related-sound-item">
            <div class="related-sound-info">
                ${titleHtml}
            </div>
            <div class="kanban-card-info-row related-sound-meta-row">
                <div class="kanban-card-emotion">
                    <img src="${emotionIcon}" alt="${emotionLabel}" class="kanban-emotion-icon" />
                    <span class="kanban-emotion-text">${emotionLabel}</span>
                </div>
                <div class="kanban-card-module">
                    <span class="kanban-module-label">所属模块：</span>
                    <span class="kanban-module-value">${moduleText}</span>
                </div>
                <div class="kanban-card-emotion related-sound-status">
                    <span class="kanban-emotion-text">${statusText}</span>
                </div>
            </div>
        </div>
    `;
}

// 创建关联问题卡片HTML
function createRelatedIssueItemHtml(problem) {
    if (!problem) return '';
    
    const title = problem.title || '--';
    const problemId = problem.id || '';
    const problemType = problem.problemType || 'feedback';
    const detailLink = buildProblemDetailLink(problemId, problemType);
    const titleHtml = problemId ? `
        <a class="related-issue-title-link" href="${detailLink}" target="_blank" rel="noopener noreferrer">
            ${title}
        </a>
    ` : `<div class="related-issue-title">${title}</div>`;
    
    const regions = Array.isArray(problem.regions) ? problem.regions.join('、') : (problem.regions || '--');
    const terminals = Array.isArray(problem.terminals) ? problem.terminals.join('、') : (problem.terminals || '--');
    const assignTo = problem.assignTo || '--';
    
    return `
        <div class="related-issue-item">
            <div class="related-issue-info">
                ${titleHtml}
            </div>
            <div class="kanban-card-info-row related-issue-meta-row">
                <div class="kanban-card-field-item">
                    <img src="icon/所属地区.svg" alt="所属地区" class="kanban-card-field-icon" />
                    <span class="kanban-card-field-value">${regions}</span>
                </div>
                <div class="kanban-card-field-item">
                    <img src="icon/归属终端.svg" alt="归属终端" class="kanban-card-field-icon" />
                    <span class="kanban-card-field-value">${terminals}</span>
                </div>
                <div class="kanban-card-field-item">
                    <img src="icon/指派给.svg" alt="指派给" class="kanban-card-field-icon" />
                    <span class="kanban-card-field-value">${assignTo}</span>
                </div>
            </div>
        </div>
    `;
}

function openRelatedSoundModal(problemId) {
    const problems = getProblemsFromStorage();
    const problem = problems.find(p => p.id === problemId);
    if (!problem) return;
    
    const voicePoolData = getVoicePoolDataFromStorage();
    const selectedIds = Array.isArray(problem.relatedOriginalSounds) ? 
        problem.relatedOriginalSounds.map(sound => sound.id).filter(Boolean) : 
        (problem.relatedOriginalSoundId ? [problem.relatedOriginalSoundId] : []);
    
    const existingOverlay = document.getElementById('relatedSoundModalOverlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    const modalHtml = createRelatedSoundModalHtml(problemId, voicePoolData, selectedIds);
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    addRelatedSoundModalStyles();
    
    requestAnimationFrame(() => {
        const overlay = document.getElementById('relatedSoundModalOverlay');
        const modal = document.getElementById('relatedSoundModal');
        if (overlay && modal) {
            overlay.classList.add('show');
            modal.classList.add('show');
        }
    });
}

function createRelatedSoundModalHtml(problemId, voicePoolData, selectedIds) {
    const listHtml = voicePoolData.length > 0 ? voicePoolData.map(voice => `
        <label class="related-sound-select-item">
            <input type="checkbox" class="related-sound-checkbox" value="${voice.id}" ${selectedIds.includes(voice.id) ? 'checked' : ''} />
            <div class="related-sound-select-info">
                <div class="related-sound-select-title">${voice.summary || '--'}</div>
                <div class="related-sound-select-meta">
                    <span>${voice.emotion?.label || (voice.emotion?.type === 'negative' ? '负向' : voice.emotion?.type === 'positive' ? '正向' : '中性')}</span>
                    <span>模块：${voice.module || '--'}</span>
                    <span>状态：${voice.status?.text || getVoiceStatusLabel(voice.status?.type) || '--'}</span>
                </div>
            </div>
        </label>
    `).join('') : '<div class="related-sound-modal-empty">暂无可关联的用户原声</div>';
    
    return `
        <div class="related-sound-modal-overlay" id="relatedSoundModalOverlay" onclick="closeRelatedSoundModal()">
            <div class="related-sound-modal" id="relatedSoundModal" onclick="event.stopPropagation()" data-problem-id="${problemId}">
                <div class="related-sound-modal-header">
                    <h3 class="related-sound-modal-title">关联原声</h3>
                    <button class="related-sound-modal-close" onclick="closeRelatedSoundModal()">
                        <img src="icon/关闭-默认.svg" alt="关闭" class="close-icon" />
                    </button>
                </div>
                <div class="related-sound-modal-body">
                    <p class="related-sound-modal-desc">请选择需要关联的问题原声，可多选。</p>
                    <div class="related-sound-modal-list">
                        ${listHtml}
                    </div>
                </div>
                <div class="related-sound-modal-footer">
                    <button class="related-sound-modal-btn related-sound-modal-btn-cancel" onclick="closeRelatedSoundModal()">取消</button>
                    <button class="related-sound-modal-btn related-sound-modal-btn-confirm" onclick="confirmRelatedSoundSelection('${problemId}')">保存</button>
                </div>
            </div>
        </div>
    `;
}

function closeRelatedSoundModal() {
    const overlay = document.getElementById('relatedSoundModalOverlay');
    const modal = document.getElementById('relatedSoundModal');
    if (!overlay || !modal) return;
    
    overlay.classList.remove('show');
    modal.classList.remove('show');
    
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.remove();
        }
    }, 200);
}

function confirmRelatedSoundSelection(problemId) {
    const modal = document.getElementById('relatedSoundModal');
    if (!modal) return;
    
    const checkboxes = modal.querySelectorAll('.related-sound-checkbox:checked');
    const selectedIds = Array.from(checkboxes).map(cb => cb.value).filter(Boolean);
    
    const voicePoolData = getVoicePoolDataFromStorage();
    const selectedVoices = voicePoolData.filter(voice => selectedIds.includes(voice.id));
    
    const problems = getProblemsFromStorage();
    const problem = problems.find(p => p.id === problemId);
    if (!problem) return;
    
    problem.relatedOriginalSounds = selectedVoices.map(voice => ({
        id: voice.id,
        summary: voice.summary || voice.originalDetail || '--'
    }));
    
    if (problem.relatedOriginalSounds.length > 0) {
        problem.relatedOriginalSoundId = problem.relatedOriginalSounds[0].id;
        problem.relatedOriginalSound = problem.relatedOriginalSounds[0].summary || '--';
    } else {
        problem.relatedOriginalSoundId = null;
        problem.relatedOriginalSound = '--';
    }
    
    localStorage.setItem('definedProblems', JSON.stringify(problems));
    closeRelatedSoundModal();
    
    updateProblemDetailRelatedSounds(problemId);
    
    if (currentMainPage === 'problem-pool') {
        if (currentProblemViewType === 'list') {
            renderProblemPoolTable();
        } else {
            renderProblemPoolKanbanView();
        }
    }
}

function updateProblemDetailRelatedSounds(problemId) {
    const relatedListContainer = document.querySelector('.related-sounds-list');
    if (!relatedListContainer) return;
    
    const problems = getProblemsFromStorage();
    const problem = problems.find(p => p.id === problemId);
    if (!problem) return;
    
    const voicePoolData = getVoicePoolDataFromStorage();
    const voiceDataMap = voicePoolData.reduce((acc, voice) => {
        if (voice && voice.id) acc[voice.id] = voice;
        return acc;
    }, {});
    
    const relatedSoundList = Array.isArray(problem.relatedOriginalSounds) ?
        problem.relatedOriginalSounds.filter(sound => sound && (sound.summary || sound.id)) :
        (problem.relatedOriginalSound && problem.relatedOriginalSound !== '--'
            ? [{ id: problem.relatedOriginalSoundId, summary: problem.relatedOriginalSound }]
            : []);
    
    relatedListContainer.innerHTML = relatedSoundList.length > 0 ?
        relatedSoundList.map(sound => createRelatedSoundItemHtml(sound, sound.id ? voiceDataMap[sound.id] : null)).join('') :
        '<div class="empty-state">暂无关联原声</div>';
}

// 打开关联问题弹窗
function openRelatedIssueModal(voiceId) {
    const voicePoolData = getVoicePoolDataFromStorage();
    const voice = voicePoolData.find(v => v.id === voiceId);
    if (!voice) return;
    
    const problems = getProblemsFromStorage();
    
    // 获取当前已关联的问题ID列表
    let selectedIds = [];
    if (voice.relatedIssues && Array.isArray(voice.relatedIssues)) {
        selectedIds = voice.relatedIssues.map(issue => issue.id).filter(Boolean);
    } else if (voice.issues && voice.issues !== '--') {
        // 兼容旧数据：如果issues是字符串，尝试根据标题查找问题ID
        const problem = problems.find(p => p.title === voice.issues);
        if (problem) {
            selectedIds = [problem.id];
        }
    }
    
    const existingOverlay = document.getElementById('relatedIssueModalOverlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    const modalHtml = createRelatedIssueModalHtml(voiceId, problems, selectedIds);
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    addRelatedIssueModalStyles();
    
    requestAnimationFrame(() => {
        const overlay = document.getElementById('relatedIssueModalOverlay');
        const modal = document.getElementById('relatedIssueModal');
        if (overlay && modal) {
            overlay.classList.add('show');
            modal.classList.add('show');
        }
    });
}

// 创建关联问题弹窗HTML
function createRelatedIssueModalHtml(voiceId, problems, selectedIds) {
    const listHtml = problems.length > 0 ? problems.map(problem => {
        const regions = Array.isArray(problem.regions) ? problem.regions.join('、') : (problem.regions || '--');
        const terminals = Array.isArray(problem.terminals) ? problem.terminals.join('、') : (problem.terminals || '--');
        const assignTo = problem.assignTo || '--';
        const resolutionStatus = problem.resolutionStatus || '待确认';
        
        return `
        <label class="related-issue-select-item">
            <input type="checkbox" class="related-issue-checkbox" value="${problem.id}" ${selectedIds.includes(problem.id) ? 'checked' : ''} />
            <div class="related-issue-select-info">
                <div class="related-issue-select-title">${problem.title || '--'}</div>
                <div class="related-issue-select-meta">
                    <span>${resolutionStatus}</span>
                    <span>指派给：${assignTo}</span>
                    <span>所属地区：${regions}</span>
                    <span>归属终端：${terminals}</span>
                </div>
            </div>
        </label>
    `;
    }).join('') : '<div class="related-issue-modal-empty">暂无可关联的问题</div>';
    
    return `
        <div class="related-issue-modal-overlay" id="relatedIssueModalOverlay" onclick="closeRelatedIssueModal()">
            <div class="related-issue-modal" id="relatedIssueModal" onclick="event.stopPropagation()" data-voice-id="${voiceId}">
                <div class="related-issue-modal-header">
                    <h3 class="related-issue-modal-title">关联问题</h3>
                    <button class="related-issue-modal-close" onclick="closeRelatedIssueModal()">
                        <img src="icon/关闭-默认.svg" alt="关闭" class="close-icon" />
                    </button>
                </div>
                <div class="related-issue-modal-body">
                    <p class="related-issue-modal-desc">请选择需要关联的问题，可多选。</p>
                    <div class="related-issue-modal-list">
                        ${listHtml}
                    </div>
                </div>
                <div class="related-issue-modal-footer">
                    <button class="related-issue-modal-btn related-issue-modal-btn-cancel" onclick="closeRelatedIssueModal()">取消</button>
                    <button class="related-issue-modal-btn related-issue-modal-btn-confirm" onclick="confirmRelatedIssueSelection('${voiceId}')">保存</button>
                </div>
            </div>
        </div>
    `;
}

// 关闭关联问题弹窗
function closeRelatedIssueModal() {
    const overlay = document.getElementById('relatedIssueModalOverlay');
    const modal = document.getElementById('relatedIssueModal');
    if (!overlay || !modal) return;
    
    overlay.classList.remove('show');
    modal.classList.remove('show');
    
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.remove();
        }
    }, 200);
}

// 确认关联问题选择
function confirmRelatedIssueSelection(voiceId) {
    const modal = document.getElementById('relatedIssueModal');
    if (!modal) return;
    
    const checkboxes = modal.querySelectorAll('.related-issue-checkbox:checked');
    const selectedIds = Array.from(checkboxes).map(cb => cb.value).filter(Boolean);
    
    const problems = getProblemsFromStorage();
    const selectedProblems = problems.filter(problem => selectedIds.includes(problem.id));
    
    const voicePoolData = getVoicePoolDataFromStorage();
    const voice = voicePoolData.find(v => v.id === voiceId);
    if (!voice) return;
    
    // 保存关联问题
    voice.relatedIssues = selectedProblems.map(problem => ({
        id: problem.id,
        title: problem.title || '--'
    }));
    
    // 兼容旧数据：如果只有一个问题，也保存到issues字段
    if (selectedProblems.length === 1) {
        voice.issues = selectedProblems[0].title;
    } else if (selectedProblems.length > 1) {
        // 多个问题时，保存第一个问题的标题（保持兼容性）
        voice.issues = selectedProblems[0].title;
    } else {
        voice.issues = '--';
    }
    
    localStorage.setItem('voicePoolData', JSON.stringify(voicePoolData));
    closeRelatedIssueModal();
    
    updateVoiceDetailRelatedIssues(voiceId);
    
    // 如果当前在用户原声池页面，重新渲染
    if (currentMainPage === 'voice-pool') {
        if (currentViewType === 'list') {
            renderVoicePoolTable();
        } else {
            renderVoicePoolKanbanView();
        }
    }
}

// 更新原声详情页的关联问题显示
function updateVoiceDetailRelatedIssues(voiceId) {
    const relatedListContainer = document.querySelector('.related-issues-list');
    if (!relatedListContainer) return;
    
    const voicePoolData = getVoicePoolDataFromStorage();
    const voice = voicePoolData.find(v => v.id === voiceId);
    if (!voice) return;
    
    const problems = getProblemsFromStorage();
    
    let relatedIssuesList = [];
    if (voice.relatedIssues && Array.isArray(voice.relatedIssues)) {
        relatedIssuesList = voice.relatedIssues.map(issue => {
            const problem = problems.find(p => p.id === issue.id);
            return problem || null;
        }).filter(Boolean);
    } else if (voice.issues && voice.issues !== '--') {
        // 兼容旧数据
        const problem = problems.find(p => p.title === voice.issues);
        if (problem) {
            relatedIssuesList = [problem];
        }
    }
    
    relatedListContainer.innerHTML = relatedIssuesList.length > 0 ?
        relatedIssuesList.map(problem => createRelatedIssueItemHtml(problem)).join('') :
        '<div class="empty-state">暂无关联问题</div>';
}

// 添加关联问题弹窗样式
function addRelatedIssueModalStyles() {
    if (document.getElementById('relatedIssueModalStyles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'relatedIssueModalStyles';
    style.textContent = `
        .related-issue-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2100;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease;
        }
        
        .related-issue-modal-overlay.show {
            opacity: 1;
            pointer-events: auto;
        }
        
        .related-issue-modal {
            width: 640px;
            max-height: 80vh;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.2s ease, transform 0.2s ease;
        }
        
        .related-issue-modal-overlay.show .related-issue-modal {
            opacity: 1;
            transform: translateY(0);
        }
        
        .related-issue-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .related-issue-modal-title {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #1f1f1f;
        }
        
        .related-issue-modal-close {
            border: none;
            background: none;
            cursor: pointer;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: background 0.2s ease;
        }
        
        .related-issue-modal-close:hover {
            background: #f5f5f5;
        }
        
        .related-issue-modal-body {
            padding: 20px 24px;
            overflow-y: auto;
        }
        
        .related-issue-modal-desc {
            margin: 0 0 12px 0;
            font-size: 14px;
            color: #8a8a91;
        }
        
        .related-issue-modal-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .related-issue-select-item {
            display: flex;
            gap: 12px;
            border: 1px solid #f0f0f0;
            border-radius: 10px;
            padding: 12px;
            cursor: pointer;
            transition: border-color 0.2s ease, background 0.2s ease;
        }
        
        .related-issue-select-item:hover {
            border-color: #000;
            background: #fafafa;
        }
        
        .related-issue-select-item input[type="checkbox"] {
            width: 16px;
            height: 16px;
            margin-top: 4px;
            cursor: pointer;
        }
        
        .related-issue-select-info {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        
        .related-issue-select-title {
            font-size: 14px;
            font-weight: 600;
            color: #1f1f1f;
        }
        
        .related-issue-select-meta {
            display: flex;
            gap: 16px;
            font-size: 12px;
            color: #8a8a91;
            flex-wrap: wrap;
        }
        
        .related-issue-modal-empty {
            text-align: center;
            padding: 40px 0;
            color: #8a8a91;
            font-size: 14px;
        }
        
        .related-issue-modal-footer {
            padding: 16px 24px;
            border-top: 1px solid #f0f0f0;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }
        
        .related-issue-modal-btn {
            min-width: 96px;
            height: 36px;
            border-radius: 8px;
            border: 1px solid #d9d9d9;
            background: #fff;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .related-issue-modal-btn-cancel:hover {
            border-color: #000;
            color: #000;
        }
        
        .related-issue-modal-btn-confirm {
            background: #000;
            color: #fff;
            border-color: #000;
        }
        
        .related-issue-modal-btn-confirm:hover {
            background: #333;
            border-color: #333;
        }
    `;
    document.head.appendChild(style);
}

function handleProblemTitleClick(id, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const drawer = document.getElementById('problemDetailDrawer');
    if (drawer && drawer.classList.contains('show')) {
        switchProblemDetail(id);
    } else {
        viewProblemDetail(id);
    }
}

// 显示问题详情抽屉
function showProblemDetailDrawer(problem, allProblems) {
    // 如果已存在抽屉，先移除
    const existingDrawer = document.getElementById('problemDetailDrawerOverlay');
    if (existingDrawer) {
        existingDrawer.remove();
    }
    
    // 创建抽屉HTML
    const drawerHtml = createProblemDetailDrawerHtml(problem, allProblems);
    document.body.insertAdjacentHTML('beforeend', drawerHtml);
    
    // 添加样式（如果还没有）
    addProblemDetailDrawerStyles();
    
    // 显示抽屉动画
    setTimeout(() => {
        const overlay = document.getElementById('problemDetailDrawerOverlay');
        const drawer = document.getElementById('problemDetailDrawer');
        if (overlay && drawer) {
            overlay.classList.add('show');
            drawer.classList.add('show');
        }
    }, 10);
    
    // 绑定切换事件
    bindProblemDetailSwitchEvents(allProblems);
    
    // 绑定字段编辑事件
    bindProblemDetailFieldEditEvents();
    
    // 绑定附件上传事件
    bindProblemDetailAttachmentEvents();
}

// 创建问题详情抽屉HTML
function createProblemDetailDrawerHtml(problem, allProblems) {
    // 获取当前索引
    const currentIndex = allProblems.findIndex(p => p.id === problem.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < allProblems.length - 1;
    
    // 解决状态
    const resolutionStatus = problem.resolutionStatus || '待确认';
    const statusClass = resolutionStatus === '待确认' ? 'status-pending' :
                       resolutionStatus === '开发中' ? 'status-processing' :
                       resolutionStatus === '待走查' ? 'status-key' :
                       resolutionStatus === '已解决' ? 'status-unresolved' : 'status-pending';
    
    // 创建时间
    const createdAt = problem.createdAt || new Date().toISOString();
    const createdTime = new Date(createdAt).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).replace(/\//g, '-');
    
    // 所属地区（数组转字符串）
    const regions = Array.isArray(problem.regions) ? problem.regions.join('、') : (problem.regions || '--');
    
    // 归属终端（数组转字符串）
    const terminals = Array.isArray(problem.terminals) ? problem.terminals.join('、') : (problem.terminals || '--');
    
    // 指派给
    const assignTo = problem.assignTo || '--';
    
    // 关联原声
    const relatedOriginalSound = problem.relatedOriginalSound || '--';
    const relatedOriginalSoundId = problem.relatedOriginalSoundId || problem.relatedSoundId || null;
    const voicePoolData = getVoicePoolDataFromStorage();
    const voiceDataMap = voicePoolData.reduce((acc, voice) => {
        if (voice && voice.id) {
            acc[voice.id] = voice;
        }
        return acc;
    }, {});
    
    // 问题描述
    const description = problem.description || '';
    
    // 解决状态选项
    const resolutionStatusOptions = ['待确认', '开发中', '待走查', '已解决'];
    const statusSelectOptions = resolutionStatusOptions.map(status => 
        `<option value="${status}" ${resolutionStatus === status ? 'selected' : ''}>${status}</option>`
    ).join('');
    
    // 获取所有已存在的地区值（用于生成下拉选项）
    let allRegions = [];
    try {
        const stored = localStorage.getItem('definedProblems');
        if (stored) {
            const allData = JSON.parse(stored);
            allRegions = [...new Set(allData.flatMap(p => Array.isArray(p.regions) ? p.regions : (p.regions ? [p.regions] : [])))];
        }
    } catch (error) {
        console.error('读取地区数据失败:', error);
    }
    
    // 固定地区选项
    const fixedRegions = ['北京', '上海', '广州', '深圳', '杭州', '成都', '其他'];
    const allRegionOptions = [...new Set([...fixedRegions, ...allRegions])].sort();
    
    // 获取所有已存在的终端值（用于生成下拉选项）
    let allTerminals = [];
    try {
        const stored = localStorage.getItem('definedProblems');
        if (stored) {
            const allData = JSON.parse(stored);
            allTerminals = [...new Set(allData.flatMap(p => Array.isArray(p.terminals) ? p.terminals : (p.terminals ? [p.terminals] : [])))];
        }
    } catch (error) {
        console.error('读取终端数据失败:', error);
    }
    
    // 固定终端选项
    const fixedTerminals = ['iOS', 'Android', 'Web', '小程序', '其他'];
    const allTerminalOptions = [...new Set([...fixedTerminals, ...allTerminals])].sort();
    
    // 获取所有已存在的指派给值（用于生成下拉选项）
    let allAssignees = [];
    try {
        const stored = localStorage.getItem('definedProblems');
        if (stored) {
            const allData = JSON.parse(stored);
            allAssignees = [...new Set(allData.map(p => p.assignTo).filter(a => a))];
        }
    } catch (error) {
        console.error('读取指派给数据失败:', error);
    }
    
    // 固定指派给选项
    const fixedAssignees = ['产品经理', 'UI设计师', '前端开发', '后端开发', '测试工程师', '其他'];
    const allAssigneeOptions = [...new Set([...fixedAssignees, ...allAssignees])].sort();
    
    const isDesignProblem = problem.problemType === 'design';
    
    const relatedSoundList = Array.isArray(problem.relatedOriginalSounds) ? 
        problem.relatedOriginalSounds.filter(sound => sound && (sound.summary || sound.id)) : 
        (relatedOriginalSound && relatedOriginalSound !== '--' ? [{ id: relatedOriginalSoundId, summary: relatedOriginalSound }] : []);
    
    const relatedSoundItemsHtml = relatedSoundList.length > 0 ? 
        relatedSoundList.map(sound => createRelatedSoundItemHtml(sound, sound.id ? voiceDataMap[sound.id] : null)).join('') :
        '<div class="empty-state">暂无关联原声</div>';
    
    const attachments = Array.isArray(problem.attachments) ? problem.attachments : [];
    const attachmentsListHtml = generateProblemAttachmentListHtml(problem.id, attachments);
    const solution = problem.solution || '';
    
    const detailFieldsHtml = isDesignProblem ? `
        <div class="problem-detail-field">
            <div class="problem-detail-field-label">问题描述</div>
            <textarea class="problem-detail-field-value problem-detail-field-editable" 
                data-field="description" 
                data-item-id="${problem.id}"
                placeholder="--">${description}</textarea>
        </div>
        <div class="problem-detail-field">
            <div class="problem-detail-field-label">解决方案</div>
            <textarea class="problem-detail-field-value problem-detail-field-editable" 
                data-field="solution" 
                data-item-id="${problem.id}"
                placeholder="--">${solution}</textarea>
        </div>
    ` : `
        <div class="problem-detail-field">
            <div class="problem-detail-field-label">问题描述</div>
            <textarea class="problem-detail-field-value problem-detail-field-editable" 
                data-field="description" 
                data-item-id="${problem.id}"
                placeholder="--">${description}</textarea>
        </div>
        <div class="problem-detail-field">
            <div class="problem-detail-field-label-row">
                <div class="problem-detail-field-label">上传附件</div>
                <div class="problem-detail-upload-actions">
                    <input type="file" class="problem-detail-upload-input" data-item-id="${problem.id}" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" />
                    <button class="problem-detail-action-btn link-btn upload-attachment-btn" data-item-id="${problem.id}">
                        <img src="icon/上传附件.svg" alt="上传附件" class="action-btn-icon" />
                        <span>上传附件</span>
                    </button>
                </div>
            </div>
            <div class="problem-detail-upload-wrapper">
                <div class="problem-detail-uploaded-files" id="problemAttachmentsList-${problem.id}">
                    ${attachmentsListHtml}
                </div>
            </div>
        </div>
    `;
    
    const primaryTabId = isDesignProblem ? 'related-images' : 'related-sounds';
    const primaryTabLabel = isDesignProblem ? '相关图片' : '关联原声';
    const primaryTabContentHtml = isDesignProblem ? `
        <div class="related-images-list" id="problemRelatedImagesList-${problem.id}">
            ${attachmentsListHtml}
        </div>
    ` : `
        <div class="related-sounds-list">
            ${relatedSoundItemsHtml}
        </div>
    `;
    
    const tabActionsHtml = isDesignProblem ? `
        <div class="problem-detail-tab-actions related-images-actions" data-problem-id="${problem.id}" style="display: flex;">
            <input type="file" class="problem-detail-upload-input" data-item-id="${problem.id}" multiple accept="image/*" />
            <button class="problem-detail-action-btn link-btn upload-attachment-btn" data-item-id="${problem.id}">
                <img src="icon/上传附件.svg" alt="上传图片" class="action-btn-icon" />
                <span>上传图片</span>
            </button>
        </div>
    ` : `
        <div class="problem-detail-tab-actions">
            <button class="problem-detail-action-btn link-btn" onclick="openRelatedSoundModal('${problem.id}')">
                <img src="icon/关联原声.svg" alt="关联原声" class="action-btn-icon" />
                <span>关联原声</span>
            </button>
        </div>
    `;
    
    const operationRecordsHtml = problem.operationRecords && problem.operationRecords.length ? `
        <div class="operation-records-list">
            ${problem.operationRecords.map(record => `
                <div class="operation-record-item">
                    <div class="operation-record-header">
                        <span class="operation-record-user">${record.user || '系统'}</span>
                        <span class="operation-record-time">${record.time || ''}</span>
                    </div>
                    <div class="operation-record-content">${record.content || ''}</div>
                </div>
            `).join('')}
        </div>
    ` : '<div class="empty-state">暂无操作记录</div>';
    
    return `
        <div class="problem-detail-drawer-overlay" id="problemDetailDrawerOverlay">
            <div class="problem-detail-drawer" id="problemDetailDrawer">
                <!-- 抽屉头部 -->
                <div class="problem-detail-drawer-header">
                    <div class="problem-detail-header-top">
                        <div class="problem-detail-header-left">
                            <input type="text" class="problem-detail-title problem-detail-title-editable" 
                                value="${problem.title || ''}" 
                                placeholder="请输入标题"
                                data-field="title"
                                data-item-id="${problem.id}" />
                            <div class="problem-detail-header-actions">
                                <button class="problem-detail-delete-btn" onclick="deleteProblemItem('${problem.id}')" title="删除">
                                    <img src="icon/删除-默认.svg" alt="删除" class="delete-icon" />
                                </button>
                                <button class="problem-detail-close-btn" onclick="closeProblemDetailDrawer()" title="关闭">
                                    <img src="icon/关闭-默认.svg" alt="关闭" class="close-icon" />
                                </button>
                            </div>
                        </div>
                        <div class="problem-detail-tags">
                            <div class="problem-detail-tags-left">
                                <select class="problem-detail-status-select problem-detail-header-editable ${statusClass}" 
                                    data-field="resolutionStatus"
                                    data-item-id="${problem.id}">
                                    ${statusSelectOptions}
                                </select>
                                <div class="problem-detail-header-fields">
                                    <div class="problem-detail-header-field-wrapper">
                                        <span class="problem-detail-header-field-display">
                                            <img src="icon/所属地区.svg" alt="所属地区" class="problem-detail-header-field-icon" />
                                            <span class="problem-detail-header-field-text">${regions}</span>
                                        </span>
                                        <select class="problem-detail-header-field-select problem-detail-header-editable" 
                                            data-field="regions"
                                            data-item-id="${problem.id}">
                                            ${createProblemHeaderOptionsHtml('regions', Array.isArray(problem.regions) ? problem.regions[0] : (problem.regions || ''))}
                                        </select>
                                    </div>
                                    <div class="problem-detail-header-field-wrapper">
                                        <span class="problem-detail-header-field-display">
                                            <img src="icon/归属终端.svg" alt="归属终端" class="problem-detail-header-field-icon" />
                                            <span class="problem-detail-header-field-text">${terminals}</span>
                                        </span>
                                        <select class="problem-detail-header-field-select problem-detail-header-editable" 
                                            data-field="terminals"
                                            data-item-id="${problem.id}">
                                            ${createProblemHeaderOptionsHtml('terminals', Array.isArray(problem.terminals) ? problem.terminals[0] : (problem.terminals || ''))}
                                        </select>
                                    </div>
                                    <div class="problem-detail-header-field-wrapper">
                                        <span class="problem-detail-header-field-display">
                                            <img src="icon/指派给.svg" alt="指派给" class="problem-detail-header-field-icon" />
                                            <span class="problem-detail-header-field-text">${assignTo}</span>
                                        </span>
                                        <select class="problem-detail-header-field-select problem-detail-header-editable" 
                                            data-field="assignTo"
                                            data-item-id="${problem.id}">
                                            ${createProblemHeaderOptionsHtml('assignTo', assignTo)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="problem-detail-tags-right">
                                <span class="problem-detail-creator">创建于 ${createdTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 抽屉内容 -->
                <div class="problem-detail-drawer-body">
                    <div class="problem-detail-section">
                        <!-- 问题详情区域 -->
                        <div class="problem-detail-section-header">
                            <span class="problem-detail-section-title active">问题详情</span>
                        </div>
                        <div class="problem-detail-section-content problem-detail-main-content">
                            ${detailFieldsHtml}
                        </div>
                    </div>
                    
                    <div class="problem-detail-section problem-detail-other-content">
                        <div class="problem-detail-tabs-container">
                            <div class="problem-detail-tabs-left">
                                <button class="problem-detail-filter-tab active" data-tab="${primaryTabId}">${primaryTabLabel}</button>
                                <button class="problem-detail-filter-tab" data-tab="operation-records">操作记录</button>
                            </div>
                            ${tabActionsHtml}
                        </div>
                        
                        <div class="problem-detail-tab-content">
                            <div class="problem-detail-tab-pane active" id="${primaryTabId}-tab">
                                ${primaryTabContentHtml}
                            </div>
                            <div class="problem-detail-tab-pane" id="operation-records-tab">
                                ${operationRecordsHtml}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateProblemAttachmentListHtml(problemId, attachments) {
    if (!Array.isArray(attachments) || attachments.length === 0) {
        return '<div class="problem-detail-upload-empty">暂无附件</div>';
    }
    
    return attachments.map(attachment => `
        <div class="problem-attachment-item" data-attachment-id="${attachment.id}">
            <div class="problem-attachment-info">
                <span class="problem-attachment-name">${attachment.name || '未命名文件'}</span>
                <span class="problem-attachment-meta">${formatFileSize(attachment.size || 0)}</span>
            </div>
            <div class="problem-attachment-actions">
                ${attachment.url ? `<a class="problem-attachment-download" href="${attachment.url}" download="${attachment.name || 'attachment'}">下载</a>` : ''}
                <button class="problem-attachment-remove" onclick="removeProblemAttachment('${problemId}', '${attachment.id}')">删除</button>
            </div>
        </div>
    `).join('');
}
function createProblemHeaderOptionsHtml(field, currentValue) {
    const options = getProblemHeaderOptions(field);
    const safeValue = currentValue || '';
    const optionSet = new Set(options);
    if (safeValue && !optionSet.has(safeValue)) {
        options.unshift(safeValue);
    }
    const placeholder = '<option value="">请选择</option>';
    const optionHtml = options
        .filter(Boolean)
        .map(option => `<option value="${option}" ${option === safeValue ? 'selected' : ''}>${option}</option>`)
        .join('');
    return placeholder + optionHtml;
}

function getProblemHeaderOptions(field) {
    const problems = getProblemsFromStorage();
    const values = new Set();
    problems.forEach(problem => {
        const data = problem[field];
        if (Array.isArray(data)) {
            data.forEach(item => item && values.add(item));
        } else if (data) {
            values.add(data);
        }
    });
    if (values.size === 0) {
        const defaults = {
            regions: ['全国', '北京', '上海', '广州'],
            terminals: ['iOS', 'Android', 'Web', '小程序'],
            assignTo: ['产品经理', 'UI设计师', '前端开发', '后端开发', '测试工程师']
        };
        return defaults[field] || [];
    }
    return Array.from(values);
}
// 切换问题详情
function switchProblemDetail(id) {
    const stored = localStorage.getItem('definedProblems');
    let problems = [];
    if (stored) {
        problems = JSON.parse(stored);
    }
    const problem = problems.find(p => p.id === id);
    
    if (!problem) {
        return;
    }
    
    // 更新抽屉内容
    const drawerHtml = createProblemDetailDrawerHtml(problem, problems);
    const overlay = document.getElementById('problemDetailDrawerOverlay');
    if (overlay) {
        overlay.outerHTML = drawerHtml;
    }
    
    // 重新绑定事件
    bindProblemDetailSwitchEvents(problems);
    
    // 重新绑定字段编辑事件
    bindProblemDetailFieldEditEvents();
    
    // 重新绑定附件上传事件
    bindProblemDetailAttachmentEvents();
    
    const newOverlay = document.getElementById('problemDetailDrawerOverlay');
    const newDrawer = document.getElementById('problemDetailDrawer');
    if (newOverlay && newDrawer) {
        requestAnimationFrame(() => {
            newOverlay.classList.add('show');
            newDrawer.classList.add('show');
        });
    }
}

// 绑定问题详情切换事件
function bindProblemDetailSwitchEvents(allProblems) {
    const tabButtons = document.querySelectorAll('.problem-detail-filter-tab');
    tabButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            if (!tabName) return;
            
            document.querySelectorAll('.problem-detail-filter-tab').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.problem-detail-tab-pane').forEach(pane => pane.classList.remove('active'));
            const targetPane = document.getElementById(`${tabName}-tab`);
            if (targetPane) {
                targetPane.classList.add('active');
            }
            
            document.querySelectorAll('.related-images-actions').forEach(actions => {
                if (tabName === 'related-images') {
                    actions.style.display = 'flex';
                } else {
                    actions.style.display = 'none';
                }
            });
        });
    });
}

// 绑定字段编辑事件
function bindProblemDetailFieldEditEvents() {
    // 绑定所有可编辑字段的失焦事件
    const editableFields = document.querySelectorAll('.problem-detail-field-editable');
    editableFields.forEach(field => {
        // 移除旧的事件监听器（通过克隆节点）
        const newField = field.cloneNode(true);
        field.parentNode.replaceChild(newField, field);
        
        newField.addEventListener('blur', function() {
            const fieldName = this.getAttribute('data-field');
            const itemId = this.getAttribute('data-item-id');
            const value = this.value.trim();
            
            if (!itemId || !fieldName) return;
            
            // 获取数据
            const stored = localStorage.getItem('definedProblems');
            let problems = [];
            if (stored) {
                problems = JSON.parse(stored);
            }
            
            // 找到对应的问题
            const problem = problems.find(p => p.id === itemId);
            if (!problem) return;
            
            // 保存字段值
            if (fieldName === 'regions' || fieldName === 'terminals') {
                const values = value ? value.split(/[,，、\s]+/).filter(Boolean) : [];
                problem[fieldName] = values;
            } else if (fieldName === 'assignTo') {
                problem.assignTo = value || '';
            } else {
                problem[fieldName] = value || null;
            }
            
            // 保存到localStorage
            localStorage.setItem('definedProblems', JSON.stringify(problems));
            
            console.log(`已保存字段 ${fieldName}:`, value);
            
            // 更新表格和看板视图
            if (currentMainPage === 'problem-pool') {
                if (currentProblemViewType === 'list') {
                    renderProblemPoolTable();
                } else {
                    renderProblemPoolKanbanView();
                }
            }
        });
    });
    
    // 更新状态选择器的样式
    function updateStatusSelectStyle(selectElement) {
        const value = selectElement.value;
        // 移除所有状态类
        selectElement.classList.remove('status-pending', 'status-processing', 'status-key', 'status-unresolved');
        
        if (value === '待确认') {
            selectElement.classList.add('status-pending');
        } else if (value === '开发中') {
            selectElement.classList.add('status-processing');
        } else if (value === '待走查') {
            selectElement.classList.add('status-key');
        } else if (value === '已解决') {
            selectElement.classList.add('status-unresolved');
        }
    }
    
    // 更新头部字段显示层
    function updateHeaderFieldDisplay(selectElement) {
        const wrapper = selectElement.closest('.problem-detail-header-field-wrapper');
        if (!wrapper) return;
        
        const displayElement = wrapper.querySelector('.problem-detail-header-field-display');
        if (!displayElement) return;
        
        const textElement = displayElement.querySelector('.problem-detail-header-field-text');
        if (!textElement) return;
        
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        const displayText = selectElement.value ? (selectedOption ? selectedOption.text : selectElement.value) : '--';
        textElement.textContent = displayText;
    }
    
    // 绑定header字段的编辑事件
    const headerEditableFields = document.querySelectorAll('.problem-detail-header-editable');
    headerEditableFields.forEach(field => {
        const newField = field.cloneNode(true);
        field.parentNode.replaceChild(newField, field);
        
        // 如果是状态选择器，初始化样式
        if (newField.classList.contains('problem-detail-status-select')) {
            updateStatusSelectStyle(newField);
        }
        
        // 如果是头部字段选择器，初始化显示
        if (newField.classList.contains('problem-detail-header-field-select')) {
            updateHeaderFieldDisplay(newField);
        }
        
        newField.addEventListener('change', function() {
            const fieldName = this.getAttribute('data-field');
            const itemId = this.getAttribute('data-item-id');
            let value = this.value.trim();
            
            if (!itemId || !fieldName) return;
            
            // 如果是状态选择器，更新样式
            if (fieldName === 'resolutionStatus' && this.classList.contains('problem-detail-status-select')) {
                updateStatusSelectStyle(this);
            }
            
            // 如果是头部字段选择器，更新显示
            if (this.classList.contains('problem-detail-header-field-select')) {
                updateHeaderFieldDisplay(this);
            }
            
            // 获取数据
            const stored = localStorage.getItem('definedProblems');
            let problems = [];
            if (stored) {
                problems = JSON.parse(stored);
            }
            
            // 找到对应的问题
            const problem = problems.find(p => p.id === itemId);
            if (!problem) return;
            
            // 保存字段值
            if (fieldName === 'regions' || fieldName === 'terminals') {
                // 地区或终端：保存为数组
                problem[fieldName] = value ? [value] : [];
            } else {
                problem[fieldName] = value || null;
            }
            
            // 保存到localStorage
            localStorage.setItem('definedProblems', JSON.stringify(problems));
            
            console.log(`已保存header字段 ${fieldName}:`, value);
            
            // 更新表格和看板视图
            if (currentMainPage === 'problem-pool') {
                if (currentProblemViewType === 'list') {
                    renderProblemPoolTable();
                } else {
                    renderProblemPoolKanbanView();
                }
            }
        });
    });
    
    // 绑定标题输入框的失焦事件
    const titleInput = document.querySelector('.problem-detail-title-editable');
    if (titleInput) {
        const newTitleInput = titleInput.cloneNode(true);
        titleInput.parentNode.replaceChild(newTitleInput, titleInput);
        
        newTitleInput.addEventListener('blur', function() {
            const itemId = this.getAttribute('data-item-id');
            const value = this.value.trim();
            
            if (!itemId) return;
            
            // 获取数据
            const stored = localStorage.getItem('definedProblems');
            let problems = [];
            if (stored) {
                problems = JSON.parse(stored);
            }
            
            // 找到对应的问题
            const problem = problems.find(p => p.id === itemId);
            if (!problem) return;
            
            // 保存标题
            problem.title = value || null;
            
            // 保存到localStorage
            localStorage.setItem('definedProblems', JSON.stringify(problems));
            
            console.log('已保存标题:', value);
            
            // 更新表格和看板视图
            if (currentMainPage === 'problem-pool') {
                if (currentProblemViewType === 'list') {
                    renderProblemPoolTable();
                } else {
                    renderProblemPoolKanbanView();
                }
            }
        });
    }
}

function bindProblemDetailAttachmentEvents() {
    const uploadButtons = document.querySelectorAll('.upload-attachment-btn');
    uploadButtons.forEach(button => {
        const parent = button.parentNode;
        if (!parent) return;
        const newButton = button.cloneNode(true);
        parent.replaceChild(newButton, button);
        attachProblemDetailUploadButtonEvents(newButton);
    });
    
    const uploadInputs = document.querySelectorAll('.problem-detail-upload-input');
    uploadInputs.forEach(input => {
        const parent = input.parentNode;
        if (!parent) return;
        const newInput = input.cloneNode(true);
        parent.replaceChild(newInput, input);
        attachProblemDetailUploadInputEvents(newInput);
    });
}

function attachProblemDetailUploadButtonEvents(button) {
    if (!button) return;
    const problemId = button.getAttribute('data-item-id');
    if (!problemId) return;
    
    button.addEventListener('click', () => {
        const input = button.parentElement?.querySelector(`.problem-detail-upload-input[data-item-id="${problemId}"]`);
        if (input) {
            input.click();
        }
    });
}

function attachProblemDetailUploadInputEvents(input) {
    if (!input) return;
    const problemId = input.getAttribute('data-item-id');
    if (!problemId) {
        return;
    }
    
    input.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            handleProblemAttachmentFiles(problemId, files);
            event.target.value = '';
        }
    });
}

function handleProblemAttachmentFiles(problemId, fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB
    const readTasks = [];
    
    files.forEach(file => {
        if (file.size > MAX_SIZE) {
            if (typeof showNotification === 'function') {
                showNotification(`文件 ${file.name} 超过20MB，已被跳过`, 'warning');
            }
            return;
        }
        readTasks.push(new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve({
                    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: reader.result
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        }));
    });
    
    if (readTasks.length === 0) {
        return;
    }
    
    Promise.all(readTasks)
        .then(newAttachments => {
            const stored = localStorage.getItem('definedProblems');
            let problems = [];
            if (stored) {
                problems = JSON.parse(stored);
            }
            const problem = problems.find(p => p.id === problemId);
            if (!problem) return;
            
            if (!Array.isArray(problem.attachments)) {
                problem.attachments = [];
            }
            problem.attachments.push(...newAttachments);
            
            localStorage.setItem('definedProblems', JSON.stringify(problems));
            updateProblemAttachmentList(problemId);
            if (typeof showNotification === 'function') {
                showNotification('附件上传成功', 'success');
            }
        })
        .catch(error => {
            console.error('上传附件失败:', error);
            if (typeof showNotification === 'function') {
                showNotification('附件上传失败，请重试', 'error');
            }
        });
}

function updateProblemAttachmentList(problemId) {
    const listElement = document.getElementById(`problemAttachmentsList-${problemId}`) || document.getElementById(`problemRelatedImagesList-${problemId}`);
    if (!listElement) return;
    
    const stored = localStorage.getItem('definedProblems');
    let problems = [];
    if (stored) {
        problems = JSON.parse(stored);
    }
    const problem = problems.find(p => p.id === problemId);
    const attachments = problem && Array.isArray(problem.attachments) ? problem.attachments : [];
    listElement.innerHTML = generateProblemAttachmentListHtml(problemId, attachments);
}

function removeProblemAttachment(problemId, attachmentId) {
    const stored = localStorage.getItem('definedProblems');
    let problems = [];
    if (stored) {
        problems = JSON.parse(stored);
    }
    const problem = problems.find(p => p.id === problemId);
    if (!problem || !Array.isArray(problem.attachments)) {
        return;
    }
    
    problem.attachments = problem.attachments.filter(att => att.id !== attachmentId);
    localStorage.setItem('definedProblems', JSON.stringify(problems));
    updateProblemAttachmentList(problemId);
    if (typeof showNotification === 'function') {
        showNotification('已删除附件', 'success');
    }
}

// 删除问题
function deleteProblemItem(id) {
    // 确认删除
    if (!confirm('确定要删除这个问题吗？')) {
        return;
    }
    
    // 从localStorage读取数据
    let allProblems = [];
    try {
        const stored = localStorage.getItem('definedProblems');
        if (stored) {
            allProblems = JSON.parse(stored);
        }
    } catch (error) {
        console.error('读取数据失败:', error);
        if (typeof showNotification === 'function') {
            showNotification('读取数据失败', 'error');
        }
        return;
    }
    
    // 删除数据
    const filteredProblems = allProblems.filter(problem => problem.id !== id);
    
    // 保存到localStorage
    try {
        localStorage.setItem('definedProblems', JSON.stringify(filteredProblems));
        if (typeof showNotification === 'function') {
            showNotification('删除成功', 'success');
        }
        
        // 关闭抽屉
        closeProblemDetailDrawer();
        
        // 重新渲染问题列表（如果列表存在）
        if (typeof renderProblemList === 'function') {
            renderProblemList();
        }
    } catch (error) {
        console.error('保存数据失败:', error);
        if (typeof showNotification === 'function') {
            showNotification('保存数据失败', 'error');
        }
    }
}

// 关闭问题详情抽屉
function closeProblemDetailDrawer() {
    const overlay = document.getElementById('problemDetailDrawerOverlay');
    const drawer = document.getElementById('problemDetailDrawer');
    
    if (overlay && drawer) {
        overlay.classList.remove('show');
        drawer.classList.remove('show');
        
        // 等待动画完成后移除元素
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 300);
    }
}

// 添加问题详情抽屉样式
function addProblemDetailDrawerStyles() {
    // 检查样式是否已添加
    if (document.getElementById('problemDetailDrawerStyles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'problemDetailDrawerStyles';
    style.textContent = `
        .problem-detail-drawer-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            z-index: 2000;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        }
        
        .problem-detail-drawer-overlay.show {
            opacity: 1;
        }
        
        .problem-detail-drawer-overlay.show .problem-detail-drawer {
            pointer-events: auto;
        }
        
        .problem-detail-drawer {
            position: fixed;
            top: 0;
            right: 0;
            width: 660px;
            height: 100vh;
            background: #ffffff;
            box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .problem-detail-drawer.show {
            transform: translateX(0);
        }
        
        .problem-detail-drawer-header {
            flex-shrink: 0;
            min-height: 110px;
            padding: 24px;
            border-bottom: 1px solid #F2F2F5;
            background: linear-gradient(135deg, #F4F1FF 0%, #FFFFFF 50%, #FAFFE1 100%);
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
        }
        
        .problem-detail-header-top {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .problem-detail-header-left {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
        }
        
        .problem-detail-title {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            color: #333;
            line-height: 1.4;
            flex: 1;
        }
        
        .problem-detail-title-editable {
            width: 100%;
            border: none;
            background: transparent;
            font-size: 24px;
            font-weight: 600;
            color: #333;
            line-height: 1.4;
            padding: 0;
            outline: none;
            flex: 1;
            font-family: inherit;
        }
        
        .problem-detail-title-editable:focus {
            background: rgba(255, 255, 255, 0.5);
            border-radius: 4px;
            padding: 2px 4px;
        }
        
        .problem-detail-header-actions {
            display: flex;
            gap: 12px;
            align-items: center;
        }
        
        .problem-detail-close-btn,
        .problem-detail-delete-btn {
            width: 28px;
            height: 28px;
            border: none;
            background: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all 0.2s ease;
            padding: 0;
        }
        
        
        .problem-detail-close-btn:hover .close-icon {
            content: url('icon/关闭-悬停.svg');
        }
        
        .delete-icon {
            width: 28px;
            height: 28px;
            transition: all 0.2s ease;
        }
        
        .problem-detail-delete-btn:hover .delete-icon {
            content: url('icon/删除-悬停.svg');
        }
        
        .problem-detail-tags {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
        }
        
        .problem-detail-tags-left {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            align-items: center;
            flex: 1;
        }
        
        .problem-detail-header-fields {
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
        }
        
        .problem-detail-header-field-wrapper {
            position: relative;
            display: inline-flex;
            align-items: center;
            min-width: 64px;
            width: auto;
            height: 22px;
        }
        
        .problem-detail-header-field-display {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            pointer-events: none;
            z-index: 1;
            padding: 0 4px;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            position: relative;
        }
        
        .problem-detail-header-field-icon {
            width: 12px;
            height: 12px;
            flex-shrink: 0;
        }
        
        .problem-detail-header-field-text {
            font-size: 12px;
            line-height: 18px;
            font-weight: 400;
            color: #8A8A91;
        }
        
        .problem-detail-header-field-display::after {
            content: '';
            display: none;
            width: 12px;
            height: 12px;
            margin-left: 4px;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23BABABF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: center;
            background-size: contain;
            flex-shrink: 0;
        }
        
        .problem-detail-header-field-wrapper:hover .problem-detail-header-field-display::after {
            display: block;
        }
        
        .problem-detail-header-field-select {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            z-index: 2;
            cursor: pointer;
            padding: 0;
            appearance: none;
            border: none;
            background: transparent;
        }
        
        .problem-detail-header-field-wrapper:hover {
            background-color: #ffffff;
        }
        
        .problem-detail-header-field-wrapper:hover .problem-detail-header-field-display {
            background-color: #ffffff;
        }
        
        .problem-detail-header-field-wrapper:focus-within .problem-detail-header-field-display {
            background-color: #ffffff;
        }
        
        .problem-detail-header-field-wrapper:focus-within .problem-detail-header-field-display::after {
            display: block;
        }
        
        .problem-detail-tags-right {
            display: flex;
            align-items: center;
            margin-left: auto;
        }
        
        .problem-detail-creator {
            color: #BABABF;
            font-size: 12px;
            line-height: 18px;
            white-space: nowrap;
        }
        
        /* Header可编辑字段样式 */
        .problem-detail-header-editable {
            display: inline-flex;
            align-items: center;
            padding: 0 4px;
            border: 1px solid transparent;
            background: transparent;
            font-size: 12px;
            line-height: 18px;
            font-weight: 400;
            color: #8A8A91;
            border-radius: 4px;
            transition: all 0.2s ease;
            font-family: inherit;
        }
        
        .problem-detail-status-select {
            appearance: none;
            background-image: none;
            background-repeat: no-repeat;
            background-position: right 4px center;
            background-size: 12px;
            padding: 0 4px;
            cursor: pointer;
            height: 22px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid;
            background-color: transparent;
            border-radius: 4px;
            font-size: 12px;
            line-height: 18px;
            font-weight: 500;
            box-sizing: border-box;
            min-width: 52px;
            width: auto;
        }
        
        /* 状态选择器的颜色类 */
        .problem-detail-status-select.status-pending {
            color: #83AF3B;
            border-color: #83AF3B;
        }
        
        .problem-detail-status-select.status-processing {
            color: #1890ff;
            border-color: #1890ff;
        }
        
        .problem-detail-status-select.status-key {
            color: #A794FF;
            border-color: #A794FF;
        }
        
        .problem-detail-status-select.status-unresolved {
            color: #BABABF;
            border-color: #BABABF;
        }
        
        .problem-detail-status-select:hover {
            background-color: #ffffff;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23BABABF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
            padding-right: 20px;
        }
        
        .problem-detail-status-select:focus {
            outline: none;
            background-color: #ffffff;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23BABABF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
            padding-right: 20px;
        }
        
        .problem-detail-status-select.status-pending:hover,
        .problem-detail-status-select.status-pending:focus {
            border-color: #83AF3B;
        }
        
        .problem-detail-status-select.status-processing:hover,
        .problem-detail-status-select.status-processing:focus {
            border-color: #1890ff;
        }
        
        .problem-detail-status-select.status-key:hover,
        .problem-detail-status-select.status-key:focus {
            border-color: #A794FF;
        }
        
        .problem-detail-status-select.status-unresolved:hover,
        .problem-detail-status-select.status-unresolved:focus {
            border-color: #BABABF;
        }
        
        .problem-detail-drawer-body {
            flex: 1;
            overflow-y: auto;
            padding: 20px 24px;
            display: flex;
            flex-direction: column;
            gap: 24px;
        }
        
        .problem-detail-section-header {
            background: transparent;
            padding: 0;
            border-bottom: none;
            flex-shrink: 0;
            margin-bottom: 16px;
        }
        
        .problem-detail-section-title {
            padding: 6px 0;
            border: none;
            background: transparent;
            border-radius: 6px;
            font-size: 16px;
            line-height: 20px;
            font-weight: 400;
            color: #8A8A91;
            cursor: default;
            position: relative;
            z-index: 1;
        }
        
        .problem-detail-section-title.active {
            background: transparent;
            color: #000000;
            font-weight: bold;
            z-index: 2;
        }
        
        .problem-detail-section-title.active::after {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%) rotate(2deg);
            width: 70px;
            height: 10px;
            background-color: #D7FE03;
            border-radius: 4px;
            z-index: -1;
            box-shadow: 0 4px 10px 0 rgba(215, 254, 3, 0.3);
        }
        
        .problem-detail-section-content {
            padding: 20px 0;
            border-radius: 0;
        }
        
        .problem-detail-main-content {
            max-height: 520px;
            overflow-y: auto;
            padding: 0;
        }
        
        .problem-detail-field {
            margin-bottom: 20px;
        }
        
        .problem-detail-field:last-child {
            margin-bottom: 0;
        }
        
        .problem-detail-field-label {
            font-size: 14px;
            font-weight: 500;
            line-height: 20px;
            color: #000;
            margin-bottom: 8px;
        }
        
        .problem-detail-field-label-row .problem-detail-field-label {
            margin-bottom: 0;
        }
        
        .problem-detail-field-value {
            font-size: 14px;
            color: #333;
            line-height: 1.6;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 6px;
            min-height: 20px;
        }
        
        .problem-detail-field-value:empty::before {
            content: '--';
            color: #999;
        }
        
        .problem-detail-field-editable {
            width: 100%;
            border: 1px solid #F4F4F4;
            resize: vertical;
            font-family: inherit;
            font-size: 14px;
            color: #333;
            line-height: 1.6;
            padding: 12px;
            background: #fff;
            border-radius: 8px;
            min-height: 120px;
            transition: all 0.2s ease;
            outline: none;
            box-sizing: border-box;
        }
        
        .problem-detail-field-editable:hover {
            border-color: #D9D9DE;
        }
        
        .problem-detail-field-editable:focus {
            border-color: #000;
            background: #ffffff;
            box-shadow: none;
        }
        
        .problem-detail-field-editable::placeholder {
            color: #999;
        }
        
        .problem-detail-field-readonly {
            background: #f8f9fa;
            border: none;
            color: #333;
        }
        
        .problem-detail-field-readonly .issues-tag {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            background: #f0f0f0;
            border-radius: 4px;
            font-size: 14px;
        }
        
        .problem-detail-field-readonly .issues-tag-icon {
            width: 16px;
            height: 16px;
        }
        
        .problem-detail-field-readonly .issues-tag-text {
            color: #333;
        }
        
        .problem-detail-field-label-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 8px;
        }
        
        .problem-detail-upload-actions {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .problem-detail-upload-input {
            display: none;
        }
        
        .problem-detail-upload-wrapper {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .problem-detail-uploaded-files {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .problem-attachment-item {
            border: 1px solid #f0f0f0;
            border-radius: 10px;
            padding: 12px;
            background: #ffffff;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: border-color 0.2s ease, background 0.2s ease;
        }
        
        .problem-attachment-item:hover {
            border-color: #BABABF;
            background: #ffffff;
        }
        
        .problem-attachment-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .problem-attachment-name {
            font-size: 14px;
            line-height: 20px;
            color: #494949;
            font-weight: 400;
        }
        
        .problem-attachment-meta {
            font-size: 12px;
            color: #8A8A91;
        }
        
        .problem-attachment-actions {
            display: flex;
            gap: 12px;
            align-items: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease;
        }
        
        .problem-attachment-item:hover .problem-attachment-actions {
            opacity: 1;
            pointer-events: auto;
        }
        
        .problem-attachment-download,
        .problem-attachment-remove {
            font-size: 12px;
            color: #000;
            text-decoration: none;
            border: none;
            background: none;
            cursor: pointer;
            padding: 0;
        }
        
        .problem-attachment-download:hover {
            text-decoration: underline;
        }
        
        .problem-detail-upload-empty {
            font-size: 12px;
            color: #8A8A91;
            text-align: center;
            padding: 12px 0;
        }
        
        .problem-detail-other-content {
            padding-top: 0;
            margin-top: 8px;
        }
        
        .problem-detail-tabs-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            overflow: visible;
            margin-top: 8px;
            margin-bottom: 16px;
        }
        
        .problem-detail-tabs-left {
            display: flex;
            align-items: center;
            gap: 24px;
        }
        
        .problem-detail-filter-tab {
            padding: 6px 0;
            border: none;
            background: transparent;
            border-radius: 6px;
            font-size: 16px;
            line-height: 20px;
            font-weight: 400;
            color: #8A8A91;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            z-index: 1;
        }
        
        .problem-detail-filter-tab:hover {
            background: #f5f5f5;
            color: #333;
        }
        
        .problem-detail-filter-tab.active {
            background: transparent;
            color: #000000;
            font-weight: bold;
            z-index: 2;
        }
        
        .problem-detail-filter-tab.active::after {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%) rotate(2deg);
            width: 70px;
            height: 10px;
            background-color: #D7FE03;
            border-radius: 4px;
            z-index: -1;
            box-shadow: 0 4px 10px 0 rgba(215, 254, 3, 0.3);
        }
        
        .problem-detail-tab-actions {
            display: flex;
            gap: 12px;
        }
        
        .problem-detail-action-btn {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 6px 16px;
            border: 1px solid #d9d9d9;
            border-radius: 8px;
            background: #ffffff;
            font-size: 14px;
            line-height: 20px;
            font-weight: bold;
            color: #333;
            cursor: pointer;
            transition: all 0.2s ease;
            height: 32px;
        }
        
        .problem-detail-action-btn:hover {
            border-color: #BABABF;
            color: #1890ff;
        }
        
        .problem-detail-action-btn.link-btn {
            background: #ffffff;
            color: #333;
        }
        
        .problem-detail-action-btn .action-btn-icon {
            width: 16px;
            height: 16px;
        }
        
        .problem-detail-tab-content {
            position: relative;
        }
        
        .problem-detail-tab-pane {
            display: none;
        }
        
        .problem-detail-tab-pane.active {
            display: block;
        }
        
        .related-sounds-list,
        .operation-records-list {
            min-height: 120px;
        }
        
        .related-sounds-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .related-images-list {
            min-height: 120px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .related-sound-item {
            padding: 12px;
            border: 1px solid #F2F2F5;
            border-radius: 8px;
            background: transparent;
            display: flex;
            flex-direction: column;
            gap: 4px;
            transition: border-color 0.2s ease, background 0.2s ease;
        }
        
        .related-sound-item:hover {
            border-color: #BABABF;
            background: #ffffff;
        }
        
        .related-sound-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .related-sound-title,
        .related-sound-title-link {
            font-size: 14px;
            font-weight: 500;
            color: #000;
            text-decoration: none;
        }
        
        .related-sound-title-link:hover {
            color: #1890ff;
        }
        
        .related-sound-meta-row {
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
        }
        
        .related-sound-status .kanban-emotion-text {
            color: #8A8A91;
        }
        
        
        .operation-record-item {
            padding: 12px;
            background: #f8f9fa;
            border-radius: 8px;
            margin-bottom: 8px;
        }
        
        .operation-record-item:last-child {
            margin-bottom: 0;
        }
        
        .operation-record-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            font-size: 12px;
            color: #8A8A91;
        }
        
        .operation-record-content {
            font-size: 14px;
            color: #333;
            line-height: 1.6;
        }
    `;
    document.head.appendChild(style);
}

function addRelatedSoundModalStyles() {
    if (document.getElementById('relatedSoundModalStyles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'relatedSoundModalStyles';
    style.textContent = `
        .related-sound-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2100;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease;
        }
        
        .related-sound-modal-overlay.show {
            opacity: 1;
            pointer-events: auto;
        }
        
        .related-sound-modal {
            width: 640px;
            max-height: 80vh;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.2s ease, transform 0.2s ease;
        }
        
        .related-sound-modal-overlay.show .related-sound-modal {
            opacity: 1;
            transform: translateY(0);
        }
        
        .related-sound-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .related-sound-modal-title {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #1f1f1f;
        }
        
        .related-sound-modal-close {
            border: none;
            background: none;
            cursor: pointer;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .related-sound-modal-close:hover {
            background: #f5f5f5;
        }
        
        .related-sound-modal-body {
            padding: 20px 24px;
            overflow-y: auto;
        }
        
        .related-sound-modal-desc {
            margin: 0 0 12px 0;
            font-size: 14px;
            color: #8a8a91;
        }
        
        .related-sound-modal-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .related-sound-select-item {
            display: flex;
            gap: 12px;
            border: 1px solid #f0f0f0;
            border-radius: 10px;
            padding: 12px;
            cursor: pointer;
            transition: border-color 0.2s ease, background 0.2s ease;
        }
        
        .related-sound-select-item:hover {
            border-color: #000;
            background: #fafafa;
        }
        
        .related-sound-select-item input[type="checkbox"] {
            width: 16px;
            height: 16px;
            margin-top: 4px;
            cursor: pointer;
        }
        
        .related-sound-select-info {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        
        .related-sound-select-title {
            font-size: 14px;
            font-weight: 600;
            color: #1f1f1f;
        }
        
        .related-sound-select-meta {
            display: flex;
            gap: 16px;
            font-size: 12px;
            color: #8a8a91;
            flex-wrap: wrap;
        }
        
        .related-sound-modal-empty {
            text-align: center;
            padding: 40px 0;
            color: #8a8a91;
            font-size: 14px;
        }
        
        .related-sound-modal-footer {
            padding: 16px 24px;
            border-top: 1px solid #f0f0f0;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }
        
        .related-sound-modal-btn {
            min-width: 96px;
            height: 36px;
            border-radius: 8px;
            border: 1px solid #d9d9d9;
            background: #fff;
            font-size: 14px;
            cursor: pointer;
        }
        
        .related-sound-modal-btn-cancel:hover {
            border-color: #000;
            color: #000;
        }
        
        .related-sound-modal-btn-confirm {
            background: #000;
            color: #fff;
            border-color: #000;
        }
        
        .related-sound-modal-btn-confirm:hover {
            background: #333;
            border-color: #333;
        }
    `;
    document.head.appendChild(style);
}

// 更新原声卡片的状态（根据用户在下拉面板中的选择）
function transitionToNextStatus(id, targetStatus) {
    // 阻止事件冒泡，避免触发卡片点击等
    if (event) {
        event.stopPropagation();
    }
    
    // 每次从 localStorage 读取最新的 voicePoolData
    let voicePoolData = [];
    try {
        const stored = localStorage.getItem('voicePoolData');
        if (stored) {
            voicePoolData = JSON.parse(stored);
        }
    } catch (error) {
        console.error('读取用户原声池数据失败:', error);
        return;
    }
    
    const item = voicePoolData.find(item => item.id === id);
    if (!item) return;
    
    const statusMap = {
        'pending': { type: 'pending', label: '待评估' },
        'key': { type: 'key', label: '关键反馈' },
        'unresolved': { type: 'unresolved', label: '暂不解决' }
    };
    
    if (!statusMap[targetStatus]) return;
    
    item.status = statusMap[targetStatus];
    
    // 保存到localStorage
    localStorage.setItem('voicePoolData', JSON.stringify(voicePoolData));
    
    // 重新渲染视图（看板或列表）
    if (currentViewType === 'kanban') {
        renderKanbanView();
    } else {
        applyVoicePoolFilter(currentVoicePoolFilter, voicePoolData);
    }
}

// 打开流转状态下拉面板，展示除当前状态外的其他状态选项
function openStatusDropdown(event, id, currentStatus) {
    event.stopPropagation();
    
    const button = event.currentTarget;
    if (!button) return;
    
    // 如果已存在下拉面板，先关闭
    const existingDropdown = document.querySelector('.kanban-status-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    }
    
    const actionsGroup = button.closest('.kanban-card-actions-group');
    if (!actionsGroup) return;
    
    const statusOptions = [
        { type: 'pending', label: '待评估' },
        { type: 'key', label: '关键反馈' },
        { type: 'unresolved', label: '暂不解决' }
    ];
    
    const availableOptions = statusOptions.filter(option => option.type !== currentStatus);
    
    if (availableOptions.length === 0) return;
    
    const dropdown = document.createElement('div');
    dropdown.className = 'kanban-status-dropdown';
    dropdown.innerHTML = availableOptions.map(option => `
        <div class="kanban-status-option" data-status="${option.type}" onclick="handleStatusOptionClick(event, '${id}', '${option.type}')">
            ${option.label}
        </div>
    `).join('');
    
    actionsGroup.appendChild(dropdown);
}

// 处理下拉面板中状态选项点击
function handleStatusOptionClick(event, id, targetStatus) {
    event.stopPropagation();
    
    transitionToNextStatus(id, targetStatus);
    
    // 关闭当前下拉面板
    const dropdown = event.currentTarget.closest('.kanban-status-dropdown');
    if (dropdown) {
        dropdown.remove();
    }
}

// 处理视图切换
function handleViewTabClick(event) {
    const viewTab = event.target.closest('.view-tab');
    if (!viewTab) return;
    
    const viewType = viewTab.getAttribute('data-view');
    if (!viewType) return;
    
    // 判断是用户原声池还是问题跟进池
    const voicePoolHome = document.getElementById('voice-pool-home');
    const problemPoolHome = document.getElementById('problem-pool-home');
    
    if (voicePoolHome && voicePoolHome.contains(viewTab)) {
        // 用户原声池
        // 更新视图状态
        currentViewType = viewType;
        
        // 更新tab的激活状态
        const viewContainer = viewTab.closest('.view-container');
        if (viewContainer) {
            viewContainer.querySelectorAll('.view-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            viewTab.classList.add('active');
        }
        
        // 切换视图显示
        switchViewType(viewType);
    } else if (problemPoolHome && problemPoolHome.contains(viewTab)) {
        // 问题跟进池
        // 更新视图状态
        currentProblemViewType = viewType;
        
        // 更新tab的激活状态
        const viewContainer = viewTab.closest('.view-container');
        if (viewContainer) {
            viewContainer.querySelectorAll('.view-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            viewTab.classList.add('active');
        }
        
        // 切换视图显示
        switchProblemPoolViewType(viewType);
    }
}

// 处理问题类型切换
function handleProblemTypeTabClick(event) {
    const viewTab = event.target.closest('.view-tab');
    if (!viewTab) return;
    
    // 确保只处理问题跟进池主页的view-tab
    const problemPoolHome = document.getElementById('problem-pool-home');
    if (!problemPoolHome || !problemPoolHome.contains(viewTab)) return;
    
    const problemType = viewTab.getAttribute('data-problem-type');
    if (!problemType) return;
    
    // 更新问题类型状态
    currentProblemType = problemType;
    
    // 更新tab的激活状态
    const viewContainer = viewTab.closest('.view-container');
    if (viewContainer) {
        viewContainer.querySelectorAll('.view-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        viewTab.classList.add('active');
    }
    
    // 重新渲染表格和统计数据
    if (currentProblemViewType === 'list') {
        renderProblemPoolTable();
    } else {
        renderProblemPoolKanbanView();
    }
    updateProblemPoolStats();
}

// 处理问题跟进池解决状态筛选
function handleProblemPoolFilterClick(event) {
    const filterTab = event.target.closest('.filter-tab');
    if (!filterTab) return;
    
    // 确保只处理问题跟进池主页的filter-tab
    const problemPoolHome = document.getElementById('problem-pool-home');
    if (!problemPoolHome || !problemPoolHome.contains(filterTab)) return;
    
    const filterType = filterTab.getAttribute('data-filter');
    if (!filterType) return;
    
    // 更新解决状态筛选状态
    currentProblemStatusFilter = filterType;
    
    // 更新tab的激活状态
    const filterContainer = filterTab.closest('.filter-tabs-container');
    if (filterContainer) {
        filterContainer.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        filterTab.classList.add('active');
    }
    
    // 重新渲染表格和统计数据
    if (currentProblemViewType === 'list') {
        renderProblemPoolTable();
    } else {
        renderProblemPoolKanbanView();
    }
    updateProblemPoolStats();
}

// 切换视图类型
function switchViewType(viewType) {
    const listView = document.getElementById('voice-pool-list-view');
    const kanbanView = document.getElementById('voice-pool-kanban-view');
    const dataToolbar = document.querySelector('#voice-pool-home .data-toolbar');
    const homeDataSection = document.querySelector('#voice-pool-home .home-data-section');
    
    const groupBtn = document.getElementById('voice-pool-group-btn');
    const groupPopup = document.getElementById('voice-pool-group-popup');
    
    // 更新当前视图类型
    currentViewType = viewType;
    
    if (viewType === 'list') {
        // 显示列表视图（表格）
        if (listView) {
            listView.style.display = 'block';
        }
        // 隐藏看板视图
        if (kanbanView) {
            kanbanView.style.display = 'none';
        }
        // 保持data-toolbar的padding
        if (dataToolbar) {
            dataToolbar.style.borderBottom = 'none';
            dataToolbar.style.paddingBottom = '12px';
        }
        // 显示分组按钮
        if (groupBtn) {
            groupBtn.style.display = 'flex';
        }
        if (groupPopup) {
            groupPopup.style.display = 'none';
        }
        
        // 重新渲染表格数据
        let voicePoolData = [];
        try {
            const stored = localStorage.getItem('voicePoolData');
            if (stored) {
                voicePoolData = JSON.parse(stored);
            }
        } catch (error) {
            console.error('读取数据失败:', error);
        }
        if (voicePoolData.length > 0) {
            applyVoicePoolFilter(currentVoicePoolFilter, voicePoolData);
        }
    } else if (viewType === 'kanban') {
        // 显示看板视图
        if (kanbanView) {
            kanbanView.style.display = 'flex';
        }
        // 隐藏列表视图（表格）
        if (listView) {
            listView.style.display = 'none';
        }
        // 去掉data-toolbar的border，保持padding
        if (dataToolbar) {
            dataToolbar.style.borderBottom = 'none';
            dataToolbar.style.paddingBottom = '12px';
        }
        // 隐藏分组按钮和分组弹窗
        if (groupBtn) {
            groupBtn.style.display = 'none';
        }
        if (groupPopup) {
            groupPopup.style.display = 'none';
        }
        
        // 重新渲染看板数据
        let voicePoolData = [];
        try {
            const stored = localStorage.getItem('voicePoolData');
            if (stored) {
                voicePoolData = JSON.parse(stored);
            }
        } catch (error) {
            console.error('读取数据失败:', error);
        }
        if (voicePoolData.length > 0) {
            applyVoicePoolFilter(currentVoicePoolFilter, voicePoolData);
        }
        
        // 渲染看板视图数据
        renderKanbanView();
    }
}

// 切换问题跟进池视图类型
function switchProblemPoolViewType(viewType) {
    const listView = document.getElementById('problem-pool-list-view');
    const kanbanView = document.getElementById('problem-pool-kanban-view');
    const dataToolbar = document.querySelector('#problem-pool-home .data-toolbar');
    
    if (viewType === 'list') {
        // 显示列表视图（表格）
        if (listView) {
            listView.style.display = 'block';
        }
        // 隐藏看板视图
        if (kanbanView) {
            kanbanView.style.display = 'none';
        }
        // 保持data-toolbar的padding
        if (dataToolbar) {
            dataToolbar.style.borderBottom = 'none';
            dataToolbar.style.paddingBottom = '12px';
        }
        // 渲染列表视图
        renderProblemPoolTable();
    } else if (viewType === 'kanban') {
        // 显示看板视图
        if (kanbanView) {
            kanbanView.style.display = 'flex';
        }
        // 隐藏列表视图（表格）
        if (listView) {
            listView.style.display = 'none';
        }
        // 去掉data-toolbar的border，保持padding
        if (dataToolbar) {
            dataToolbar.style.borderBottom = 'none';
            dataToolbar.style.paddingBottom = '12px';
        }
        
        // 渲染看板视图数据
        renderProblemPoolKanbanView();
    }
}

// 渲染看板视图
function renderKanbanView() {
    // 从localStorage读取所有数据
    let allData = [];
    try {
        const stored = localStorage.getItem('voicePoolData');
        if (stored) {
            allData = JSON.parse(stored);
        }
    } catch (error) {
        console.error('读取数据失败:', error);
        allData = [];
    }
    
    // 先根据tab筛选类型过滤数据
    let filteredData = [];
    if (currentVoicePoolFilter === 'all') {
        filteredData = allData;
    } else if (currentVoicePoolFilter === 'pending') {
        filteredData = allData.filter(item => item.status && item.status.type === 'pending');
    } else if (currentVoicePoolFilter === 'key') {
        filteredData = allData.filter(item => item.status && item.status.type === 'key');
    } else if (currentVoicePoolFilter === 'unresolved') {
        filteredData = allData.filter(item => item.status && item.status.type === 'unresolved');
    }
    
    // 再应用筛选条件（情感分类、所属模块、分析状态）
    filteredData = applyFilterConditions(filteredData);
    
    // 根据当前筛选tab决定分组方式
    if (currentVoicePoolFilter === 'all') {
        // 全部原声：按状态分组
        const pendingData = filteredData.filter(item => item.status?.type === 'pending');
        const keyData = filteredData.filter(item => item.status?.type === 'key');
        const unresolvedData = filteredData.filter(item => item.status?.type === 'unresolved');
        
        // 更新列标题为状态
        updateKanbanColumnTitles('status');
        
        // 渲染各列
        renderKanbanColumn('pending', pendingData, 'status');
        renderKanbanColumn('key', keyData, 'status');
        renderKanbanColumn('unresolved', unresolvedData, 'status');
    } else {
        // 非全部原声：按情感分类分组
        const negativeData = filteredData.filter(item => {
            const emotionType = item.emotion?.type || 'neutral';
            return emotionType === 'negative';
        });
        const neutralData = filteredData.filter(item => {
            const emotionType = item.emotion?.type || 'neutral';
            return emotionType === 'neutral';
        });
        const positiveData = filteredData.filter(item => {
            const emotionType = item.emotion?.type || 'neutral';
            return emotionType === 'positive';
        });
        
        // 更新列标题为情感分类
        updateKanbanColumnTitles('emotion');
        
        // 渲染各列（使用pending、key、unresolved作为列ID，但显示情感分类标题）
        renderKanbanColumn('pending', negativeData, 'emotion', 'negative');
        renderKanbanColumn('key', neutralData, 'emotion', 'neutral');
        renderKanbanColumn('unresolved', positiveData, 'emotion', 'positive');
    }
}

// 渲染看板列
function renderKanbanColumn(statusType, data, groupType = 'status', emotionType = null) {
    const columnContent = document.getElementById(`kanban-column-${statusType}`);
    if (!columnContent) return;
    
    if (data.length === 0) {
        columnContent.innerHTML = '<div class="kanban-empty">暂无数据</div>';
        return;
    }
    
    columnContent.innerHTML = data.map((item, index) => renderKanbanCard(item, index + 1, groupType)).join('');
    
    // 绑定看板卡片的复选框事件
    columnContent.querySelectorAll('.kanban-card-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateBatchToolbar);
    });
}

// 更新看板列标题
function updateKanbanColumnTitles(groupType) {
    const columns = [
        { id: 'pending', statusTitle: '待评估', emotionTitle: '负向', emotionType: 'negative' },
        { id: 'key', statusTitle: '关键反馈', emotionTitle: '中性', emotionType: 'neutral' },
        { id: 'unresolved', statusTitle: '暂不解决', emotionTitle: '正向', emotionType: 'positive' }
    ];
    
    columns.forEach(column => {
        const columnElement = document.querySelector(`.kanban-column[data-status="${column.id}"]`);
        if (!columnElement) return;
        
        const titleElement = columnElement.querySelector('.kanban-column-title');
        if (!titleElement) return;
        
        if (groupType === 'emotion') {
            // 按情感分类显示
            titleElement.textContent = column.emotionTitle;
        } else {
            // 按状态显示
            titleElement.textContent = column.statusTitle;
        }
    });
}

// 渲染看板卡片
function renderKanbanCard(item, index, groupType = 'status') {
    // 处理关联问题
    const issues = item.issues && item.issues !== '--' ? item.issues : '暂无';
    
    // 获取当前状态，用于流转按钮
    const currentStatus = item.status?.type || 'pending';
    const nextStatusMap = {
        'pending': 'key',
        'key': 'unresolved',
        'unresolved': 'pending'
    };
    const nextStatus = nextStatusMap[currentStatus] || 'pending';
    const nextStatusText = {
        'pending': '关键反馈',
        'key': '暂不解决',
        'unresolved': '待评估'
    }[nextStatus] || '待评估';
    
    // 处理关联问题（看板中展示为"关联问题：xxx"，不展示图标）
    const issuesText = item.issues && item.issues !== '--' ? item.issues : '--';
    
    // 根据分组类型决定显示情感分类还是状态信息
    let infoDisplay = '';
    if (groupType === 'emotion') {
        // 按情感分类分组时，显示状态信息
        const statusLabel = item.status?.text || 
                           (currentStatus === 'pending' ? '待评估' :
                            currentStatus === 'key' ? '关键反馈' : '暂不解决');
        const statusColorClass = currentStatus === 'pending' ? 'kanban-status-text-pending' :
                                 currentStatus === 'key' ? 'kanban-status-text-key' :
                                 'kanban-status-text-unresolved';
        // 状态信息使用文字显示，保持与情感分类相同的样式结构
        infoDisplay = `
            <div class="kanban-card-emotion">
                <span class="kanban-emotion-text ${statusColorClass}">${statusLabel}</span>
            </div>
        `;
    } else {
        // 按状态分组时，显示情感分类信息
        const emotionLabel = item.emotion?.label || '中性';
        const emotionType = item.emotion?.type || 'neutral';
        const emotionIcon = emotionType === 'negative' ? 'icon/负向.svg' : 
                           emotionType === 'positive' ? 'icon/正向.svg' : 
                           'icon/中性.svg';
        infoDisplay = `
            <div class="kanban-card-emotion">
                <img src="${emotionIcon}" alt="${emotionLabel}" class="kanban-emotion-icon" />
                <span class="kanban-emotion-text">${emotionLabel}</span>
            </div>
        `;
    }
    
    return `
        <div class="kanban-card" data-item-id="${item.id}">
            <div class="kanban-card-content">
                <div class="kanban-card-actions-group">
                    <button class="kanban-action-btn-transition" onclick="openStatusDropdown(event, '${item.id}', '${currentStatus}')" title="流转状态">
                        <img src="icon/看板-流转至下一个状态.svg" alt="流转状态" class="kanban-action-icon-small" />
                        <span class="kanban-action-text">流转状态</span>
                    </button>
                    <button class="kanban-action-btn-define" onclick="defineAsProblem('${item.id}')" title="定义为问题">
                        <img src="icon/看板-定义为问题.svg" alt="定义为问题" class="kanban-action-icon-small" />
                        <span class="kanban-action-text">定义为问题</span>
                    </button>
                </div>
                <div class="kanban-card-summary">${item.summary || '--'}</div>
                <div class="kanban-card-info-row">
                    ${infoDisplay}
                    <div class="kanban-card-module">
                        <img src="icon/归属终端.svg" alt="所属模块" class="kanban-card-field-icon" />
                        <span class="kanban-module-value">${item.module || '--'}</span>
                    </div>
                </div>
                <div class="kanban-card-issues">
                    <span class="kanban-issues-value">关联问题：${issuesText}</span>
                </div>
            </div>
        </div>
    `;
}

// 渲染问题跟进池看板视图
function renderProblemPoolKanbanView() {
    // 从localStorage读取所有问题数据
    let allProblems = [];
    try {
        const stored = localStorage.getItem('definedProblems');
        if (stored) {
            allProblems = JSON.parse(stored);
        }
    } catch (error) {
        console.error('读取问题数据失败:', error);
        allProblems = [];
    }
    
    // 根据当前选中的问题类型过滤数据
    if (currentProblemType) {
        allProblems = allProblems.filter(problem => problem.problemType === currentProblemType);
    }
    
    // 根据当前选中的解决状态过滤数据（全部问题tab时不过滤，其他tab按状态过滤）
    let filteredProblems = [];
    if (currentProblemStatusFilter === 'all') {
        // 全部问题tab：显示所有问题，按四种解决状态分组
        filteredProblems = allProblems;
    } else {
        // 其他tab：只显示对应状态的问题
        const statusMap = {
            'pending': '待确认',
            'processing': '开发中',
            'review': '待走查',
            'resolved': '已解决'
        };
        const targetStatus = statusMap[currentProblemStatusFilter];
        if (targetStatus) {
            filteredProblems = allProblems.filter(problem => problem.resolutionStatus === targetStatus);
        } else {
            filteredProblems = allProblems;
        }
    }
    
    // 按创建时间倒序排列（最新的在前）
    filteredProblems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 根据当前tab状态设置看板容器样式和分组方式
    const kanbanContainer = document.getElementById('problem-pool-kanban-view');
    if (kanbanContainer) {
        if (currentProblemStatusFilter === 'all') {
            // 全部问题tab：四列定宽400px，横向滚动，按四种解决状态分组
            kanbanContainer.classList.add('kanban-fixed-width');
            
            // 按四种解决状态分组
            const pendingProblems = filteredProblems.filter(problem => problem.resolutionStatus === '待确认');
            const processingProblems = filteredProblems.filter(problem => problem.resolutionStatus === '开发中');
            const reviewProblems = filteredProblems.filter(problem => problem.resolutionStatus === '待走查');
            const resolvedProblems = filteredProblems.filter(problem => problem.resolutionStatus === '已解决');
            
            // 更新列标题为状态
            updateProblemPoolKanbanColumnTitles('status');
            
            // 显示所有四列
            const pendingColumn = document.querySelector('#problem-pool-kanban-view .kanban-column[data-status="pending"]');
            const processingColumn = document.querySelector('#problem-pool-kanban-view .kanban-column[data-status="processing"]');
            const reviewColumn = document.querySelector('#problem-pool-kanban-view .kanban-column[data-status="review"]');
            const resolvedColumn = document.querySelector('#problem-pool-kanban-view .kanban-column[data-status="resolved"]');
            
            if (pendingColumn) pendingColumn.style.display = 'flex';
            if (processingColumn) processingColumn.style.display = 'flex';
            if (reviewColumn) reviewColumn.style.display = 'flex';
            if (resolvedColumn) resolvedColumn.style.display = 'flex';
            
            // 渲染各列
            renderProblemPoolKanbanColumn('pending', pendingProblems);
            renderProblemPoolKanbanColumn('processing', processingProblems);
            renderProblemPoolKanbanColumn('review', reviewProblems);
            renderProblemPoolKanbanColumn('resolved', resolvedProblems);
        } else {
            // 其他tab：使用默认flex布局，按归属终端分成三栏
            kanbanContainer.classList.remove('kanban-fixed-width');
            
            // 按归属终端分组（管理端、门店端、移动端）
            // 如果一个问题的terminals包含某个终端，就放在对应的列中
            const managementProblems = filteredProblems.filter(problem => {
                const terminals = Array.isArray(problem.terminals) ? problem.terminals : (problem.terminals ? [problem.terminals] : []);
                return terminals.includes('管理端');
            });
            const storeProblems = filteredProblems.filter(problem => {
                const terminals = Array.isArray(problem.terminals) ? problem.terminals : (problem.terminals ? [problem.terminals] : []);
                return terminals.includes('门店端');
            });
            const mobileProblems = filteredProblems.filter(problem => {
                const terminals = Array.isArray(problem.terminals) ? problem.terminals : (problem.terminals ? [problem.terminals] : []);
                return terminals.includes('移动端');
            });
            
            // 更新列标题为归属终端
            updateProblemPoolKanbanColumnTitles('terminal');
            
            // 显示前三列，隐藏第四列
            const pendingColumn = document.querySelector('#problem-pool-kanban-view .kanban-column[data-status="pending"]');
            const processingColumn = document.querySelector('#problem-pool-kanban-view .kanban-column[data-status="processing"]');
            const reviewColumn = document.querySelector('#problem-pool-kanban-view .kanban-column[data-status="review"]');
            const resolvedColumn = document.querySelector('#problem-pool-kanban-view .kanban-column[data-status="resolved"]');
            
            if (pendingColumn) pendingColumn.style.display = 'flex';
            if (processingColumn) processingColumn.style.display = 'flex';
            if (reviewColumn) reviewColumn.style.display = 'flex';
            if (resolvedColumn) resolvedColumn.style.display = 'none';
            
            // 使用pending、processing、review三列来显示三个归属终端
            // pending -> 管理端, processing -> 门店端, review -> 移动端
            renderProblemPoolKanbanColumn('pending', managementProblems);
            renderProblemPoolKanbanColumn('processing', storeProblems);
            renderProblemPoolKanbanColumn('review', mobileProblems);
            renderProblemPoolKanbanColumn('resolved', []); // 清空第四列
        }
    }
}

// 更新问题跟进池看板列标题
function updateProblemPoolKanbanColumnTitles(groupType) {
    const columns = [
        { id: 'pending', statusTitle: '待确认', terminalTitle: '管理端' },
        { id: 'processing', statusTitle: '开发中', terminalTitle: '门店端' },
        { id: 'review', statusTitle: '待走查', terminalTitle: '移动端' },
        { id: 'resolved', statusTitle: '已解决', terminalTitle: '' }
    ];
    
    columns.forEach(column => {
        const columnElement = document.querySelector(`#problem-pool-kanban-view .kanban-column[data-status="${column.id}"]`);
        if (!columnElement) return;
        
        const titleElement = columnElement.querySelector('.kanban-column-title');
        if (!titleElement) return;
        
        if (groupType === 'terminal') {
            // 按归属终端显示
            if (column.terminalTitle) {
                titleElement.textContent = column.terminalTitle;
            }
        } else {
            // 按状态显示
            titleElement.textContent = column.statusTitle;
        }
    });
}

// 渲染问题跟进池看板列
function renderProblemPoolKanbanColumn(statusType, problems) {
    const columnContent = document.getElementById(`problem-kanban-column-${statusType}`);
    if (!columnContent) return;
    
    if (problems.length === 0) {
        columnContent.innerHTML = '<div class="kanban-empty">暂无数据</div>';
        return;
    }
    
    columnContent.innerHTML = problems.map((problem, index) => renderProblemPoolKanbanCard(problem, index + 1)).join('');
    
    // 绑定看板卡片的复选框事件（问题跟进池暂不需要批量操作，但保留事件绑定以备后续扩展）
    columnContent.querySelectorAll('.kanban-card-checkbox').forEach(checkbox => {
        // 可以在这里添加问题跟进池的批量操作逻辑
    });
}

// 渲染问题跟进池看板卡片
function renderProblemPoolKanbanCard(problem, index) {
    const regions = Array.isArray(problem.regions) ? problem.regions.join('、') : (problem.regions || '--');
    const terminals = Array.isArray(problem.terminals) ? problem.terminals.join('、') : (problem.terminals || '--');
    const assignTo = problem.assignTo || '--';
    const resolutionStatus = problem.resolutionStatus || '待确认';
    
    // 处理关联原声显示 - 去掉icon和背景，只保留文字
    const relatedSound = problem.relatedOriginalSound || '--';
    const relatedSoundText = relatedSound !== '--' ? relatedSound : '--';
    const relatedSoundDisplay = `
        <div class="kanban-card-issues">
            <span class="kanban-issues-value">关联原声：${relatedSoundText}</span>
        </div>
    `;
    
    // 如果是设计走查类，添加优先级显示
    const priorityDisplay = (problem.problemType === 'design' && problem.priority) 
        ? renderKanbanPriorityDisplay(problem.priority) 
        : '';
    
    return `
        <div class="kanban-card" data-problem-id="${problem.id}">
            <div class="kanban-card-content">
                <div class="kanban-card-actions-group">
                    <button class="kanban-action-btn-transition" onclick="openProblemStatusDropdown(event, '${problem.id}', '${resolutionStatus}')" title="流转状态">
                        <img src="icon/看板-流转至下一个状态.svg" alt="流转状态" class="kanban-action-icon-small" />
                        <span class="kanban-action-text">流转状态</span>
                    </button>
                </div>
                <!-- 第一行：标题 -->
                <div class="kanban-card-summary">${problem.title || '--'}</div>
                <!-- 第二行：优先级（仅设计走查类）、所属地区、归属终端、指派给（icon+值的形式） -->
                <div class="kanban-card-info-row">
                    ${priorityDisplay}
                    <div class="kanban-card-field-item">
                        <img src="icon/所属地区.svg" alt="所属地区" class="kanban-card-field-icon" />
                        <span class="kanban-card-field-value">${regions}</span>
                    </div>
                    <div class="kanban-card-field-item">
                        <img src="icon/归属终端.svg" alt="归属终端" class="kanban-card-field-icon" />
                        <span class="kanban-card-field-value">${terminals}</span>
                    </div>
                    <div class="kanban-card-field-item">
                        <img src="icon/指派给.svg" alt="指派给" class="kanban-card-field-icon" />
                        <span class="kanban-card-field-value">${assignTo}</span>
                    </div>
                </div>
                <!-- 第三行：关联原声 -->
                ${relatedSoundDisplay}
            </div>
        </div>
    `;
}

// 问题池状态流转函数
function transitionProblemStatus(id, targetStatus) {
    if (event) {
        event.stopPropagation();
    }
    
    let allProblems = [];
    try {
        const stored = localStorage.getItem('definedProblems');
        if (stored) {
            allProblems = JSON.parse(stored);
        }
    } catch (error) {
        console.error('读取问题数据失败:', error);
        return;
    }
    
    const problem = allProblems.find(p => p.id === id);
    if (!problem) return;
    
    const statusMap = {
        'pending': '待确认',
        'processing': '开发中',
        'review': '待走查',
        'resolved': '已解决'
    };
    
    if (!statusMap[targetStatus]) return;
    
    problem.resolutionStatus = statusMap[targetStatus];
    
    localStorage.setItem('definedProblems', JSON.stringify(allProblems));
    
    if (currentProblemViewType === 'kanban') {
        renderProblemPoolKanbanView();
    } else {
        renderProblemPoolTable();
    }
    updateProblemPoolStats();
}

// 打开问题池流转状态下拉面板
function openProblemStatusDropdown(event, id, currentResolutionStatus) {
    event.stopPropagation();
    
    const button = event.currentTarget;
    if (!button) return;
    
    const existingDropdown = document.querySelector('.kanban-status-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    }
    
    const actionsGroup = button.closest('.kanban-card-actions-group');
    if (!actionsGroup) return;
    
    const statusOptions = [
        { type: 'pending', label: '待确认' },
        { type: 'processing', label: '开发中' },
        { type: 'review', label: '待走查' },
        { type: 'resolved', label: '已解决' }
    ];
    
    // 将当前状态转换为对应的type
    const statusTypeMap = {
        '待确认': 'pending',
        '开发中': 'processing',
        '待走查': 'review',
        '已解决': 'resolved'
    };
    const currentStatusType = statusTypeMap[currentResolutionStatus] || 'pending';
    
    const availableOptions = statusOptions.filter(option => option.type !== currentStatusType);
    
    if (availableOptions.length === 0) return;
    
    const dropdown = document.createElement('div');
    dropdown.className = 'kanban-status-dropdown';
    dropdown.innerHTML = availableOptions.map(option => `
        <div class="kanban-status-option" data-status="${option.type}" onclick="handleProblemStatusOptionClick(event, '${id}', '${option.type}')">
            ${option.label}
        </div>
    `).join('');
    
    actionsGroup.appendChild(dropdown);
}

// 处理问题池下拉面板中状态选项点击
function handleProblemStatusOptionClick(event, id, targetStatus) {
    event.stopPropagation();
    
    transitionProblemStatus(id, targetStatus);
    
    const dropdown = event.currentTarget.closest('.kanban-status-dropdown');
    if (dropdown) {
        dropdown.remove();
    }
}

// 筛选用户原声池数据
function applyVoicePoolFilter(filterType, allData) {
    // 更新当前筛选状态
    currentVoicePoolFilter = filterType;
    
    // 根据筛选类型，为原声池看板容器切换情感分组样式类
    const voicePoolKanban = document.getElementById('voice-pool-kanban-view');
    if (voicePoolKanban) {
        if (filterType === 'all') {
            voicePoolKanban.classList.remove('kanban-emotion-view');
        } else {
            // 待评估 / 关键反馈 / 暂不解决 Tab 下的看板
            voicePoolKanban.classList.add('kanban-emotion-view');
        }
    }
    
    // 先根据tab筛选类型过滤数据
    let filteredData = [];
    if (filterType === 'all') {
        filteredData = allData;
    } else if (filterType === 'pending') {
        filteredData = allData.filter(item => item.status && item.status.type === 'pending');
    } else if (filterType === 'key') {
        filteredData = allData.filter(item => item.status && item.status.type === 'key');
    } else if (filterType === 'unresolved') {
        filteredData = allData.filter(item => item.status && item.status.type === 'unresolved');
    }
    
    // 再应用筛选条件（情感分类、所属模块、分析状态）
    filteredData = applyFilterConditions(filteredData);
    
    // 根据当前视图类型渲染数据
    if (currentViewType === 'list') {
        renderVoicePoolTable(filteredData);
    } else if (currentViewType === 'kanban') {
        renderKanbanView();
    }
    
    // 更新筛选tab的激活状态
    updateFilterTabActiveState(filterType);
    
    // 更新筛选按钮样式
    updateFilterButtonStyle();
    
    // 更新分组按钮样式
    updateGroupButtonStyle();
}

// 应用筛选条件
function applyFilterConditions(data) {
    let result = [...data];
    
    // 情感分类筛选
    if (currentFilterConditions.emotion.length > 0) {
        result = result.filter(item => {
            const emotionType = item.emotion?.type || 'neutral';
            return currentFilterConditions.emotion.includes(emotionType);
        });
    }
    
    // 所属模块筛选
    if (currentFilterConditions.module.length > 0) {
        result = result.filter(item => {
            const module = item.module || '';
            return currentFilterConditions.module.includes(module);
        });
    }
    
    // 分析状态筛选
    if (currentFilterConditions.status.length > 0) {
        result = result.filter(item => {
            const statusType = item.status?.type || 'pending';
            return currentFilterConditions.status.includes(statusType);
        });
    }
    
    return result;
}

// 更新筛选tab的激活状态
function updateFilterTabActiveState(activeFilter) {
    // 只更新用户原声池主页的filter-tab（避免影响问题池的filter-tab）
    const voicePoolHome = document.getElementById('voice-pool-home');
    if (!voicePoolHome) return;
    
    // 移除用户原声池主页内所有filter-tab的active状态
    voicePoolHome.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 添加当前激活的filter-tab的active状态
    const activeTab = voicePoolHome.querySelector(`.filter-tab[data-filter="${activeFilter}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

// 处理筛选tab点击事件
function handleVoicePoolFilterClick(event) {
    const filterTab = event.target.closest('.filter-tab');
    if (!filterTab) return;
    
    // 确保只处理用户原声池主页的filter-tab
    const voicePoolHome = document.getElementById('voice-pool-home');
    if (!voicePoolHome || !voicePoolHome.contains(filterTab)) return;
    
    const filterType = filterTab.getAttribute('data-filter');
    if (!filterType) return;
    
    // 从localStorage读取所有数据
    let allData = [];
    try {
        const stored = localStorage.getItem('voicePoolData');
        if (stored) {
            allData = JSON.parse(stored);
        }
    } catch (error) {
        console.error('读取数据失败:', error);
        allData = [];
    }
    
    // 应用筛选
    applyVoicePoolFilter(filterType, allData);
}

// 显示/隐藏筛选浮窗
function toggleFilterPopup(show) {
    const popup = document.getElementById('voice-pool-filter-popup');
    if (!popup) return;
    
    if (show) {
        popup.style.display = 'block';
        // 定位浮窗在按钮下方8px（CSS已设置，这里只需要确保位置正确）
        positionFilterPopup();
        // 初始化模块选项
        initModuleOptions();
        // 恢复筛选条件到复选框
        restoreFilterConditions();
    } else {
        popup.style.display = 'none';
    }
}

// 定位筛选浮窗
function positionFilterPopup() {
    const popup = document.getElementById('voice-pool-filter-popup');
    const filterBtn = document.getElementById('voice-pool-filter-btn');
    if (!popup || !filterBtn) return;
    
    // 浮窗的父元素是 filter-btn-wrapper，CSS已设置 position: relative
    // CSS的 top: 100% + margin-top: 8px 和 right: 0 已经设置了基本定位
    // 这里只需要确保在窗口边缘时不会溢出
    const wrapper = filterBtn.closest('.filter-btn-wrapper');
    if (wrapper) {
        // 使用 requestAnimationFrame 确保DOM已更新后再计算位置
        requestAnimationFrame(() => {
            const wrapperRect = wrapper.getBoundingClientRect();
            const popupWidth = 320; // 浮窗宽度
            const spaceOnRight = window.innerWidth - wrapperRect.right;
            
            // 如果右侧空间不足，调整浮窗位置，确保不超出窗口
            if (spaceOnRight < popupWidth) {
                popup.style.right = 'auto';
                popup.style.left = '0';
            } else {
                // 使用CSS的默认定位（right: 0），确保浮窗右边缘与按钮右边缘对齐
                popup.style.right = '0';
                popup.style.left = 'auto';
            }
        });
    }
}

// 初始化模块选项
function initModuleOptions() {
    const moduleOptionsContainer = document.getElementById('voice-pool-module-options');
    if (!moduleOptionsContainer) return;
    
    // 从localStorage读取所有数据，提取所有唯一的模块
    let allData = [];
    try {
        const stored = localStorage.getItem('voicePoolData');
        if (stored) {
            allData = JSON.parse(stored);
        }
    } catch (error) {
        console.error('读取数据失败:', error);
        allData = [];
    }
    
    // 提取所有唯一的模块
    const modules = [...new Set(allData.map(item => item.module).filter(Boolean))].sort();
    
    // 生成模块选项
    moduleOptionsContainer.innerHTML = modules.map(module => `
        <label class="filter-option">
            <input type="checkbox" class="filter-checkbox" data-filter="module" value="${module}" />
            <span class="filter-option-text">${module}</span>
        </label>
    `).join('');
}

// 恢复筛选条件到复选框
function restoreFilterConditions() {
    // 恢复情感分类
    document.querySelectorAll('.filter-checkbox[data-filter="emotion"]').forEach(checkbox => {
        checkbox.checked = currentFilterConditions.emotion.includes(checkbox.value);
    });
    
    // 恢复所属模块
    document.querySelectorAll('.filter-checkbox[data-filter="module"]').forEach(checkbox => {
        checkbox.checked = currentFilterConditions.module.includes(checkbox.value);
    });
    
    // 恢复分析状态
    document.querySelectorAll('.filter-checkbox[data-filter="status"]').forEach(checkbox => {
        checkbox.checked = currentFilterConditions.status.includes(checkbox.value);
    });
}

// 收集筛选条件
function collectFilterConditions() {
    const conditions = {
        emotion: [],
        module: [],
        status: []
    };
    
    // 收集情感分类
    document.querySelectorAll('.filter-checkbox[data-filter="emotion"]:checked').forEach(checkbox => {
        conditions.emotion.push(checkbox.value);
    });
    
    // 收集所属模块
    document.querySelectorAll('.filter-checkbox[data-filter="module"]:checked').forEach(checkbox => {
        conditions.module.push(checkbox.value);
    });
    
    // 收集分析状态
    document.querySelectorAll('.filter-checkbox[data-filter="status"]:checked').forEach(checkbox => {
        conditions.status.push(checkbox.value);
    });
    
    return conditions;
}

// 检查是否有筛选条件生效
function hasActiveFilterConditions() {
    return currentFilterConditions.emotion.length > 0 ||
           currentFilterConditions.module.length > 0 ||
           currentFilterConditions.status.length > 0;
}

// 更新筛选按钮样式
function updateFilterButtonStyle() {
    const filterBtn = document.getElementById('voice-pool-filter-btn');
    if (!filterBtn) return;
    
    if (hasActiveFilterConditions()) {
        filterBtn.classList.add('filter-active');
    } else {
        filterBtn.classList.remove('filter-active');
    }
}

// 重置筛选条件
function resetFilterConditions() {
    currentFilterConditions = {
        emotion: [],
        module: [],
        status: []
    };
    
    // 取消所有复选框
    document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // 更新按钮样式
    updateFilterButtonStyle();
    
    // 重新应用筛选
    let allData = [];
    try {
        const stored = localStorage.getItem('voicePoolData');
        if (stored) {
            allData = JSON.parse(stored);
        }
    } catch (error) {
        console.error('读取数据失败:', error);
        allData = [];
    }
    
    applyVoicePoolFilter(currentVoicePoolFilter, allData);
    
    // 如果当前是看板视图，重新渲染看板
    if (currentViewType === 'kanban') {
        renderKanbanView();
    }
}

// 应用筛选条件
function applyFilterConditionsToData() {
    // 收集筛选条件
    currentFilterConditions = collectFilterConditions();
    
    // 更新按钮样式
    updateFilterButtonStyle();
    
    // 关闭浮窗
    toggleFilterPopup(false);
    
    // 重新应用筛选
    let allData = [];
    try {
        const stored = localStorage.getItem('voicePoolData');
        if (stored) {
            allData = JSON.parse(stored);
        }
    } catch (error) {
        console.error('读取数据失败:', error);
        allData = [];
    }
    
    applyVoicePoolFilter(currentVoicePoolFilter, allData);
    
    // 如果当前是看板视图，重新渲染看板
    if (currentViewType === 'kanban') {
        renderKanbanView();
    }
}

// 显示/隐藏分组浮窗
function toggleGroupPopup(show) {
    const popup = document.getElementById('voice-pool-group-popup');
    if (!popup) return;
    
    if (show) {
        popup.style.display = 'block';
        // 定位浮窗在按钮下方8px
        positionGroupPopup();
        // 恢复当前分组选择
        restoreGroupSelection();
    } else {
        popup.style.display = 'none';
    }
}

// 定位分组浮窗
function positionGroupPopup() {
    const popup = document.getElementById('voice-pool-group-popup');
    const groupBtn = document.getElementById('voice-pool-group-btn');
    if (!popup || !groupBtn) return;
    
    // 浮窗的父元素是 filter-btn-wrapper，CSS已设置 position: relative
    // CSS的 top: 100% + margin-top: 8px 和 right: 0 已经设置了基本定位
    // 这里只需要确保在窗口边缘时不会溢出
    const wrapper = groupBtn.closest('.filter-btn-wrapper');
    if (wrapper) {
        // 使用 requestAnimationFrame 确保DOM已更新后再计算位置
        requestAnimationFrame(() => {
            const wrapperRect = wrapper.getBoundingClientRect();
            const popupWidth = 320; // 浮窗宽度
            const spaceOnRight = window.innerWidth - wrapperRect.right;
            
            // 如果右侧空间不足，调整浮窗位置，确保不超出窗口
            if (spaceOnRight < popupWidth) {
                popup.style.right = 'auto';
                popup.style.left = '0';
            } else {
                // 使用CSS的默认定位（right: 0），确保浮窗右边缘与按钮右边缘对齐
                popup.style.right = '0';
                popup.style.left = 'auto';
            }
        });
    }
}

// 恢复分组选择
function restoreGroupSelection() {
    const radio = document.querySelector(`.group-radio[value="${currentGroupBy}"]`);
    if (radio) {
        radio.checked = true;
    }
}

// 应用分组
function applyGroup() {
    // 获取选中的分组方式
    const selectedRadio = document.querySelector('.group-radio:checked');
    if (!selectedRadio) return;
    
    const groupBy = selectedRadio.value;
    currentGroupBy = groupBy;
    
    // 更新分组按钮样式
    updateGroupButtonStyle();
    
    // 关闭浮窗
    toggleGroupPopup(false);
    
    // 重新应用筛选（会触发表格重新渲染）
    let allData = [];
    try {
        const stored = localStorage.getItem('voicePoolData');
        if (stored) {
            allData = JSON.parse(stored);
        }
    } catch (error) {
        console.error('读取数据失败:', error);
        allData = [];
    }
    
    applyVoicePoolFilter(currentVoicePoolFilter, allData);
}

// 更新分组按钮样式
function updateGroupButtonStyle() {
    const groupBtn = document.getElementById('voice-pool-group-btn');
    if (!groupBtn) return;
    
    if (currentGroupBy !== 'none') {
        groupBtn.classList.add('filter-active');
    } else {
        groupBtn.classList.remove('filter-active');
    }
}

// 初始化事件监听器
function initializeEventListeners() {
    // 文件上传相关事件 - 检查元素是否存在
    if (elements.fileUploadArea && elements.fileInput) {
        // 点击上传区域时，触发文件选择并获得焦点
        elements.fileUploadArea.addEventListener('click', (e) => {
            // 如果点击的不是已上传的图片，则触发文件选择
            if (!e.target.closest('.uploaded-image-item') && !e.target.closest('.remove-image-btn')) {
                console.log('📍 文件上传区域被点击，获得焦点并触发文件选择');
                elements.fileUploadArea.focus();
                elements.fileInput.click();
            }
        });
        
        elements.fileInput.addEventListener('change', handleFileSelect);
        
        // 拖拽上传
        elements.fileUploadArea.addEventListener('dragover', handleDragOver);
        elements.fileUploadArea.addEventListener('dragleave', handleDragLeave);
        elements.fileUploadArea.addEventListener('drop', handleDrop);
        
        // 为文件上传区域添加粘贴事件监听器
        elements.fileUploadArea.addEventListener('paste', handlePaste);
    }
    
    // 粘贴图片 - 全局监听
    document.addEventListener('paste', handlePaste);
    
    // 转化按钮 - 检查元素是否存在
    if (elements.convertBtn) {
        elements.convertBtn.addEventListener('click', handleConvert);
    }
    
    // 导航按钮 - 检查元素是否存在
    if (elements.historyBtn) {
        elements.historyBtn.addEventListener('click', showHistory);
    }
    if (elements.draftsBtn) {
        elements.draftsBtn.addEventListener('click', showDrafts);
    }
    
    // 新会话按钮 - 检查元素是否存在
    if (elements.newSessionBtn) {
        elements.newSessionBtn.addEventListener('click', startNewSession);
    }
    
    // 用户原声清洗模板新会话按钮 - 检查元素是否存在
    if (elements.newOriginalSoundSessionBtn) {
        elements.newOriginalSoundSessionBtn.addEventListener('click', startOriginalSoundNewSession);
    }
    
    // Tab切换事件已通过HTML中的onclick处理
    
    // 视图切换事件
    document.querySelectorAll('.view-tab').forEach(tab => {
        tab.addEventListener('click', handleViewTabClick);
    });
    
    // 问题跟进池问题类型切换事件
    document.querySelectorAll('#problem-pool-home .view-tab[data-problem-type]').forEach(tab => {
        tab.addEventListener('click', handleProblemTypeTabClick);
    });
    
    // 问题跟进池解决状态筛选tab点击事件
    document.querySelectorAll('#problem-pool-home .filter-tab').forEach(tab => {
        tab.addEventListener('click', handleProblemPoolFilterClick);
    });
    
    // 用户原声池筛选tab点击事件
    document.querySelectorAll('#voice-pool-home .filter-tab').forEach(tab => {
        tab.addEventListener('click', handleVoicePoolFilterClick);
    });
    
    // 筛选浮窗相关事件
    const filterBtn = document.getElementById('voice-pool-filter-btn');
    const filterPopup = document.getElementById('voice-pool-filter-popup');
    const filterClose = document.getElementById('voice-pool-filter-close');
    const filterReset = document.getElementById('voice-pool-filter-reset');
    const filterApply = document.getElementById('voice-pool-filter-apply');
    
    if (filterBtn) {
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = filterPopup && filterPopup.style.display !== 'none';
            toggleFilterPopup(!isVisible);
        });
    }
    
    if (filterClose) {
        filterClose.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFilterPopup(false);
        });
    }
    
    if (filterReset) {
        filterReset.addEventListener('click', (e) => {
            e.stopPropagation();
            resetFilterConditions();
        });
    }
    
    if (filterApply) {
        filterApply.addEventListener('click', (e) => {
            e.stopPropagation();
            applyFilterConditionsToData();
        });
    }
    
    // 点击浮窗外部关闭浮窗
    document.addEventListener('click', (e) => {
        if (filterPopup && filterPopup.style.display !== 'none') {
            if (!filterPopup.contains(e.target) && !filterBtn.contains(e.target)) {
                toggleFilterPopup(false);
            }
        }
    });
    
    // 分组浮窗相关事件
    const groupBtn = document.getElementById('voice-pool-group-btn');
    const groupPopup = document.getElementById('voice-pool-group-popup');
    const groupClose = document.getElementById('voice-pool-group-close');
    const groupApply = document.getElementById('voice-pool-group-apply');
    
    if (groupBtn) {
        groupBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = groupPopup && groupPopup.style.display !== 'none';
            toggleGroupPopup(!isVisible);
        });
    }
    
    if (groupClose) {
        groupClose.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleGroupPopup(false);
        });
    }
    
    if (groupApply) {
        groupApply.addEventListener('click', (e) => {
            e.stopPropagation();
            applyGroup();
        });
    }
    
    // 点击分组浮窗外部关闭浮窗
    document.addEventListener('click', (e) => {
        if (groupPopup && groupPopup.style.display !== 'none') {
            if (!groupPopup.contains(e.target) && !groupBtn.contains(e.target)) {
                toggleGroupPopup(false);
            }
        }
    });
    
    // 初始化用户原声清洗模板（避免重复初始化）
    if (!OriginalSoundTemplate.initialized) {
        OriginalSoundTemplate.init();
    }
    
    // 自动保存草稿和检查按钮状态 - 检查元素是否存在
    if (elements.issueDescription) {
        elements.issueDescription.addEventListener('input', function() {
            debounce(saveDraft, 1000)();
            checkConvertButtonState();
        });
    }
    
    // 初始化按钮状态
    checkConvertButtonState();
    
    // 为系统类型复选框添加事件监听器
    const systemTypeCheckboxes = elements.systemTypeSelect.querySelectorAll('input[type="checkbox"]');
    systemTypeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', debounce(saveDraft, 1000));
    });
    
    // 为模块复选框添加事件监听器
    const moduleCheckboxes = elements.moduleSelect.querySelectorAll('input[type="checkbox"]');
    moduleCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', debounce(saveDraft, 1000));
    });
    
}

// 文件选择处理
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    processFiles(files);
}

// 拖拽处理
function handleDragOver(event) {
    event.preventDefault();
    elements.fileUploadArea.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    elements.fileUploadArea.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    elements.fileUploadArea.classList.remove('dragover');
    
    const files = Array.from(event.dataTransfer.files);
    processFiles(files);
}

// 粘贴处理
function handlePaste(event) {
    console.log('🔍 粘贴事件触发:', event);
    console.log('🔍 剪贴板数据:', event.clipboardData);
    console.log('🔍 剪贴板项目数量:', event.clipboardData.items.length);
    
    const items = event.clipboardData.items;
    const files = [];
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.log(`🔍 剪贴板项目 ${i}:`, {
            kind: item.kind,
            type: item.type,
            size: item.size
        });
        
        if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) {
                console.log('✅ 找到图片文件:', {
                    name: file.name,
                    type: file.type,
                    size: file.size
                });
                files.push(file);
            }
        }
    }
    
    console.log('🔍 找到的文件数量:', files.length);
    
    if (files.length > 0) {
        event.preventDefault();
        console.log('🚀 开始处理文件...');
        processFiles(files);
    } else {
        console.log('⚠️ 没有找到图片文件');
    }
}

// 处理文件
function processFiles(files) {
    console.log('📁 开始处理文件，文件数量:', files.length);
    
    files.forEach((file, index) => {
        console.log(`📄 处理文件 ${index + 1}:`, {
            name: file.name,
            type: file.type,
            size: file.size
        });
        
        if (validateFile(file)) {
            console.log('✅ 文件验证通过，添加到上传列表');
            uploadedFiles.push(file);
            displayUploadedFile(file);
        } else {
            console.log('❌ 文件验证失败');
        }
    });
    
    // 清空input，允许重复选择同一文件
    elements.fileInput.value = '';
}

// 验证文件
function validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
    
    if (file.size > maxSize) {
        showNotification('文件大小不能超过10MB', 'error');
        return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
        showNotification('只支持图片和视频文件', 'error');
        return false;
    }
    
    return true;
}

// 显示已上传文件
function displayUploadedFile(file) {
    // 检查是否为图片文件
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // 创建图片容器
            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-item-container';
            imageContainer.dataset.fileName = file.name;
            
            // 创建图片元素
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = file.name;
            img.className = 'uploaded-image';
            
            // 创建删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'image-delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.onclick = function() {
                removeUploadedImage(file.name);
            };
            
            // 组装元素
            imageContainer.appendChild(img);
            imageContainer.appendChild(deleteBtn);
            
            // 添加到图片容器
            const container = document.getElementById('uploadedImagesContainer');
            if (container) {
                container.appendChild(imageContainer);
            }
        };
        reader.readAsDataURL(file);
    } else {
        // 非图片文件显示通知
        showNotification('只支持图片文件', 'error');
    }
}

// 删除上传的图片
function removeUploadedImage(fileName) {
    // 从数组中移除文件
    uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);
    
    // 从DOM中移除图片容器
    const container = document.getElementById('uploadedImagesContainer');
    if (container) {
        const imageContainer = container.querySelector(`[data-file-name="${fileName}"]`);
        if (imageContainer) {
            imageContainer.remove();
        }
    }
    
    showNotification('图片已删除', 'success');
}

// 获取文件图标
function getFileIcon(type) {
    if (type.startsWith('image/')) {
        return 'fa-image';
    } else if (type.startsWith('video/')) {
        return 'fa-video';
    } else {
        return 'fa-file';
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 移除文件
function removeFile(fileName) {
    uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);
    
    const fileItem = elements.uploadedFiles.querySelector(`[data-file-name="${fileName}"]`);
    if (fileItem) {
        fileItem.remove();
    }
}


// 防抖处理
let convertTimeout = null;

// 转化处理
async function handleConvert() {
    if (isConverting) return;
    
    // 清除之前的防抖定时器
    if (convertTimeout) {
        clearTimeout(convertTimeout);
    }
    
    // 设置防抖延迟
    convertTimeout = setTimeout(async () => {
        await performConvert();
    }, 300); // 300ms防抖
}

// 实际执行转化
async function performConvert() {
    
    const issueDescription = elements.issueDescription.value.trim();
    const selectedSystemTypes = elements.systemTypeSelect.querySelectorAll('input[type="checkbox"]:checked');
    const systemTypes = Array.from(selectedSystemTypes).map(checkbox => checkbox.value);
    const selectedModules = elements.moduleSelect.querySelectorAll('input[type="checkbox"]:checked');
    const modules = Array.from(selectedModules).map(checkbox => checkbox.value);
    
    // 验证输入
    if (!issueDescription) {
        showNotification('请填写体验问题描述', 'error');
        elements.issueDescription.focus();
        return;
    }
    
    if (systemTypes.length === 0) {
        showNotification('请选择所属地区', 'error');
        return;
    }
    
    if (modules.length === 0) {
        showNotification('请选择归属终端/模块', 'error');
        return;
    }
    
    isConverting = true;
    if (elements.convertBtn) {
        elements.convertBtn.disabled = true;
        elements.convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 转化中...';
    }
    
    // 禁用整个输入区域
    setInputAreaDisabled(true);
    
    // 在预览区域显示加载状态
    showPreviewLoading();
    
    try {
        // 模拟API调用
        const result = await convertToStandardFormat({
            description: issueDescription,
            systemTypes: systemTypes,
            modules: modules,
            files: uploadedFiles
        });
        
        // 验证结果
        if (!result || !result.standardFormat) {
            throw new Error('转化结果格式错误');
        }
        
        // 标记转化完成
        window.conversionCompleted = true;
        
        // 清除进度动画
        if (window.progressInterval) {
            clearInterval(window.progressInterval);
        }
        
        displayPreviewResult(result);
        showNotification('转化成功！', 'success');
        
        // 后端API已经自动保存到历史记录，这里不需要重复保存
        console.log('✅ 转化完成，历史记录已自动保存');
        
    } catch (error) {
        console.error('转化失败:', error);
        showNotification('转化失败，请重试', 'error');
        
        // 显示错误状态
        if (elements.previewContent) {
            elements.previewContent.innerHTML = `
                <div class="preview-error">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="error-text">转化过程中出现错误</div>
                    <div class="error-subtitle">请检查输入内容后重试</div>
                </div>
            `;
        }
    } finally {
        isConverting = false;
        if (elements.convertBtn) {
            elements.convertBtn.disabled = false;
            elements.convertBtn.innerHTML = '<i class="fas fa-magic"></i> 一键转化';
        }
        
        // 重新启用输入区域
        setInputAreaDisabled(false);
    }
}

// 智能转化API
async function convertToStandardFormat(data) {
    
    // 先尝试调用后端 LLM 解析接口
    try {
        updateAnalysisProgress('正在调用智能解析服务...', 15);
        const formData = new FormData();
        formData.append('description', data.description);
        formData.append('system_types', JSON.stringify(data.systemTypes));
        formData.append('modules', JSON.stringify(data.modules));
        formData.append('template_id', 'default');
        formData.append('user_id', getCurrentUserId());
        
        // 设置30秒超时，给LLM足够时间
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const resp = await fetch('http://localhost:8001/api/analysis/parse-feedback', {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        if (resp.ok) {
            const result = await resp.json();
            console.log('API响应:', result); // 调试信息
            if (result && result.success && result.data) {
                const d = result.data;
                console.log('API数据:', d); // 调试信息
                const mapped = {
                    id: generateId(),
                    timestamp: new Date().toISOString(),
                    title: d.title,
                    description: d.problem_description,
                    systemTypes: (d.region || '').split(/[,、，]/).filter(Boolean),
                    modules: (d.terminal || '').split(/[,、，]/).filter(Boolean),
                    files: data.files || [],
                    analysis: result.analysis || {},
                    // 直接采用模板字段
                    standardFormat: {
                        title: d.title,
                        region: d.region,
                        terminal: d.terminal,
                        issue_type: d.issue_type,
                        resolution_method: d.resolution_method,
                        priority: d.priority,
                        problem_description: d.problem_description,
                        solution: d.solution,
                        status: d.status,
                        target_version: d.target_version,
                        screenshots: d.screenshots,
                        attachments: d.attachments
                    }
                };
                // 基于描述做视觉还原度识别的结果纠偏（后端偶发给到泛化类型时）
                try {
                    const textForType = `${d.problem_description || ''}\n${d.title || ''}`;
                    if (detectVisualMismatch(textForType)) {
                        mapped.standardFormat.issue_type = '视觉还原度bug';
                        mapped.standardFormat.resolution_method = '体验优化';
                        if (mapped.analysis) {
                            mapped.analysis.predictedType = '视觉还原度bug';
                            if (!mapped.analysis.processingMethod) mapped.analysis.processingMethod = {};
                            mapped.analysis.processingMethod.method = '体验优化';
                        }
                    }
                } catch (_) {}
                // 标题纠偏：若LLM标题冗长或带分条，按问题句提炼
                try {
                    const regionText = mapped.systemTypes.length > 1 ? mapped.systemTypes.join('+') : (mapped.systemTypes[0] || '');
                    const moduleText = mapped.modules.length > 1 ? mapped.modules.join('+') : (mapped.modules[0] || '');
                    const base = extractTitleContent(d.problem_description || data.description || '');
                    if (base) {
                        mapped.title = `【${regionText}：${moduleText}】${base}`;
                        mapped.standardFormat.title = mapped.title;
                    }
                } catch (_) {}
                // 完全信任后端（LLM）抽取结果；仅在字段缺失时做最小兜底，不二次改写
                try {
                    // 如果问题描述中包含了明显的解决方案内容（如编号列表、明确的建议等），需要清理
                    if (mapped.standardFormat.problem_description) {
                        const problemDesc = mapped.standardFormat.problem_description;
                        
                        // 只清理明显的解决方案模式（更温和的匹配）
                        const solutionPatterns = [
                            /优先[^。]*[。；;]/g,  // "优先找产品确认..."
                            /如果无法[^。]*[。；;]/g,  // "如果无法修改..."
                            /尝试[^。]*[。；;]/g,  // "尝试缩小字体..."
                            /建议[^。]*[。；;]/g,  // "建议增加..."
                            /\d+\.\s*[^。]*[。；;]/g  // 编号列表 "1. 优先找产品..."
                        ];
                        
                        // 检查问题描述是否包含明显的解决方案模式
                        let cleanedProblemDesc = problemDesc;
                        let hasSolutionContent = false;
                        
                        for (const pattern of solutionPatterns) {
                            if (pattern.test(problemDesc)) {
                                hasSolutionContent = true;
                                // 移除匹配的解决方案内容
                                cleanedProblemDesc = cleanedProblemDesc.replace(pattern, '').trim();
                            }
                        }
                        
                        // 如果检测到明显的解决方案内容，且清理后仍有足够内容，才使用清理后的描述
                        if (hasSolutionContent && cleanedProblemDesc && cleanedProblemDesc.length > 15) {
                            mapped.standardFormat.problem_description = cleanedProblemDesc;
                        } else if (hasSolutionContent && cleanedProblemDesc.length <= 15) {
                            // 如果清理后太短，尝试使用splitProblemAndSolution重新分离
                            const { problemText } = await splitProblemAndSolution(problemDesc);
                            if (problemText && problemText.trim() && problemText.length > 15) {
                                mapped.standardFormat.problem_description = problemText.trim();
                            }
                            // 如果重新分离后仍然太短，保留原始描述
                        }
                    }
                    
                    if (!mapped.standardFormat.problem_description || !mapped.standardFormat.solution) {
                        const { problemText, solutionText } = await splitProblemAndSolution(data.description);
                        const enriched = await enrichProblemAndSolution(problemText, solutionText, data.description);
                        if (!mapped.standardFormat.problem_description && problemText) {
                            mapped.standardFormat.problem_description = enriched.problem || problemText;
                        }
                        if (!mapped.standardFormat.solution && solutionText) {
                            mapped.standardFormat.solution = enriched.solution || solutionText;
                        }
                    }
                    // 若后端未返回solution且从原文也未拆出，则基于分析结果生成动作型方案
                    if (!mapped.standardFormat.solution || /请详细描述问题现象和期望的解决方案|待分析/.test(mapped.standardFormat.solution)) {
                        const rec = (mapped.analysis && mapped.analysis.recommendedSolutions) || [];
                        mapped.standardFormat.solution = await generateSmartSolution(
                            data.description,
                            rec
                        );
                    }
                    // 若方案看起来仍是“问题列表”，前端做最终一次动作化改写（与后端策略一致）
                    if (mapped.standardFormat.solution && looksLikeProblemList(mapped.standardFormat.solution)) {
                        mapped.standardFormat.solution = rewriteProblemListToActions(mapped.standardFormat.solution);
                    }
                } catch (e) {
                    console.warn('最小兜底失败，保留后端结果：', e);
                }
                updateAnalysisProgress('转化完成！', 100);
                await new Promise(resolve => setTimeout(resolve, 200));
                return mapped;
            }
        }
    } catch (err) {
        // 忽略错误，进入本地回退逻辑
        console.warn('调用后端解析失败，使用本地规则回退:', err);
        console.log('错误详情:', err.message);
        console.log('错误类型:', err.name);
        console.log('错误堆栈:', err.stack);
    }

    // 回退到本地规则
    updateAnalysisProgress('正在分析问题类型...', 20);
    await new Promise(resolve => setTimeout(resolve, 300));

    updateAnalysisProgress('正在预测问题类型和优先级...', 40);
    const analysis = await SmartAnalysisEngine.analyzeProblem(
        data.description,
        data.systemTypes,
        data.modules
    );

    updateAnalysisProgress('正在生成解决方案...', 60);
    await new Promise(resolve => setTimeout(resolve, 300));

    const enhancedContent = await enhanceContent(data, analysis);

    updateAnalysisProgress('正在生成标准化文档...', 80);
    await new Promise(resolve => setTimeout(resolve, 300));

    const regionNames = data.systemTypes.join('、');
    const moduleNames = data.modules.map(module => getModuleName(module)).join('、');

    // 生成与模板一致的字段
    // 从用户原始描述中尽量拆分"问题/解决方案"
    const { problemText, solutionText } = await splitProblemAndSolution(data.description);
    const enriched = await enrichProblemAndSolution(problemText, solutionText, data.description);

    const fallbackStandard = {
        title: enhancedContent.title,
        region: regionNames,
        terminal: moduleNames,
        issue_type: analysis.predictedType,
        resolution_method: (analysis.processingMethod && analysis.processingMethod.method) || '体验优化',
        priority: analysis.priority || 'P2-中',
        problem_description: enriched.problem,
        solution: enriched.solution || enhancedContent.solution,
        status: '待确认(未提给研发)',
        target_version: '未定',
        screenshots: '',
        attachments: ''
    };

    const result = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        title: enhancedContent.title,
        description: data.description,
        systemTypes: data.systemTypes,
        modules: data.modules,
        files: data.files,
        analysis: analysis,
        standardFormat: fallbackStandard
    };

    updateAnalysisProgress('转化完成！', 100);
    await new Promise(resolve => setTimeout(resolve, 200));
    return result;
}

// 内容增强函数
async function enhanceContent(data, analysis) {
    const regionNames = data.systemTypes.join('、');
    const moduleNames = data.modules.map(module => getModuleName(module)).join('、');
    
    // 智能生成标题
    const title = await generateSmartTitle(data.description, analysis.predictedType, regionNames, moduleNames);
    
    // 智能生成背景描述
    const background = generateSmartBackground(data.description, analysis.predictedType, regionNames, moduleNames);
    
    // 智能生成解决方案
    const solution = await generateSmartSolution(data.description, analysis.recommendedSolutions);
    
    // 智能生成验收标准
    const acceptanceCriteria = generateSmartAcceptanceCriteria(analysis.predictedType, analysis.priority);
    
    return {
        title,
        background,
        solution,
        acceptanceCriteria
    };
}

// 智能生成标题 - 使用统一API
async function generateSmartTitle(description, problemType, regionNames, moduleNames) {
    try {
        // 调用统一标题生成API
        const response = await fetch('http://localhost:8001/api/title/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                description: description,
                system_types: JSON.stringify(Array.isArray(regionNames) ? regionNames : [regionNames]),
                modules: JSON.stringify(Array.isArray(moduleNames) ? moduleNames : [moduleNames]),
                problem_type: problemType || '设计需求优化'
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                return result.title;
            }
        }
        
        // 如果API调用失败，使用本地降级逻辑
        console.warn('标题生成API调用失败，使用本地逻辑');
        return generateSmartTitleLocal(description, problemType, regionNames, moduleNames);
        
    } catch (error) {
        console.error('标题生成失败:', error);
        // 降级到本地逻辑
        return generateSmartTitleLocal(description, problemType, regionNames, moduleNames);
    }
}

// 本地降级逻辑（保留原有逻辑作为备用）
function generateSmartTitleLocal(description, problemType, regionNames, moduleNames) {
    // 特例：识别"X组件…希望…与…样式对齐/一致" → 标题直接输出"X组件样式有误"
    const wishInfo = findAlignWishInfo(description);
    if (wishInfo && wishInfo.component) {
        const regionText = Array.isArray(regionNames) ? (regionNames.length > 1 ? regionNames.join('+') : regionNames[0]) : regionNames;
        const moduleText = Array.isArray(moduleNames) ? (moduleNames.length > 1 ? moduleNames.join('+') : moduleNames[0]) : moduleNames;
        const titleContent = `${wishInfo.component}样式有误`;
        return `【${regionText}：${moduleText}】${titleContent}`;
    }

    // 特例：描述中明确出现"与设计图/设计稿不一致"→ 标题概括为"场景 + 与设计图不一致"
    if (/设计[图稿].*不一致/.test(description)) {
        const regionText = Array.isArray(regionNames) ? (regionNames.length > 1 ? regionNames.join('+') : regionNames[0]) : regionNames;
        const moduleText = Array.isArray(moduleNames) ? (moduleNames.length > 1 ? moduleNames.join('+') : moduleNames[0]) : moduleNames;
        // 场景：优先取冒号前的短语，否则取第一句到逗号
        let scene = '';
        const m1 = description.match(/^(.*?)[：:]/);
        if (m1 && m1[1]) {
            scene = m1[1].trim();
        } else {
            const m2 = description.match(/^(.*?)[，,。\n]/);
            scene = (m2 && m2[1]) ? m2[1].trim() : description.slice(0, 20).trim();
        }
        // 去除 scene 内已包含的同义短语与多余标点
        scene = scene.replace(/与[^，。]*设计[图稿]?.*不一致/g, '').replace(/[，,。;；\s]+$/,'');
        const titleContent = `${scene ? scene + '与' : ''}设计图不一致`;
        return `【${regionText}：${moduleText}】${titleContent}`.replace(/(与设计图不一致){2,}/g,'与设计图不一致');
    }
    // 处理多选地区和终端
    let regionText, moduleText;
    
    if (Array.isArray(regionNames)) {
        regionText = regionNames.length > 1 ? regionNames.join('+') : regionNames[0];
    } else {
        regionText = regionNames;
    }
    
    if (Array.isArray(moduleNames)) {
        moduleText = moduleNames.length > 1 ? moduleNames.join('+') : moduleNames[0];
    } else {
        moduleText = moduleNames;
    }
    
    // 从描述中精准提取标题内容，保留关键信息
    let titleContent = extractTitleContent(description);
    
    // 保持原有格式，但精简标题内容
    return `【${regionText}：${moduleText}】${titleContent}`;
}

// 从描述中提取标题内容
function extractTitleContent(description) {
    // 优先匹配“X有问题，……(将/把/需要/统一/调整/改为/优化…)”结构，标题取逗号前的问题部分
    const problemThenAction = /^(.*?有问题)[，,。；;\s]+(将|把|需要|统一|调整|改为|改成|优化|修复|修改|更改)/;
    const pm = (description || '').match(problemThenAction);
    if (pm && pm[1]) {
        return optimizeTitleContent(pm[1].trim());
    }
    // 处理“以下/如下 … ：”列点结构，标题取冒号前场景句
    const preColonMatch = (description || '').match(/^(.+?)[:：]/);
    if (preColonMatch && preColonMatch[1]) {
        const pre = preColonMatch[1];
        // 场景对象（在“以下/如下”之前）
        const scenePart = (pre.split(/以下|如下/)[0] || pre).trim();
        // 抽取“与XXX不一致”的对比目标
        const target = ((pre.match(/与([^：:]+?)不一致/) || [])[1] || '设计图').trim();
        const sentence = `${scenePart}与${target}不一致`;
        return optimizeTitleContent(sentence);
    }
    // 智能提取核心问题描述，彻底移除解决方案相关描述
    let content = description;
    
    // 先移除解决方案相关的描述（更彻底的匹配，支持多行）
    // 匹配以"建议"开头的所有内容（包括换行符）
    content = content.replace(/建议[\s\S]*$/g, '').trim();
    // 匹配以数字开头的建议项（如"1. 优先找产品..."）
    content = content.replace(/\d+\.\s*[\s\S]*$/g, '').trim();
    // 匹配以"应该"、"需要"、"要"等开头的建议
    content = content.replace(/(应该|需要|要|可以|希望|期待)[\s\S]*$/g, '').trim();
    // 匹配以"如果"开头的条件建议
    content = content.replace(/如果[\s\S]*$/g, '').trim();
    // 匹配以"尝试"开头的建议
    content = content.replace(/尝试[\s\S]*$/g, '').trim();
    // 匹配"调整为"、"改为"等解决方案描述
    content = content.replace(/调整为[\s\S]*$/g, '').trim();
    content = content.replace(/改为[\s\S]*$/g, '').trim();
    
    // 精简标题内容，提取核心问题
    content = extractCoreProblem(content);
    
    return content || '问题描述';
}

// 识别“组件样式对齐”类愿望表达，抽取组件与愿望文本
function findAlignWishInfo(text) {
    if (!text) return null;
    const m = text.match(/([^。\n]*?组件)[^。\n]*?(?:希望|期望)[^。\n]*?(?:与|和)[^。\n]*?(?:样式)?(?:对齐|一致)/);
    if (m) {
        const component = (m[1] || '').trim();
        // 提取从“希望/期望”开始的愿望句
        const wish = (text.match(/((?:希望|期望)[^。\n]*)(?:。|$)/) || [])[1] || '';
        return { component, wish: wish.trim() };
    }
    return null;
}

// 提取核心问题，精简标题内容
function extractCoreProblem(content) {
    if (!content) return content;
    
    // 移除冗余的描述性词汇
    const redundantWords = [
        '截图中的', '图片中的', '界面中的', '页面中的',
        '发现', '看到', '注意到', '观察到',
        '存在', '出现', '发生', '产生',
        '导致', '造成', '引起', '使得',
        '用户', '使用者', '操作者'
    ];
    
    let coreContent = content;
    redundantWords.forEach(word => {
        coreContent = coreContent.replace(new RegExp(word, 'g'), '');
    });
    // 清理“与设计图不一致/请核对规范”等前导结论与编号样式，避免标题围绕结论或解决方案
    coreContent = coreContent
        .replace(/与[^，。]*设计[图稿]?.*不一致[:：]?/g, '')
        .replace(/与[^，。]*规范.*不一致[:：]?/g, '')
        .replace(/请核对规范[:：]?/g, '')
        .replace(/\n+/g, '，')
        .replace(/(^|[，,\s])([0-9一二三四五六七八九十]+)[、\.)]/g, '，')
        .replace(/[：:]/g, '，');

    // 优先保留前两个分句，避免只保留一个要点
    const primaryParts = coreContent
        .split(/同时|以及|并且|、|[，,。；;]+/)
        .filter(Boolean)
        .map(s => s.trim());

    // 识别“问题关键词”分句，优先用真正的问题点生成标题
    const issueRegex = /(未到边|到顶|重叠|遮挡|异常|错误|不对|不符|不一致|显示不全|显示|截断|布局|间距|对齐|底色|颜色|样式|边距|高度|宽度|位置|阴影|圆角)/;
    const contextCandidate = primaryParts[0] && !issueRegex.test(primaryParts[0]) ? primaryParts[0] : '';
    const issueParts = primaryParts.filter(p => issueRegex.test(p));
    if (issueParts.length > 0) {
        const issues = issueParts.slice(0, 2).join('、');
        coreContent = contextCandidate ? `${contextCandidate}：${issues}` : issues;
    } else {
        if (primaryParts.length >= 2) {
            coreContent = `${primaryParts[0]}、${primaryParts[1]}`;
        } else if (primaryParts.length === 1) {
            coreContent = primaryParts[0];
        }
    }

    // 提取关键问题词汇（仅在仍然过短或未命中时作为补充）
    const problemKeywords = [
        '字体大小不对', '字体大小', '字号不对', '字号',
        '颜色不对', '颜色', '色值不对', '色值',
        '样式不对', '样式', '外观不对', '外观',
        '布局不对', '布局', '排版不对', '排版',
        '对齐不对', '对齐', '间距不对', '间距',
        '选中状态', '选中', 'hover状态', 'hover',
        '按钮大小', '按钮', '图标大小', '图标',
        '文案显示', '文案', '文字显示', '文字',
        '导航菜单', '导航', '菜单',
        '弹窗', '对话框', '提示框',
        '加载', '响应', '速度'
    ];
    if (coreContent.length < 6) {
        for (const keyword of problemKeywords) {
            if (content.includes(keyword)) {
                const regex = new RegExp(`[^，。！？]*${keyword}[^，。！？]*`, 'g');
                const matches = content.match(regex);
                if (matches && matches.length > 0) {
                    let phrase = matches[0].trim();
                    phrase = phrase.replace(/^[，。！？\s]+/, '').replace(/[，。！？\s]+$/, '');
                    coreContent = phrase;
                    break;
                }
            }
        }
    }
    
    // 去除不恰当的设计规范措辞（本质为功能/交互问题时不应出现）
    coreContent = coreContent
        .replace(/与?设计稿?存在不一致[，。]*/g, '')
        .replace(/请核对规范[，。]*/g, '')
        .replace(/按设计稿|按规范|规范要求[，。]*/g, '');

    // 限制长度，确保标题简洁（不加省略号，保持一句话表述）
    if (coreContent.length > 30) {
        coreContent = coreContent.substring(0, 30);
    }
    
    return coreContent;
}

// 优化标题内容，确保语句通顺
function optimizeTitleContent(content) {
    if (!content) return content;
    
    // 智能优化常见表达，确保语句通顺（先应用优化规则，再移除冗余词汇）
    const optimizations = {
        // 尺寸问题优化
        '按钮的尺寸不对,太小了,高度应该是40px': '按钮尺寸过小，高度不够',
        '尺寸不对,太小了,高度应该是40px': '尺寸过小，高度不够',
        '按钮的尺寸不对,太小了,高度': '按钮尺寸过小，高度不够',
        '尺寸不对,太小了,高度': '尺寸过小，高度不够',
        '按钮的高度应该是40px': '按钮高度不符合规范',
        '高度应该是40px': '高度不符合规范',
        '按钮的高度': '按钮高度异常',
        '尺寸不对,太小了': '尺寸过小',
        '太小了,高度': '高度过小',
        '按钮的尺寸不对': '按钮尺寸不对',
        '按钮尺寸不对,太小了': '按钮尺寸过小',
        
        // 样式问题优化
        'Tab选中态的样式需加粗为bold': 'Tab选中态样式不够突出',
        '样式需加粗为bold': '样式不够突出',
        '样式需加粗': '样式不够突出',
        '需加粗为bold': '样式不够突出',
        
        // 显示问题优化
        '展示不全': '显示不全',
        '显示不全,截断': '显示不全',
        '文案显示不全': '文案显示不全',
        
        // 布局问题优化
        '布局不对': '布局异常',
        '间距不对': '间距异常',
        '对齐不对': '对齐异常',
        
        // 颜色问题优化
        '颜色不对': '颜色异常',
        '颜色不符': '颜色不匹配',
        
        // 通用优化
        '导致': '，',
        '放大后': '放大'
    };
    
    // 先应用优化规则
    Object.entries(optimizations).forEach(([pattern, replacement]) => {
        content = content.replace(new RegExp(pattern, 'g'), replacement);
    });
    
    // 然后移除常见的冗余词汇，但保留核心问题描述
    const redundantWords = ["应该", "需要", "要", "可以", "希望", "期待", "需"];
    redundantWords.forEach(word => {
        content = content.replace(new RegExp(word, 'g'), '');
    });
    
    // 清理多余的标点符号，但保留必要的逗号
    content = content.replace(/。$/, '').replace(/；$/, '').replace(/，$/, '').trim();
    
    // 清理多余的标点符号
    content = content
        .replace(/，+/g, '，')   // 合并多个逗号
        .replace(/^，/, '')      // 移除开头的逗号
        .replace(/，$/, '')      // 移除结尾的逗号
        .trim();
    
    // 如果内容太短，尝试补充
    if (content.length < 3) {
        content = "问题描述";
    }
    
    return content;
}

// 智能生成背景描述
function generateSmartBackground(description, problemType, regionNames, moduleNames) {
    const typeMap = {
        '设计需求优化': '设计体验问题',
        '交互功能bug': '交互功能问题',
        '视觉还原度bug': '视觉还原度问题',
        '历史遗留': '历史遗留问题'
    };
    
    const typeText = typeMap[problemType] || '设计体验问题';
    
    return `用户原声在${regionNames}地区的${moduleNames}使用过程中发现${typeText}，${getImpactDescription(problemType)}，需要及时处理解决。`;
}

// 智能生成解决方案 - 增强个性化分析
async function generateSmartSolution(description, recommendedSolutions) {
    if (recommendedSolutions && recommendedSolutions.length > 0) {
        const first = (recommendedSolutions[0] || '').trim();
        // 忽略占位/无效建议
        if (first && !/请详细描述问题现象和期望的解决方案|请详细描述|待分析/.test(first)) {
            return first;
        }
    }
    
    // 根据描述内容生成基础解决方案
    const text = description.toLowerCase();
    // 1) 若是"分条问题"输入，优先按问题反推方案
    const fromProblems = buildSolutionsFromProblemList(description);
    if (fromProblems) {
        return normalizeSolutionPunctuation(fromProblems);
    }
    const { solutionText } = await splitProblemAndSolution(description).catch(() => splitProblemAndSolutionLocal(description));
    
    // 如果提取到了解决方案文本，进行优化处理
    if (solutionText) {
        return normalizeSolutionPunctuation(optimizeSolutionText(
            solutionText
                .replace(/与?设计稿?存在不一致[，。]*/g, '')
                .replace(/请核对规范[，。]*/g, '')
                .replace(/按设计稿|按规范|规范要求[，。]*/g, '')
        ));
    }
    
    // 基于具体问题场景生成针对性解决方案
    const personalizedSolution = generatePersonalizedSolution(description);
    if (personalizedSolution) {
        return personalizedSolution;
    }
    
    // 根据问题类型生成对应的解决方案
    if (text.includes('慢') || text.includes('卡顿')) {
        return normalizeSolutionPunctuation('优化系统性能，提升响应速度，改善用户体验');
    } else if (text.includes('颜色') || text.includes('还原') || text.includes('对齐') || text.includes('样式') || text.includes('字体')) {
        return normalizeSolutionPunctuation('按设计稿还原视觉规范（色值、对齐、间距、圆角、阴影等），并进行设计走查');
    } else if (text.includes('界面') || text.includes('操作') || text.includes('菜单') || text.includes('导航')) {
        return normalizeSolutionPunctuation('优化用户界面设计，简化操作流程，提升易用性');
    } else if (text.includes('功能') || text.includes('无法') || text.includes('错误') || text.includes('异常')) {
        return normalizeSolutionPunctuation('修复功能逻辑错误，补充异常兜底，确保功能稳定运行');
    }
    return normalizeSolutionPunctuation('根据问题具体情况制定针对性解决方案');
}

// 生成个性化解决方案
function generatePersonalizedSolution(description) {
    const text = description.toLowerCase();
    
    // 针对具体问题场景的个性化解决方案
    if (text.includes('导航') && text.includes('菜单') && text.includes('选中')) {
        return '优化导航菜单选中状态样式，确保视觉层次清晰，提升用户识别度。调整导航文案长度限制，避免文案截断问题，保证信息完整性。';
    }
    
    if (text.includes('字体') && (text.includes('大小') || text.includes('字号'))) {
        return '根据设计规范调整字体大小和字重，确保文字清晰可读。优化文字排版和行高，提升阅读体验和视觉舒适度。';
    }
    
    if (text.includes('颜色') && (text.includes('不一致') || text.includes('还原'))) {
        return '按设计稿规范调整颜色值，确保品牌色彩一致性。优化颜色对比度，提升可访问性和视觉层次。';
    }
    
    if (text.includes('按钮') && (text.includes('点击') || text.includes('交互'))) {
        return '修复按钮事件绑定与触发逻辑，提供明确的交互反馈（禁用/Loading/Toast），并补充异常兜底与重试。';
    }
    
    if (text.includes('加载') && text.includes('慢')) {
        return '优化页面加载性能，减少用户等待时间。添加加载状态提示，改善用户等待体验。';
    }
    
    if (text.includes('弹窗') || text.includes('对话框')) {
        return '优化弹窗交互逻辑，确保操作流程顺畅。调整弹窗尺寸和位置，避免遮挡重要信息。';
    }
    
    if (text.includes('样式') && text.includes('不佳')) {
        return '优化样式与交互状态的一致性，修复异常样式或状态切换问题，并建立走查机制及时发现偏差。';
    }
    
    return null; // 没有匹配到具体场景，返回null让调用方使用默认逻辑
}

// 从“分条问题”反推方案（严格遵循你的期望表达）
function buildSolutionsFromProblemList(description) {
    if (!description) return '';
    let raw = String(description).trim();
    // 去掉开头的场景描述（直到中文/英文冒号）
    raw = raw.replace(/^[^\n:：]*[:：]\s*/,'');
    // 统一换行与分隔符
    raw = raw.replace(/\r?\n+/g,'\n');
    // 用更宽松的规则拆分 1/2/3…（支持（1.）、1.、1、等）
    const parts = raw.split(/[\n\s]*[（(]?\d+[、\.．\)）]\s*/).map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return '';
    const actions = [];
    parts.forEach(p => {
        // 底部框到边 + 到顶
        if (/底部框/.test(p) && /到边/.test(p)) {
            actions.push('底部框左右对齐边缘，顶部不顶到顶');
            return;
        }
        // 顶部提示与图片/文字重叠
        if (/(顶部|上方).*提示/.test(p) && /(重叠|遮挡)/.test(p)) {
            actions.push('调整提示与图片/文字的层级或间距，避免重叠');
            return;
        }
        // 文字区底色/背景色
        if (/(文字|文案).*底色|背景/.test(p)) {
            actions.push('移除文字区底色或按设计设为正确底色');
            return;
        }
    });
    if (actions.length === 0) return '';
    return actions.join('；');
}

// 判断一段文本是否更像“问题描述列表”而非“动作型方案”
function looksLikeProblemList(text){
    if(!text) return false;
    const s = String(text).trim();
    // 命中特征：
    // 1) 大量“是/有/不/与…不一致/存在”等“状态/问题”词汇
    // 2) 以数字列点开头的多句
    const issueHints = /(有问题|不一致|异常|错误|重叠|遮挡|不到边|到顶|显示不全|存在|是)/g;
    const countIssue = (s.match(issueHints) || []).length;
    const countAction = (s.match(/(将|把|需要|统一|调整|改为|改成|优化|修复|修改|更改)/g) || []).length;
    const listLike = /\d+[^\n]*[。；;，,]/.test(s) || /\n/.test(s);
    return countIssue > countAction && listLike;
}

// 将“问题列表”改写为“动作型解决方案”
function rewriteProblemListToActions(text){
    const raw = String(text).replace(/^[^\n:：]*[:：]\s*/,'').trim();
    const items = raw.split(/[\n\s]*[（(]?\d+[、\.．\)）]\s*/).map(s=>s.trim()).filter(Boolean);
    const actions = [];
    items.forEach(p=>{
        // 到边/到顶
        if(/底部框/.test(p) && /到边/.test(p)) actions.push('底部框左右对齐边缘，顶部不顶到顶');
        // 重叠/遮挡
        if(/(顶部|上方).*提示/.test(p) && /(重叠|遮挡)/.test(p)) actions.push('调整提示与图片/文字的层级或间距，避免重叠');
        // 文字底色
        if(/(文字|文案).*底色|背景/.test(p)) actions.push('移除文字区底色或按设计设为正确底色');
    });
    if(actions.length === 0){
        return `针对上述问题逐项优化，确保视觉与交互符合设计预期。`;
    }
    return actions.join('；') + '。';
}

// 规范问题描述：取冒号前第一句，并补句号
function normalizeProblemDescription(text){
    if(!text) return '';
    const s = String(text).split(/[:：]/)[0].trim();
    return s ? (/[。.!？?]$/.test(s) ? s : s + '。') : '';
}

// 优化解决方案文本，确保内容完整通顺
function optimizeSolutionText(solutionText) {
    if (!solutionText) return '';
    
    let solution = solutionText.trim();
    
    // 如果解决方案已经包含"建议"前缀，直接处理数字格式
    if (solution.includes('建议')) {
        // 处理"建议1.xxx 2.xxx"这样的格式
        solution = solution.replace(/建议(\d+)\./g, '建议$1：');
        // 处理独立的数字开头（如" 2.xxx"）
        solution = solution.replace(/(\s+)(\d+)\./g, '$1建议$2：');
    } else {
        // 如果解决方案以数字开头（如"1.优先找产品..."），进行格式化处理
        if (/^\d+\./.test(solution)) {
            // 将数字开头的建议转换为更完整的格式
            solution = solution.replace(/^(\d+)\.\s*/, '建议$1：');
            
            // 如果包含多个建议点，进行合并处理
            const parts = solution.split(/(?=\d+\.)/);
            if (parts.length > 1) {
                const formattedParts = parts.map((part, index) => {
                    if (index === 0) return part;
                    return part.replace(/^(\d+)\.\s*/, `建议${index + 1}：`);
                });
                solution = formattedParts.join(' ');
            }
        }
    }
    
    // 若文本更像“问题列表”，则改写为“动作型方案”
    if (looksLikeProblemList(solution)) {
        solution = rewriteProblemListToActions(solution);
    }
    
    // 确保解决方案以句号结尾
    if (!solution.endsWith('。') && !solution.endsWith('！') && !solution.endsWith('？')) {
        solution += '。';
    }
    
    // 如果解决方案太短，尝试补充上下文
    if (solution.length < 10) {
        solution = `根据问题具体情况，建议：${solution}`;
    }
    
    return normalizeSolutionPunctuation(solution);
}

// 统一清洗方案文本的重复标点
function normalizeSolutionPunctuation(text) {
    if (!text) return '';
    let s = String(text)
        .replace(/[，,]{2,}/g, '，')
        .replace(/[。\.]{2,}/g, '。')
        .replace(/[；;]{2,}/g, '；')
        .replace(/[、]{2,}/g, '、')
        .replace(/，(。|；|、)/g, '$1')
        .replace(/(。|；|，|、){2,}/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
    if (!/[。！!？?]$/.test(s)) s += '。';
    return s;
}

// 智能生成验收标准
function generateSmartAcceptanceCriteria(problemType, priority) {
    const baseCriteria = [
        '问题得到有效解决',
        '用户体验明显改善',
        '无新的相关问题产生'
    ];
    
    const typeSpecificCriteria = {
        '设计需求优化': [
            '设计效果符合预期',
            '界面美观度显著提升',
            '用户满意度明显改善'
        ],
        '交互功能bug': [
            '交互功能运行稳定可靠',
            '异常情况得到妥善处理',
            '功能性能符合预期'
        ],
        '视觉还原度bug': [
            '视觉实现与设计稿完全一致',
            '像素级对齐准确无误',
            '视觉效果符合设计规范'
        ],
        '历史遗留': [
            '历史问题得到系统性解决',
            '代码质量得到显著提升',
            '长期稳定性得到保障'
        ]
    };
    
    const criteria = typeSpecificCriteria[problemType] || baseCriteria;
    
    // 根据优先级调整验收标准
    if (priority === 'P0-紧急' || priority === 'P1-高') {
        criteria.unshift('问题完全解决，无任何遗留问题');
    }
    
    return criteria;
}

// 提取关键词
function extractKeywords(description) {
    const keywords = [];
    const text = description.toLowerCase();
    
    const importantWords = [
        '登录', '支付', '订单', '商品', '用户', '界面', '操作', '功能',
        '性能', '速度', '安全', '数据', '文件', '上传', '下载'
    ];
    
    importantWords.forEach(word => {
        if (text.includes(word)) {
            keywords.push(word);
        }
    });
    
    return keywords.slice(0, 2); // 最多返回2个关键词
}

// 识别是否为“视觉还原度bug”
function detectVisualMismatch(text){
    if(!text) return false;
    const s = String(text).toLowerCase();
    const zh = String(text);
    const visualWords = [
        '不一致','不符','偏差','还原','样式','对齐','间距','色值','颜色','边距','圆角','阴影','字号','字体','显示不全','截断','布局','排版','重叠','遮挡','到底','到边','到顶','白色底色','底色'
    ];
    // 命中任一中文关键字
    if (visualWords.some(w => zh.includes(w))) return true;
    // 英文/开发口语化
    const enWords = ['visual', 'style', 'css', 'align', 'spacing', 'color', 'radius', 'shadow', 'font', 'truncate', 'overlap'];
    return enWords.some(w => s.includes(w));
}

// 从用户输入中拆分"问题/解决方案"
// 从用户输入中拆分"问题/解决方案" - 使用统一API
async function splitProblemAndSolution(description) {
    try {
        // 调用统一的问题描述拆分API
        const response = await fetch('http://localhost:8001/api/problem-description/split', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                description: description || ''
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                return {
                    problemText: result.problem_text,
                    solutionText: result.solution_text
                };
            }
        }
        
        // 如果API调用失败，使用本地降级逻辑
        console.warn('问题描述拆分API调用失败，使用本地逻辑');
        return splitProblemAndSolutionLocal(description);
        
    } catch (error) {
        console.error('问题描述拆分失败:', error);
        // 降级到本地逻辑
        return splitProblemAndSolutionLocal(description);
    }
}

// 本地降级逻辑（保留原有逻辑作为备用）
function splitProblemAndSolutionLocal(description) {
    const text = (description || '').trim();
    if (!text) return { problemText: '', solutionText: '' };

    // 1) 先按显式分隔词拆分
    const separators = [
        /解决方案[:：]/i,
        /建议[:：]/i,
        /期望[:：]/i,
        /希望[:：]/i,
        /临时处理[:：]/i,
        /调整为[:：]/i,
        /改为[:：]/i,
        /应(?:该)?(?:为|是)[:：]?/i,
        /建议\s*\d+[:：]?/i,  // 匹配"建议1："这样的格式
        /^\s*\d+\.\s*建议/i   // 匹配"1. 建议"这样的格式
    ];

    for (const reg of separators) {
        const idx = text.search(reg);
        if (idx !== -1) {
            const problem = text.slice(0, idx).trim();
            let solution = text.slice(idx).trim();
            
            // 特殊处理：如果匹配到"建议"相关的分隔符，不要删除"建议"部分
            if (reg.source.includes('建议')) {
                // 保持完整的解决方案文本，不删除"建议"前缀
                solution = solution;
            } else {
                // 其他情况才删除匹配的分隔符
                solution = solution.replace(reg, '').trim();
            }
            
            return {
                problemText: problem || text,
                solutionText: solution
            };
        }
    }
    
    // 2) 特殊处理：如果输入包含"调整为"、"改为"等解决方案词汇，进行智能拆分
    const solutionPatterns = [
        /调整为\s*(\d+px|\d+像素|\d+号|[\u4e00-\u9fa5]+)/i,
        /改为\s*(\d+px|\d+像素|\d+号|[\u4e00-\u9fa5]+)/i,
        /需要\s*(\d+px|\d+像素|\d+号|[\u4e00-\u9fa5]+)/i,
        /应该\s*(\d+px|\d+像素|\d+号|[\u4e00-\u9fa5]+)/i
    ];
    
    for (const pattern of solutionPatterns) {
        const match = text.match(pattern);
        if (match) {
            const solutionStart = text.indexOf(match[0]);
            const problem = text.slice(0, solutionStart).trim();
            const solution = text.slice(solutionStart).trim();
            
            return {
                problemText: problem,
                solutionText: solution
            };
        }
    }
    // 2) 若无显式分隔：按句子扫描，并处理“有问题，…将/把/需要/统一/调整/改为/优化…”的结构
    const sentences = text.split(/(?<=[。！？!?.；;\n])/).map(s => s.trim()).filter(Boolean);
    // 特例：首句包含“有问题/异常/错误/不一致”等问题词，次句以行动动词开头 → 问题/方案拆分
    if (sentences.length >= 2) {
        const issueHint = /(有问题|异常|错误|不对|不符|不一致|显示不全|显示异常|布局异常|样式异常)/;
        const actionLead = /^(将|把|需要|统一|调整|改为|改成|优化|修复|修改|更改|调整为)/;
        const s1 = sentences[0].replace(/[，,。；;]+$/,'');
        const s2 = sentences.slice(1).join(' ').trim();
        if (issueHint.test(s1) && actionLead.test(s2)) {
            return {
                problemText: s1,
                solutionText: s2
            };
        }
        // 另一种形式：单句中包含“有问题，将/把/需要/统一/调整/改为/优化…”，按第一个逗号拆分
        if (text.includes('，')) {
            const [left, right] = text.split('，');
            if (issueHint.test(left) && actionLead.test(right)) {
                return {
                    problemText: left.trim(),
                    solutionText: text.slice(text.indexOf('，') + 1).trim()
                };
            }
        }
    }
    const solutionIndicators = [
        /应(?:该)?(?:为|是)/i,
        /调整为/i,
        /改为/i,
        /建议/i,
        /期望/i,
        /希望/i,
        /^\s*\d+\.\s*/i  // 匹配以数字开头的句子
    ];
    const solutionSentences = [];
    const problemSentences = [];
    sentences.forEach(s => {
        if (solutionIndicators.some(r => r.test(s))) {
            solutionSentences.push(s.replace(/^[-——\s]*/, ''));
        } else {
            problemSentences.push(s);
        }
    });
    if (solutionSentences.length > 0) {
        return {
            problemText: problemSentences.join(' '),
            solutionText: solutionSentences.join(' ')
        };
    }
    // 3) 仍未识别：按换行/破折号做兜底拆分
    const parts = text.split(/\n+|——|--/).map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
        return { problemText: parts[0], solutionText: parts.slice(1).join('；') };
    }
    return { problemText: text, solutionText: '' };
}

// 文本润色与补全：让过短的内容变成完整句式 - 使用统一API
async function enrichProblemAndSolution(problemText, solutionText, original) {
    try {
        // 调用统一的问题描述润色API
        const response = await fetch('http://localhost:8001/api/problem-description/enrich', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                problem_text: problemText || '',
                solution_text: solutionText || '',
                original: original || ''
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                return {
                    problem: result.enriched_problem,
                    solution: result.enriched_solution
                };
            }
        }
        
        // 如果API调用失败，使用本地降级逻辑
        console.warn('问题描述润色API调用失败，使用本地逻辑');
        return enrichProblemAndSolutionLocal(problemText, solutionText, original);
        
    } catch (error) {
        console.error('问题描述润色失败:', error);
        // 降级到本地逻辑
        return enrichProblemAndSolutionLocal(problemText, solutionText, original);
    }
}

// 本地降级逻辑（保留原有逻辑作为备用）
function enrichProblemAndSolutionLocal(problemText, solutionText, original) {
    const problem = (problemText || '').trim();
    let solution = (solutionText || '').trim();

    // 特例：若包含“组件样式对齐/一致”的愿望表达，问题/方案按需求输出
    const wishInfo = findAlignWishInfo(original || '');
    if (wishInfo && wishInfo.component) {
        const normalizedWish = wishInfo.wish ? (wishInfo.wish.endsWith('。') ? wishInfo.wish : wishInfo.wish + '。') : '';
        return {
            problem: `${wishInfo.component}需修改。`,
            solution: normalizeSolutionPunctuation(normalizedWish || '与对应头图组件样式对齐。')
        };
    }

    // 确保问题和解决方案不重复
    if (solution && problem.includes(solution)) {
        // 如果问题描述中包含了解决方案，从问题描述中移除解决方案部分
        const cleanProblem = problem.replace(solution, '').trim();
        return {
            problem: cleanProblem || '体验问题需要优化',
            solution: normalizeSolutionPunctuation(solution)
        };
    }

    // 若方案只有类似"20px/黄色/加粗"等简短词，补全为完整句
    if (/^#?[0-9a-fA-F]{3,8}$/.test(solution) || /\d+\s*px$/i.test(solution) || /[\u4e00-\u9fa5A-Za-z]+$/.test(solution) && solution.length <= 8) {
        solution = `按设计规范进行还原，目标为：${solution}。`;
    }

    // 如果方案为空但原文包含"应/应当/应该/应为/应是/调整为/改为"后缀，尝试抽取
    if (!solution) {
        const m = (original || '').match(/(?:应当|应该|应为|应是|应|调整为|改为)[:：]?\s*([^。；;\n]+)/);
        if (m && m[1]) {
            solution = `按设计稿调整为：${m[1].trim()}。`;
        }
    }

    // 问题语句：清理设计规范相关措辞，保持交互/功能聚焦
    let enrichedProblem = problem
        .replace(/与?设计稿?存在不一致[，。]*/g, '')
        .replace(/请核对规范[，。]*/g, '')
        .replace(/按设计稿|按规范|规范要求[，。]*/g, '');
    if (enrichedProblem && !/[。.!；;]$/.test(enrichedProblem)) {
        enrichedProblem += '。';
    }

    return { problem: enrichedProblem || (original || ''), solution: normalizeSolutionPunctuation(solution) };
}

// 获取影响描述（精简版）
function getImpactDescription(problemType) {
    const impactMap = {
        '设计需求优化': '影响使用体验',
        '交互功能bug': '影响功能使用',
        '视觉还原度bug': '影响视觉效果',
        '历史遗留': '影响系统稳定性'
    };
    
    return impactMap[problemType] || '影响用户体验';
}

// 生成增强的标准化格式
function generateEnhancedStandardFormat(data, analysis, enhancedContent) {
    const regionNames = data.systemTypes.join('、');
    const moduleNames = data.modules.map(module => getModuleName(module)).join('、');
    
    return {
        title: enhancedContent.title,
        background: enhancedContent.background,
        problem: data.description,
        impact: analysis.impact,
        priority: analysis.priority,
        problemType: analysis.predictedType,
        expectedResult: enhancedContent.solution,
        acceptanceCriteria: enhancedContent.acceptanceCriteria,
        estimatedTime: analysis.estimatedTime,
        assignee: analysis.processingMethod.assignee,
        status: '待处理',
        confidence: Math.round(analysis.analysisConfidence * 100) + '%',
        similarIssues: analysis.similarIssues,
        processingMethod: analysis.processingMethod.method,
        escalation: analysis.processingMethod.escalation,
        recommendedTimeline: analysis.processingMethod.timeline
    };
}

// 更新分析进度
function updateAnalysisProgress(message, progress) {
    const loadingText = elements.previewContent.querySelector('.loading-text');
    const progressFill = elements.previewContent.querySelector('.progress-fill');
    
    if (loadingText) {
        loadingText.textContent = message;
    }
    
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
    
    // 如果进度达到100%，标记转化完成
    if (progress >= 100) {
        window.conversionCompleted = true;
    }
}

// 获取模块名称
function getModuleName(module) {
    const moduleNames = {
        '管理端': '管理端',
        '门店端': '门店端',
        '移动端': '移动端'
    };
    return moduleNames[module] || module;
}

// 显示预览结果
function displayPreviewResult(result) {
    const f = result.standardFormat;
    console.log('显示预览结果:', result); // 调试信息
    console.log('标题字段:', result.title, f.title); // 调试信息
    // 保存当前分析结果
    window.currentAnalysisResult = result;
    // 显示操作按钮
    showPreviewActions();
    
    // 保存当前状态（转化完成后）
    TemplateStateManager.saveCurrentState();

    // 获取相关图片（第11个字段）
    const relatedImages = result.files.filter(file => file.type.startsWith('image/'));
    
    elements.previewContent.innerHTML = `
        <!-- 内容详情卡片 -->
        <div class="preview-card" id="contentDetailsCard">
            <div class="preview-card-header">
                <h3 class="preview-card-title">内容详情</h3>
                <button class="copy-btn" onclick="copyCardContent('contentDetailsCard')" title="复制内容详情">
                    <img src="icon/复制-默认.svg" alt="复制" class="copy-icon" />
                </button>
            </div>
            <div class="preview-card-content" id="contentDetailsContent">
                <div class="detail-row detail-row-title">
                    <div class="detail-label">标题</div>
                    <div class="detail-value">
                        <div class="detail-display">${(result.title || f.title || '').replace(/"/g, '&quot;')}</div>
                        <textarea class="detail-input detail-textarea" data-field="title" rows="2">${(result.title || f.title || '').replace(/"/g, '&quot;')}</textarea>
                    </div>
                </div>
                
                <div class="detail-row detail-row-description">
                    <div class="detail-label">问题描述</div>
                    <div class="detail-value">
                        <div class="detail-display">${f.problem_description || ''}</div>
                        <input type="text" class="detail-input detail-text" data-field="problem_description" value="${f.problem_description || ''}">
                    </div>
                </div>
                
                <div class="detail-row detail-row-solution">
                    <div class="detail-label">解决方案</div>
                    <div class="detail-value">
                        <div class="detail-display">${f.solution || ''}</div>
                        <input type="text" class="detail-input detail-text" data-field="solution" value="${f.solution || ''}">
                    </div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">所属地区</div>
                    <div class="detail-value">
                        <div class="detail-display">${f.region || ''}</div>
                        <div class="detail-input detail-checkbox-group" data-field="region">
                            <label class="detail-checkbox-item">
                                <input type="checkbox" value="BR" ${(f.region||'').includes('BR') ? 'checked' : ''}>
                                <span class="detail-checkbox-label">BR</span>
                            </label>
                            <label class="detail-checkbox-item">
                                <input type="checkbox" value="SSL" ${(f.region||'').includes('SSL') ? 'checked' : ''}>
                                <span class="detail-checkbox-label">SSL</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">归属终端</div>
                    <div class="detail-value">
                        <div class="detail-display">${f.terminal || ''}</div>
                        <div class="detail-input detail-checkbox-group" data-field="terminal">
                            <label class="detail-checkbox-item">
                                <input type="checkbox" value="管理端" ${(f.terminal||'').includes('管理端') ? 'checked' : ''}>
                                <span class="detail-checkbox-label">管理端</span>
                            </label>
                            <label class="detail-checkbox-item">
                                <input type="checkbox" value="门店端" ${(f.terminal||'').includes('门店端') ? 'checked' : ''}>
                                <span class="detail-checkbox-label">门店端</span>
                            </label>
                            <label class="detail-checkbox-item">
                                <input type="checkbox" value="移动端" ${(f.terminal||'').includes('移动端') ? 'checked' : ''}>
                                <span class="detail-checkbox-label">移动端</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">问题类型</div>
                    <div class="detail-value">
                        <div class="detail-display">${f.issue_type || ''}</div>
                        <select class="detail-input detail-select" data-field="issue_type">
                            <option value="设计需求优化" ${f.issue_type === '设计需求优化' ? 'selected' : ''}>设计需求优化</option>
                            <option value="交互功能bug" ${f.issue_type === '交互功能bug' ? 'selected' : ''}>交互功能bug</option>
                            <option value="视觉还原度bug" ${f.issue_type === '视觉还原度bug' ? 'selected' : ''}>视觉还原度bug</option>
                            <option value="历史遗留" ${f.issue_type === '历史遗留' ? 'selected' : ''}>历史遗留</option>
                        </select>
                    </div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">解决方式</div>
                    <div class="detail-value">
                        <div class="detail-display">${f.resolution_method || ''}</div>
                        <select class="detail-input detail-select" data-field="resolution_method">
                            <option value="体验优化" ${f.resolution_method === '体验优化' ? 'selected' : ''}>体验优化</option>
                            <option value="需求优化" ${f.resolution_method === '需求优化' ? 'selected' : ''}>需求优化</option>
                        </select>
                    </div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">优先级</div>
                    <div class="detail-value">
                        <div class="detail-display">${f.priority || ''}</div>
                        <select class="detail-input detail-select" data-field="priority">
                            <option value="P0-紧急" ${f.priority === 'P0-紧急' ? 'selected' : ''}>P0-紧急</option>
                            <option value="P1-高" ${f.priority === 'P1-高' ? 'selected' : ''}>P1-高</option>
                            <option value="P2-中" ${f.priority === 'P2-中' ? 'selected' : ''}>P2-中</option>
                            <option value="P3-低" ${f.priority === 'P3-低' ? 'selected' : ''}>P3-低</option>
                        </select>
                    </div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">解决状态</div>
                    <div class="detail-value">
                        <div class="detail-display">${f.status || ''}</div>
                        <select class="detail-input detail-select" data-field="status">
                            <option value="待确认(未提给研发)" ${f.status === '待确认(未提给研发)' ? 'selected' : ''}>待确认(未提给研发)</option>
                            <option value="研发中(已提给研发)" ${f.status === '研发中(已提给研发)' ? 'selected' : ''}>研发中(已提给研发)</option>
                            <option value="待走查(已研发完成)" ${f.status === '待走查(已研发完成)' ? 'selected' : ''}>待走查(已研发完成)</option>
                            <option value="已解决(走查完成并上线)" ${f.status === '已解决(走查完成并上线)' ? 'selected' : ''}>已解决(走查完成并上线)</option>
                            <option value="暂不解决" ${f.status === '暂不解决' ? 'selected' : ''}>暂不解决</option>
                        </select>
                    </div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">期望修复版本</div>
                    <div class="detail-value">
                        <div class="detail-display">${f.target_version || '未定'}</div>
                        <input type="text" class="detail-input detail-text" data-field="target_version" value="${f.target_version || '未定'}">
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 相关图片卡片 -->
        <div class="preview-card" id="relatedImagesCard">
            <div class="preview-card-header">
                <h3 class="preview-card-title">相关图片</h3>
                <button class="copy-btn" onclick="copyCardContent('relatedImagesCard')" title="复制相关图片">
                    <img src="icon/复制-默认.svg" alt="复制" class="copy-icon" />
                </button>
            </div>
            <div class="preview-card-content" id="relatedImagesContent">
                ${relatedImages.length > 0 ? 
                    relatedImages.map((file, index) => {
                        try {
                            if (file instanceof File) {
                                const imageUrl = URL.createObjectURL(file);
                                return `
                                    <div class="image-item">
                                        <img src="${imageUrl}" alt="${file.name}" class="image-thumbnail">
                                        <div class="image-caption">${file.name}</div>
                                    </div>
                                `;
                            }
                        } catch (error) {
                            console.error('Error creating image URL:', error);
                        }
                        return '';
                    }).join('') : 
                    '<div class="no-images">暂无相关图片</div>'
                }
            </div>
        </div>
    `;
    
    // 初始化编辑功能
    initializeEditableContent();
}

// 复制卡片内容功能
function copyCardContent(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;
    
    if (cardId === 'contentDetailsCard') {
        // 复制内容详情卡片 - 只复制字段值，用制表符分隔
        const detailRows = card.querySelectorAll('.detail-row');
        const fieldValues = [];
        
        detailRows.forEach(row => {
            const value = row.querySelector('.detail-display');
            if (value) {
                fieldValues.push(value.textContent.trim());
            }
        });
        
        const content = fieldValues.join('\t');
        
        // 复制到剪贴板
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(content).then(() => {
                showNotification('复制成功，请前往Cooper粘贴', 'success');
            }).catch(err => {
                console.error('复制失败:', err);
                fallbackCopyTextToClipboard(content);
            });
        } else {
            fallbackCopyTextToClipboard(content);
        }
        
    } else if (cardId === 'relatedImagesCard') {
        // 复制相关图片卡片 - 只复制图片文件
        copyRelatedImages();
    } else if (cardId === 'userInputCard') {
        // 复制用户输入卡片 - 复制体验问题描述
        const userInputContent = card.querySelector('.user-input-content');
        if (userInputContent) {
            const content = userInputContent.textContent.trim();
            copyToClipboard(content, '体验问题描述');
        }
    } else if (cardId === 'contentDetailsCard' && card.querySelector('.detail-grid')) {
        // 复制历史记录详情页的内容详情卡片
        const detailItems = card.querySelectorAll('.detail-item');
        const fieldValues = [];
        
        detailItems.forEach(item => {
            const label = item.querySelector('label');
            const value = item.querySelector('.detail-value');
            if (label && value) {
                fieldValues.push(`${label.textContent.trim()}${value.textContent.trim()}`);
            }
        });
        
        const content = fieldValues.join('\n');
        copyToClipboard(content, '内容详情');
    } else if (cardId === 'relatedImagesCard' && card.querySelector('.images-grid')) {
        // 复制历史记录详情页的相关图片卡片
        const imageItems = card.querySelectorAll('.image-item');
        const imageNames = [];
        
        imageItems.forEach(item => {
            const caption = item.querySelector('.image-caption');
            if (caption) {
                imageNames.push(caption.textContent.trim());
            }
        });
        
        if (imageNames.length > 0) {
            const content = `相关图片：\n${imageNames.join('\n')}`;
            copyToClipboard(content, '相关图片');
        } else {
            showNotification('没有相关图片', 'warning');
        }
    }
}

// 复制到剪贴板的通用函数
function copyToClipboard(content, type = '内容') {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(content).then(() => {
            showNotification(`${type}复制成功，请前往Cooper粘贴`, 'success');
        }).catch(err => {
            console.error('复制失败:', err);
            fallbackCopyTextToClipboard(content);
        });
    } else {
        fallbackCopyTextToClipboard(content);
    }
}

// 复制相关图片功能
async function copyRelatedImages() {
    try {
        // 获取当前分析结果中的图片文件
        if (!window.currentAnalysisResult || !window.currentAnalysisResult.files) {
            showNotification('没有找到相关图片', 'warning');
            return;
        }
        
        const imageFiles = window.currentAnalysisResult.files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            showNotification('没有相关图片可复制', 'warning');
            return;
        }
        
        // 检查剪贴板API支持
        if (!navigator.clipboard || !window.isSecureContext) {
            showNotification('当前环境不支持图片复制功能', 'error');
            return;
        }
        
        // 准备剪贴板数据
        const clipboardItems = [];
        
        for (const imageFile of imageFiles) {
            try {
                // 将图片转换为PNG格式以提高兼容性
                const pngBlob = await convertToPNG(imageFile);
                clipboardItems.push(new ClipboardItem({
                    'image/png': pngBlob
                }));
            } catch (error) {
                console.error('转换图片失败:', error);
                // 如果转换失败，使用原始格式
                clipboardItems.push(new ClipboardItem({
                    [imageFile.type]: imageFile
                }));
            }
        }
        
        // 写入剪贴板
        await navigator.clipboard.write(clipboardItems);
        showNotification('复制成功，请前往Cooper粘贴', 'success');
        
    } catch (error) {
        console.error('复制图片失败:', error);
        showNotification('复制图片失败，请重试', 'error');
    }
}

// 将图片转换为PNG格式
async function convertToPNG(imageFile) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('转换失败'));
                }
            }, 'image/png');
        };
        
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = URL.createObjectURL(imageFile);
    });
}


// 导出文档
function exportAsDoc() {
    const content = elements.previewContent.innerText;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `需求文档_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('文档已导出', 'success');
}

// 显示加载模态框
function showLoadingModal() {
    elements.loadingModal.classList.add('show');
}

// 隐藏加载模态框
function hideLoadingModal() {
    elements.loadingModal.classList.remove('show');
}

// 显示通知
function showNotification(message, type = 'info', options = {}) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = document.createElement('i');
    icon.className = `fas ${getNotificationIcon(type)}`;
    
    const text = document.createElement('span');
    text.textContent = message;
    
    notification.appendChild(icon);
    notification.appendChild(text);
    
    if (options.actionText && typeof options.onAction === 'function') {
        const actionBtn = document.createElement('button');
        actionBtn.textContent = options.actionText;
        actionBtn.style.cssText = `
            background: transparent;
            border: none;
            color: #fff;
            font-weight: 600;
            text-decoration: underline;
            cursor: pointer;
            font-size: 14px;
        `;
        actionBtn.addEventListener('click', () => {
            try {
                options.onAction();
            } catch (error) {
                console.error('通知操作失败:', error);
            }
            removeNotification(notification);
        });
        notification.appendChild(actionBtn);
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${getNotificationColor(type)};
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1001;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        removeNotification(notification);
    }, 4000);
}

function removeNotification(notification) {
    if (!notification || !notification.parentNode) return;
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
}

// 获取通知图标
function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// 获取通知颜色
function getNotificationColor(type) {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    return colors[type] || colors.info;
}

// ============================================
// 动态Tooltip管理系统
// ============================================

// Tooltip管理器
const TooltipManager = {
    tooltipElement: null,
    arrowElement: null,
    currentTarget: null,
    
    // 计算tooltip位置，避免被遮挡
    calculatePosition(target, tooltip) {
        const targetRect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // 默认位置：上方居中
        const gap = 4; // tooltip和箭头之间的间距
        let top = targetRect.top - tooltipRect.height - gap;
        let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        let placement = 'top';
        let arrowBorder = 'border-top: 4px solid #333; border-left: 4px solid transparent; border-right: 4px solid transparent;';
        
        // 检查上方空间是否足够
        const topSpace = targetRect.top - scrollY;
        const bottomSpace = viewportHeight - targetRect.bottom;
        
        if (topSpace < tooltipRect.height + 20) {
            // 上方空间不足，尝试下方
            if (bottomSpace >= tooltipRect.height + 20) {
                top = targetRect.bottom + gap;
                placement = 'bottom';
                arrowBorder = 'border-bottom: 4px solid #333; border-left: 4px solid transparent; border-right: 4px solid transparent;';
            } else {
                // 上下都不够，选择空间更大的一侧
                if (topSpace < bottomSpace) {
                    top = targetRect.bottom + gap;
                    placement = 'bottom';
                    arrowBorder = 'border-bottom: 4px solid #333; border-left: 4px solid transparent; border-right: 4px solid transparent;';
                }
            }
        }
        
        // 计算箭头应该指向的目标中心点
        const targetCenterX = targetRect.left + (targetRect.width / 2);
        
        // 检查左右边界
        if (left < 10) {
            // 左边界超出，调整到左对齐
            left = 10;
        } else if (left + tooltipRect.width > viewportWidth - 10) {
            // 右边界超出，调整到右对齐
            left = viewportWidth - tooltipRect.width - 10;
        }
        
        // 如果tooltip太宽，居中显示但确保不超出视口
        if (tooltipRect.width > viewportWidth - 20) {
            left = 10;
        }
        
        // 计算箭头位置：箭头应该指向目标中心，但限制在tooltip范围内
        let arrowLeft = targetCenterX;
        const tooltipLeft = left;
        const tooltipRight = left + tooltipRect.width;
        const minArrowLeft = tooltipLeft + 8; // 距离tooltip左边缘至少8px
        const maxArrowLeft = tooltipRight - 8; // 距离tooltip右边缘至少8px
        
        // 限制箭头在tooltip范围内
        if (arrowLeft < minArrowLeft) {
            arrowLeft = minArrowLeft;
        } else if (arrowLeft > maxArrowLeft) {
            arrowLeft = maxArrowLeft;
        }
        
        // 计算箭头垂直位置：紧贴在tooltip边缘
        let arrowTop;
        if (placement === 'top') {
            // 箭头在tooltip底部，紧贴
            arrowTop = top + tooltipRect.height;
        } else {
            // 箭头在tooltip顶部，紧贴
            arrowTop = top - 4; // 箭头高度是4px
        }
        
        return {
            top: top,
            left: left,
            placement,
            arrowLeft: arrowLeft,
            arrowTop: arrowTop,
            arrowBorder
        };
    },
    
    // 显示tooltip
    show(target, text) {
        // 如果已经有tooltip显示，先隐藏
        this.hide();
        
        if (!text || !target) return;
        
        this.currentTarget = target;
        
        // 创建tooltip元素
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.className = 'dynamic-tooltip';
        this.tooltipElement.textContent = text;
        this.tooltipElement.style.cssText = `
            position: fixed;
            padding: 4px 8px;
            background: #333;
            color: #fff;
            font-size: 12px;
            white-space: nowrap;
            border-radius: 4px;
            pointer-events: none;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;
        
        // 先添加到DOM以获取尺寸
        document.body.appendChild(this.tooltipElement);
        
        // 计算位置
        const position = this.calculatePosition(target, this.tooltipElement);
        
        // 应用tooltip位置
        this.tooltipElement.style.top = position.top + 'px';
        this.tooltipElement.style.left = position.left + 'px';
        
        // 创建箭头元素
        this.arrowElement = document.createElement('div');
        this.arrowElement.className = 'dynamic-tooltip-arrow';
        this.arrowElement.style.cssText = `
            position: fixed;
            width: 0;
            height: 0;
            pointer-events: none;
            z-index: 10001;
            top: ${position.arrowTop}px;
            left: ${position.arrowLeft}px;
            transform: translateX(-50%);
            ${position.arrowBorder}
        `;
        
        document.body.appendChild(this.arrowElement);
        
        // 显示动画
        requestAnimationFrame(() => {
            this.tooltipElement.style.opacity = '1';
        });
        
        // 监听滚动和窗口大小变化，更新位置
        this.updatePosition = () => {
            if (this.tooltipElement && this.currentTarget && this.arrowElement) {
                const position = this.calculatePosition(this.currentTarget, this.tooltipElement);
                this.tooltipElement.style.top = position.top + 'px';
                this.tooltipElement.style.left = position.left + 'px';
                this.arrowElement.style.top = position.arrowTop + 'px';
                this.arrowElement.style.left = position.arrowLeft + 'px';
                this.arrowElement.style.cssText = `
                    position: fixed;
                    width: 0;
                    height: 0;
                    pointer-events: none;
                    z-index: 10001;
                    top: ${position.arrowTop}px;
                    left: ${position.arrowLeft}px;
                    transform: translateX(-50%);
                    ${position.arrowBorder}
                `;
            }
        };
        
        window.addEventListener('scroll', this.updatePosition, true);
        window.addEventListener('resize', this.updatePosition);
    },
    
    // 隐藏tooltip
    hide() {
        if (this.tooltipElement) {
            this.tooltipElement.style.opacity = '0';
            setTimeout(() => {
                if (this.tooltipElement && this.tooltipElement.parentNode) {
                    this.tooltipElement.parentNode.removeChild(this.tooltipElement);
                }
                this.tooltipElement = null;
            }, 200);
        }
        
        if (this.arrowElement) {
            if (this.arrowElement.parentNode) {
                this.arrowElement.parentNode.removeChild(this.arrowElement);
            }
            this.arrowElement = null;
        }
        
        if (this.updatePosition) {
            window.removeEventListener('scroll', this.updatePosition, true);
            window.removeEventListener('resize', this.updatePosition);
            this.updatePosition = null;
        }
        
        this.currentTarget = null;
    }
};

// 初始化动态tooltip
function initDynamicTooltips() {
    // 为所有带有data-tooltip的元素绑定事件
    const elementsWithTooltip = document.querySelectorAll('[data-tooltip]');
    
    elementsWithTooltip.forEach(element => {
        // 移除原有的hover事件（如果有）
        element.removeEventListener('mouseenter', element._tooltipMouseEnter);
        element.removeEventListener('mouseleave', element._tooltipMouseLeave);
        
        // 创建新的事件处理函数
        const showTooltip = (e) => {
            const text = element.getAttribute('data-tooltip');
            if (text) {
                TooltipManager.show(element, text);
            }
        };
        
        const hideTooltip = () => {
            TooltipManager.hide();
        };
        
        // 绑定事件
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
        
        // 保存引用以便后续清理
        element._tooltipMouseEnter = showTooltip;
        element._tooltipMouseLeave = hideTooltip;
    });
}

// 生成ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 获取当前用户ID
function getCurrentUserId() {
    // 从localStorage获取用户ID，如果没有则生成一个
    let userId = localStorage.getItem('feedbackBridge_userId');
    if (!userId) {
        userId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
        localStorage.setItem('feedbackBridge_userId', userId);
    }
    return userId;
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 检查转化按钮状态
function checkConvertButtonState() {
    const description = elements.issueDescription.value.trim();
    const charCount = description.length;
    const shouldEnable = charCount > 10;
    
    // 更新按钮状态
    elements.convertBtn.disabled = !shouldEnable;
    
    if (shouldEnable) {
        elements.convertBtn.classList.remove('disabled');
        elements.convertBtn.style.opacity = '1';
        elements.convertBtn.style.cursor = 'pointer';
    } else {
        elements.convertBtn.classList.add('disabled');
        elements.convertBtn.style.opacity = '0.5';
        elements.convertBtn.style.cursor = 'not-allowed';
    }
    
}


// 在预览区域显示加载状态
function showPreviewLoading() {
    elements.previewContent.innerHTML = `
        <div class="preview-loading">
            <div class="loading-spinner">
                <i class="fas fa-brain fa-pulse"></i>
            </div>
            <div class="loading-text">正在智能分析问题...</div>
            <div class="loading-subtitle">请稍候，我们正在为您智能转化体验问题</div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
            </div>
            <div class="loading-tips">
                <div class="tip-item">💡 首次分析可能需要几秒钟，相似问题会更快</div>
                <div class="tip-item">🚀 系统会自动缓存结果，提升后续响应速度</div>
                <div class="tip-item">⚡ 如果等待时间过长，系统会自动降级到快速模式</div>
            </div>
        </div>
    `;
    
    // 启动进度动画
    startProgressAnimation();
}

// 启动进度动画
function startProgressAnimation() {
    let progress = 0;
    const progressFill = elements.previewContent.querySelector('.progress-fill');
    const loadingText = elements.previewContent.querySelector('.loading-text');
    
    const messages = [
        "正在智能分析问题...",
        "正在识别问题类型...",
        "正在评估优先级...",
        "正在生成解决方案...",
        "正在优化输出格式...",
        "即将完成分析..."
    ];
    
    let messageIndex = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 15; // 随机增长，更真实
        if (progress > 90) progress = 90; // 不超过90%，等待实际完成
        
        if (progressFill) progressFill.style.width = progress + '%';
        
        // 更新消息
        if (progress > messageIndex * 15 && messageIndex < messages.length - 1) {
            messageIndex++;
            if (loadingText) loadingText.textContent = messages[messageIndex];
        }
        
        // 如果转化完成，清除定时器
        if (window.conversionCompleted) {
            clearInterval(interval);
            if (progressFill) progressFill.style.width = '100%';
            if (loadingText) loadingText.textContent = '分析完成！';
        }
    }, 200);
    
    // 保存定时器引用，以便后续清除
    window.progressInterval = interval;
}

// 重新生成内容
function regenerateContent() {
    if (isConverting) return;
    
    // 直接调用转化函数
    handleConvert();
}

// 保存AI录入原声到用户原声池
function saveOriginalSoundToVoicePool() {
    if (!window.currentOriginalSoundResult) {
        showNotification('请先完成原声转化再保存', 'warning');
        return;
    }
    
    const result = window.currentOriginalSoundResult;
    
    if (OriginalSoundTemplate?.currentInputType === 'excel' && result.analysis?.results) {
        const ids = saveMultipleOriginalSounds(result.analysis.results);
        notifyVoicePoolSave(ids);
    } else {
        const newId = saveSingleOriginalSound(result);
        notifyVoicePoolSave([newId]);
    }
    
    window.currentOriginalSoundResult = null;
}

// 保存AI录入问题到问题跟进池
function saveProblemAnalysisToProblemPool() {
    if (!window.currentAnalysisResult) {
        showNotification('请先完成AI转化再保存', 'warning');
        return;
    }
    
    const result = window.currentAnalysisResult;
    const standardFormat = result.standardFormat || result.standard_format || {};
    const analysis = result.analysis || {};
    
    const regions = normalizeListField(standardFormat.region || analysis.region);
    const terminals = normalizeListField(standardFormat.terminal || analysis.terminal);
    const priority = standardFormat.priority || analysis.priority || 'P2-中';
    const problemTypeValue = standardFormat.issue_type || analysis.predictedType || '设计需求优化';
    const assignTo = standardFormat.owner || analysis.owner || '';
    const resolutionStatus = normalizeResolutionStatus(standardFormat.status || analysis.status);
    const resolutionMethod = standardFormat.resolution_method || (analysis.processingMethod?.method) || '';
    const targetVersion = standardFormat.target_version || '未定';
    
    const problemData = {
        problemType: 'design',
        regions,
        terminals,
        problemTypeValue,
        priority,
        assignTo,
        resolutionStatus,
        title: result.title || standardFormat.title || '未命名问题',
        description: standardFormat.problem_description || '',
        solution: standardFormat.solution || '',
        resolutionMethod,
        targetVersion,
        relatedOriginalSound: '--',
        relatedOriginalSounds: [],
        createdAt: new Date().toISOString(),
        operationRecords: [{
            user: 'AI助手',
            time: new Date().toLocaleString('zh-CN'),
            content: '通过AI录入自动生成'
        }]
    };
    
    const problemId = saveProblemData(problemData);
    
    showNotification('已保存到问题跟进池-设计走查类', 'success', {
        actionText: '查看',
        onAction: () => goToProblemPoolAndOpenDetail(problemId, 'design')
    });
    
    window.currentAnalysisResult = null;
}

function saveSingleOriginalSound(result) {
    const entry = buildVoicePoolEntryFromResult(result);
    const voicePoolData = insertVoicePoolEntry(entry);
    
    if (currentMainPage === 'voice-pool') {
        renderVoicePoolTable(voicePoolData);
        updateVoicePoolStats(voicePoolData);
    }
    
    return entry.id;
}

function saveMultipleOriginalSounds(results = []) {
    if (!Array.isArray(results) || results.length === 0) {
        return [];
    }
    
    const entries = results.map(item => {
        return buildVoicePoolEntryFromResult({
            analysis: item.analysis,
            user_input: item.original_text,
            transcribed_text: item.transcribed_text,
            standard_format: item.standard_format || {}
        });
    });
    
    const voicePoolData = insertVoicePoolEntries(entries);
    
    if (currentMainPage === 'voice-pool') {
        renderVoicePoolTable(voicePoolData);
        updateVoicePoolStats(voicePoolData);
    }
    
    return entries.map(entry => entry.id);
}

function buildVoicePoolEntryFromResult(result = {}) {
    const analysis = result.analysis || {};
    const standardFormat = result.standard_format || result.standardFormat || {};
    const emotion = buildEmotionMeta(analysis);
    const summary = analysis.ai_optimized_summary || standardFormat.summary || result.user_input || standardFormat.title || '未命名原声';
    const moduleName = standardFormat.module || analysis.module || '其他';
    const originalText = result.user_input || result.transcribed_text || standardFormat.problem_description || '';
    const translation = analysis.original_translation || standardFormat.translation || '';
    const keyPointsValue = normalizeKeyPointsValue(analysis.key_points);
    
    return {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        summary: summary,
        emotion: emotion,
        module: moduleName,
        issues: '--',
        status: { text: '待评估', type: 'pending' },
        originalText: originalText,
        originalDetail: originalText,
        originalDescription: standardFormat.problem_description || originalText,
        translatedText: translation,
        originalTranslation: translation,
        translation: translation,
        keyAnalysis: keyPointsValue,
        keyPoints: keyPointsValue,
        sentimentAnalysis: analysis.sentiment_analysis || '',
        sentiment: analysis.sentiment_analysis || '',
        sentimentClassification: emotion.type,
        sentimentIntensity: emotion.level,
        transcribedText: result.transcribed_text || '',
        userInput: result.user_input || '',
        createdAt: new Date().toISOString()
    };
}

function insertVoicePoolEntry(entry) {
    const data = getVoicePoolDataFromStorage();
    data.unshift(entry);
    persistVoicePoolData(data);
    return data;
}

function insertVoicePoolEntries(entries = []) {
    const data = getVoicePoolDataFromStorage();
    entries.forEach(entry => data.unshift(entry));
    persistVoicePoolData(data);
    return data;
}

function persistVoicePoolData(data = []) {
    try {
        localStorage.setItem('voicePoolData', JSON.stringify(data));
    } catch (error) {
        console.error('保存原声数据失败:', error);
        showNotification('保存失败，请重试', 'error');
    }
}

function notifyVoicePoolSave(ids = []) {
    if (!Array.isArray(ids) || ids.length === 0) {
        showNotification('已保存到用户原声池', 'success');
        return;
    }
    
    const targetId = ids[ids.length - 1];
    const text = ids.length > 1 ? `已保存 ${ids.length} 条原声` : '已保存到用户原声池';
    
    showNotification(text, 'success', {
        actionText: '查看',
        onAction: () => goToVoicePoolAndOpenDetail(targetId)
    });
}

function buildEmotionMeta(analysis = {}) {
    const classificationRaw = (analysis.sentiment_classification || '').toString().toLowerCase();
    let type = 'neutral';
    if (classificationRaw.includes('neg') || classificationRaw.includes('负')) {
        type = 'negative';
    } else if (classificationRaw.includes('pos') || classificationRaw.includes('正')) {
        type = 'positive';
    }
    
    const intensityRaw = (analysis.sentiment_intensity || '').toString().toLowerCase();
    let level = 'slight';
    let intensityLabel = '轻微';
    if (['strong', 'high', '强', '强烈'].some(key => intensityRaw.includes(key))) {
        level = 'strong';
        intensityLabel = '强烈';
    } else if (['medium', 'moderate', '中', '适中'].some(key => intensityRaw.includes(key))) {
        level = 'medium';
        intensityLabel = '中等';
    }
    
    const sentimentLabel = type === 'negative' ? '负面' : type === 'positive' ? '正向' : '中性';
    return {
        type,
        level,
        label: `${sentimentLabel}·${intensityLabel}`
    };
}

function normalizeKeyPointsValue(value) {
    if (!value) {
        return '';
    }
    if (Array.isArray(value)) {
        return value.filter(item => item && item.trim());
    }
    if (typeof value === 'string') {
        const parts = value.split(/[\n;；]+/).map(part => part.trim()).filter(Boolean);
        return parts.length > 1 ? parts : value.trim();
    }
    return '';
}

function normalizeListField(value) {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value.map(item => (typeof item === 'string' ? item.trim() : item)).filter(Boolean);
    }
    if (typeof value === 'string') {
        return value.split(/[,，;；、\s]+/).map(part => part.trim()).filter(Boolean);
    }
    return [];
}

function normalizeResolutionStatus(rawStatus) {
    const status = (rawStatus || '').toString();
    const map = {
        '待确认(未提给研发)': '待确认',
        '待确认': '待确认',
        '研发中(已提给研发)': '开发中',
        '开发中': '开发中',
        '待走查(已研发完成)': '待走查',
        '待走查': '待走查',
        '已解决(走查完成并上线)': '已解决',
        '已解决': '已解决',
        '暂不解决': '暂不解决'
    };
    return map[status] || '待确认';
}

function goToVoicePoolAndOpenDetail(id) {
    if (!id) return;
    currentMainPage = 'voice-pool';
    backToHome();
    setTimeout(() => {
        viewVoiceDetail(id);
    }, 500);
}

function goToProblemPoolAndOpenDetail(id, problemType = 'design') {
    if (!id) return;
    currentMainPage = 'problem-pool';
    backToHomeWithProblemType(problemType);
    setTimeout(() => {
        viewProblemDetail(id);
    }, 500);
}

// 清空AI录入原声的输入区和预览区
function clearAIVoiceInputAndPreview() {
    // 清空文本原声输入
    const originalSoundText = document.getElementById('originalSoundText');
    if (originalSoundText) {
        originalSoundText.value = '';
    }
    
    // 清空Excel文件输入
    const excelFileInput = document.getElementById('excelFileInput');
    if (excelFileInput) {
        excelFileInput.value = '';
    }
    
    // 清空Excel上传的文件显示区域
    const excelUploadedFiles = document.getElementById('excelUploadedFiles');
    if (excelUploadedFiles) {
        excelUploadedFiles.innerHTML = '';
    }
    
    // 重置已选择的Excel文件
    window.selectedExcelFile = null;
    
    // 重新初始化Excel上传事件，确保功能可用
    if (typeof OriginalSoundTemplate !== 'undefined' && OriginalSoundTemplate.initializeFileUpload) {
        setTimeout(() => {
            OriginalSoundTemplate.initializeFileUpload();
        }, 0);
    }
    
    // 清空预览区域
    const previewContent = document.getElementById('previewContent');
    if (previewContent) {
        previewContent.innerHTML = `
            <div class="preview-empty-state" id="previewEmptyState">
                <img src="image/预览空占位.png" alt="预览空状态" class="empty-state-image" />
                <p class="empty-state-text">转化好的内容将会按照标准化的模板在此处展示</p>
            </div>
        `;
    }
    
    // 隐藏预览操作按钮
    hidePreviewActions();
    
    // 清空全局变量
    window.currentOriginalSoundResult = null;
    window.conversionCompleted = false;
    
    // 清空OriginalSoundTemplate的缓存
    if (typeof OriginalSoundTemplate !== 'undefined') {
        OriginalSoundTemplate.excelAnalysisCache = {
            fileHash: null,
            analysisResults: null,
            timestamp: null,
            sourceLanguage: null,
            targetLanguage: null
        };
        OriginalSoundTemplate.previewContent = {
            text: null,
            excel: null
        };
    }
    
    // 清空TemplateStateManager中的预览内容
    if (typeof TemplateStateManager !== 'undefined' && TemplateStateManager.states) {
        if (TemplateStateManager.states.feedback) {
            if (TemplateStateManager.states.feedback.text) {
                TemplateStateManager.states.feedback.text.formData = {};
                TemplateStateManager.states.feedback.text.previewContent = '';
                TemplateStateManager.states.feedback.text.uploadedFiles = [];
            }
            if (TemplateStateManager.states.feedback.excel) {
                TemplateStateManager.states.feedback.excel.formData = {};
                TemplateStateManager.states.feedback.excel.previewContent = '';
                TemplateStateManager.states.feedback.excel.uploadedFiles = [];
            }
        }
    }
}

// 清空AI录入体验问题页的输入区和预览区
function clearAIProblemInputAndPreview() {
    // 清空问题描述输入
    const issueDescription = document.getElementById('issueDescription');
    if (issueDescription) {
        issueDescription.value = '';
    }
    
    // 清空文件上传区域
    const uploadedImagesContainer = document.getElementById('uploadedImagesContainer');
    if (uploadedImagesContainer) {
        uploadedImagesContainer.innerHTML = '';
    }
    
    // 清空文件输入
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.value = '';
    }
    
    // 清空上传的文件数组
    uploadedFiles = [];
    
    // 恢复所属地区和归属模块的选择（从localStorage读取，如果没有则使用默认值）
    try {
        const savedSystemTypes = JSON.parse(localStorage.getItem('aiProblemLastSystemTypes') || '[]');
        const savedModules = JSON.parse(localStorage.getItem('aiProblemLastModules') || '[]');
        
        // 恢复所属地区选择
        const systemTypeCheckboxes = document.querySelectorAll('input[name="systemType"]');
        if (savedSystemTypes.length > 0) {
            systemTypeCheckboxes.forEach(checkbox => {
                checkbox.checked = savedSystemTypes.includes(checkbox.value);
            });
        } else {
            // 如果没有保存的状态，使用默认值（BR和SSL默认选中）
            systemTypeCheckboxes.forEach(checkbox => {
                if (checkbox.value === 'BR' || checkbox.value === 'SSL') {
                    checkbox.checked = true;
                } else {
                    checkbox.checked = false;
                }
            });
        }
        
        // 恢复归属模块选择
        const moduleCheckboxes = document.querySelectorAll('input[name="module"]');
        if (savedModules.length > 0) {
            moduleCheckboxes.forEach(checkbox => {
                checkbox.checked = savedModules.includes(checkbox.value);
            });
        } else {
            // 如果没有保存的状态，全部不选中
            moduleCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }
        
        console.log('恢复所属地区和归属模块选择:', { savedSystemTypes, savedModules });
    } catch (error) {
        console.error('恢复所属地区和归属模块选择失败:', error);
        // 如果恢复失败，使用默认值
        const systemTypeCheckboxes = document.querySelectorAll('input[name="systemType"]');
        systemTypeCheckboxes.forEach(checkbox => {
            if (checkbox.value === 'BR' || checkbox.value === 'SSL') {
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
            }
        });
        
        const moduleCheckboxes = document.querySelectorAll('input[name="module"]');
        moduleCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    
    // 清空预览区域
    const previewContent = document.getElementById('previewContent');
    if (previewContent) {
        previewContent.innerHTML = `
            <div class="preview-empty-state" id="previewEmptyState">
                <img src="image/预览空占位.png" alt="预览空状态" class="empty-state-image" />
                <p class="empty-state-text">转化好的内容将会按照标准化的模板在此处展示</p>
            </div>
        `;
    }
    
    // 隐藏预览操作按钮
    hidePreviewActions();
    
    // 清空全局变量
    window.currentAnalysisResult = null;
    window.conversionCompleted = false;
    
    // 清空TemplateStateManager中的设计模板状态
    if (typeof TemplateStateManager !== 'undefined' && TemplateStateManager.states) {
        if (TemplateStateManager.states.design) {
            TemplateStateManager.states.design.formData = {};
            TemplateStateManager.states.design.previewContent = '';
            TemplateStateManager.states.design.uploadedFiles = [];
        }
    }
}

// 恢复用户上次选择的输入类型tab
function restoreLastInputTypeTab() {
    try {
        // 从localStorage读取上次选择的tab
        const lastInputType = localStorage.getItem('aiVoiceLastInputType') || 'text';
        
        // 移除所有tab的active状态
        document.querySelectorAll('.input-type-tab').forEach(tab => {
            const isActive = tab.dataset.type === lastInputType;
            tab.classList.toggle('active', isActive);
            const icon = tab.querySelector('.input-type-tab-icon');
            if (icon) {
                const activeIcon = icon.getAttribute('data-active-icon');
                const inactiveIcon = icon.getAttribute('data-inactive-icon');
                if (activeIcon && inactiveIcon) {
                    icon.src = isActive ? activeIcon : inactiveIcon;
                }
            }
        });
        
        // 切换输入类型内容显示
        document.querySelectorAll('.input-type-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const targetContent = document.getElementById(`${lastInputType}InputContent`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
        
        // 调用OriginalSoundTemplate的switchInputType方法（但不保存状态）
        if (typeof OriginalSoundTemplate !== 'undefined' && OriginalSoundTemplate.switchInputType) {
            OriginalSoundTemplate.switchInputType(lastInputType, false);
        }
    } catch (error) {
        console.error('恢复输入类型tab失败:', error);
        // 默认激活文本原声tab
        const textTab = document.querySelector('.input-type-tab[data-type="text"]');
        if (textTab) {
            textTab.classList.add('active');
        }
    }
}

// 保存当前选择的输入类型tab
function saveCurrentInputTypeTab() {
    try {
        const activeTab = document.querySelector('.input-type-tab.active');
        if (activeTab) {
            const inputType = activeTab.getAttribute('data-type');
            if (inputType) {
                localStorage.setItem('aiVoiceLastInputType', inputType);
                console.log('保存输入类型tab:', inputType);
            }
        }
    } catch (error) {
        console.error('保存输入类型tab失败:', error);
    }
}










// Excel+图片复制功能（专门解决Excel图片显示问题）
async function copyExcelWithImages() {
    // 记录用户原声 - 接受了智能分析结果
    if (window.currentAnalysisResult) {
        SmartAnalysisEngine.recordUserFeedback(window.currentAnalysisResult.analysis, 'accepted');
    }
    
    // 获取预览内容
    const previewContent = document.getElementById('previewContent');
    if (!previewContent) {
        showNotification('没有可复制的内容', 'error');
        return;
    }
    
    // 提取表单中的实际内容值
    const contentValues = extractFormContentValues(previewContent);
    
    if (!contentValues || contentValues.trim() === '') {
        showNotification('没有可复制的内容', 'error');
        return;
    }
    
    // 提取图片数据
    const imageData = await extractImageData();
    
    console.log('Excel+图片复制 - 文本内容:', contentValues);
    console.log('Excel+图片复制 - 图片数量:', imageData.length);
    
    if (navigator.clipboard && window.isSecureContext) {
        try {
            // 创建包含图片的HTML内容
            const htmlWithImages = await createGoogleSheetsCompatibleHTML(contentValues, imageData);
            
            // 创建剪贴板数据
            const clipboardItemData = {
                'text/html': new Blob([htmlWithImages], { type: 'text/html' }),
                'text/plain': new Blob([contentValues], { type: 'text/plain' })
            };
            
            // 添加图片到剪贴板（转换为PNG格式以提高兼容性）
            if (imageData.length > 0) {
                console.log(`准备添加${imageData.length}张图片到剪贴板`);
                
                for (let i = 0; i < imageData.length; i++) {
                    const image = imageData[i];
                    console.log(`处理图片${i + 1}:`, {
                        name: image.name,
                        type: image.type,
                        size: image.blob.size
                    });
                    
                    // 将图片转换为PNG格式以提高剪贴板兼容性
                    try {
                        const pngBlob = await convertToPNG(image.blob);
                        console.log(`✅ 成功转换图片${i + 1}为PNG格式:`, {
                            原始大小: image.blob.size,
                            PNG大小: pngBlob.size,
                            原始类型: image.blob.type,
                            新类型: pngBlob.type
                        });
                        
                        // 使用唯一的键名避免覆盖
                        const imageKey = imageData.length === 1 ? 'image/png' : `image/png-${i + 1}`;
                        clipboardItemData[imageKey] = pngBlob;
                        
                    } catch (error) {
                        console.error(`❌ 转换图片${i + 1}为PNG失败:`, error);
                        // 如果转换失败，尝试使用原始格式
                        const originalKey = imageData.length === 1 ? image.type : `${image.type}-${i + 1}`;
                        clipboardItemData[originalKey] = image.blob;
                    }
                }
                
                console.log('最终剪贴板数据键名:', Object.keys(clipboardItemData));
            }
            
            console.log('Excel+图片 - 剪贴板数据类型:', Object.keys(clipboardItemData));
            await navigator.clipboard.write([new ClipboardItem(clipboardItemData)]);
            
            if (imageData.length > 0) {
                showNotification(`🎯 一键复制成功！\n\n内容已复制到剪贴板：\n• 文本内容（制表符分隔）\n• HTML格式（包含图片）\n• ${imageData.length}张图片（PNG格式）\n\n使用方法：\n• Ctrl+V：粘贴文本到多个单元格\n• 选择性粘贴 → HTML：粘贴文本+图片\n• 选择性粘贴 → 图片：只粘贴图片\n\n图片已单独复制，可直接粘贴！`, 'success');
            } else {
                showNotification('✅ 文本已复制到剪贴板', 'success');
            }
            
        } catch (err) {
            console.error('Excel+图片复制失败:', err);
            
            // 如果失败，尝试只复制文本
            try {
                await navigator.clipboard.writeText(contentValues);
                showNotification('⚠️ 文本已复制到剪贴板\n图片复制失败', 'warning');
            } catch (textErr) {
                fallbackCopyTextToClipboard(contentValues);
            }
        }
    } else {
        fallbackCopyTextToClipboard(contentValues);
    }
}

// 创建包含图片的HTML内容
async function createHTMLWithImages(textContent, imageData) {
    const fields = textContent.split('\t');
    
    // 创建HTML内容
    let html = '<div style="font-family: Arial, sans-serif;">';
    
    // 添加表格
    html += '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">';
    html += '<tr>';
    fields.forEach((field, index) => {
        html += `<td style="padding: 8px; border: 1px solid #ccc;">${field || ''}</td>`;
    });
    html += '</tr>';
    html += '</table>';
    
    // 添加图片
    if (imageData.length > 0) {
        html += '<br><h3>相关图片：</h3>';
        
        for (const image of imageData) {
            try {
                // 将图片转换为base64
                const base64 = await blobToBase64(image.blob);
                html += `<img src="${base64}" alt="${image.name}" style="max-width: 400px; max-height: 300px; border: 2px solid #007acc; margin: 10px 0; display: block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">`;
            } catch (error) {
                console.error('HTML图片转换失败:', error);
                html += `<p style="color: red;">图片 ${image.name} (转换失败)</p>`;
            }
        }
    }
    
    html += '</div>';
    
    return html;
}


// 创建Google Sheets兼容的HTML内容 - 文本在表格中，图片集中在一个单元格
async function createGoogleSheetsCompatibleHTML(textContent, imageData) {
    const fields = textContent.split('\t');
    
    let html = '<div style="font-family: Arial, sans-serif;">';
    
    // 创建表格，文本内容分布在多个单元格中
    html += '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">';
    html += '<tr>';
    
    // 将文本字段放入不同的单元格
    fields.forEach((field, index) => {
        html += `<td style="padding: 8px; border: 1px solid #ccc; vertical-align: top;">${field || ''}</td>`;
    });
    
    // 如果有图片，在最后一个单元格中添加所有图片信息
    if (imageData.length > 0) {
        html += '<td style="padding: 8px; border: 1px solid #ccc; vertical-align: top; text-align: center;">';
        html += '<div style="font-weight: bold; margin-bottom: 10px; color: #1890ff;">相关图片</div>';
        
        // 将所有图片集中在一个单元格中展示
        for (let i = 0; i < imageData.length; i++) {
            const image = imageData[i];
            try {
                const base64 = await blobToBase64(image.blob);
                html += `<div style="margin-bottom: 8px; display: inline-block; margin-right: 5px;">`;
                html += `<img src="${base64}" style="max-width: 100px; max-height: 70px; border: 1px solid #ddd; border-radius: 4px;" alt="图片${i + 1}" />`;
                html += `<div style="margin-top: 2px; font-size: 9px; color: #666;">${image.name}</div>`;
                html += `</div>`;
            } catch (error) {
                console.error(`转换图片${i + 1}为Base64失败:`, error);
                html += `<div style="margin-bottom: 5px; color: #999; font-size: 9px;">图片${i + 1}: ${image.name}</div>`;
            }
        }
        
        html += '</td>';
    }
    
    html += '</tr>';
    html += '</table>';
    html += '</div>';
    
    return html;
}


// 创建Google Sheets友好的内容格式
function createGoogleSheetsContent(textContent, imageData) {
    const fields = textContent.split('\t');
    
    // 为Google Sheets创建制表符分隔的格式
    let sheetsText = textContent;
    
    // 如果有图片，添加图片信息
    if (imageData.length > 0) {
        sheetsText += '\n\n=== 相关图片信息 ===\n';
        imageData.forEach((image, index) => {
            sheetsText += `图片${index + 1}: ${image.name}\n`;
        });
        sheetsText += '\n注意：图片需要手动插入到Google Sheets中\n';
        sheetsText += '方法：插入 → 图片 → 上传到云端硬盘\n';
    }
    
    return sheetsText;
}

// 将Blob转换为Base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// 将图片转换为PNG格式（提高剪贴板兼容性）
function convertToPNG(blob) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        img.onload = () => {
            // 设置画布尺寸
            canvas.width = img.width;
            canvas.height = img.height;
            
            // 绘制图片到画布
            ctx.drawImage(img, 0, 0);
            
            // 转换为PNG格式的Blob
            canvas.toBlob((pngBlob) => {
                if (pngBlob) {
                    console.log('图片转换成功:', {
                        原始大小: blob.size,
                        PNG大小: pngBlob.size,
                        原始类型: blob.type,
                        新类型: pngBlob.type
                    });
                    resolve(pngBlob);
                } else {
                    reject(new Error('PNG转换失败'));
                }
            }, 'image/png', 0.9);
        };
        
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = URL.createObjectURL(blob);
    });
}

// 提取表单内容值的函数
function extractFormContentValues(previewContent) {
    const contentParts = [];
    
    // 检查是否是文本原声生成结果
    const isOriginalSoundResult = previewContent.querySelector('.original-sound-result');
    
    if (isOriginalSoundResult) {
        // 处理文本原声生成结果的字段 - 按照用户原文+567234顺序排列
        const originalSoundFields = [
            { selector: '.value.user-input', label: '用户输入原文' },    // 用户原文（最前面）
            { selector: '.value.summary', label: '核心主旨' },           // 5
            { selector: '.value.key-points', label: '重点分析' },        // 6
            { selector: '.value.translation', label: '原声翻译' },        // 7
            { selector: '.value.sentiment', label: '情感分类' },          // 2
            { selector: '.value.intensity', label: '情感强度' },         // 3
            { selector: '.value.analysis', label: '情感分析' }            // 4
        ];
        
        originalSoundFields.forEach(field => {
            const element = previewContent.querySelector(field.selector);
            if (element) {
                const value = element.textContent || element.innerText || '';
                if (value && value.trim() !== '') {
                    contentParts.push(value.trim());
                }
            }
        });
        
        // 处理识别文本（如果有）
        const transcriptionElement = previewContent.querySelector('.transcription');
        if (transcriptionElement) {
            const transcriptionValue = transcriptionElement.textContent || transcriptionElement.innerText || '';
            if (transcriptionValue && transcriptionValue.trim() !== '') {
                contentParts.unshift(transcriptionValue.trim()); // 将识别文本放在最前面
            }
        }
        
    } else {
        // 处理设计体验问题模板的字段
        const fields = [
            { selector: '[data-field="title"]', label: '标题' },
            { selector: '[data-field="region"]', label: '所属地区', isSelect: true },
            { selector: '[data-field="terminal"]', label: '归属终端', isSelect: true },
            { selector: '[data-field="issue_type"]', label: '问题类型', isSelect: true },
            { selector: '[data-field="resolution_method"]', label: '解决方式', isSelect: true },
            { selector: '[data-field="priority"]', label: '优先级', isSelect: true },
            { selector: '[data-field="problem_description"]', label: '问题描述' },
            { selector: '[data-field="solution"]', label: '解决方案' },
            { selector: '[data-field="status"]', label: '解决状态', isSelect: true },
            { selector: '[data-field="target_version"]', label: '期望修复版本' }
        ];
        
        fields.forEach(field => {
            const element = previewContent.querySelector(field.selector);
            if (element) {
                let value = '';
                
                if (field.isSelect) {
                    // 处理select元素
                    if (element.multiple) {
                        // 多选
                        const selectedOptions = Array.from(element.selectedOptions);
                        value = selectedOptions.map(option => option.value).join('、');
                    } else {
                        // 单选
                        value = element.value || '';
                    }
                } else {
                    // 处理input和textarea元素
                    value = element.value || element.textContent || '';
                }
                
                // 只有当值不为空时才添加到结果中
                if (value && value.trim() !== '') {
                    contentParts.push(value.trim());
                }
            }
        });
    }
    
    // 返回用制表符连接的内容，便于在表格中横向粘贴
    const result = contentParts.join('\t');
    console.log('复制内容预览:', result);
    console.log('字段数量:', contentParts.length);
    console.log('制表符位置:', result.split('\t').map((part, index) => `${index}: "${part}"`));
    return result;
}

// 降级复制方案
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // 避免滚动到底部
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showNotification('内容已复制到剪贴板', 'success');
        } else {
            showNotification('复制失败，请手动复制', 'error');
        }
    } catch (err) {
        console.error('降级复制失败:', err);
        showNotification('复制失败，请手动复制', 'error');
    }
    
    document.body.removeChild(textArea);
}

// 提取图片数据（改进版）
async function extractImageData() {
    const imageData = [];
    console.log('🔍 开始提取图片数据...');
    
    // 检查所有可能的图片源
    console.log('📋 检查图片源...');
    console.log('window.currentScreenshots:', window.currentScreenshots);
    console.log('window.currentAnalysisResult:', window.currentAnalysisResult);
    
    // 方法1：从全局文件状态中获取图片文件
    if (window.currentScreenshots && window.currentScreenshots.length > 0) {
        console.log('📁 从全局截图文件提取:', window.currentScreenshots.length, '个文件');
        
        for (const file of window.currentScreenshots) {
            try {
                console.log('🖼️ 处理截图文件:', file.name, file.type, '大小:', file.size);
                const arrayBuffer = await file.arrayBuffer();
                const blob = new Blob([arrayBuffer], { type: file.type });
                imageData.push({
                    blob: blob,
                    name: file.name,
                    type: file.type
                });
                console.log('✅ 成功提取截图:', file.name);
            } catch (error) {
                console.error('❌ 提取截图数据失败:', error);
            }
        }
    } else {
        console.log('⚠️ 没有找到全局截图文件');
    }
    
    // 方法2：从分析结果中获取文件信息
    if (window.currentAnalysisResult && window.currentAnalysisResult.files) {
        console.log('📄 从分析结果提取文件信息:', window.currentAnalysisResult.files);
        // 注意：这里只有文件信息，没有实际的File对象
    }
    
    // 方法3：从预览区域中获取显示的图片
    const previewImages = document.querySelectorAll('#screenshotPreviewContainer img, .screenshot-preview img, .file-preview img');
    console.log('🖼️ 预览区域中的图片数量:', previewImages.length);
    
    for (const img of previewImages) {
        try {
            console.log('🔄 处理预览图片:', img.src, img.alt);
            // 检查是否是blob URL
            if (img.src.startsWith('blob:')) {
                const response = await fetch(img.src);
                const blob = await response.blob();
                imageData.push({
                    blob: blob,
                    name: img.alt || 'preview-image.png',
                    type: blob.type
                });
                console.log('✅ 成功提取预览图片:', img.alt || 'preview-image.png');
            } else {
                console.log('⚠️ 跳过非blob图片:', img.src);
            }
        } catch (error) {
            console.error('❌ 提取预览图片失败:', error);
        }
    }
    
    // 方法4：从文件上传区域获取图片
    const uploadedFiles = document.querySelectorAll('.file-item img, .uploaded-file img');
    console.log('📤 上传文件区域中的图片数量:', uploadedFiles.length);
    
    for (const img of uploadedFiles) {
        try {
            console.log('🔄 处理上传文件图片:', img.src, img.alt);
            if (img.src.startsWith('blob:')) {
                const response = await fetch(img.src);
                const blob = await response.blob();
                imageData.push({
                    blob: blob,
                    name: img.alt || 'uploaded-image.png',
                    type: blob.type
                });
                console.log('✅ 成功提取上传文件图片:', img.alt || 'uploaded-image.png');
            }
        } catch (error) {
            console.error('❌ 提取上传文件图片失败:', error);
        }
    }
    
    // 方法5：从input元素中获取文件
    const fileInputs = document.querySelectorAll('input[type="file"]');
    for (const input of fileInputs) {
        if (input.files && input.files.length > 0) {
            console.log('📁 从input元素提取文件:', input.files.length, '个文件');
            for (const file of input.files) {
                if (file.type.startsWith('image/')) {
                    try {
                        const arrayBuffer = await file.arrayBuffer();
                        const blob = new Blob([arrayBuffer], { type: file.type });
                        imageData.push({
                            blob: blob,
                            name: file.name,
                            type: file.type
                        });
                        console.log('✅ 成功从input提取图片:', file.name);
                    } catch (error) {
                        console.error('❌ 从input提取图片失败:', error);
                    }
                }
            }
        }
    }
    
    console.log('🎯 最终提取的图片数据:', imageData.length, '张图片');
    imageData.forEach((img, index) => {
        console.log(`图片${index + 1}:`, img.name, img.type, '大小:', img.blob.size);
    });
    
    return imageData;
}


// 复制包含图片的内容
async function copyWithImages(textContent, imageData) {
    console.log('开始复制包含图片的内容...');
    console.log('文本内容:', textContent);
    console.log('图片数据:', imageData);
    
    // 方法1：尝试使用单个ClipboardItem包含文本和图片
    try {
        console.log('尝试方法1：单个ClipboardItem包含文本和图片');
        const clipboardItemData = {
            'text/plain': new Blob([textContent], { type: 'text/plain' })
        };
        
        // 添加所有图片到同一个ClipboardItem中（转换为PNG格式）
        for (const image of imageData) {
            console.log('添加图片到剪贴板:', image.name, image.type, '大小:', image.blob.size);
            
            try {
                const pngBlob = await convertToPNG(image.blob);
                clipboardItemData['image/png'] = pngBlob;
                console.log('✅ 成功转换图片为PNG格式');
            } catch (error) {
                console.error('❌ 转换图片为PNG失败:', error);
                clipboardItemData[image.type] = image.blob;
            }
        }
        
        console.log('剪贴板数据类型:', Object.keys(clipboardItemData));
        
        // 写入剪贴板
        await navigator.clipboard.write([new ClipboardItem(clipboardItemData)]);
        console.log('成功写入剪贴板（方法1）');
        return;
    } catch (error) {
        console.error('方法1失败:', error);
    }
    
    // 方法2：尝试使用单个ClipboardItem包含多种类型
    try {
        console.log('尝试方法2：单个ClipboardItem包含多种类型');
        const clipboardItemData = {
            'text/plain': new Blob([textContent], { type: 'text/plain' })
        };
        
        // 只添加第一张图片，避免过多内容
        if (imageData.length > 0) {
            const firstImage = imageData[0];
            console.log('添加第一张图片:', firstImage.name, firstImage.type);
            clipboardItemData[firstImage.type] = firstImage.blob;
        }
        
        await navigator.clipboard.write([new ClipboardItem(clipboardItemData)]);
        console.log('成功写入剪贴板（方法2）');
        return;
    } catch (error) {
        console.error('方法2失败:', error);
    }
    
    // 方法3：只复制文本
    try {
        console.log('尝试方法3：只复制文本');
        await navigator.clipboard.writeText(textContent);
        console.log('成功写入文本到剪贴板（方法3）');
        return;
    } catch (error) {
        console.error('方法3失败:', error);
        throw error;
    }
}

// 初始化编辑功能
function initializeEditableContent() {
    // 为输入框添加样式
    const inputElements = elements.previewContent.querySelectorAll('.field-input, .field-textarea, .field-select, .field-multiselect');
    
    inputElements.forEach(element => {
        // 添加焦点状态样式
        element.addEventListener('focus', function() {
            this.classList.add('editing');
        });
        
        element.addEventListener('blur', function() {
            this.classList.remove('editing');
        });
        
        // 为输入框添加变化监听
        element.addEventListener('input', function() {
            // 可以在这里添加实时保存或其他逻辑
            console.log('Field changed:', this.dataset.field, this.value);
        });
    });
    
    // 为多选字段添加变化监听
    const multiselects = elements.previewContent.querySelectorAll('.field-multiselect[data-field]');
    multiselects.forEach(select => {
        select.addEventListener('change', function() {
            const fieldName = this.dataset.field;
            const selectedValues = Array.from(this.selectedOptions).map(option => option.value);
            console.log('Multi-select field changed:', fieldName, selectedValues);
        });
    });
}

// 保存草稿
function saveDraft() {
    const selectedSystemTypes = elements.systemTypeSelect.querySelectorAll('input[type="checkbox"]:checked');
    const systemTypes = Array.from(selectedSystemTypes).map(checkbox => checkbox.value);
    const selectedModules = elements.moduleSelect.querySelectorAll('input[type="checkbox"]:checked');
    const modules = Array.from(selectedModules).map(checkbox => checkbox.value);
    
    const draft = {
        description: elements.issueDescription.value,
        systemTypes: systemTypes,
        modules: modules,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('feedbackBridge_draft', JSON.stringify(draft));
}

// 加载草稿
function loadDraftData() {
    const draft = localStorage.getItem('feedbackBridge_draft');
    if (draft) {
        try {
            const data = JSON.parse(draft);
            elements.issueDescription.value = data.description || '';
            
            // 设置系统类型复选框的选中状态
            if (data.systemTypes && data.systemTypes.length > 0) {
                const systemTypeCheckboxes = elements.systemTypeSelect.querySelectorAll('input[type="checkbox"]');
                systemTypeCheckboxes.forEach(checkbox => {
                    checkbox.checked = data.systemTypes.includes(checkbox.value);
                });
            }
            
            // 设置模块复选框的选中状态
            if (data.modules && data.modules.length > 0) {
                const moduleCheckboxes = elements.moduleSelect.querySelectorAll('input[type="checkbox"]');
                moduleCheckboxes.forEach(checkbox => {
                    checkbox.checked = data.modules.includes(checkbox.value);
                });
            }
            
            // 检查按钮状态和更新字数统计
            checkConvertButtonState();
        } catch (error) {
            console.error('加载草稿失败:', error);
        }
    }
}

// 保存到历史记录
async function saveToHistory(result) {
    try {
        const userId = getCurrentUserId();
        
        // 准备文件信息
        const filesInfo = result.files ? result.files.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        })) : [];
        
        // 构建历史记录数据
        const historyData = {
            user_id: userId,
            title: result.standardFormat?.title || '未命名转化',
            original_description: result.description || '',
            system_types: result.systemTypes || [],
            modules: result.modules || [],
            analysis_result: result.analysis || {},
            standard_format: result.standardFormat || {},
            template_id: result.template_id || 'design_experience_issue',
            files_info: filesInfo
        };
        
        // 调用后端API保存到数据库
        const response = await fetch('http://localhost:8001/api/history/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(historyData)
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                console.log('✅ 历史记录保存成功:', result.id);
            } else {
                console.warn('⚠️ 历史记录保存失败:', result.message);
            }
        } else {
            console.warn('⚠️ 历史记录API调用失败:', response.status);
        }
        
    } catch (error) {
        console.warn('⚠️ 保存历史记录失败:', error);
        // 不抛出异常，避免影响主要功能
    }
    
    // 同时保存到localStorage作为备份
    const history = JSON.parse(localStorage.getItem('feedbackBridge_history') || '[]');
    
    // 创建一个可序列化的结果副本
    const serializableResult = {
        ...result,
        files: result.files ? result.files.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        })) : []
    };
    
    history.unshift(serializableResult);
    
    // 只保留最近50条记录
    if (history.length > 50) {
        history.splice(50);
    }
    
    localStorage.setItem('feedbackBridge_history', JSON.stringify(history));
}

// 显示历史记录
async function showHistory() {
    console.log('showHistory 函数被调用');
    try {
        showNotification('正在加载历史记录...', 'info');
        
        const userId = getCurrentUserId();
        console.log('用户ID:', userId);
        
        // 首先尝试从localStorage获取历史记录作为降级方案
        const localHistory = JSON.parse(localStorage.getItem('feedbackBridge_history') || '[]');
        console.log('本地历史记录:', localHistory);
        
        try {
            const response = await fetch(`http://localhost:8001/api/history/list?user_id=${userId}&page=1&page_size=20`, {
                timeout: 5000 // 5秒超时
            });
        console.log('API响应状态:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('API响应数据:', result);
            
            if (result.success) {
                    // 使用服务器数据
                console.log('准备显示抽屉，数据:', result.data);
                displayHistoryModal(result.data || [], result.pagination || {total: 0, page: 1, page_size: 20, total_pages: 0});
                    return;
                }
            }
        } catch (apiError) {
            console.warn('API调用失败，使用本地数据:', apiError);
        }
        
        // 如果API失败，使用本地存储的历史记录
        if (localHistory.length > 0) {
            console.log('使用本地历史记录数据');
            const pagination = {
                total: localHistory.length,
                page: 1,
                page_size: 20,
                total_pages: Math.ceil(localHistory.length / 20)
            };
            displayHistoryModal(localHistory, pagination);
        } else {
            // 显示空状态
            displayHistoryModal([], {total: 0, page: 1, page_size: 20, total_pages: 0});
        }
        
    } catch (error) {
        console.error('获取历史记录失败:', error);
        showNotification('获取历史记录失败，请重试', 'error');
    }
}

// 显示草稿箱
function showDrafts() {
    const draft = localStorage.getItem('feedbackBridge_draft');
    
    if (!draft) {
        showNotification('暂无草稿', 'info');
        return;
    }
    
    showNotification('已加载草稿内容', 'success');
}

// 显示历史记录抽屉
function displayHistoryModal(historyData, pagination) {
    console.log('displayHistoryModal 被调用，数据:', historyData, '分页:', pagination);
    
    // 创建抽屉HTML
    const drawerHtml = `
        <div class="history-drawer-overlay" id="historyDrawerOverlay" onclick="closeHistoryModal()">
            <div class="history-drawer" id="historyDrawer" onclick="event.stopPropagation()">
                <div class="history-drawer-header">
                    <div class="history-header-left">
                        <h2>历史记录</h2>
                        <span class="history-count">共 ${pagination.total} 条记录</span>
                    </div>
                    <button class="history-close-btn" onclick="closeHistoryModal()">
                        <img src="icon/关闭-默认.svg" alt="关闭" class="history-close-icon" />
                    </button>
                </div>
                <div class="history-drawer-body">
                    <div class="history-list" id="historyList">
                        ${historyData.length > 0 ? historyData.map(record => {
                            // 兼容不同的数据格式
                            const recordId = record.id || record.timestamp || Date.now();
                            const title = record.title || record.standard_format?.title || '历史记录';
                            
                            // 构建转化后的内容描述
                            let description = '';
                            if (record.standard_format) {
                                const problemDesc = record.standard_format.problem_description || '';
                                const solution = record.standard_format.solution || '';
                                
                                if (problemDesc && solution) {
                                    description = `
                                        <div class="converted-content">
                                            <div class="converted-section">
                                                <div class="converted-label">问题描述：</div>
                                                <div class="converted-text">${problemDesc}</div>
                                            </div>
                                            <div class="converted-section">
                                                <div class="converted-label">解决方案：</div>
                                                <div class="converted-text">${solution}</div>
                                            </div>
                                        </div>
                                    `;
                                } else if (problemDesc) {
                                    description = `
                                        <div class="converted-content">
                                            <div class="converted-section">
                                                <div class="converted-label">问题描述：</div>
                                                <div class="converted-text">${problemDesc}</div>
                                            </div>
                                        </div>
                                    `;
                                } else {
                                    description = record.original_description || '暂无描述';
                                }
                            } else {
                                description = record.original_description || '暂无描述';
                            }
                            
                            const systemTypes = record.system_types || record.systemTypes || [];
                            const modules = record.modules || [];
                            const createdAt = record.created_at || record.timestamp || new Date().toISOString();
                            const templateId = record.template_id || 'default';
                            
                            // 根据模板类型确定显示信息
                            let templateInfo = {
                                icon: '🎨',
                                name: '设计体验问题',
                                color: '#1890ff'
                            };
                            
                            if (templateId === 'original_sound_cleaning') {
                                templateInfo = {
                                    icon: '🎤',
                                    name: '用户原声清洗',
                                    color: '#52c41a'
                                };
                            } else if (templateId === 'design_experience_issue') {
                                templateInfo = {
                                    icon: '🎨',
                                    name: '设计体验问题',
                                    color: '#1890ff'
                                };
                            }
                            
                            return `
                            <div class="history-item" data-id="${recordId}" data-template="${templateId}">
                                <div class="history-item-header">
                                    <div class="history-title-section">
                                        <div class="template-badge" style="background-color: ${templateInfo.color}20; color: ${templateInfo.color}; border-color: ${templateInfo.color}40;">
                                            <span class="template-icon">${templateInfo.icon}</span>
                                            <span class="template-name">${templateInfo.name}</span>
                                        </div>
                                        <h3 class="history-title">${title}</h3>
                                    </div>
                                    <div class="history-actions">
                                        <button class="history-action-btn view-btn" onclick="viewHistoryDetail('${recordId}')">
                                            <img src="icon/查看详情-默认.svg" alt="查看" class="action-icon" />
                                        </button>
                                        <button class="history-action-btn delete-btn" onclick="deleteHistoryRecord('${recordId}')">
                                            <img src="icon/删除-默认.svg" alt="删除" class="action-icon" />
                                        </button>
                                    </div>
                                </div>
                                <div class="history-item-content">
                                    <div class="history-description ${record.standard_format ? 'converted-description' : ''}">${description}</div>
                                    <div class="history-meta">
                                        <span class="history-time">${formatDateTime(createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                            `;
                        }).join('') : `
                            <div class="empty-history">
                                <div class="empty-icon">📚</div>
                                <div class="empty-title">暂无历史记录</div>
                                <div class="empty-description">开始转化您的第一个问题，历史记录将在这里显示</div>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.insertAdjacentHTML('beforeend', drawerHtml);
    
    // 添加样式
    addHistoryDrawerStyles();
    console.log('样式已添加');
    
    // 确保样式已加载
    setTimeout(() => {
        const testElement = document.querySelector('.history-drawer-overlay');
        if (testElement) {
            console.log('抽屉元素已创建，样式已应用');
        } else {
            console.error('抽屉元素创建失败');
        }
    }, 100);
    
    // 添加动画效果
    setTimeout(() => {
        const overlay = document.getElementById('historyDrawerOverlay');
        const drawer = document.getElementById('historyDrawer');
        console.log('查找抽屉元素:', overlay, drawer);
        
        if (overlay && drawer) {
            console.log('添加show类');
            overlay.classList.add('show');
            drawer.classList.add('show');
        } else {
            console.error('找不到抽屉元素');
        }
    }, 10);
    
    // 添加ESC键关闭功能
    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            closeHistoryModal();
            document.removeEventListener('keydown', handleKeyDown);
        }
    };
    document.addEventListener('keydown', handleKeyDown);
}

// 添加历史记录抽屉样式
function addHistoryDrawerStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .history-drawer-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .history-drawer-overlay.show {
            opacity: 1;
        }
        
        .history-drawer {
            position: fixed;
            top: 0;
            right: 0;
            width: 600px;
            height: 100vh;
            background: white;
            box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            display: flex;
            flex-direction: column;
        }
        
        .history-drawer.show {
            transform: translateX(0);
        }
        
        .history-drawer-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid #eee;
            background: #f8f9fa;
            flex-shrink: 0;
        }
        
        .history-header-left {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .history-count {
            font-size: 14px;
            color: #666;
            font-weight: 400;
        }
        
        .history-drawer-header h2 {
            margin: 0;
            color: #333;
            font-size: 18px;
            font-weight: 600;
        }
        
        .history-close-btn {
            width: 28px;
            height: 28px;
            border: none;
            background: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all 0.2s ease;
        }
        
        .history-close-btn:hover {
            background: none;
        }
        
        .history-close-btn:hover .history-close-icon {
            content: url('icon/关闭-悬停.svg');
        }
        
        .history-close-icon {
            width: 28px;
            height: 28px;
            transition: all 0.2s ease;
        }
        
        
        .history-drawer-body {
            flex: 1;
            padding: 20px 24px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            min-height: 0;
        }
        
        
        .history-list {
            flex: 1;
            overflow-y: auto;
        }
        
        .history-item {
            border: 1px solid #e9ecef;
            border-radius: 8px;
            margin-bottom: 12px;
            padding: 16px;
            transition: all 0.2s ease;
            background: #fff;
        }
        
        .history-item:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border-color: #007bff;
        }
        
        .history-item-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
        }
        
        .history-title-section {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
        }
        
        .template-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            margin-bottom: 6px;
            border: 1px solid;
        }
        
        .template-icon {
            font-size: 12px;
        }
        
        .template-name {
            font-size: 10px;
        }
        
        .history-title {
            margin: 0;
            font-size: 15px;
            color: #333;
            line-height: 1.4;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
            min-width: 0;
        }
        
        .history-actions {
            display: flex;
            gap: 8px;
            flex-shrink: 0;
            min-width: 64px;
        }
        
        .history-action-btn {
            width: 28px;
            height: 28px;
            background: none;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: all 0.2s ease;
        }
        
        .history-action-btn:hover {
            background: none;
        }
        
        .history-action-btn .action-icon {
            width: 28px;
            height: 28px;
            transition: all 0.2s ease;
        }
        
        .history-action-btn:hover .action-icon {
            opacity: 0.7;
        }
        
        .history-action-btn.view-btn:hover .action-icon {
            content: url('icon/查看详情-悬停.svg');
        }
        
        .history-action-btn.delete-btn:hover .action-icon {
            content: url('icon/删除-悬停.svg');
        }
        
        .history-description {
            color: #666;
            margin-bottom: 12px;
            line-height: 1.5;
            font-size: 13px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        /* 转化内容容器，移除行数限制 */
        .history-description.converted-description {
            display: block;
            -webkit-line-clamp: unset;
            -webkit-box-orient: unset;
            overflow: visible;
        }
        
        .converted-content {
            margin-bottom: 12px;
        }
        
        .converted-section {
            margin-bottom: 8px;
        }
        
        .converted-section:last-child {
            margin-bottom: 0;
        }
        
        .converted-label {
            font-weight: 600;
            color: #333;
            font-size: 13px;
            margin-bottom: 4px;
        }
        
        .converted-text {
            color: #666;
            font-size: 13px;
            line-height: 1.4;
            background: #f8f9fa;
            padding: 8px 12px;
            border-radius: 6px;
            border-left: 3px solid #007bff;
        }
        
        .history-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        
        .history-time {
            color: #BABABF;
            font-size: 12px;
        }
        
        .empty-history {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            text-align: center;
            color: #999;
        }
        
        .empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.6;
        }
        
        .empty-title {
            font-size: 18px;
            font-weight: 500;
            color: #666;
            margin-bottom: 8px;
        }
        
        .empty-description {
            font-size: 14px;
            color: #999;
            line-height: 1.5;
            max-width: 280px;
        }
        
        /* 历史记录详情页样式 */
        .history-detail-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid #eee;
            background: #f8f9fa;
            flex-shrink: 0;
        }
        
        .history-back-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
            border-radius: 6px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
        }
        
        .history-back-btn:hover {
            background: none;
        }
        
        .history-back-icon {
            width: 36px;
            height: 36px;
            transition: all 0.2s ease;
        }
        
        .history-back-btn:hover .history-back-icon {
            content: url('icon/返回-悬停.svg');
        }
        
        .history-detail-title {
            margin: 0;
            color: #333;
            font-size: 18px;
            font-weight: 600;
            flex: 1;
            line-height: 1.4;
        }
        
        .history-detail-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            border: 1px solid;
        }
        
        .history-detail-card {
            background: #ffffff;
            border: none;
            border-radius: 22px;
            padding: 20px 24px;
            box-shadow: none;
            position: relative;
            margin-bottom: 20px;
        }
        
        .history-detail-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 22px;
            padding: 1px;
            background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #e8f5e8 100%);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            pointer-events: none;
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }
        
        .card-title {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }
        
        .card-icon {
            font-size: 18px;
        }
        
        .copy-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
            border-radius: 6px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
        }
        
        .copy-btn:hover {
            background: none;
        }
        
        .copy-icon {
            width: 36px;
            height: 36px;
            transition: all 0.2s ease;
        }
        
        .copy-btn:hover .copy-icon {
            content: url('icon/复制-悬停.svg');
        }
        
        .card-content {
            color: #666;
            line-height: 1.6;
        }
        
        .user-input-content {
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            margin: 0;
        }
        
        .conversion-separator {
            position: relative;
            text-align: center;
            margin: 20px 0;
        }
        
        .conversion-separator::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: #e9ecef;
        }
        
        .separator-text {
            background: #fff;
            padding: 0 16px;
            color: #666;
            font-size: 14px;
            font-weight: 500;
        }
        
        .detail-grid {
            display: grid;
            gap: 16px;
        }
        
        .detail-item {
            display: flex;
            align-items: flex-start;
            gap: 16px;
        }
        
        .detail-item label {
            font-weight: 500;
            color: #666;
            min-width: 84px;
            flex-shrink: 0;
            font-size: 14px;
        }
        
        .detail-value {
            color: #333;
            flex: 1;
            word-break: break-word;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .sentiment-positive {
            color: #52c41a;
            font-weight: 500;
        }
        
        .sentiment-negative {
            color: #ff4d4f;
            font-weight: 500;
        }
        
        .sentiment-neutral {
            color: #666;
            font-weight: 500;
        }
        
        .priority-high {
            color: #ff4d4f;
            font-weight: 500;
        }
        
        .priority-medium {
            color: #faad14;
            font-weight: 500;
        }
        
        .priority-low {
            color: #52c41a;
            font-weight: 500;
        }
        
        .images-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 20px;
        }
        
        .image-item {
            text-align: center;
        }
        
        .image-thumbnail {
            width: 100%;
            height: 100px;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #e9ecef;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8f9fa;
        }
        
        .image-thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .image-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            background: #f8f9fa;
        }
        
        .placeholder-icon {
            font-size: 24px;
            color: #999;
        }
        
        .image-caption {
            font-size: 12px;
            color: #666;
            margin-top: 8px;
            word-break: break-word;
        }
        
        .add-image-placeholder {
            width: 100%;
            height: 100px;
            border: 2px dashed #d9d9d9;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .add-image-placeholder:hover {
            border-color: #1890ff;
            background: #f0f8ff;
        }
        
        .add-image-icon {
            font-size: 24px;
            color: #999;
            margin-bottom: 4px;
        }
        
        .add-image-text {
            font-size: 12px;
            color: #999;
        }
        
        .no-images {
            display: flex;
            justify-content: center;
        }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
            .history-drawer {
                width: 100%;
            }
        }
        
        @media (max-width: 480px) {
            .history-drawer-header {
                padding: 16px 20px;
            }
            
            .history-drawer-body {
                padding: 16px 20px;
            }
            
            .history-item {
                padding: 12px;
            }
            
            .history-actions {
                flex-direction: column;
                gap: 4px;
            }
            
            .history-action-btn {
                font-size: 10px;
                padding: 3px 6px;
            }
            
            .history-detail-header {
                padding: 16px 20px;
                flex-wrap: wrap;
            }
            
            .history-detail-title {
                font-size: 16px;
            }
            
            .card-content {
                padding: 16px;
            }
            
            .detail-item {
                flex-direction: column;
                gap: 8px;
            }
            
            .detail-item label {
                min-width: auto;
            }
        }
    `;
    document.head.appendChild(style);
}

// 关闭历史记录抽屉
function closeHistoryModal() {
    const overlay = document.getElementById('historyDrawerOverlay');
    const drawer = document.getElementById('historyDrawer');
    
    if (overlay && drawer) {
        // 添加关闭动画
        overlay.classList.remove('show');
        drawer.classList.remove('show');
        
        // 等待动画完成后移除元素
        setTimeout(() => {
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }
}

// 格式化日期时间
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 下载处理好的Excel文件
async function downloadProcessedExcel(recordId) {
    try {
        // 显示加载状态
        showNotification('正在准备下载文件...', 'info');
        
        // 调用后端API下载处理好的Excel文件
        const response = await fetch(`http://localhost:8001/api/history/download-excel/${recordId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            // 获取文件名
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'processed_excel.xlsx';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            // 创建下载链接
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showNotification('Excel文件下载成功！', 'success');
        } else {
            const errorData = await response.json();
            showNotification(`下载失败: ${errorData.detail || '未知错误'}`, 'error');
        }
    } catch (error) {
        console.error('下载Excel文件失败:', error);
        showNotification('下载失败，请稍后重试', 'error');
    }
}

// 查看历史记录详情
async function viewHistoryDetail(recordId) {
    try {
        const userId = getCurrentUserId();
        const response = await fetch(`http://localhost:8001/api/history/detail/${recordId}?user_id=${userId}`);
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                displayHistoryDetailPage(result.data);
            } else {
                showNotification('获取历史记录详情失败', 'error');
            }
        } else {
            throw new Error('获取历史记录详情失败');
        }
    } catch (error) {
        console.error('获取历史记录详情失败:', error);
        showNotification('获取历史记录详情失败，请重试', 'error');
    }
}

// 显示历史记录详情页（下钻）
function displayHistoryDetailPage(record) {
    // 隐藏历史记录列表，显示详情页
    const historyList = document.getElementById('historyList');
    
    if (historyList) {
        historyList.style.display = 'none';
    }
    
    // 替换抽屉header为详情页header
    const drawerHeader = document.querySelector('.history-drawer-header');
    if (drawerHeader) {
        const detailHeaderHtml = createHistoryDetailHeaderHtml(record);
        drawerHeader.innerHTML = detailHeaderHtml;
    }
    
    // 创建详情页内容
    const detailPageHtml = createHistoryDetailPageHtml(record);
    
    // 在抽屉中显示详情页
    const drawerBody = document.querySelector('.history-drawer-body');
    if (drawerBody) {
        // 清除现有内容
        drawerBody.innerHTML = '';
        drawerBody.insertAdjacentHTML('beforeend', detailPageHtml);
    }
}

// 创建历史记录详情页Header HTML
function createHistoryDetailHeaderHtml(record) {
    // 根据模板类型确定显示信息
    let templateInfo = {
        name: '设计体验问题',
        color: '#1890ff'
    };
    
    if (record.template_id === 'original_sound_cleaning') {
        templateInfo = {
            name: '用户原声清洗',
            color: '#52c41a'
        };
    } else if (record.template_id === 'design_experience_issue') {
        templateInfo = {
            name: '设计体验问题',
            color: '#1890ff'
        };
    }
    
    return `
        <button class="history-back-btn" onclick="backToHistoryList()">
            <img src="icon/返回-默认.svg" alt="返回" class="history-back-icon" />
        </button>
        <div class="history-detail-badge" style="background-color: ${templateInfo.color}20; color: ${templateInfo.color}; border-color: ${templateInfo.color}40;">
            <span class="template-name">${templateInfo.name}</span>
        </div>
        <h2 class="history-detail-title">${record.title}</h2>
    `;
}

// 创建历史记录详情页HTML
function createHistoryDetailPageHtml(record) {
    // 构建内容详情
    const contentDetails = buildContentDetails(record);
    
    // 构建相关图片
    const relatedImages = buildRelatedImages(record);
    
    // 根据模板类型构建不同的详情页面
    if (record.template_id === 'original_sound_cleaning') {
        // 用户原声清洗模板的详情页面
        return createOriginalSoundDetailPage(record, contentDetails, relatedImages);
    } else {
        // 设计体验问题模板的详情页面
        return createDesignExperienceDetailPage(record, contentDetails, relatedImages);
    }
}

// 创建用户原声清洗详情页面
function createOriginalSoundDetailPage(record, contentDetails, relatedImages) {
    const analysisResult = record.analysis_result || {};
    
    // 检查是否是Excel文件转化
    const isExcelConversion = record.files_info && record.files_info.length > 0 && 
                              record.files_info.some(file => file.name && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')));
    
    let excelFileInfo = '';
    if (isExcelConversion) {
        const excelFile = record.files_info.find(file => file.name && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')));
        excelFileInfo = `
        <!-- Excel文件信息卡片 -->
        <div class="history-detail-card" id="excelFileCard">
            <div class="card-header">
                <h3 class="card-title">📊 Excel文件信息</h3>
            </div>
            <div class="card-content">
                <div class="excel-file-info">
                    <div class="file-info-item">
                        <span class="file-info-label">文件名：</span>
                        <span class="file-info-value">${excelFile.name || '未知文件名'}</span>
                    </div>
                    <div class="file-info-item">
                        <span class="file-info-label">文件大小：</span>
                        <span class="file-info-value">${formatFileSize(excelFile.size || 0)}</span>
                    </div>
                    <div class="file-info-item">
                        <span class="file-info-label">文件类型：</span>
                        <span class="file-info-value">${excelFile.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}</span>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
    
    // 如果是Excel文件转化，显示简化的布局
    if (isExcelConversion) {
        // 处理Excel文件的多条分析结果
        const excelResults = analysisResult.results || [];
        const totalCount = analysisResult.total_count || excelResults.length;
        
        return `
            ${excelFileInfo}
            
            <!-- Excel处理结果预览卡片 -->
            <div class="history-detail-card" id="excelPreviewCard">
                <div class="card-header">
                    <h3 class="card-title">📋 Excel处理结果预览 (共${totalCount}条)</h3>
                    <button class="download-excel-btn" onclick="downloadProcessedExcel('${record.id}')" title="下载转化好的Excel">
                        <img src="icon/下载转化好的excel文件-默认.svg" alt="下载" class="download-excel-icon" />
                    </button>
                </div>
                <div class="card-content">
                    <div class="excel-preview-content">
                        <div class="preview-note">
                            <p>📊 此记录包含Excel文件处理结果，显示了所有处理后的内容：</p>
                        </div>
                        <div class="excel-results">
                            ${excelResults.map((result, index) => {
                                const analysis = result.analysis || {};
                                return `
                                    <div class="result-section">
                                        <h4>📝 第${index + 1}条原声处理结果</h4>
                                        <div class="original-text-item">
                                            <span class="original-text-label">原声内容：</span>
                                            <div class="original-text-value">${result.original_text || '暂无原声内容'}</div>
                                        </div>
                                        <div class="analysis-results">
                                            <div class="analysis-item">
                                                <span class="analysis-label">情感分类：</span>
                                                ${getSentimentDisplayHTML(analysis.sentiment_classification || '中性')}
                                            </div>
                                            <div class="analysis-item">
                                                <span class="analysis-label">情感强度：</span>
                                                <span class="analysis-value">${analysis.sentiment_intensity || '中等'}</span>
                                            </div>
                                            <div class="analysis-item">
                                                <span class="analysis-label">情感分析：</span>
                                                <div class="analysis-value">${analysis.sentiment_analysis || '暂无情感分析数据'}</div>
                                            </div>
                                        </div>
                                        <div class="translation-results">
                                            <div class="translation-item">
                                                <span class="translation-label">原声翻译：</span>
                                                <div class="translation-value">${analysis.original_translation || '暂无翻译数据'}</div>
                                            </div>
                                        </div>
                                        <div class="summary-results">
                                            <div class="summary-item">
                                                <span class="summary-label">核心主旨：</span>
                                                <div class="summary-value">${analysis.ai_optimized_summary || '暂无核心主旨数据'}</div>
                                            </div>
                                            <div class="summary-item">
                                                <span class="summary-label">重点分析：</span>
                                                <div class="summary-value">${analysis.key_points || '暂无重点分析数据'}</div>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 非Excel文件转化的常规布局
    return `
        <!-- 用户原声输入卡片 -->
        <div class="history-detail-card" id="userInputCard">
            <div class="card-header">
                <h3 class="card-title">🎤 用户原声输入</h3>
                <button class="copy-btn" onclick="copyCardContent('userInputCard')" title="复制用户原声">
                    <img src="icon/复制-默认.svg" alt="复制" class="copy-icon" />
                </button>
            </div>
            <div class="card-content">
                <div class="user-input-content">${record.original_description || '暂无用户原声内容'}</div>
            </div>
        </div>
        
        <!-- 转化后分隔线 -->
        <div class="conversion-separator">
            <span class="separator-text">转化后</span>
        </div>
        
        <!-- 情感分析卡片 -->
        <div class="history-detail-card" id="sentimentAnalysisCard">
            <div class="card-header">
                <h3 class="card-title">🎭 情感分析</h3>
                <button class="copy-btn" onclick="copyCardContent('sentimentAnalysisCard')" title="复制情感分析">
                    <img src="icon/复制-默认.svg" alt="复制" class="copy-icon" />
                </button>
            </div>
            <div class="card-content">
                <div class="analysis-grid">
                    <div class="analysis-item">
                        <span class="analysis-label">情感分类</span>
                        ${getSentimentDisplayHTML(analysisResult.sentiment_classification || '中性')}
                    </div>
                    <div class="analysis-item">
                        <span class="analysis-label">情感强度</span>
                        <span class="analysis-value intensity ${analysisResult.sentiment_intensity || 'medium'}">${analysisResult.sentiment_intensity || '中等'}</span>
                    </div>
                    <div class="analysis-item full-width">
                        <span class="analysis-label">情感分析</span>
                        <div class="analysis-value analysis">${analysisResult.sentiment_analysis || '暂无情感分析数据'}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 翻译结果卡片 -->
        <div class="history-detail-card" id="translationCard">
            <div class="card-header">
                <h3 class="card-title">🌐 翻译结果</h3>
                <button class="copy-btn" onclick="copyCardContent('translationCard')" title="复制翻译结果">
                    <img src="icon/复制-默认.svg" alt="复制" class="copy-icon" />
                </button>
            </div>
            <div class="card-content">
                <div class="translation-content">
                    <div class="translation-item">
                        <span class="translation-label">原声翻译</span>
                        <div class="translation-value">${analysisResult.original_translation || '暂无翻译数据'}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 智能总结卡片 -->
        <div class="history-detail-card" id="summaryCard">
            <div class="card-header">
                <h3 class="card-title">🧠 智能总结</h3>
                <button class="copy-btn" onclick="copyCardContent('summaryCard')" title="复制智能总结">
                    <img src="icon/复制-默认.svg" alt="复制" class="copy-icon" />
                </button>
            </div>
            <div class="card-content">
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="summary-label">核心主旨</span>
                        <div class="summary-value">${analysisResult.ai_optimized_summary || '暂无核心主旨数据'}</div>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">重点分析</span>
                        <div class="summary-value">${analysisResult.key_points || '暂无重点分析数据'}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 相关图片卡片 -->
        <div class="history-detail-card" id="relatedImagesCard">
            <div class="card-header">
                <h3 class="card-title">📷 相关图片</h3>
                <button class="copy-btn" onclick="copyCardContent('relatedImagesCard')" title="复制相关图片">
                    <img src="icon/复制-默认.svg" alt="复制" class="copy-icon" />
                </button>
            </div>
            <div class="card-content">
                ${relatedImages}
            </div>
        </div>
    `;
}

// 创建设计体验问题详情页面
function createDesignExperienceDetailPage(record, contentDetails, relatedImages) {
    return `
        <!-- 用户输入卡片 -->
        <div class="history-detail-card" id="userInputCard">
            <div class="card-header">
                <h3 class="card-title">体验问题描述</h3>
                <button class="copy-btn" onclick="copyCardContent('userInputCard')" title="复制体验问题描述">
                    <img src="icon/复制-默认.svg" alt="复制" class="copy-icon" />
                </button>
            </div>
            <div class="card-content">
                <div class="user-input-content">${record.original_description}</div>
            </div>
        </div>
        
        <!-- 转化后分隔线 -->
        <div class="conversion-separator">
            <span class="separator-text">转化后</span>
        </div>
        
        <!-- 内容详情卡片 -->
        <div class="history-detail-card" id="contentDetailsCard">
            <div class="card-header">
                <h3 class="card-title">内容详情</h3>
                <button class="copy-btn" onclick="copyCardContent('contentDetailsCard')" title="复制内容详情">
                    <img src="icon/复制-默认.svg" alt="复制" class="copy-icon" />
                </button>
            </div>
            <div class="card-content">
                ${contentDetails}
            </div>
        </div>
        
        <!-- 相关图片卡片 -->
        <div class="history-detail-card" id="relatedImagesCard">
            <div class="card-header">
                <h3 class="card-title">相关图片</h3>
                <button class="copy-btn" onclick="copyCardContent('relatedImagesCard')" title="复制相关图片">
                    <img src="icon/复制-默认.svg" alt="复制" class="copy-icon" />
                </button>
            </div>
            <div class="card-content">
                ${relatedImages}
            </div>
        </div>
    `;
}

// 构建内容详情
function buildContentDetails(record) {
    const standardFormat = record.standard_format || {};
    const analysisResult = record.analysis_result || {};
    
    // 根据模板类型构建不同的详情内容
    if (record.template_id === 'original_sound_cleaning') {
        // 用户原声清洗的详情
        return `
            <div class="detail-grid">
                <div class="detail-item">
                    <label>反馈类型</label>
                    <span class="detail-value">${analysisResult.feedback_type || '未知'}</span>
                </div>
                <div class="detail-item">
                    <label>情感分析</label>
                    ${getSentimentDisplayHTML(analysisResult.sentiment || '中性')}
                </div>
                <div class="detail-item">
                    <label>智能总结</label>
                    <span class="detail-value">${analysisResult.summary || '无'}</span>
                </div>
                <div class="detail-item">
                    <label>翻译结果</label>
                    <span class="detail-value">${analysisResult.translation || '无'}</span>
                </div>
            </div>
        `;
    } else {
        // 设计体验问题的详情
        return `
            <div class="detail-grid">
                <div class="detail-item">
                    <label>标题</label>
                    <span class="detail-value">${standardFormat.title || record.title}</span>
                </div>
                <div class="detail-item">
                    <label>问题类型</label>
                    <span class="detail-value">${standardFormat.problem_type || '未知'}</span>
                </div>
                <div class="detail-item">
                    <label>优先级</label>
                    <span class="detail-value priority-${standardFormat.priority || 'medium'}">${standardFormat.priority || '中等'}</span>
                </div>
                <div class="detail-item">
                    <label>问题描述</label>
                    <span class="detail-value">${standardFormat.problem_description || '无'}</span>
                </div>
                <div class="detail-item">
                    <label>解决方案</label>
                    <span class="detail-value">${standardFormat.solution || '无'}</span>
                </div>
                <div class="detail-item">
                    <label>解决状态</label>
                    <span class="detail-value">${standardFormat.resolution_status || '待处理'}</span>
                </div>
                <div class="detail-item">
                    <label>期望修复版本</label>
                    <span class="detail-value">${standardFormat.expected_fix_version || '未指定'}</span>
                </div>
            </div>
        `;
    }
}

// 构建相关图片
function buildRelatedImages(record) {
    const filesInfo = record.files_info || [];
    
    if (filesInfo.length === 0) {
        return `
            <div class="no-images">
                <div class="add-image-placeholder">
                    <div class="add-image-icon">📷</div>
                    <div class="add-image-text">Add Image</div>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="images-grid">
            ${filesInfo.map((file, index) => `
                <div class="image-item">
                    <div class="image-thumbnail">
                        <img src="${file.path || '#'}" alt="${file.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="image-placeholder" style="display: none;">
                            <div class="placeholder-icon">📄</div>
                        </div>
                    </div>
                    <div class="image-caption">${file.name}</div>
                </div>
            `).join('')}
            <div class="add-image-placeholder">
                <div class="add-image-icon">📷</div>
                <div class="add-image-text">Add Image</div>
            </div>
        </div>
    `;
}

// 返回历史记录列表
function backToHistoryList() {
    const historyList = document.getElementById('historyList');
    
    if (historyList) {
        historyList.style.display = 'block';
    }
    
    // 恢复原始的抽屉header
    const drawerHeader = document.querySelector('.history-drawer-header');
    if (drawerHeader) {
        // 获取当前统计信息
        const historyList = document.getElementById('historyList');
        const totalCount = historyList ? historyList.children.length : 0;
        
        drawerHeader.innerHTML = `
            <div class="history-header-left">
                <h2>历史记录</h2>
                <span class="history-count">共 ${totalCount} 条记录</span>
            </div>
            <button class="history-close-btn" onclick="closeHistoryModal()">
                <img src="icon/关闭-默认.svg" alt="关闭" class="history-close-icon" />
            </button>
        `;
    }
    
    // 清除详情页内容，恢复历史记录列表
    const drawerBody = document.querySelector('.history-drawer-body');
    if (drawerBody) {
        // 重新显示历史记录列表
        const historyList = document.getElementById('historyList');
        if (historyList) {
            historyList.style.display = 'block';
        }
        
        // 清除详情页内容
        drawerBody.innerHTML = `
            <div class="history-list" id="historyList">
                <!-- 历史记录列表将在这里显示 -->
            </div>
        `;
        
        // 重新加载历史记录数据
        loadHistoryData();
    }
}

// 重新加载历史记录数据
async function loadHistoryData() {
    try {
        const userId = getCurrentUserId();
        const response = await fetch(`http://localhost:8001/api/history/list?user_id=${userId}&page=1&page_size=20`);
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                // 重新渲染历史记录列表
                const historyList = document.getElementById('historyList');
                if (historyList) {
                    const historyHtml = result.data.map(record => {
                        const recordId = record.id || record.timestamp || Date.now();
                        const title = record.title || record.standard_format?.title || '历史记录';
                        
                        // 构建转化后的内容描述
                        let description = '';
                        if (record.standard_format) {
                            const problemDesc = record.standard_format.problem_description || '';
                            const solution = record.standard_format.solution || '';
                            
                            if (problemDesc && solution) {
                                description = `
                                    <div class="converted-content">
                                        <div class="converted-section">
                                            <div class="converted-label">问题描述：</div>
                                            <div class="converted-text">${problemDesc}</div>
                                        </div>
                                        <div class="converted-section">
                                            <div class="converted-label">解决方案：</div>
                                            <div class="converted-text">${solution}</div>
                                        </div>
                                    </div>
                                `;
                            } else if (problemDesc) {
                                description = `
                                    <div class="converted-content">
                                        <div class="converted-section">
                                            <div class="converted-label">问题描述：</div>
                                            <div class="converted-text">${problemDesc}</div>
                                        </div>
                                    </div>
                                `;
                            } else {
                                description = record.original_description || '暂无描述';
                            }
                        } else {
                            description = record.original_description || '暂无描述';
                        }
                        
                        const createdAt = record.created_at || record.timestamp || new Date().toISOString();
                        const systemTypes = record.system_types || record.systemTypes || [];
                        const modules = record.modules || [];
                        const templateId = record.template_id || 'design_experience_issue';
                        
                        // 根据模板类型确定显示信息
                        let templateInfo = {
                            icon: '🎨',
                            name: '设计体验问题',
                            color: '#1890ff'
                        };
                        
                        if (templateId === 'original_sound_cleaning') {
                            templateInfo = {
                                icon: '🎤',
                                name: '用户原声清洗',
                                color: '#52c41a'
                            };
                        }
                        
                        return `
                        <div class="history-item" data-id="${recordId}" data-template="${templateId}">
                            <div class="history-item-header">
                                <div class="history-title-section">
                                    <div class="template-badge" style="background-color: ${templateInfo.color}20; color: ${templateInfo.color}; border-color: ${templateInfo.color}40;">
                                        <span class="template-icon">${templateInfo.icon}</span>
                                        <span class="template-name">${templateInfo.name}</span>
                                    </div>
                                    <h3 class="history-title">${title}</h3>
                                </div>
                                <div class="history-actions">
                                    <button class="history-action-btn view-btn" onclick="viewHistoryDetail('${recordId}')">
                                        <img src="icon/查看详情-默认.svg" alt="查看" class="action-icon" />
                                    </button>
                                    <button class="history-action-btn delete-btn" onclick="deleteHistoryRecord('${recordId}')">
                                        <img src="icon/删除-默认.svg" alt="删除" class="action-icon" />
                                    </button>
                                </div>
                            </div>
                            <div class="history-item-content">
                                <div class="history-description ${record.standard_format ? 'converted-description' : ''}">${description}</div>
                                <div class="history-meta">
                                    <span class="history-time">${formatDateTime(createdAt)}</span>
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('');
                    
                    historyList.innerHTML = historyHtml || `
                        <div class="empty-history">
                            <div class="empty-icon">📚</div>
                            <div class="empty-text">暂无历史记录</div>
                        </div>
                    `;
                }
                
                // 更新header中的统计信息
                const drawerHeader = document.querySelector('.history-drawer-header');
                if (drawerHeader) {
                    const headerLeft = drawerHeader.querySelector('.history-header-left');
                    if (headerLeft) {
                        const countSpan = headerLeft.querySelector('.history-count');
                        if (countSpan) {
                            countSpan.textContent = `共 ${result.data.length} 条记录`;
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('重新加载历史记录失败:', error);
    }
}

// 显示历史记录详情模态框
function displayHistoryDetailModal(record) {
    // 根据模板类型确定显示信息
    let templateInfo = {
        icon: '🎨',
        name: '设计体验问题',
        color: '#1890ff'
    };
    
    if (record.template_id === 'original_sound_cleaning') {
        templateInfo = {
            icon: '🎤',
            name: '用户原声清洗',
            color: '#52c41a'
        };
    } else if (record.template_id === 'design_experience_issue') {
        templateInfo = {
            icon: '🎨',
            name: '设计体验问题',
            color: '#1890ff'
        };
    }
    
    const modalHtml = `
        <div class="history-detail-modal" id="historyDetailModal">
            <div class="history-detail-content">
                <div class="history-detail-header">
                    <h2>历史记录详情</h2>
                    <button class="history-close-btn" onclick="closeHistoryDetailModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="history-detail-body">
                    <div class="detail-section">
                        <h3>基本信息</h3>
                        <div class="detail-item">
                            <label>模板类型：</label>
                            <span class="template-badge" style="background-color: ${templateInfo.color}20; color: ${templateInfo.color}; border-color: ${templateInfo.color}40;">
                                <span class="template-icon">${templateInfo.icon}</span>
                                <span class="template-name">${templateInfo.name}</span>
                            </span>
                        </div>
                        <div class="detail-item">
                            <label>标题：</label>
                            <span>${record.title}</span>
                        </div>
                        <div class="detail-item">
                            <label>所属地区：</label>
                            <span>${record.system_types.join('、')}</span>
                        </div>
                        <div class="detail-item">
                            <label>归属终端：</label>
                            <span>${record.modules.join('、')}</span>
                        </div>
                        <div class="detail-item">
                            <label>创建时间：</label>
                            <span>${formatDateTime(record.created_at)}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3>原始描述</h3>
                        <div class="detail-content">${record.original_description}</div>
                    </div>
                    
                    <div class="detail-section">
                        <h3>转化结果</h3>
                        <div class="standard-format-preview">
                            ${Object.entries(record.standard_format || {}).map(([key, value]) => `
                                <div class="format-item">
                                    <label>${key}：</label>
                                    <span>${value}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="detail-actions">
                        <button class="action-btn copy-btn" onclick="copyHistoryContent('${record.id}')">
                            <i class="fas fa-copy"></i> 复制内容
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    addHistoryDetailModalStyles();
}

// 添加历史记录详情模态框样式
function addHistoryDetailModalStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .history-detail-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1001;
        }
        
        .history-detail-content {
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .history-detail-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #eee;
            background: #f8f9fa;
        }
        
        .history-detail-body {
            padding: 20px;
            max-height: 60vh;
            overflow-y: auto;
        }
        
        .detail-section {
            margin-bottom: 25px;
        }
        
        .detail-section h3 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 16px;
            border-bottom: 2px solid #007bff;
            padding-bottom: 5px;
        }
        
        .detail-item {
            display: flex;
            margin-bottom: 10px;
        }
        
        .detail-item label {
            font-weight: bold;
            min-width: 80px;
            color: #666;
        }
        
        .detail-content {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            line-height: 1.5;
            color: #333;
        }
        
        .standard-format-preview {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
        }
        
        .format-item {
            display: flex;
            margin-bottom: 8px;
        }
        
        .format-item label {
            font-weight: bold;
            min-width: 100px;
            color: #666;
        }
        
        .detail-actions {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        
        .action-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .action-btn:hover {
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);
}

// 关闭历史记录详情模态框
function closeHistoryDetailModal() {
    const modal = document.getElementById('historyDetailModal');
    if (modal) {
        modal.remove();
    }
}

// 删除历史记录
async function deleteHistoryRecord(recordId) {
    if (!confirm('确定要删除这条历史记录吗？')) {
        return;
    }
    
    try {
        const userId = getCurrentUserId();
        const response = await fetch(`http://localhost:8001/api/history/delete/${recordId}?user_id=${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showNotification('历史记录删除成功', 'success');
                // 重新加载历史记录列表
                closeHistoryModal();
                setTimeout(() => {
                    showHistory();
                }, 350);
            } else {
                showNotification('删除历史记录失败', 'error');
            }
        } else {
            throw new Error('删除历史记录失败');
        }
    } catch (error) {
        console.error('删除历史记录失败:', error);
        showNotification('删除历史记录失败，请重试', 'error');
    }
}


// 从历史记录重新转化
async function regenerateFromHistory(recordId) {
    try {
        const userId = getCurrentUserId();
        const response = await fetch(`http://localhost:8001/api/history/detail/${recordId}?user_id=${userId}`);
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                const record = result.data;
                
                // 填充表单
                elements.issueDescription.value = record.original_description;
                
                // 设置系统类型复选框
                const systemTypeCheckboxes = elements.systemTypeSelect.querySelectorAll('input[type="checkbox"]');
                systemTypeCheckboxes.forEach(checkbox => {
                    checkbox.checked = record.system_types.includes(checkbox.value);
                });
                
                // 设置模块复选框
                const moduleCheckboxes = elements.moduleSelect.querySelectorAll('input[type="checkbox"]');
                moduleCheckboxes.forEach(checkbox => {
                    checkbox.checked = record.modules.includes(checkbox.value);
                });
                
                // 关闭模态框
                closeHistoryDetailModal();
                closeHistoryModal();
                
                // 自动触发转化
                setTimeout(() => {
                    handleConvert();
                }, 500);
                
                showNotification('已加载历史记录，开始重新转化...', 'success');
            } else {
                showNotification('获取历史记录失败', 'error');
            }
        } else {
            throw new Error('获取历史记录失败');
        }
    } catch (error) {
        console.error('重新转化失败:', error);
        showNotification('重新转化失败，请重试', 'error');
    }
}

// 复制历史记录内容
function copyHistoryContent(recordId) {
    // 这里可以实现复制功能
    showNotification('复制功能待实现', 'info');
}


// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(-50%) translateY(-20px);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(-50%) translateY(-20px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 文件上传和删除功能
let currentScreenshots = [];
let currentAttachments = [];

// 处理截图上传
document.addEventListener('change', function(e) {
    if (e.target.id === 'screenshotUpload') {
        const files = Array.from(e.target.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/') && 
            (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png'));
        
        if (imageFiles.length !== files.length) {
            alert('只支持 .jpg 和 .png 格式的图片');
        }
        
        if (imageFiles.length > 0) {
            currentScreenshots = [...currentScreenshots, ...imageFiles];
            updateScreenshotDisplay();
        }
        
        // 清空input
        e.target.value = '';
    }
    
    if (e.target.id === 'attachmentUpload') {
        const files = Array.from(e.target.files);
        const allowedTypes = ['application/pdf', 'video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
        const validFiles = files.filter(file => allowedTypes.includes(file.type));
        
        if (validFiles.length !== files.length) {
            alert('只支持 PDF 和视频格式的附件');
        }
        
        if (validFiles.length > 0) {
            currentAttachments = [...currentAttachments, ...validFiles];
            updateAttachmentDisplay();
        }
        
        // 清空input
        e.target.value = '';
    }
});

// 更新截图显示
function updateScreenshotDisplay() {
    const screenshotField = document.querySelector('[data-field="screenshots"] .attachment-text');
    if (screenshotField) {
        screenshotField.textContent = currentScreenshots.length > 0 ? 
            '已上传 ' + currentScreenshots.length + ' 张截图' : '暂无截图';
    }
    
    // 更新图片预览
    const previewContainer = document.getElementById('screenshotPreviewContainer');
    if (previewContainer) {
        if (currentScreenshots.length > 0) {
            previewContainer.innerHTML = currentScreenshots.map((file, index) => {
                try {
                    const imageUrl = URL.createObjectURL(file);
                    return `
                        <div class="screenshot-preview-item">
                            <img src="${imageUrl}" alt="${file.name}" class="screenshot-preview-image">
                            <div class="screenshot-overlay">
                                <div class="screenshot-filename">${file.name}</div>
                                <button type="button" class="delete-single-btn" data-index="${index}" onclick="removeSingleScreenshot(${index})">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    `;
                } catch (error) {
                    console.error('Error creating image URL:', error);
                    return '';
                }
            }).join('');
        } else {
            previewContainer.innerHTML = '';
        }
    }
}

// 更新附件显示
function updateAttachmentDisplay() {
    const attachmentField = document.querySelector('[data-field="attachments"] .attachment-text');
    if (attachmentField) {
        attachmentField.textContent = currentAttachments.length > 0 ? 
            currentAttachments.map(f => f.name).join(', ') : '暂无附件';
    }
    
    // 更新删除按钮显示
    const deleteBtn = document.querySelector('[data-field="attachments"] .delete-btn');
    if (deleteBtn) {
        deleteBtn.style.display = currentAttachments.length > 0 ? 'inline-block' : 'none';
    }
}

// 删除单张截图
function removeSingleScreenshot(index) {
    if (index >= 0 && index < currentScreenshots.length) {
        currentScreenshots.splice(index, 1);
        updateScreenshotDisplay();
    }
}

// 删除所有截图
function removeScreenshots() {
    currentScreenshots = [];
    updateScreenshotDisplay();
}

// 删除附件
function removeAttachments() {
    currentAttachments = [];
    updateAttachmentDisplay();
}


// Tab切换处理
function handleTabSwitch(event) {
    console.log('handleTabSwitch 被调用');
    const clickedTab = event.target;
    const templateType = clickedTab.dataset.template;
    
    console.log('点击的标签:', clickedTab.textContent);
    console.log('模板类型:', templateType);
    
    // 检查是否已经激活
    if (clickedTab.classList.contains('active')) {
        console.log('标签已经激活，无需切换');
        return;
    }
    
    // 移除所有tab的active状态
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        console.log('移除active状态:', tab.textContent);
    });
    
    // 添加当前tab的active状态
    clickedTab.classList.add('active');
    console.log('添加active状态:', clickedTab.textContent);
    
    // 根据模板类型更新界面内容
    updateTemplateContent(templateType);
    
    // 显示切换提示
    const templateName = templateType === 'design' ? '设计体验问题模板' : '用户原声清洗模板';
    showNotification(`已切换到${templateName}`, 'info');
}

// 开始新会话
function startNewSession() {
    // 如果正在转换中，不允许开始新会话
    if (isConverting) return;
    
    // 保存当前选择的地区和模块
    const selectedSystemTypes = elements.systemTypeSelect.querySelectorAll('input[type="checkbox"]:checked');
    const systemTypes = Array.from(selectedSystemTypes).map(checkbox => checkbox.value);
    const selectedModules = elements.moduleSelect.querySelectorAll('input[type="checkbox"]:checked');
    const modules = Array.from(selectedModules).map(checkbox => checkbox.value);
    
    // 清空体验问题描述
    elements.issueDescription.value = '';
    
    // 清空已上传的文件
    uploadedFiles = [];
    elements.uploadedFiles.innerHTML = '';
    
    // 清空预览区域，恢复默认状态
    if (elements.previewContent) {
        elements.previewContent.innerHTML = `
        <div class="preview-empty-state" id="previewEmptyState">
            <img src="image/预览空占位.png" alt="预览空状态" class="empty-state-image" />
            <p class="empty-state-text">转化好的内容将会按照标准化的模板在此处展示</p>
        </div>
    `;
    }
    
    // 隐藏预览操作按钮
    hidePreviewActions();
    
    // 重置转化按钮状态
    checkConvertButtonState();

    // 同步清空设计模板在状态管理中的预览缓存与表单，避免切换时被旧内容恢复
    if (typeof TemplateStateManager !== 'undefined' && TemplateStateManager.states && TemplateStateManager.states.design) {
        try {
            TemplateStateManager.states.design.previewContent = null;
            TemplateStateManager.states.design.formData = {};
            TemplateStateManager.states.design.uploadedFiles = [];
            if (typeof TemplateStateManager.saveCurrentState === 'function') {
                TemplateStateManager.saveCurrentState();
            }
        } catch (e) {
            console.warn('清空设计模板会话状态失败:', e);
        }
    }
    
    // 恢复地区和模块的选择（保持用户上次的选择）
    if (systemTypes.length > 0) {
        const systemTypeCheckboxes = elements.systemTypeSelect.querySelectorAll('input[type="checkbox"]');
        systemTypeCheckboxes.forEach(checkbox => {
            checkbox.checked = systemTypes.includes(checkbox.value);
        });
    }
    
    if (modules.length > 0) {
        const moduleCheckboxes = elements.moduleSelect.querySelectorAll('input[type="checkbox"]');
        moduleCheckboxes.forEach(checkbox => {
            checkbox.checked = modules.includes(checkbox.value);
        });
    }
    
    // 清空当前分析结果
    window.currentAnalysisResult = null;
    window.conversionCompleted = false;
    
    // 清空用户原声清洗模板的预览内容和缓存
    if (typeof OriginalSoundTemplate !== 'undefined') {
        OriginalSoundTemplate.clearAllPreviewContent();
        console.log('新会话: 已清空用户原声清洗模板的预览内容和缓存');
    }
    
    // 显示成功提示
    showNotification('新会话已开始，表单已重置', 'success');
    
    // 聚焦到问题描述输入框
    elements.issueDescription.focus();
}

// 开始用户原声清洗模板新会话
function startOriginalSoundNewSession() {
    // 如果正在转换中，不允许开始新会话
    if (isConverting) return;
    
    console.log('开始用户原声清洗模板新会话...');
    
    try {
        // 检测当前激活的输入类型标签
        const activeInputTab = document.querySelector('.input-type-tab.active');
        const currentInputType = activeInputTab ? activeInputTab.getAttribute('data-type') : 'text';
        
        console.log('当前激活的输入类型:', currentInputType);
        
        // 根据当前激活的标签类型，只清空对应的内容
        if (currentInputType === 'text') {
            // 只清空文本原声相关内容
            const originalSoundText = document.getElementById('originalSoundText');
            if (originalSoundText) {
                originalSoundText.value = '';
                console.log('已清空用户原声文本输入');
            } else {
                console.log('未找到用户原声文本输入框');
            }
            
            // 清空文本原声的预览内容
            if (typeof OriginalSoundTemplate !== 'undefined') {
                OriginalSoundTemplate.previewContent.text = null;
                console.log('已清空文本原声预览内容');
            }
            
        } else if (currentInputType === 'excel') {
            // 只清空Excel文件相关内容
            if (typeof OriginalSoundTemplate !== 'undefined') {
                // 清空Excel文件上传区域
                const excelUploadArea = document.getElementById('excelUploadArea');
                if (excelUploadArea) {
                    excelUploadArea.innerHTML = `
                        <div class="upload-content">
                            <i class="fas fa-file-excel upload-icon"></i>
                            <p class="upload-text">点击或拖拽Excel文件到此区域上传</p>
                            <p class="upload-hint">支持 .xlsx、.xls 格式，最大 20MB</p>
                        </div>
                    `;
                    console.log('已重置Excel上传区域');
                } else {
                    console.log('未找到Excel上传区域');
                }
                
                // 清空Excel文件输入
                const excelFileInput = document.getElementById('excelFileInput');
                if (excelFileInput) {
                    excelFileInput.value = '';
                    console.log('已清空Excel文件输入');
                } else {
                    console.log('未找到Excel文件输入');
                }
                
                // 清空Excel上传的文件显示区域
                const excelUploadedFiles = document.getElementById('excelUploadedFiles');
                if (excelUploadedFiles) {
                    excelUploadedFiles.innerHTML = '';
                    console.log('已清空Excel上传文件显示区域');
                }
                
                // 清空Excel分析结果缓存
                OriginalSoundTemplate.excelAnalysisCache = {
                    fileHash: null,
                    analysisResults: null,
                    timestamp: null,
                    sourceLanguage: null,
                    targetLanguage: null
                };
                
                // 清空Excel预览内容
                OriginalSoundTemplate.previewContent.excel = null;
                console.log('已清空Excel预览内容');
            }
        }
        
        // 清空当前激活标签的预览内容（不区分类型）
        if (typeof OriginalSoundTemplate !== 'undefined') {
            OriginalSoundTemplate.clearCurrentTabPreviewContent(currentInputType);
            console.log(`新会话: 已清空${currentInputType}标签的预览内容`);
        }
        
        // 重置预览内容 - 添加安全检查
        if (elements.previewContent) {
            elements.previewContent.innerHTML = `
                <div class="preview-empty-state" id="previewEmptyState">
                    <img src="image/预览空占位.png" alt="预览空状态" class="empty-state-image" />
                    <p class="empty-state-text">转化好的内容将会按照标准化的模板在此处展示</p>
                </div>
            `;
            console.log('已重置预览内容');
        } else {
            console.log('未找到预览内容区域');
        }
        
        // 隐藏预览操作按钮 - 添加安全检查
        hidePreviewActions();
        console.log('已隐藏预览操作按钮');
        
        // 重置转化按钮状态
        if (elements.convertBtn) {
            elements.convertBtn.disabled = false;
            elements.convertBtn.innerHTML = '<i class="fas fa-magic"></i> 一键转化';
            console.log('已重置转化按钮状态');
        } else {
            console.log('未找到转化按钮');
        }
        
        // 重置转换状态
        isConverting = false;
        window.conversionCompleted = false;
        
        // 显示成功提示
        showNotification('新会话已开始，用户原声清洗表单已重置', 'success');
        
        // 聚焦到用户原声输入框
        if (originalSoundText) {
            originalSoundText.focus();
        }
        
        console.log('用户原声清洗模板新会话初始化完成');
        
    } catch (error) {
        console.error('新会话初始化过程中发生错误:', error);
        showNotification('新会话初始化失败，请重试', 'error');
    }
}

// 用户原声清洗模板功能
const OriginalSoundTemplate = {
    currentInputType: 'text',
    initialized: false,
    // 存储不同输入类型的预览内容
    previewContent: {
        text: null,
        excel: null
    },
    // Excel分析结果缓存
    excelAnalysisCache: {
        fileHash: null,
        analysisResults: null,
        timestamp: null,
        sourceLanguage: null,
        targetLanguage: null
    },
    
    // 初始化用户原声清洗模板
    init() {
        if (this.initialized) {
            console.log('用户原声清洗模板已经初始化，跳过重复初始化');
            return;
        }
        
        console.log('初始化用户原声清洗模板...');
        this.initializeEventListeners();
        // 移除过早的 initializeFileUpload 调用，它会在切换到录音原声时被调用
        // this.initializeFileUpload();
        this.initializeFormValidation();
        
        // 预创建Excel上传卡片，确保在切换到Excel标签时能正确显示
        this.createExcelUploadCard();
        
        // 确保语言切换卡片显示
        const languageSwitchCard = document.getElementById('languageSwitchCard');
        if (languageSwitchCard) {
            // 移除内联样式，让CSS的display: flex生效
            languageSwitchCard.style.display = '';
            languageSwitchCard.style.visibility = 'visible';
            languageSwitchCard.style.opacity = '1';
            console.log('初始化: 确保语言切换卡片显示');
        } else {
            console.error('初始化: 找不到语言切换卡片');
        }
        
        // 标记为已初始化
        this.initialized = true;
    },
    
    // 初始化事件监听器
    initializeEventListeners() {
        // 输入类型切换
        document.querySelectorAll('.input-type-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const inputType = e.currentTarget.dataset.type;
                // AI录入走查问题页的tab（problem类型）保持选中状态，不可取消
                if (inputType === 'problem') {
                    // 确保始终保持active状态
                    e.currentTarget.classList.add('active');
                    return;
                }
                this.switchInputType(inputType);
            });
        });
        
        // 原声文本输入监听
        const originalSoundText = document.getElementById('originalSoundText');
        if (originalSoundText) {
            originalSoundText.addEventListener('input', () => {
                this.updateCharCount();
            });
        }
        
        // 转化按钮（避免重复绑定）
        const convertBtn = document.getElementById('originalSoundConvertBtn');
        if (convertBtn && !convertBtn.hasAttribute('data-listener-added')) {
            convertBtn.addEventListener('click', () => {
                console.log('转化按钮被点击');
                this.convertOriginalSound();
            });
            convertBtn.setAttribute('data-listener-added', 'true');
        }
    },
    
    // 切换输入类型
    switchInputType(inputType, saveState = true) {
        console.log('🔄 switchInputType 被调用，输入类型:', inputType, '保存状态:', saveState);
        
        // 保存当前状态（如果允许）
        if (saveState) {
            TemplateStateManager.saveCurrentState();
        }
        
        this.currentInputType = inputType;
        
        // 保存当前选择的输入类型tab到localStorage
        if (currentPage === 'ai-voice') {
            try {
                localStorage.setItem('aiVoiceLastInputType', inputType);
                console.log('保存输入类型tab:', inputType);
            } catch (error) {
                console.error('保存输入类型tab失败:', error);
            }
        }
        
        // 更新标签页状态
        document.querySelectorAll('.input-type-tab').forEach(tab => {
            const tabType = tab.dataset.type;
            // AI录入走查问题页的tab（problem类型）始终保持选中状态
            if (tabType === 'problem') {
                tab.classList.add('active');
                const icon = tab.querySelector('.input-type-tab-icon');
                if (icon) {
                    const activeIcon = icon.getAttribute('data-active-icon');
                    if (activeIcon) {
                        icon.src = activeIcon;
                    }
                }
                return;
            }
            const isActive = tabType === inputType;
            tab.classList.toggle('active', isActive);
            const icon = tab.querySelector('.input-type-tab-icon');
            if (icon) {
                const activeIcon = icon.getAttribute('data-active-icon');
                const inactiveIcon = icon.getAttribute('data-inactive-icon');
                if (activeIcon && inactiveIcon) {
                    icon.src = isActive ? activeIcon : inactiveIcon;
                }
            }
        });
        
        // 更新内容显示
        document.querySelectorAll('.input-type-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // 只有当对应的输入内容元素存在时才添加active类
        const inputContentElement = document.getElementById(`${inputType}InputContent`);
        if (inputContentElement) {
            inputContentElement.classList.add('active');
        }
        
        // 恢复或显示对应输入类型的预览内容
        this.restorePreviewContent(inputType);
        
        // 更新预览操作按钮组：仅当存在有效预览内容时显示，否则强制隐藏
        const previewHTML = document.getElementById('previewContent').innerHTML;
        if (previewHTML && previewHTML.trim() !== '' &&
            !previewHTML.includes('转化后的标准化内容将在此处显示') &&
            !previewHTML.includes('转化好的内容将会按照标准化的模板在此处展示') &&
            !previewHTML.includes('preview-empty-state') &&
            !previewHTML.includes('预览空占位.png')) {
            showPreviewActions();
        } else {
            hidePreviewActions();
        }
        
        // 控制各个卡片的显示和移除
        console.log('switchInputType: 输入类型 =', inputType);
        
        // 处理用户原声卡片
        const userOriginalSoundCard = document.getElementById('userOriginalSoundCard');
        console.log('🔍 用户原声卡片存在:', !!userOriginalSoundCard);
        console.log('🔍 当前输入类型:', inputType);
        
        if (inputType === 'text') {
            // 文本原声：显示用户原声卡片
            if (userOriginalSoundCard) {
                // 恢复所有显示样式
                userOriginalSoundCard.style.display = '';
                userOriginalSoundCard.style.visibility = 'visible';
                userOriginalSoundCard.style.opacity = '1';
                userOriginalSoundCard.style.height = '';
                userOriginalSoundCard.style.overflow = '';
                userOriginalSoundCard.style.margin = '';
                userOriginalSoundCard.style.padding = '';
                
                console.log('✅ switchInputType: 显示用户原声卡片');
                console.log('🔍 用户原声卡片显示后的样式:', {
                    display: userOriginalSoundCard.style.display,
                    visibility: userOriginalSoundCard.style.visibility,
                    opacity: userOriginalSoundCard.style.opacity
                });
            } else {
                // 如果卡片不存在，需要重新创建
                this.createUserOriginalSoundCard();
                console.log('🔧 switchInputType: 重新创建用户原声卡片');
            }
        } else {
            // 录音原声或Excel文件：隐藏用户原声卡片，但保留内容
            if (userOriginalSoundCard) {
                // 使用多种方式确保隐藏
                userOriginalSoundCard.style.display = 'none';
                userOriginalSoundCard.style.visibility = 'hidden';
                userOriginalSoundCard.style.opacity = '0';
                userOriginalSoundCard.style.height = '0';
                userOriginalSoundCard.style.overflow = 'hidden';
                userOriginalSoundCard.style.margin = '0';
                userOriginalSoundCard.style.padding = '0';
                
                console.log('❌ switchInputType: 隐藏用户原声卡片，保留内容');
                console.log('🔍 用户原声卡片隐藏后的样式:', {
                    display: userOriginalSoundCard.style.display,
                    visibility: userOriginalSoundCard.style.visibility,
                    opacity: userOriginalSoundCard.style.opacity
                });
            } else {
                console.log('⚠️ 用户原声卡片不存在，无法隐藏');
            }
        }
        
        
        // 处理Excel上传卡片
        const excelInputContent = document.getElementById('excelInputContent');
        console.log('📊 处理Excel上传卡片，输入类型:', inputType, '卡片存在:', !!excelInputContent);
        if (inputType === 'excel') {
            // Excel文件：显示Excel上传卡片
            if (excelInputContent) {
                // 添加active类来显示卡片，并确保display属性正确
                excelInputContent.classList.add('active');
                excelInputContent.style.display = '';
                console.log('✅ switchInputType: 显示Excel上传卡片');
            } else {
                // 如果卡片不存在，需要重新创建
                console.log('🔧 switchInputType: 重新创建Excel上传卡片');
                this.createExcelUploadCard();
                
                // 创建后立即显示
                setTimeout(() => {
                    const newExcelInputContent = document.getElementById('excelInputContent');
                    if (newExcelInputContent) {
                        newExcelInputContent.classList.add('active');
                        newExcelInputContent.style.display = '';
                        console.log('✅ switchInputType: 新创建的Excel上传卡片已显示');
                    }
                }, 50);
            }
            
            // 无论卡片是显示还是重新创建，都需要绑定事件监听器
            setTimeout(() => {
                this.initializeFileUpload();
                console.log('✅ switchInputType: Excel上传事件监听器已重新绑定');
            }, 100);
        } else {
            // 文本原声或录音原声：隐藏Excel上传卡片
            if (excelInputContent) {
                excelInputContent.classList.remove('active');
                excelInputContent.style.display = 'none';
                console.log('🗑️ switchInputType: 隐藏Excel上传卡片');
            }
        }
        
        // 确保语言切换卡片始终显示
        const languageSwitchCard = document.getElementById('languageSwitchCard');
        if (languageSwitchCard) {
            // 移除内联样式，让CSS的display: flex生效
            languageSwitchCard.style.display = '';
            languageSwitchCard.style.visibility = 'visible';
            languageSwitchCard.style.opacity = '1';
            console.log('switchInputType: 确保语言切换卡片显示');
        } else {
            console.error('找不到语言切换卡片');
        }
        
        // 恢复目标输入类型的状态
        TemplateStateManager.restoreState('feedback', inputType);
    },
    
    // 恢复预览内容
    restorePreviewContent(inputType) {
        const previewContent = document.getElementById('previewContent');
        if (!previewContent) return;
        
        // 如果有保存的预览内容，则恢复它
        if (this.previewContent[inputType]) {
            previewContent.innerHTML = this.previewContent[inputType];
            console.log(`restorePreviewContent: 恢复了${inputType}类型的预览内容`);
            // 恢复内容时显示对应的按钮
            showPreviewActions();
        } else {
            // 如果没有保存的内容，显示占位符
            previewContent.innerHTML = `
                <div class="preview-empty-state" id="previewEmptyState">
                    <img src="image/预览空占位.png" alt="预览空状态" class="empty-state-image" />
                    <p class="empty-state-text">转化好的内容将会按照标准化的模板在此处展示</p>
                </div>
            `;
            console.log(`restorePreviewContent: 显示${inputType}类型的占位符`);
            // 显示占位符时隐藏所有按钮
            hidePreviewActions();
        }
    },
    
    // 保存预览内容
    savePreviewContent(inputType, content) {
        this.previewContent[inputType] = content;
        console.log(`savePreviewContent: 保存了${inputType}类型的预览内容`);
    },
    
    // 清空所有预览内容
    clearAllPreviewContent() {
        this.previewContent = {
            text: null,
            excel: null
        };
        // 同时清空Excel分析缓存
        this.excelAnalysisCache = {
            fileHash: null,
            analysisResults: null,
            timestamp: null,
            sourceLanguage: null,
            targetLanguage: null
        };
        console.log('clearAllPreviewContent: 已清空所有预览内容和缓存');
    },
    
    // 清空当前标签的预览内容
    clearCurrentTabPreviewContent(inputType) {
        if (inputType === 'text') {
            this.previewContent.text = null;
            console.log('clearCurrentTabPreviewContent: 已清空文本原声预览内容');
        } else if (inputType === 'excel') {
            this.previewContent.excel = null;
            // 清空Excel分析缓存
            this.excelAnalysisCache = {
                fileHash: null,
                analysisResults: null,
                timestamp: null,
                sourceLanguage: null,
                targetLanguage: null
            };
            console.log('clearCurrentTabPreviewContent: 已清空Excel预览内容和缓存');
        }
    },
    
    // 计算文件哈希值
    async calculateFileHash(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const arrayBuffer = e.target.result;
                const hashBuffer = crypto.subtle.digest('SHA-256', arrayBuffer);
                hashBuffer.then(hash => {
                    const hashArray = Array.from(new Uint8Array(hash));
                    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                    resolve(hashHex);
                }).catch(reject);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    },
    
    // 检查缓存是否有效
    isCacheValid(file, sourceLanguage, targetLanguage) {
        if (!this.excelAnalysisCache.fileHash || !this.excelAnalysisCache.analysisResults) {
            return false;
        }
        
        // 检查语言设置是否变化
        if (this.excelAnalysisCache.sourceLanguage !== sourceLanguage || 
            this.excelAnalysisCache.targetLanguage !== targetLanguage) {
            return false;
        }
        
        // 检查缓存是否过期（1小时）
        const now = Date.now();
        const cacheAge = now - this.excelAnalysisCache.timestamp;
        if (cacheAge > 60 * 60 * 1000) { // 1小时
            return false;
        }
        
        return true;
    },
    
    // 创建用户原声卡片
    createUserOriginalSoundCard() {
        // 找到用户原声清洗输入区域的容器
        const originalSoundInputGroup = document.getElementById('originalSoundInputGroup');
        if (!originalSoundInputGroup) {
            console.error('找不到用户原声清洗输入区域');
            return;
        }
        
        // 创建用户原声卡片HTML
        const userOriginalSoundCardHTML = `
            <div class="input-card" id="userOriginalSoundCard">
                <div class="input-group">
                    <div class="input-label-row">
                        <label for="originalSoundText" class="input-label">
                            用户原声
                        </label>
                        <button 
                            type="button" 
                            class="quick-try-btn" 
                            id="originalSoundQuickTryBtn"
                        >
                            <span class="quick-try-btn-icon" aria-hidden="true"></span>
                            快速试用
                        </button>
                    </div>
                    <div class="textarea-container">
                        <textarea 
                            id="originalSoundText" 
                            class="textarea-input antd-style" 
                            placeholder="请输入用户原声内容..."
                            rows="6"
                        ></textarea>
                    </div>
                </div>
            </div>
        `;
        
        // 在语言切换卡片之前插入用户原声卡片
        const languageSwitchCard = document.getElementById('languageSwitchCard');
        if (languageSwitchCard) {
            languageSwitchCard.insertAdjacentHTML('beforebegin', userOriginalSoundCardHTML);
            console.log('用户原声卡片已重新创建');
            attachOriginalSoundQuickTryListener();
        } else {
            console.error('找不到语言切换卡片，无法插入用户原声卡片');
        }
    },
    
    // 创建Excel上传卡片
    createExcelUploadCard() {
        console.log('📊 开始创建Excel上传卡片');
        
        // 检查是否已经存在Excel上传卡片，如果存在则不需要重新创建
        const existingExcelCard = document.getElementById('excelInputContent');
        if (existingExcelCard) {
            console.log('Excel上传卡片已存在，跳过创建');
            return;
        }
        
        const originalSoundInputGroup = document.getElementById('originalSoundInputGroup');
        if (!originalSoundInputGroup) {
            console.error('找不到用户原声清洗输入区域');
            return;
        }
        
        const excelUploadCardHTML = `
            <div class="input-type-content" id="excelInputContent">
                <div class="input-group">
                    <div class="input-label-row">
                        <label class="input-label">上传Excel文件</label>
                        <button 
                            type="button" 
                            class="quick-try-btn" 
                            id="excelQuickTryBtn"
                        >
                            <span class="quick-try-btn-icon" aria-hidden="true"></span>
                            快速试用
                        </button>
                    </div>
                    <div class="uploaded-files" id="excelUploadedFiles"></div>
                    <div class="file-upload-area antd-style" id="excelUploadArea">
                        <div class="upload-content">
                            <i class="fas fa-file-excel upload-icon"></i>
                            <p class="upload-text">点击或拖拽Excel文件到此区域上传</p>
                            <p class="upload-hint">支持 .xlsx、.xls 格式，最大 20MB</p>
                        </div>
                        <input type="file" id="excelFileInput" accept=".xlsx,.xls" style="display: none;">
                    </div>
                </div>
            </div>
        `;
        
        // 在语言切换卡片之前插入Excel上传卡片
        const languageSwitchCard = document.getElementById('languageSwitchCard');
        if (languageSwitchCard) {
            languageSwitchCard.insertAdjacentHTML('beforebegin', excelUploadCardHTML);
            attachExcelQuickTryListener();
            console.log('✅ Excel上传卡片已创建并插入到语言切换卡片之前');
        } else {
            console.error('❌ 找不到语言切换卡片，无法插入Excel上传卡片');
        }
    },
    
    // 初始化文件上传
    initializeFileUpload() {
        
        // Excel文件上传
        const excelUploadArea = document.getElementById('excelUploadArea');
        const excelFileInput = document.getElementById('excelFileInput');
        
        if (excelUploadArea && excelFileInput) {
            console.log('找到Excel上传元素，开始绑定事件');
            
            // 先移除旧的事件监听器，防止重复绑定
            excelUploadArea.onclick = null;
            excelFileInput.onchange = null;
            
            // 使用与图片上传相同的绑定方式
            excelUploadArea.addEventListener('click', (e) => {
                console.log('Excel上传区域被点击');
                // 移除preventDefault和stopPropagation，让点击事件正常工作
                
                // 确保文件输入元素存在且可点击
                if (excelFileInput) {
                    console.log('触发Excel文件选择');
                    excelUploadArea.focus(); // 先获得焦点，与图片上传保持一致
                    excelFileInput.click();
                } else {
                    console.error('Excel文件输入元素不存在');
                }
            });
            
            excelFileInput.addEventListener('change', (e) => {
                console.log('Excel文件被选择');
                this.handleExcelFileUpload(e);
            });
            
            // 添加拖拽功能（使用与图片上传相同的处理方式）
            excelUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                excelUploadArea.classList.add('dragover');
                console.log('Excel拖拽悬停');
            });
            
            excelUploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                excelUploadArea.classList.remove('dragover');
                console.log('Excel拖拽离开');
            });
            
            excelUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                excelUploadArea.classList.remove('dragover');
                console.log('Excel文件拖拽放下');
                
                const files = Array.from(e.dataTransfer.files);
                if (files.length > 0) {
                    console.log('拖拽Excel文件:', files[0].name);
                    // 创建文件列表并触发change事件
                    const dt = new DataTransfer();
                    dt.items.add(files[0]);
                    excelFileInput.files = dt.files;
                    
                    // 触发change事件
                    const changeEvent = new Event('change', { bubbles: true });
                    excelFileInput.dispatchEvent(changeEvent);
                }
            });
            
            console.log('Excel上传事件监听器已绑定');
        } else {
            console.error('找不到Excel上传元素:', {
                excelUploadArea: !!excelUploadArea,
                excelFileInput: !!excelFileInput
            });
        }
    },
    
    
    // 处理Excel文件上传
    handleExcelFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // 验证文件类型
        const validTypes = ['.xlsx', '.xls'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!validTypes.includes(fileExtension)) {
            showNotification('请选择Excel文件(.xlsx或.xls)', 'error');
            return;
        }
        
        // 验证文件大小 (20MB)
        if (file.size > 20 * 1024 * 1024) {
            showNotification('Excel文件超过20MB限制', 'error');
            return;
        }
        
        this.displayUploadedFile(file, 'excelUploadedFiles');

        // 缓存到全局，供一键转化时读取
        window.selectedExcelFile = file;
        
        // 清空input，允许重复选择同一文件
        event.target.value = '';
    },
    
    // 显示上传的文件
    displayUploadedFile(file, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // 确定文件名（如果是快速试用文件，使用displayName）
        const displayName = file.name === 'excel_quick_try.xlsx' ? '快速试用（含5条用户原声）.xlsx' : file.name;
        
        const fileItem = document.createElement('div');
        fileItem.className = 'uploaded-file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <img src="icon/excel上传后.svg" class="file-info-icon" alt="Excel文件">
                <span class="file-name">${displayName}</span>
            </div>
            <button class="delete-file-btn" onclick="this.parentElement.remove(); window.selectedExcelFile = null;">
                <img src="icon/删除excel文件.svg" class="delete-file-icon" alt="删除">
            </button>
        `;
        
        container.innerHTML = '';
        container.appendChild(fileItem);
    },
    
    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // 更新字符计数
    updateCharCount() {
        const textarea = document.getElementById('originalSoundText');
        const charCount = document.getElementById('originalSoundCharCount');
        
        if (textarea && charCount) {
            const length = textarea.value.length;
            charCount.textContent = `${length} 字 (不少于5个字)`;
            charCount.style.color = length < 5 ? '#ff4d4f' : '#666';
        }
    },
    
    // 初始化表单验证
    initializeFormValidation() {
        // 这里可以添加表单验证逻辑
    },
    
    // 转化用户原声
    async convertOriginalSound() {
        if (isConverting) return;
        
        try {
            isConverting = true;
            showLoadingModal('正在处理原声内容，请稍候...');
            
            let result;
            
            if (this.currentInputType === 'text') {
                result = await this.processTextOriginalSound();
            } else if (this.currentInputType === 'excel') {
                result = await this.processExcelOriginalSound();
            }
            
            console.log('🔍 处理结果检查:', {
                result: result,
                hasSuccess: result && result.success,
                resultType: typeof result
            });
            
            if (result && result.success) {
                console.log('✅ 调用displayOriginalSoundResult');
                // 获取用户输入原文
                const userInput = document.getElementById('originalSoundText').value.trim();
                result.user_input = userInput; // 将用户输入原文添加到结果中
                this.displayOriginalSoundResult(result);
                
                // 显示成功消息
                if (result.message && result.message.includes('Excel')) {
                    showNotification('Excel文件处理完成，分析结果已显示', 'success');
                } else {
                    showNotification('原声处理完成', 'success');
                }
            } else {
                console.log('❌ 处理失败，结果:', result);
                showNotification(result?.message || '处理失败', 'error');
            }
            
        } catch (error) {
            console.error('原声处理失败:', error);
            showNotification('处理失败: ' + error.message, 'error');
        } finally {
            isConverting = false;
            hideLoadingModal();
        }
    },
    
    // 处理文本原声
    async processTextOriginalSound() {
        const userInput = document.getElementById('originalSoundText').value.trim();
        const sourceLanguage = getSourceLanguageValue();
        const targetLanguage = getTargetLanguageValue();
        
        if (!sourceLanguage || !targetLanguage) {
            throw new Error('请选择源语言和目标语言');
        }
        
        if (!userInput || userInput.length < 5) {
            throw new Error('请输入至少5个字符的用户原声内容');
        }
        
        const formData = new FormData();
        formData.append('user_input', userInput);
        formData.append('source_language', sourceLanguage);
        formData.append('target_language', targetLanguage);
        formData.append('user_id', getCurrentUserId());
        
        const response = await fetch('http://localhost:8001/api/original-sound/process-text', {
            method: 'POST',
            body: formData
        });
        
        return await response.json();
    },
    
    
    // 处理Excel原声
    async processExcelOriginalSound() {
        const excelFileInput = document.getElementById('excelFileInput');
        let excelFile = null;
        
        // 安全检查：确保文件输入元素存在
        if (excelFileInput && excelFileInput.files && excelFileInput.files.length > 0) {
            excelFile = excelFileInput.files[0];
        } else if (window.selectedExcelFile) {
            excelFile = window.selectedExcelFile;
        }
        
        // 保存文件到全局变量，供下载时使用
        if (excelFile) {
            window.selectedExcelFile = excelFile;
        }
        const sourceLanguage = getSourceLanguageValue();
        const targetLanguage = getTargetLanguageValue();
        
        if (!sourceLanguage || !targetLanguage) {
            throw new Error('请选择源语言和目标语言');
        }
        
        if (!excelFile) {
            throw new Error('请选择Excel文件');
        }
        
        // 计算文件哈希值
        const fileHash = await this.calculateFileHash(excelFile);
        console.log('🔍 文件哈希值:', fileHash);
        
        // 检查缓存是否有效
        if (this.isCacheValid(excelFile, sourceLanguage, targetLanguage) && 
            this.excelAnalysisCache.fileHash === fileHash) {
            console.log('✅ 使用缓存的分析结果');
            return this.excelAnalysisCache.analysisResults;
        }
        
        console.log('🔄 缓存无效，开始新的分析...');
        
        const formData = new FormData();
        formData.append('excel_file', excelFile);
        formData.append('source_language', sourceLanguage);
        formData.append('target_language', targetLanguage);
        formData.append('user_id', getCurrentUserId());
        
        const response = await fetch('http://localhost:8001/api/original-sound/process-excel', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            let msg = '';
            try { const j = await response.json(); msg = j?.detail || j?.message; } catch (_) { msg = await response.text(); }
            throw new Error(msg || 'Excel处理失败');
        }

        // 解析JSON响应
        const result = await response.json();
        
        // 缓存分析结果
        this.excelAnalysisCache = {
            fileHash: fileHash,
            analysisResults: result,
            timestamp: Date.now(),
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage
        };
        
        console.log('💾 分析结果已缓存');
        console.log('💾 缓存的数据结构:', result);
        
        return result;
    },
    
    // 显示原声处理结果
    displayOriginalSoundResult(result) {
        const previewContent = document.getElementById('previewContent');
        if (!previewContent) return;
        
        console.log('🔍 displayOriginalSoundResult 接收到的结果:', result);
        
        // 安全检查：确保analysis对象存在
        if (!result || !result.analysis) {
            console.error('❌ 结果中缺少analysis字段:', result);
            showNotification('处理结果格式错误，缺少分析数据', 'error');
            return;
        }
        
        const analysis = result.analysis;
        const standardFormat = result.standard_format;
        const transcribedText = result.transcribed_text; // 录音识别文本（若有）
        
        // 检查是否是Excel多条原声结果
        if (analysis.total_count && analysis.results) {
            this.displayMultipleOriginalSoundResults(result);
            return;
        }
        
        const transcribedBlock = transcribedText
            ? `
                <div class="result-section">
                    <h3>📝 识别文本 <span class="from-api-badge">来自后端</span></h3>
                    <div class="analysis-item">
                        <div class="value transcription">${transcribedText}</div>
                    </div>
                </div>
            `
            : '';

        const resultHTML = `
            <div class="original-sound-result">
                ${transcribedBlock}
                <div class="result-section">
                    <h3>📝 用户输入原文</h3>
                    <div class="analysis-item">
                        <div class="value user-input">${result.user_input || '暂无用户输入数据'}</div>
                    </div>
                </div>
                <div class="result-section">
                    <h3>🎭 情感分析</h3>
                    <div class="analysis-item">
                        <span class="label">情感分类</span>
                        ${getSentimentDisplayHTML(analysis.sentiment_classification || '中性')}
                    </div>
                    <div class="analysis-item">
                        <span class="label">情感强度</span>
                        <span class="value intensity ${analysis.sentiment_intensity || '中等'}">${analysis.sentiment_intensity || '中等'}</span>
                    </div>
                    <div class="analysis-item">
                        <span class="label">情感分析</span>
                        <div class="value analysis">${analysis.sentiment_analysis || '暂无情感分析数据'}</div>
                    </div>
                </div>
                
                <div class="result-section">
                    <h3>🌐 翻译结果</h3>
                    <div class="analysis-item">
                        <span class="label">原声翻译</span>
                        <div class="value translation">${analysis.original_translation || '暂无翻译数据'}</div>
                    </div>
                </div>
                
                <div class="result-section">
                    <h3>🧠 智能总结</h3>
                    <div class="analysis-item">
                        <span class="label">核心主旨</span>
                        <div class="value summary">${analysis.ai_optimized_summary || '暂无核心主旨数据'}</div>
                    </div>
                    <div class="analysis-item">
                        <span class="label">重点分析</span>
                        <div class="value key-points">${analysis.key_points || '暂无重点分析数据'}</div>
                    </div>
                </div>
                
                ${result.message && result.message.includes('Excel') ? `
                <div class="result-section">
                    <h3>📊 Excel文件处理</h3>
                    <div class="analysis-item">
                        <span class="label">处理状态</span>
                        <div class="value">${result.message}</div>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
        
        previewContent.innerHTML = resultHTML;
        
        // 保存当前预览内容到对应输入类型
        this.savePreviewContent(this.currentInputType, resultHTML);
        
        // 保存当前分析结果到全局变量，供保存到原声池使用
        window.currentOriginalSoundResult = result;
        
        // 显示预览操作按钮
        showPreviewActions();
        
        // 保存当前状态（转化完成后）
        TemplateStateManager.saveCurrentState();
    },
    
    // 显示多条原声处理结果
    displayMultipleOriginalSoundResults(result) {
        const previewContent = document.getElementById('previewContent');
        if (!previewContent) return;
        
        const analysis = result.analysis || {};
        const message = result.message || '';
        
        console.log('🔍 显示多条原声结果:', analysis);
        
        let resultsHTML = `
            <div class="original-sound-result">
                <div class="result-section">
                    <h3>📊 Excel文件处理结果</h3>
                    <div class="analysis-item">
                        <span class="label">处理状态</span>
                        <div class="value">${message}</div>
                    </div>
                    <div class="analysis-item">
                        <span class="label">原声数量</span>
                        <div class="value">共处理 ${analysis.total_count} 条原声</div>
                    </div>
                </div>
        `;
        
        // 为每条原声显示结果
        analysis.results.forEach((result, index) => {
            const itemAnalysis = result.analysis;
            resultsHTML += `
                <div class="result-section">
                    <h3>🎤 原声 ${index + 1}</h3>
                    <div class="analysis-item">
                        <span class="label">原始文本</span>
                        <div class="value original-text">${result.original_text}</div>
                    </div>
                    <div class="analysis-item">
                        <span class="label">情感分类</span>
                        ${getSentimentDisplayHTML(itemAnalysis.sentiment_classification || '中性')}
                    </div>
                    <div class="analysis-item">
                        <span class="label">情感强度</span>
                        <span class="value intensity ${itemAnalysis.sentiment_intensity || '中等'}">${itemAnalysis.sentiment_intensity || '中等'}</span>
                    </div>
                    <div class="analysis-item">
                        <span class="label">情感分析</span>
                        <div class="value analysis">${itemAnalysis.sentiment_analysis || '暂无情感分析数据'}</div>
                    </div>
                    <div class="analysis-item">
                        <span class="label">原声翻译</span>
                        <div class="value translation">${itemAnalysis.original_translation || '暂无翻译数据'}</div>
                    </div>
                    <div class="analysis-item">
                        <span class="label">核心主旨</span>
                        <div class="value summary">${itemAnalysis.ai_optimized_summary || '暂无核心主旨数据'}</div>
                    </div>
                    <div class="analysis-item">
                        <span class="label">重点分析</span>
                        <div class="value key-points">${itemAnalysis.key_points || '暂无重点分析数据'}</div>
                    </div>
                </div>
            `;
        });
        
        resultsHTML += `</div>`;
        
        previewContent.innerHTML = resultsHTML;
        
        this.savePreviewContent(this.currentInputType, resultsHTML);
        window.currentOriginalSoundResult = result;
        showPreviewActions();
        TemplateStateManager.saveCurrentState();
    }
};

// Excel文件下载功能
async function downloadExcelFile() {
    try {
        showNotification('正在生成Excel文件...', 'info');
        
        // 获取当前处理的数据
        const excelFileInput = document.getElementById('excelFileInput');
        const sourceLanguageSelect = document.getElementById('sourceLanguageSelect');
        const targetLanguageSelect = document.getElementById('targetLanguageSelect');
        
        console.log('🔍 检查文件输入:', excelFileInput);
        console.log('🔍 文件输入文件:', excelFileInput?.files);
        console.log('🔍 全局文件:', window.selectedExcelFile);
        console.log('🔍 源语言选择:', sourceLanguageSelect?.value);
        console.log('🔍 目标语言选择:', targetLanguageSelect?.value);
        
        // 检查文件输入，如果为空则尝试使用全局变量
        let excelFile = null;
        
        if (excelFileInput && excelFileInput.files && excelFileInput.files.length > 0) {
            excelFile = excelFileInput.files[0];
            console.log('🔍 使用文件输入中的文件:', excelFile.name);
        } else if (window.selectedExcelFile) {
            excelFile = window.selectedExcelFile;
            console.log('🔍 使用全局变量中的文件:', excelFile.name);
        } else {
            console.log('❌ 没有找到Excel文件');
            showNotification('请先选择Excel文件', 'error');
            return;
        }
        
        if (!sourceLanguageSelect || !sourceLanguageSelect.value || !targetLanguageSelect || !targetLanguageSelect.value) {
            console.log('❌ 语言选择不完整');
            showNotification('请选择源语言和目标语言', 'error');
            return;
        }
        
        const sourceLanguage = sourceLanguageSelect.value;
        const targetLanguage = targetLanguageSelect.value;
        
        // 检查是否有缓存的分析结果
        if (OriginalSoundTemplate.excelAnalysisCache.analysisResults && 
            OriginalSoundTemplate.isCacheValid(excelFile, sourceLanguage, targetLanguage)) {
            console.log('✅ 使用缓存的分析结果生成Excel文件');
            await generateExcelFromCache(OriginalSoundTemplate.excelAnalysisCache.analysisResults, excelFile.name);
            return;
        }
        
        console.log('🔄 缓存无效，调用后端API生成Excel文件');
        
        const formData = new FormData();
        formData.append('excel_file', excelFile);
        formData.append('source_language', sourceLanguage);
        formData.append('target_language', targetLanguage);
        formData.append('user_id', getCurrentUserId());
        
        console.log('🔍 发送请求到:', 'http://localhost:8001/api/original-sound/process-excel-download');
        console.log('🔍 请求数据:', {
            file: excelFile.name,
            source_language: sourceLanguage,
            target_language: targetLanguage
        });
        
        // 调用专门的下载API
        const response = await fetch('http://localhost:8001/api/original-sound/process-excel-download', {
            method: 'POST',
            body: formData
        });
        
        console.log('🔍 响应状态:', response.status);
        console.log('🔍 响应头:', response.headers);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ 服务器错误:', errorText);
            throw new Error(`Excel文件生成失败: ${response.status} ${errorText}`);
        }
        
        // 下载文件
        const blob = await response.blob();
        console.log('🔍 下载的blob大小:', blob.size);
        
        if (blob.size === 0) {
            throw new Error('下载的文件为空');
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'original_sound_processed.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        
        showNotification('Excel文件下载完成', 'success');
        
    } catch (error) {
        console.error('下载Excel文件失败:', error);
        showNotification('下载失败: ' + error.message, 'error');
    }
}

// 从缓存生成Excel文件
async function generateExcelFromCache(analysisResults, originalFileName) {
    try {
        console.log('🔍 开始从缓存生成Excel文件...');
        console.log('🔍 缓存数据结构:', analysisResults);
        
        // 创建Excel数据
        const excelData = [];
        
        // 检查数据结构并处理
        if (analysisResults.analysis && analysisResults.analysis.total_count && analysisResults.analysis.results) {
            // 处理Excel多条原声结果（标准结构）
            console.log('🔍 处理Excel多条原声结果');
            analysisResults.analysis.results.forEach((result, index) => {
                const analysis = result.analysis;
                excelData.push({
                    "原文": result.original_text || "无内容",
                    "翻译": analysis.original_translation || "暂无翻译数据",
                    "核心主旨": analysis.ai_optimized_summary || "暂无核心主旨数据",
                    "重点分析": analysis.key_points || "暂无重点分析数据",
                    "情感分类": analysis.sentiment_classification || "中性",
                    "情感强度": analysis.sentiment_intensity || "中等",
                    "情感分析": analysis.sentiment_analysis || "暂无情感分析数据"
                });
            });
        } else if (analysisResults.results && analysisResults.results.length > 0) {
            // 处理多条原声结果（备用结构）
            console.log('🔍 处理多条原声结果（备用结构）');
            analysisResults.results.forEach((result, index) => {
                const analysis = result.analysis;
                excelData.push({
                    "原文": result.original_text || "无内容",
                    "翻译": analysis.original_translation || "暂无翻译数据",
                    "核心主旨": analysis.ai_optimized_summary || "暂无核心主旨数据",
                    "重点分析": analysis.key_points || "暂无重点分析数据",
                    "情感分类": analysis.sentiment_classification || "中性",
                    "情感强度": analysis.sentiment_intensity || "中等",
                    "情感分析": analysis.sentiment_analysis || "暂无情感分析数据"
                });
            });
        } else {
            // 处理单条原声结果
            console.log('🔍 处理单条原声结果');
            const analysis = analysisResults.analysis || {};
            excelData.push({
                "原文": analysisResults.original_text || "无内容",
                "翻译": analysis.original_translation || "暂无翻译数据",
                "核心主旨": analysis.ai_optimized_summary || "暂无核心主旨数据",
                "重点分析": analysis.key_points || "暂无重点分析数据",
                "情感分类": analysis.sentiment_classification || "中性",
                "情感强度": analysis.sentiment_intensity || "中等",
                "情感分析": analysis.sentiment_analysis || "暂无情感分析数据"
            });
        }
        
        console.log('🔍 Excel数据准备完成，行数:', excelData.length);
        console.log('🔍 Excel数据内容:', excelData);
        
        // 如果没有数据，显示警告
        if (excelData.length === 0) {
            console.warn('⚠️ 没有找到有效的分析数据');
            showNotification('缓存中没有找到有效的分析数据，请重新分析', 'warning');
            return;
        }
        
        // 使用SheetJS生成Excel文件
        if (typeof XLSX === 'undefined') {
            try {
                // 动态加载SheetJS
                await loadSheetJS();
            } catch (error) {
                console.error('❌ SheetJS库加载失败，回退到后端API');
                // 如果SheetJS加载失败，回退到后端API
                await fallbackToBackendAPI(analysisResults, originalFileName);
                return;
            }
        }
        
        // 创建工作簿
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        
        // 设置列宽
        const colWidths = [
            { wch: 30 }, // 原文
            { wch: 30 }, // 翻译
            { wch: 20 }, // 核心主旨
            { wch: 25 }, // 重点分析
            { wch: 12 }, // 情感分类
            { wch: 12 }, // 情感强度
            { wch: 30 }  // 情感分析
        ];
        ws['!cols'] = colWidths;
        
        // 添加工作表
        XLSX.utils.book_append_sheet(wb, ws, "原声分析结果");
        
        // 生成文件名
        const baseName = originalFileName ? originalFileName.split('.')[0] : 'original_sound';
        const fileName = `${baseName}_processed.xlsx`;
        
        // 导出文件
        XLSX.writeFile(wb, fileName);
        
        showNotification('Excel文件生成完成（使用缓存）', 'success');
        console.log('✅ Excel文件生成完成');
        
    } catch (error) {
        console.error('❌ 从缓存生成Excel失败:', error);
        showNotification('Excel生成失败: ' + error.message, 'error');
    }
}

// 动态加载SheetJS库
async function loadSheetJS() {
    return new Promise((resolve, reject) => {
        if (typeof XLSX !== 'undefined') {
            resolve();
            return;
        }
        
        // 尝试加载本地库
        const script = document.createElement('script');
        script.src = 'xlsx.full.min.js';
        script.onload = () => {
            console.log('✅ SheetJS库加载完成（本地）');
            resolve();
        };
        script.onerror = () => {
            console.error('❌ 本地SheetJS库加载失败，尝试CDN');
            // 如果本地库失败，尝试CDN
            const cdnScript = document.createElement('script');
            cdnScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            cdnScript.onload = () => {
                console.log('✅ SheetJS库加载完成（CDN）');
                resolve();
            };
            cdnScript.onerror = () => {
                console.error('❌ 所有SheetJS库加载失败');
                reject(new Error('SheetJS库加载失败，请检查网络连接'));
            };
            document.head.appendChild(cdnScript);
        };
        document.head.appendChild(script);
    });
}

// 回退到后端API生成Excel
async function fallbackToBackendAPI(analysisResults, originalFileName) {
    try {
        console.log('🔄 回退到后端API生成Excel文件...');
        
        // 获取当前文件
        const excelFileInput = document.getElementById('excelFileInput');
        let excelFile = null;
        
        if (excelFileInput && excelFileInput.files && excelFileInput.files.length > 0) {
            excelFile = excelFileInput.files[0];
        } else if (window.selectedExcelFile) {
            excelFile = window.selectedExcelFile;
        }
        
        if (!excelFile) {
            throw new Error('未找到Excel文件');
        }
        
        const sourceLanguage = getSourceLanguageValue();
        const targetLanguage = getTargetLanguageValue();
        
        if (!sourceLanguage || !targetLanguage) {
            throw new Error('请选择源语言和目标语言');
        }
        
        const formData = new FormData();
        formData.append('excel_file', excelFile);
        formData.append('source_language', sourceLanguage);
        formData.append('target_language', targetLanguage);
        formData.append('user_id', getCurrentUserId());
        
        const response = await fetch('http://localhost:8001/api/original-sound/process-excel-download', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`后端API调用失败: ${response.status} ${errorText}`);
        }
        
        // 下载文件
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'original_sound_processed.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        
        showNotification('Excel文件下载完成（后端生成）', 'success');
        console.log('✅ 后端API生成Excel完成');
        
    } catch (error) {
        console.error('❌ 后端API回退失败:', error);
        showNotification('Excel生成失败: ' + error.message, 'error');
    }
}

// 草稿箱相关功能
document.addEventListener('DOMContentLoaded', function() {
    // 草稿箱按钮点击事件
    const draftsBtn = document.getElementById('draftsBtn');
    if (draftsBtn) {
        draftsBtn.addEventListener('click', function() {
            // 保存当前页面状态
            saveCurrentPageState();
            window.location.href = 'drafts.html';
        });
    }
    
    // 检查是否有编辑草稿的数据
    const editDraftData = sessionStorage.getItem('editDraft');
    if (editDraftData) {
        try {
            const draftData = JSON.parse(editDraftData);
            loadDraftForEdit(draftData);
            // 清除sessionStorage中的数据
            sessionStorage.removeItem('editDraft');
        } catch (error) {
            console.error('加载草稿数据失败:', error);
        }
    }
    
    // 检查是否有保存的页面状态需要恢复
    const savedPageState = sessionStorage.getItem('savedPageState');
    if (savedPageState) {
        try {
            const pageState = JSON.parse(savedPageState);
            restorePageState(pageState);
            // 清除sessionStorage中的数据
            sessionStorage.removeItem('savedPageState');
        } catch (error) {
            console.error('恢复页面状态失败:', error);
        }
    }
});

// 保存当前页面状态
function saveCurrentPageState() {
    console.log('=== 开始保存页面状态 ===');
    const currentTemplate = getCurrentTemplateType();
    const currentInputType = getCurrentInputType();
    console.log('当前模板类型:', currentTemplate);
    console.log('当前输入类型:', currentInputType);
    
    // 确保用户原声清洗模板的UI已经正确初始化
    if (currentTemplate === 'feedback' && currentInputType === 'text') {
        console.log('确保用户原声清洗模板(文本)UI已初始化');
        // 确保用户原声卡片存在
        let userOriginalSoundCard = document.getElementById('userOriginalSoundCard');
        if (!userOriginalSoundCard && typeof OriginalSoundTemplate !== 'undefined') {
            OriginalSoundTemplate.createUserOriginalSoundCard();
            console.log('重新创建用户原声卡片');
        }
    }
    
    // 直接获取当前表单数据
    const currentFormData = getCurrentFormData();
    console.log('当前表单数据:', currentFormData);
    
    // 保存所有tab的状态
    const allTabStates = {
        // 设计体验问题模板状态
        design: {
            formData: TemplateStateManager.states.design.formData || {},
            previewContent: TemplateStateManager.states.design.previewContent || '',
            uploadedImages: TemplateStateManager.states.design.uploadedFiles || []
        },
        
        // 用户原声清洗模板状态
        feedback: {
            text: {
                formData: TemplateStateManager.states.feedback.text.formData || {},
                previewContent: TemplateStateManager.states.feedback.text.previewContent || '',
                uploadedImages: TemplateStateManager.states.feedback.text.uploadedFiles || []
            },
            excel: {
                formData: TemplateStateManager.states.feedback.excel.formData || {},
                previewContent: TemplateStateManager.states.feedback.excel.previewContent || '',
                uploadedImages: TemplateStateManager.states.feedback.excel.uploadedFiles || []
            }
        },
        
        // 当前激活的模板和输入类型
        currentTemplate: currentTemplate,
        currentInputType: currentInputType,
        
        // 保存时间戳
        savedAt: new Date().toISOString()
    };
    
    // 强制保存当前激活模板的数据
    if (currentTemplate === 'design') {
        console.log('强制保存设计体验问题模板数据');
        allTabStates.design.formData = currentFormData;
        allTabStates.design.previewContent = document.getElementById('previewContent').innerHTML;
        allTabStates.design.uploadedImages = [...uploadedFiles];
    } else if (currentTemplate === 'feedback') {
        if (currentInputType === 'text') {
            console.log('强制保存用户原声清洗模板(文本)数据');
            allTabStates.feedback.text.formData = currentFormData;
            allTabStates.feedback.text.previewContent = document.getElementById('previewContent').innerHTML;
            allTabStates.feedback.text.uploadedImages = [...uploadedFiles];
        } else if (currentInputType === 'excel') {
            console.log('强制保存用户原声清洗模板(Excel)数据');
            allTabStates.feedback.excel.formData = currentFormData;
            allTabStates.feedback.excel.previewContent = document.getElementById('previewContent').innerHTML;
            allTabStates.feedback.excel.uploadedImages = [...uploadedFiles];
        }
    }
    
    // 保存到sessionStorage
    sessionStorage.setItem('savedPageState', JSON.stringify(allTabStates));
    console.log('所有tab状态已保存:', allTabStates);
}

// 恢复页面状态
function restorePageState(pageState) {
    console.log('=== 开始恢复页面状态 ===');
    console.log('保存的页面状态:', pageState);
    console.log('当前模板类型:', pageState.currentTemplate);
    console.log('当前输入类型:', pageState.currentInputType);
    
    // 恢复所有tab的状态到TemplateStateManager
    if (pageState.design) {
        TemplateStateManager.states.design.formData = pageState.design.formData || {};
        TemplateStateManager.states.design.previewContent = pageState.design.previewContent || '';
        TemplateStateManager.states.design.uploadedFiles = pageState.design.uploadedImages || [];
    }
    
    if (pageState.feedback) {
        if (pageState.feedback.text) {
            TemplateStateManager.states.feedback.text.formData = pageState.feedback.text.formData || {};
            TemplateStateManager.states.feedback.text.previewContent = pageState.feedback.text.previewContent || '';
            TemplateStateManager.states.feedback.text.uploadedFiles = pageState.feedback.text.uploadedImages || [];
        }
        
        if (pageState.feedback.excel) {
            TemplateStateManager.states.feedback.excel.formData = pageState.feedback.excel.formData || {};
            TemplateStateManager.states.feedback.excel.previewContent = pageState.feedback.excel.previewContent || '';
            TemplateStateManager.states.feedback.excel.uploadedFiles = pageState.feedback.excel.uploadedImages || [];
        }
    }
    
    // 直接切换UI，不调用switchTab避免重复保存
    const templateType = pageState.currentTemplate || 'design';
    const inputType = pageState.currentInputType || 'text';
    
    // 移除所有tab的active状态
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 添加当前tab的active状态
    const currentTab = document.querySelector(`[data-template="${templateType}"]`);
    if (currentTab) {
        currentTab.classList.add('active');
        console.log('激活标签:', currentTab.textContent);
    }
    
    // 根据模板类型更新界面内容
    updateTemplateContent(templateType);
    
    // 先恢复当前激活tab的状态
    if (templateType === 'design') {
        TemplateStateManager.restoreState('design');
    } else if (templateType === 'feedback') {
        TemplateStateManager.restoreState('feedback', inputType);
    }
    
    // 如果是用户原声清洗模板，还需要切换输入类型
    if (templateType === 'feedback' && inputType) {
        console.log('切换用户原声清洗模板输入类型:', inputType);
        // 使用OriginalSoundTemplate的switchInputType方法，但不保存状态（因为我们已经恢复了状态）
        if (typeof OriginalSoundTemplate !== 'undefined' && OriginalSoundTemplate.switchInputType) {
            OriginalSoundTemplate.switchInputType(inputType, false);
        } else {
            // 回退到全局函数
            switchInputType(inputType);
        }
    }
    
    // 更新按钮状态
    checkConvertButtonState();
}

// 获取当前模板类型
function getCurrentTemplateType() {
    // 根据当前页面状态判断模板类型
    if (currentPage === 'ai-voice' || currentPage === 'manual-voice') {
        return 'feedback';
    } else if (currentPage === 'ai-problem' || currentPage === 'manual-problem') {
        return 'design';
    }
    
    // 回退到旧的检查方式（兼容性）
    const activeTab = document.querySelector('.nav-tab[data-template].active');
    if (activeTab) {
        return activeTab.getAttribute('data-template');
    }
    
    return 'design'; // 默认值
}

// 获取当前输入类型
function getCurrentInputType() {
    // 优先查找用户原声清洗模板中的active tab（如果该模板可见）
    const originalSoundInputGroup = document.getElementById('originalSoundInputGroup');
    if (originalSoundInputGroup && originalSoundInputGroup.style.display !== 'none') {
        const activeTab = originalSoundInputGroup.querySelector('.input-type-tab.active');
        if (activeTab) {
            return activeTab.getAttribute('data-type') || 'text';
        }
    }
    
    // 否则查找设计体验问题模板中的active tab
    const designInputTypeGroup = document.getElementById('designInputTypeGroup');
    if (designInputTypeGroup && designInputTypeGroup.style.display !== 'none') {
        const activeTab = designInputTypeGroup.querySelector('.input-type-tab.active');
        if (activeTab) {
            return activeTab.getAttribute('data-type') || 'problem';
        }
    }
    
    // 最后尝试全局查找（兼容旧代码）
    const activeInputTab = document.querySelector('.input-type-tab.active');
    return activeInputTab ? activeInputTab.getAttribute('data-type') : 'text';
}

// 显示正确的预览操作按钮组
function showPreviewActions() {
    // 隐藏所有按钮组
    document.getElementById('designPreviewActions').style.display = 'none';
    document.getElementById('textPreviewActions').style.display = 'none';
    document.getElementById('excelPreviewActions').style.display = 'none';
    
    const templateType = getCurrentTemplateType();
    const inputType = getCurrentInputType();
    
    console.log('显示预览按钮组 - 模板类型:', templateType, '输入类型:', inputType);
    
    // 若预览区为空或占位符，则不显示任何按钮
    const previewContent = document.getElementById('previewContent');
    const previewHTML = previewContent?.innerHTML || '';
    const hasValidPreview = previewHTML.trim() !== '' && 
                           !previewHTML.includes('转化后的标准化内容将在此处显示') &&
                           !previewHTML.includes('转化好的内容将会按照标准化的模板在此处展示') &&
                           !previewHTML.includes('preview-empty-state') &&
                           !previewHTML.includes('预览空占位.png');
    
    // 检查是否有原声处理结果（包含original-sound-result类）
    const hasOriginalSoundResult = previewContent?.querySelector('.original-sound-result') !== null;
    
    if (!hasValidPreview && !hasOriginalSoundResult) {
        console.log('预览内容为空或占位符，不显示按钮');
        return; // 保持全部隐藏
    }

    if (templateType === 'design') {
        // 设计体验问题模板：重新生成、保存
        document.getElementById('designPreviewActions').style.display = 'flex';
    } else if (templateType === 'feedback') {
        if (inputType === 'text') {
            // 文本原声清洗：复制、保存
            document.getElementById('textPreviewActions').style.display = 'flex';
            console.log('显示文本原声清洗按钮组');
        } else if (inputType === 'excel') {
            // Excel文件清洗：下载Excel文件、保存
            document.getElementById('excelPreviewActions').style.display = 'flex';
            console.log('显示Excel文件清洗按钮组');
        } else {
            console.log('未识别的输入类型:', inputType, '，默认显示文本原声按钮组');
            // 如果无法识别输入类型，但有原声结果，默认显示文本原声按钮组
            if (hasOriginalSoundResult) {
                document.getElementById('textPreviewActions').style.display = 'flex';
            }
        }
    } else {
        console.log('未识别的模板类型:', templateType);
    }
}

// 隐藏所有预览操作按钮组
function hidePreviewActions() {
    document.getElementById('designPreviewActions').style.display = 'none';
    document.getElementById('textPreviewActions').style.display = 'none';
    document.getElementById('excelPreviewActions').style.display = 'none';
}

// 获取当前表单数据
function getCurrentFormData() {
    const formData = {};
    
    // 体验问题描述
    const issueDescription = document.getElementById('issueDescription');
    if (issueDescription && issueDescription.value.trim()) {
        formData.issueDescription = issueDescription.value;
    }
    
    // 用户原声文本
    const originalSoundText = document.getElementById('originalSoundText');
    if (originalSoundText && originalSoundText.value.trim()) {
        formData.originalSoundText = originalSoundText.value;
    }
    
    // 源语言选择
    const currentSourceLanguage = getSourceLanguageValue();
    if (currentSourceLanguage) {
        formData.sourceLanguage = currentSourceLanguage;
    }
    
    // 目标语言选择
    const currentTargetLanguage = getTargetLanguageValue();
    if (currentTargetLanguage) {
        formData.targetLanguage = currentTargetLanguage;
    }
    
    // 所属地区
    const systemTypes = Array.from(document.querySelectorAll('input[name="systemType"]:checked'))
        .map(input => input.value);
    if (systemTypes.length > 0) {
        formData.systemType = systemTypes;
    }
    
    // 归属模块
    const modules = Array.from(document.querySelectorAll('input[name="module"]:checked'))
        .map(input => input.value);
    if (modules.length > 0) {
        formData.module = modules;
    }
    
    return formData;
}

// 获取当前预览内容
function getCurrentPreviewContent() {
    const previewContent = document.getElementById('previewContent');
    return previewContent ? previewContent.innerHTML : '';
}

// 获取当前上传的图片
function getCurrentUploadedImages() {
    const container = document.getElementById('uploadedImagesContainer');
    if (!container) return [];
    
    const images = [];
    const imageItems = container.querySelectorAll('.image-item');
    
    imageItems.forEach(item => {
        const img = item.querySelector('img');
        const caption = item.querySelector('.image-caption');
        if (img && caption) {
            images.push({
                src: img.src,
                caption: caption.textContent
            });
        }
    });
    
    return images;
}

// 获取指定模板的表单数据
function getFormDataForTemplate(templateType, inputType = null) {
    const formData = {};
    
    if (templateType === 'design') {
        // 设计体验问题模板
        const issueDescription = document.getElementById('issueDescription');
        if (issueDescription && issueDescription.value.trim()) {
            formData.issueDescription = issueDescription.value.trim();
        }
        
        // 所属地区
        const systemTypes = Array.from(document.querySelectorAll('input[name="systemType"]:checked'))
            .map(input => input.value);
        if (systemTypes.length > 0) {
            formData.systemType = systemTypes;
        }
        
        // 归属模块
        const modules = Array.from(document.querySelectorAll('input[name="module"]:checked'))
            .map(input => input.value);
        if (modules.length > 0) {
            formData.module = modules;
        }
        
    } else if (templateType === 'feedback') {
        // 用户原声清洗模板
        if (inputType === 'text') {
            const originalSoundText = document.getElementById('originalSoundText');
            if (originalSoundText && originalSoundText.value.trim()) {
                formData.originalSoundText = originalSoundText.value.trim();
            }
            
            // 源语言选择
            const currentSourceLanguage = getSourceLanguageValue();
            if (currentSourceLanguage) {
                formData.sourceLanguage = currentSourceLanguage;
            }
            
            // 目标语言选择
            const currentTargetLanguage = getTargetLanguageValue();
            if (currentTargetLanguage) {
                formData.targetLanguage = currentTargetLanguage;
            }
        }
        // Excel输入类型暂时不需要特殊处理
    }
    
    return formData;
}

// 获取指定模板的预览内容
function getPreviewContentForTemplate(templateType, inputType = null) {
    // 这里需要从TemplateStateManager中获取对应模板的预览内容
    if (templateType === 'design') {
        return TemplateStateManager.states.design.previewContent || '';
    } else if (templateType === 'feedback') {
        if (inputType === 'text') {
            return TemplateStateManager.states.feedback.text.previewContent || '';
        } else if (inputType === 'excel') {
            return TemplateStateManager.states.feedback.excel.previewContent || '';
        }
    }
    return '';
}

// 获取指定模板的上传图片
function getUploadedImagesForTemplate(templateType, inputType = null) {
    // 这里需要从TemplateStateManager中获取对应模板的上传文件
    if (templateType === 'design') {
        return TemplateStateManager.states.design.uploadedFiles || [];
    } else if (templateType === 'feedback') {
        if (inputType === 'text') {
            return TemplateStateManager.states.feedback.text.uploadedFiles || [];
        } else if (inputType === 'excel') {
            return TemplateStateManager.states.feedback.excel.uploadedFiles || [];
        }
    }
    return [];
}

// 切换输入类型（用于用户原声清洗模板）
function switchInputType(inputType) {
    console.log('切换输入类型:', inputType);
    
    // 移除所有输入类型标签的active状态
    document.querySelectorAll('.input-type-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 添加当前输入类型标签的active状态
    const currentInputTab = document.querySelector(`[data-type="${inputType}"]`);
    if (currentInputTab) {
        currentInputTab.classList.add('active');
    }
    
    // 根据输入类型显示/隐藏相应的输入区域
    if (inputType === 'text') {
        // 显示文本输入区域
        const userOriginalSoundCard = document.getElementById('userOriginalSoundCard');
        const languageSwitchCard = document.getElementById('languageSwitchCard');
        if (userOriginalSoundCard) userOriginalSoundCard.style.display = 'block';
        if (languageSwitchCard) languageSwitchCard.style.display = 'block';
    } else if (inputType === 'excel') {
        // 隐藏文本输入区域（Excel输入暂时不实现）
        const userOriginalSoundCard = document.getElementById('userOriginalSoundCard');
        const languageSwitchCard = document.getElementById('languageSwitchCard');
        if (userOriginalSoundCard) userOriginalSoundCard.style.display = 'none';
        if (languageSwitchCard) languageSwitchCard.style.display = 'none';
    }
}

// 恢复上传的图片
function restoreUploadedImages(images) {
    const container = document.getElementById('uploadedImagesContainer');
    if (!container || !images || images.length === 0) return;
    
    container.innerHTML = '';
    
    images.forEach(imageData => {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.innerHTML = `
            <div class="image-thumbnail">
                <img src="${imageData.src}" alt="${imageData.caption}" />
            </div>
            <div class="image-caption">${imageData.caption}</div>
        `;
        container.appendChild(imageItem);
    });
}

// 加载草稿进行编辑
function loadDraftForEdit(draftData) {
    console.log('加载草稿数据:', draftData);
    
    // 切换到对应的模板类型
    if (draftData.templateType) {
        switchTab(draftData.templateType);
    }
    
    // 填充表单数据
    if (draftData.formData) {
        fillFormWithDraftData(draftData.formData);
    }
    
    // 显示预览内容
    if (draftData.previewContent) {
        const previewContent = document.getElementById('previewContent');
        if (previewContent) {
            previewContent.innerHTML = draftData.previewContent;
            
            // 显示预览操作按钮
            const previewActions = document.getElementById('previewActions');
            if (previewActions) {
                previewActions.style.display = 'flex';
            }
        }
    }
}

// 填充表单数据
function fillFormWithDraftData(formData) {
    console.log('填充表单数据:', formData);
    
    // 填充体验问题描述
    if (formData.issueDescription) {
        const issueDescription = document.getElementById('issueDescription');
        if (issueDescription) {
            issueDescription.value = formData.issueDescription;
        }
    }
    
    // 填充用户原声
    if (formData.originalSoundText) {
        const originalSoundText = document.getElementById('originalSoundText');
        if (originalSoundText) {
            originalSoundText.value = formData.originalSoundText;
        }
    }
    
    // 填充源语言选择
    if (formData.sourceLanguage) {
        setSourceLanguageValue(formData.sourceLanguage);
    }
    
    // 填充目标语言选择
    if (formData.targetLanguage) {
        setTargetLanguageValue(formData.targetLanguage);
    }
    
    // 填充所属地区
    if (formData.systemType && Array.isArray(formData.systemType)) {
        formData.systemType.forEach(type => {
            const systemTypeInput = document.querySelector(`input[name="systemType"][value="${type}"]`);
            if (systemTypeInput) {
                systemTypeInput.checked = true;
            }
        });
    }
    
    // 填充归属模块
    if (formData.module && Array.isArray(formData.module)) {
        formData.module.forEach(module => {
            const moduleInput = document.querySelector(`input[name="module"][value="${module}"]`);
            if (moduleInput) {
                moduleInput.checked = true;
            }
        });
    }
    
    // 填充上传的文件
    if (formData.uploadedFiles && Array.isArray(formData.uploadedFiles)) {
        uploadedFiles = formData.uploadedFiles;
        displayUploadedFiles();
    }
}

// 保存按钮统一入口（根据当前模板类型写入对应数据表）
function saveToDraft() {
        const templateType = getCurrentTemplateType();
        
    if (templateType === 'feedback') {
        saveOriginalSoundToVoicePool();
    } else if (templateType === 'design') {
        saveProblemAnalysisToProblemPool();
    } else {
        showNotification('当前模板不支持保存', 'warning');
    }
}

// 收集表单数据
function collectFormData() {
    const formData = {};
    
    // 体验问题描述
    const issueDescription = document.getElementById('issueDescription');
    if (issueDescription && issueDescription.value.trim()) {
        formData.issueDescription = issueDescription.value.trim();
    }
    
    // 用户原声
    const originalSoundText = document.getElementById('originalSoundText');
    if (originalSoundText && originalSoundText.value.trim()) {
        formData.originalSoundText = originalSoundText.value.trim();
    }
    
    // 源语言
    const sourceLanguage = getSourceLanguageValue();
    if (sourceLanguage) {
        formData.sourceLanguage = sourceLanguage;
    }
    
    // 目标语言
    const targetLanguage = getTargetLanguageValue();
    if (targetLanguage) {
        formData.targetLanguage = targetLanguage;
    }
    
    // 所属地区
    const systemTypeCheckboxes = document.querySelectorAll('input[name="systemType"]:checked');
    if (systemTypeCheckboxes.length > 0) {
        formData.systemType = Array.from(systemTypeCheckboxes).map(cb => cb.value);
    }
    
    // 归属模块
    const moduleCheckboxes = document.querySelectorAll('input[name="module"]:checked');
    if (moduleCheckboxes.length > 0) {
        formData.module = Array.from(moduleCheckboxes).map(cb => cb.value);
    }
    
    // 上传的文件
    if (uploadedFiles.length > 0) {
        formData.uploadedFiles = uploadedFiles;
    }
    
    // Excel文件信息（用于Excel原声清洗）
    const excelFileInput = document.getElementById('excelFileInput');
    if (excelFileInput && excelFileInput.files && excelFileInput.files.length > 0) {
        const excelFile = excelFileInput.files[0];
        formData.excelFile = {
            name: excelFile.name,
            size: excelFile.size,
            type: excelFile.type
        };
    } else if (window.selectedExcelFile) {
        formData.excelFile = {
            name: window.selectedExcelFile.name,
            size: window.selectedExcelFile.size,
            type: window.selectedExcelFile.type
        };
    }
    
    return formData;
}

// 生成草稿标题
function generateDraftTitle(formData, templateType) {
    const now = new Date();
    const timeStr = now.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    
    if (templateType === 'design' && formData.issueDescription) {
        const preview = formData.issueDescription.substring(0, 20);
        return `设计体验问题 - ${preview}... (${timeStr})`;
    } else if (templateType === 'feedback' && formData.originalSoundText) {
        const preview = formData.originalSoundText.substring(0, 20);
        return `用户原声清洗 - ${preview}... (${timeStr})`;
    } else if (templateType === 'feedback' && formData.excelFile) {
        const fileName = formData.excelFile.name || 'Excel文件';
        return `Excel原声清洗 - ${fileName} (${timeStr})`;
    }
    
    return `草稿 - ${timeStr}`;
}

// 生成草稿预览
function generateDraftPreview(formData, templateType) {
    if (templateType === 'design' && formData.issueDescription) {
        return formData.issueDescription.substring(0, 100) + (formData.issueDescription.length > 100 ? '...' : '');
    } else if (templateType === 'feedback' && formData.originalSoundText) {
        return formData.originalSoundText.substring(0, 100) + (formData.originalSoundText.length > 100 ? '...' : '');
    } else if (templateType === 'feedback' && formData.excelFile) {
        return `Excel文件: ${formData.excelFile.name} (${formData.sourceLanguage || ''} → ${formData.targetLanguage || ''})`;
    }
    return '暂无内容';
}

