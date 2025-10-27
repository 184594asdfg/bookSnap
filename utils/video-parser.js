// 视频链接解析服务
class VideoParser {
  constructor() {
    this.supportedPlatforms = {
      'douyin': {
        name: '抖音',
        regex: /(douyin\.com\/video\/([^?&]+)|v\.douyin\.com\/([^?&]+))/,
        extractMethod: 'parseDouyin'
      },
      'kuaishou': {
        name: '快手',
        regex: /kuaishou\.com\/[^/]+\/([^?&]+)/,
        extractMethod: 'parseKuaishou'
      },
      'bilibili': {
        name: 'B站',
        regex: /bilibili\.com\/video\/([^?&]+)/,
        extractMethod: 'parseBilibili'
      },
      'xiaohongshu': {
        name: '小红书',
        regex: /xiaohongshu\.com\/explore\/([^?&]+)/,
        extractMethod: 'parseXiaohongshu'
      },
      'weibo': {
        name: '微博',
        regex: /weibo\.com\/tv\/show\/([^?&]+)/,
        extractMethod: 'parseWeibo'
      },
      'tiktok': {
        name: 'TikTok',
        regex: /tiktok\.com\/@[^/]+\/video\/([^?&]+)/,
        extractMethod: 'parseTiktok'
      }
    };
  }

  /**
   * 解析视频链接
   * @param {string} url - 视频链接
   * @returns {Promise<Object>} - 视频信息对象
   */
  async parseVideoUrl(url) {
    try {
      const platform = this.detectPlatform(url);
      
      if (!platform) {
        throw new Error('不支持的视频平台');
      }

      // 提取视频ID
      const videoId = this.extractVideoId(url, platform);
      
      if (!videoId) {
        throw new Error('无法解析视频ID');
      }

      // 获取视频信息
      const videoInfo = await this.getVideoInfo(platform, videoId, url);
      
      return {
        platform: platform.name,
        videoId: videoId,
        url: url,
        ...videoInfo
      };
      
    } catch (error) {
      console.error('视频链接解析失败:', error);
      throw error;
    }
  }

  /**
   * 检测视频平台
   */
  detectPlatform(url) {
    for (const [key, platform] of Object.entries(this.supportedPlatforms)) {
      if (platform.regex.test(url)) {
        return { key, ...platform };
      }
    }
    return null;
  }

  /**
   * 提取视频ID
   */
  extractVideoId(url, platform) {
    const match = url.match(platform.regex);
    if (!match) return null;
    
    // 对于抖音平台，处理短链接和长链接的不同匹配组
    if (platform.key === 'douyin') {
      // 短链接格式：v.douyin.com/xxx
      if (match[3]) {
        return match[3];
      }
      // 长链接格式：douyin.com/video/xxx
      if (match[2]) {
        return match[2];
      }
    }
    
    return match[1] ? match[1] : null;
  }

  /**
   * 获取视频信息
   */
  async getVideoInfo(platform, videoId, originalUrl) {
    // 在实际项目中，这里应该调用各平台的API
    // 由于平台API限制，这里返回基础信息
    return this.getBasicInfo(platform, videoId, originalUrl);
  }



  /**
   * 获取基础信息
   */
  getBasicInfo(platform, videoId, url) {
    return {
      title: `${platform.name}视频 - ${videoId.substring(0, 8)}`,
      description: `来自${platform.name}平台的视频内容`,
      author: '未知作者',
      duration: '未知时长',
      uploadTime: new Date().toLocaleDateString('zh-CN'),
      sourceUrl: url
    };
  }

  /**
   * 获取默认信息
   */
  getDefaultInfo(platform) {
    return {
      title: `${platform.name}精彩视频`,
      description: `这是一个来自${platform.name}平台的优质视频内容`,
      author: '平台用户',
      duration: '00:20',
      uploadTime: new Date().toLocaleDateString('zh-CN'),
      views: '10万+',
      likes: '1万+'
    };
  }

  /**
   * 验证链接格式
   */
  validateUrl(url) {
    // 基础URL格式验证
    if (!url || typeof url !== 'string') {
      return false;
    }

    // 检查是否为有效的URL
    try {
      new URL(url);
    } catch {
      return false;
    }

    // 检查是否支持该平台
    return this.detectPlatform(url) !== null;
  }



  /**
   * 生成视频信息摘要（用于AI分析）
   */
  generateVideoSummary(videoInfo) {
    return `
视频标题：${videoInfo.title}
视频描述：${videoInfo.description}
作者：${videoInfo.author}
时长：${videoInfo.duration}
上传时间：${videoInfo.uploadTime}
${videoInfo.likes ? `点赞数：${videoInfo.likes}` : ''}
${videoInfo.views ? `播放量：${videoInfo.views}` : ''}
${videoInfo.comments ? `评论数：${videoInfo.comments}` : ''}
    `.trim();
  }
}

// 创建单例实例
const videoParser = new VideoParser();

module.exports = videoParser;