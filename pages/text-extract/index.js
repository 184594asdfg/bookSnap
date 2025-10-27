// pages/text-extract/index.js
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
    apiStatus: 'ready' // ready, loading, success, error
  },

  onLoad() {
    this.loadHistory();
  },

  onShow() {
    // 页面显示逻辑
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
    const { videoLink } = this.data;
    
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
      
      // 提取文案（使用简单的文本处理）
      const result = await this.extractWithSimpleMethod(userContent);

      this.handleExtractSuccess(result, userContent);
      
    } catch (error) {
      this.handleExtractError(error);
    }
  },

  // 使用简单方法提取文案
  async extractWithSimpleMethod(userContent) {
    wx.showLoading({
      title: '分析中...',
      mask: true
    });

    try {
      // 模拟处理延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 简单的文本处理：返回用户输入的内容
      wx.hideLoading();
      return `提取结果：${userContent}\n\n提示：当前为演示模式，仅展示基本功能。`;
    } catch (error) {
      wx.hideLoading();
      throw new Error(`文案提取失败: ${error.message}`);
    }
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
    
    if (errorMessage.includes('网络') || errorMessage.includes('连接')) {
      solution = '\n\n💡 解决方案：\n' +
                '1. 检查网络连接是否正常\n' +
                '2. 稍后重试';
    } else if (errorMessage.includes('超时')) {
      solution = '\n\n💡 解决方案：\n' +
                '1. 网络连接较慢，请稍后重试';
    } else {
      solution = '\n\n💡 解决方案：\n' +
                '1. 检查网络连接正常\n' +
                '2. 联系技术支持';
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
      time: new Date().toLocaleString('zh-CN')
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

  // 配置功能（已移除API密钥配置）
  configApiKey() {
    wx.showModal({
      title: '功能说明',
      content: '当前为演示模式，仅展示基本功能。',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  onShareAppMessage() {
    return {
      title: 'AI文案提取神器',
      path: '/pages/text-extract/index',
      imageUrl: '/images/share-text-extract.jpg'
    };
  }
});