// pages/watermark/index.js
Page({
  data: {
    showLinkInput: false,
    videoLink: '',
    processedVideo: '',
    isProcessing: false
  },

  onLoad(options) {
    console.log('去水印页面加载', options);
  },

  onShow() {
    // 页面显示时的逻辑
  },

  // 上传视频
  uploadVideo() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: (res) => {
        console.log('选择视频成功', res);
        this.processVideo(res.tempFiles[0].tempFilePath);
      },
      fail: (err) => {
        console.error('选择视频失败', err);
        wx.showToast({
          title: '选择视频失败',
          icon: 'none'
        });
      }
    });
  },

  // 粘贴链接
  pasteLink() {
    this.setData({
      showLinkInput: true
    });
  },

  // 从剪贴板粘贴
  pasteFromClipboard() {
    wx.getClipboardData({
      success: (res) => {
        const clipboardData = res.data;
        if (clipboardData) {
          this.setData({
            videoLink: clipboardData,
            showLinkInput: true
          });
          wx.showToast({
            title: '已粘贴链接',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: '剪贴板为空',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '粘贴失败',
          icon: 'none'
        });
      }
    });
  },

  // 清空链接
  clearLink() {
    this.setData({
      videoLink: ''
    });
  },

  // 链接输入
  onLinkInput(e) {
    this.setData({
      videoLink: e.detail.value
    });
  },

  // 处理链接
  processLink() {
    const { videoLink } = this.data;
    
    if (!videoLink.trim()) {
      wx.showToast({
        title: '请输入视频链接',
        icon: 'none'
      });
      return;
    }

    // 验证链接格式
    if (!this.isValidVideoLink(videoLink)) {
      wx.showToast({
        title: '链接格式不正确',
        icon: 'none'
      });
      return;
    }

    this.processVideoLink(videoLink);
  },

  // 验证视频链接格式
  isValidVideoLink(link) {
    const patterns = [
      /https?:\/\/(?:www\.)?douyin\.com\/video\/[^\s]+/,
      /https?:\/\/(?:www\.)?iesdouyin\.com\/share\/video\/[^\s]+/,
      /https?:\/\/(?:www\.)?kuaishou\.com\/[^\s]+/,
      /https?:\/\/(?:www\.)?bilibili\.com\/video\/[^\s]+/
    ];
    
    return patterns.some(pattern => pattern.test(link));
  },

  // 处理视频链接 - 使用第三方去水印API
  processVideoLink(link) {
    this.setData({ isProcessing: true });
    
    wx.showLoading({
      title: '正在解析视频链接...'
    });

    // 调用第三方去水印API
    wx.request({
      url: 'https://your-watermark-api.com/api/remove', // 替换为实际的第三方API地址
      method: 'POST',
      data: {
        url: link,
        platform: this.detectPlatform(link)
      },
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-api-key' // 替换为实际的API密钥
      },
      success: (res) => {
        wx.hideLoading();
        
        if (res.data.success && res.data.video_url) {
          this.setData({ 
            isProcessing: false,
            processedVideo: res.data.video_url
          });
          
          wx.showToast({
            title: '水印去除成功',
            icon: 'success'
          });
        } else {
          this.handleApiError(res.data.message || '处理失败');
        }
      },
      fail: (err) => {
        wx.hideLoading();
        this.handleApiError('网络请求失败');
      }
    });
  },

  // 检测视频平台
  detectPlatform(link) {
    if (link.includes('douyin.com') || link.includes('iesdouyin.com')) {
      return 'douyin';
    } else if (link.includes('kuaishou.com')) {
      return 'kuaishou';
    } else if (link.includes('bilibili.com')) {
      return 'bilibili';
    } else {
      return 'other';
    }
  },

  // 处理API错误
  handleApiError(message) {
    this.setData({ isProcessing: false });
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 3000
    });
  },

  // 处理本地视频 - 使用第三方去水印API
  processVideo(videoPath) {
    this.setData({ isProcessing: true });
    
    wx.showLoading({
      title: '正在上传并处理视频...'
    });

    // 先上传视频到服务器，然后调用去水印API
    wx.uploadFile({
      url: 'https://your-watermark-api.com/api/upload', // 替换为实际的文件上传API地址
      filePath: videoPath,
      name: 'video',
      header: {
        'Authorization': 'Bearer your-api-key' // 替换为实际的API密钥
      },
      success: (res) => {
        const result = JSON.parse(res.data);
        
        if (result.success && result.video_id) {
          // 调用去水印处理API
          wx.request({
            url: 'https://your-watermark-api.com/api/process',
            method: 'POST',
            data: {
              video_id: result.video_id,
              action: 'remove_watermark'
            },
            header: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer your-api-key'
            },
            success: (processRes) => {
              wx.hideLoading();
              
              if (processRes.data.success && processRes.data.processed_url) {
                this.setData({ 
                  isProcessing: false,
                  processedVideo: processRes.data.processed_url
                });
                
                wx.showToast({
                  title: '水印去除成功',
                  icon: 'success'
                });
              } else {
                this.handleApiError(processRes.data.message || '处理失败');
              }
            },
            fail: (err) => {
              wx.hideLoading();
              this.handleApiError('处理请求失败');
            }
          });
        } else {
          wx.hideLoading();
          this.handleApiError(result.message || '上传失败');
        }
      },
      fail: (err) => {
        wx.hideLoading();
        this.handleApiError('上传失败');
      }
    });
  },

  // 下载视频
  downloadVideo() {
    const { processedVideo } = this.data;
    
    if (!processedVideo) {
      wx.showToast({
        title: '请先处理视频',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '正在下载...'
    });

    // 模拟下载过程
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '下载成功',
        icon: 'success'
      });
      
      // 实际项目中这里应该调用下载API
      wx.saveVideoToPhotosAlbum({
        filePath: processedVideo,
        success: () => {
          wx.showToast({
            title: '已保存到相册',
            icon: 'success'
          });
        },
        fail: () => {
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          });
        }
      });
    }, 1000);
  },

  // 分享视频
  shareVideo() {
    const { processedVideo } = this.data;
    
    if (!processedVideo) {
      wx.showToast({
        title: '请先处理视频',
        icon: 'none'
      });
      return;
    }

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });

    wx.showToast({
      title: '点击右上角分享',
      icon: 'none'
    });
  },

  // 用户分享
  onShareAppMessage() {
    return {
      title: '我使用书单助手去除了视频水印',
      path: '/pages/watermark/index',
      imageUrl: '/images/share-watermark.jpg'
    };
  }
});