// pages/text-extract/index.js
const doubaoAPI = require('../../utils/doubao-api.js');
const videoParser = require('../../utils/video-parser.js');

Page({
  data: {
    videoLink: '',
    extracting: false,
    extractResult: '',
    wordCount: 0,
    extractTime: '',
    historyList: [],
    currentPlatform: '',
    videoInfo: null,
    useMockData: true, // 默认使用模拟数据，实际部署时设为false
    apiStatus: 'ready' // ready, loading, success, error
  },

  onLoad() {
    console.log('文案提取页面加载 - 豆包API集成版');
    
    // 自动配置用户提供的正确API密钥
    const apiKey = '5785b6ff-933c-4fce-98ba-957683f11eb6';
    if (apiKey) {
      wx.setStorageSync('doubao_api_key', apiKey);
      doubaoAPI.setApiKey(apiKey);
      this.setData({ useMockData: false });
      console.log('已自动配置正确的豆包API密钥，将使用真实API服务');
    }
    
    this.loadHistory();
    
    // 检查API密钥配置
    this.checkApiConfig();
  },

  onShow() {
    console.log('文案提取页面显示');
  },

  // 检查API配置
  checkApiConfig() {
    const apiKey = wx.getStorageSync('doubao_api_key');
    if (apiKey) {
      doubaoAPI.setApiKey(apiKey);
      this.setData({ useMockData: false });
      
      // 检查API密钥格式
      if (apiKey.includes(':')) {
        console.log('已配置豆包API密钥（IAM AK/SK格式），使用真实API');
        console.log('⚠️ 注意：IAM AK/SK格式可能不适用于豆包API，建议使用单一API Key格式');
      } else {
        console.log('已配置豆包API密钥（单一格式），使用真实API');
      }
    } else {
      console.log('未配置API密钥，使用模拟数据');
    }
  },

  // 加载历史记录
  loadHistory() {
    const history = wx.getStorageSync('textExtractHistory') || [];
    this.setData({
      historyList: history.slice(0, 10) // 只显示最近10条
    });
  },

  // 链接输入
  onLinkInput(e) {
    this.setData({
      videoLink: e.detail.value,
      apiStatus: 'ready'
    });
  },

  // 清空链接
  clearLink() {
    this.setData({
      videoLink: '',
      extractResult: '',
      apiStatus: 'ready'
    });
  },

  // 粘贴链接
  pasteLink() {
    wx.getClipboardData({
      success: (res) => {
        // 智能提取链接：从文本中提取URL
        const extractedLink = this.extractUrlFromText(res.data);
        
        this.setData({
          videoLink: extractedLink,
          apiStatus: 'ready'
        });
        wx.showToast({
          title: '已粘贴链接',
          icon: 'success',
          duration: 1000
        });
      },
      fail: () => {
        wx.showToast({
          title: '粘贴失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 从文本中提取URL链接
  extractUrlFromText(text) {
    if (!text) return '';
    
    // URL正则表达式，匹配http/https链接
    const urlRegex = /https?:\/\/[^\s]+/g;
    const matches = text.match(urlRegex);
    
    if (matches && matches.length > 0) {
      // 返回第一个找到的链接
      return matches[0];
    }
    
    // 如果没有找到标准URL，返回原始文本
    return text;
  },

  // 开始提取文案
  async startExtract() {
    const { videoLink, useMockData } = this.data;
    
    if (!videoLink.trim()) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    this.setData({
      extracting: true,
      apiStatus: 'loading'
    });

    try {
      // 直接使用用户输入的内容，不进行链接校验
      const userContent = videoLink.trim();
      
      // 提取文案
      let result;
      if (useMockData) {
        result = await this.extractWithMock({ platform: '用户输入', title: '用户提供的内容' });
      } else {
        console.log('使用豆包API进行文案提取，密钥:', wx.getStorageSync('doubao_api_key') ? '已配置' : '未配置');
        result = await this.extractWithDoubaoAPI(userContent);
      }

      this.handleExtractSuccess(result, userContent);
      
    } catch (error) {
      this.handleExtractError(error);
    }
  },

  // 使用豆包API提取文案
  async extractWithDoubaoAPI(userContent) {
    wx.showLoading({
      title: 'AI分析中...',
      mask: true
    });

    try {
      console.log('开始调用豆包API，输入内容:', userContent.substring(0, 100) + '...');
      
      // 直接使用用户输入的内容，不生成视频摘要
      const result = await doubaoAPI.extractCopyFromVideo(userContent, '用户输入');
      
      console.log('豆包API调用成功，返回结果:', result);
      wx.hideLoading();
      return result;
    } catch (error) {
      wx.hideLoading();
      
      // 显示真实的API错误信息
      console.error('豆包API调用失败:', error);
      
      // 不降级到模拟数据，直接显示错误信息
      throw new Error(`豆包API调用失败: ${error.message}`);
    }
  },

  // 使用模拟数据提取文案
  async extractWithMock(videoInfo) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = doubaoAPI.simulateExtraction(
          videoParser.generateVideoSummary(videoInfo), 
          videoInfo.platform
        );
        resolve(result);
      }, 2000);
    });
  },

  // 处理提取成功
  handleExtractSuccess(result, originalLink) {
    const wordCount = result.length;
    const extractTime = new Date().toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    this.setData({
      extracting: false,
      extractResult: result,
      wordCount: wordCount,
      extractTime: extractTime,
      apiStatus: 'success'
    });

    // 保存到历史记录
    this.saveToHistory(originalLink, result);

    wx.showToast({
      title: '提取成功',
      icon: 'success',
      duration: 2000
    });
  },

  // 处理提取错误
  handleExtractError(error) {
    console.error('文案提取失败:', error);
    
    // 分析错误类型并提供具体解决方案
    let errorMessage = error.message || '未知错误';
    let solution = '';
    
    if (errorMessage.includes('认证失败') || errorMessage.includes('401') || errorMessage.includes('403')) {
      solution = '\n\n💡 解决方案：\n' +
                '1. 检查API密钥是否正确\n' +
                '2. 确认使用的是单一API Key格式（非IAM AK/SK）\n' +
                '3. 确保API密钥有足够的权限\n' +
                '4. 重新配置API密钥';
    } else if (errorMessage.includes('网络') || errorMessage.includes('连接')) {
      solution = '\n\n💡 解决方案：\n' +
                '1. 检查网络连接是否正常\n' +
                '2. 确认API服务是否可用\n' +
                '3. 稍后重试';
    } else if (errorMessage.includes('超时')) {
      solution = '\n\n💡 解决方案：\n' +
                '1. 网络连接较慢，请稍后重试\n' +
                '2. 检查API服务状态';
    } else {
      solution = '\n\n💡 解决方案：\n' +
                '1. 检查API密钥配置\n' +
                '2. 确认网络连接正常\n' +
                '3. 联系技术支持';
    }
    
    this.setData({
      extracting: false,
      apiStatus: 'error',
      extractResult: `❌ 文案提取失败\n\n错误信息: ${errorMessage}${solution}`
    });

    wx.showToast({
      title: '提取失败，请查看错误信息',
      icon: 'none',
      duration: 3000
    });
  },

  // 保存到历史记录
  saveToHistory(link, result) {
    const platform = this.data.currentPlatform || '未知平台';
    const historyItem = {
      id: Date.now(),
      platform: platform,
      link: link.length > 50 ? link.substring(0, 50) + '...' : link,
      result: result,
      time: new Date().toLocaleString('zh-CN'),
      apiUsed: !this.data.useMockData
    };

    let history = wx.getStorageSync('textExtractHistory') || [];
    history.unshift(historyItem);
    
    // 只保留最近50条记录
    if (history.length > 50) {
      history = history.slice(0, 50);
    }

    wx.setStorageSync('textExtractHistory', history);
    this.loadHistory();
  },

  // 复制结果
  copyResult() {
    const { extractResult } = this.data;
    
    wx.setClipboardData({
      data: extractResult,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
          duration: 2000
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 编辑结果
  editResult() {
    const { extractResult } = this.data;
    
    wx.showModal({
      title: '编辑文案',
      editable: true,
      placeholderText: '请输入修改后的文案',
      content: extractResult,
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({
            extractResult: res.content,
            wordCount: res.content.length
          });
          wx.showToast({
            title: '修改成功',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },

  // 使用历史记录
  useHistory(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      videoLink: item.link,
      extractResult: item.result,
      wordCount: item.result.length,
      extractTime: item.time,
      apiStatus: 'ready'
    });
  },

  // 清空历史记录
  clearHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('textExtractHistory');
          this.setData({
            historyList: []
          });
          wx.showToast({
            title: '已清空历史记录',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },

  // 配置API密钥
  configApiKey() {
    const currentKey = wx.getStorageSync('doubao_api_key') || '';
    
    wx.showModal({
      title: '配置豆包API密钥',
      editable: true,
      placeholderText: '请输入您的豆包API密钥',
      content: currentKey,
      success: (res) => {
        if (res.confirm) {
          if (res.content.trim()) {
            // 保存API密钥
            wx.setStorageSync('doubao_api_key', res.content.trim());
            doubaoAPI.setApiKey(res.content.trim());
            this.setData({ useMockData: false });
            
            wx.showToast({
              title: 'API密钥配置成功',
              icon: 'success',
              duration: 2000
            });
            
            console.log('已配置豆包API密钥，将使用真实API服务');
          } else {
            // 清空API密钥，使用模拟数据
            wx.removeStorageSync('doubao_api_key');
            doubaoAPI.setApiKey('');
            this.setData({ useMockData: true });
            
            wx.showToast({
              title: '已切换为演示模式',
              icon: 'success',
              duration: 2000
            });
            
            console.log('未配置API密钥，使用模拟数据');
          }
        }
      }
    });
  },

  onShareAppMessage() {
    return {
      title: 'AI文案提取神器 - 豆包AI智能分析',
      path: '/pages/text-extract/index',
      imageUrl: '/images/share-text-extract.jpg'
    };
  }
});