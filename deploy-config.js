// FeedbackBridge 部署配置文件
// 部署时修改此文件中的配置

const DEPLOYMENT_CONFIG = {
    // 后端 API 地址
    // 部署后端后，将此处改为您的后端地址
    API_BASE_URL: 'http://localhost:8000', // 本地开发地址
    
    // 生产环境地址示例：
    // API_BASE_URL: 'https://your-app.railway.app',
    // API_BASE_URL: 'https://your-app.onrender.com',
    
    // 应用配置
    APP_NAME: 'FeedbackBridge',
    APP_VERSION: '1.0.0',
    
    // 功能开关
    FEATURES: {
        // 是否启用文件上传
        FILE_UPLOAD: true,
        // 是否启用历史记录
        HISTORY: true,
        // 是否启用草稿保存
        DRAFTS: true,
        // 是否启用音频上传
        AUDIO_UPLOAD: true
    },
    
    // 文件上传限制
    UPLOAD_LIMITS: {
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_TYPES: ['image/*', 'video/*', 'audio/*'],
        MAX_FILES: 5
    },
    
    // 调试模式
    DEBUG: false, // 生产环境设为 false
    
    // 日志级别
    LOG_LEVEL: 'info' // 'debug', 'info', 'warn', 'error'
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DEPLOYMENT_CONFIG;
} else {
    window.DEPLOYMENT_CONFIG = DEPLOYMENT_CONFIG;
}
