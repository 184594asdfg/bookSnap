// 去水印API配置
const WATERMARK_API_CONFIG = {
  // 推荐的第三方去水印API服务（选择其中一个）
  
  // 方案1: 专业去水印API服务（推荐）
  professional: {
    baseUrl: 'https://api.watermark-remover.com/v1',
    endpoints: {
      removeFromUrl: '/remove/url',
      uploadAndProcess: '/upload/process'
    },
    // 需要注册获取API密钥
    apiKey: 'your-api-key-here'
  },
  
  // 方案2: 视频处理云服务
  cloudService: {
    baseUrl: 'https://video-processing-api.com/api',
    endpoints: {
      removeWatermark: '/watermark/remove'
    },
    // 需要注册获取API密钥
    apiKey: 'your-cloud-api-key'
  },
  
  // 方案3: 免费去水印API（可能有使用限制）
  freeService: {
    baseUrl: 'https://free-watermark-api.com/api',
    endpoints: {
      parseVideo: '/parse',
      downloadVideo: '/download'
    },
    // 可能不需要API密钥或有限制
    apiKey: ''
  }
};

// 支持的视频平台
const SUPPORTED_PLATFORMS = {
  douyin: ['抖音', 'douyin.com', 'iesdouyin.com'],
  kuaishou: ['快手', 'kuaishou.com'],
  bilibili: ['B站', 'bilibili.com'],
  xiaohongshu: ['小红书', 'xiaohongshu.com'],
  weibo: ['微博', 'weibo.com'],
  youtube: ['YouTube', 'youtube.com']
};

// API调用配置
const API_CONFIG = {
  timeout: 30000, // 30秒超时
  maxRetries: 3,  // 最大重试次数
  retryDelay: 1000 // 重试延迟
};

module.exports = {
  WATERMARK_API_CONFIG,
  SUPPORTED_PLATFORMS,
  API_CONFIG
};