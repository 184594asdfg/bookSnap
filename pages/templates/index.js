// pages/templates/index.js
Page({
  data: {
    categories: [
      { id: 1, name: '全部', value: 'all', active: true },
      { id: 2, name: '简约', value: 'simple', active: false },
      { id: 3, name: '创意', value: 'creative', active: false },
      { id: 4, name: '教育', value: 'education', active: false }
    ],
    templateList: [],
    hasMore: false,
    showPreview: false,
    previewTemplate: null,
    showVIPModal: false
  },

  onLoad(options) {
    console.log('模板页面加载', options);
    this.loadTemplates();
  },

  // 分类点击
  onCategoryClick(e) {
    const categoryValue = e.currentTarget.dataset.category;
    const categories = this.data.categories.map(category => ({
      ...category,
      active: category.value === categoryValue
    }));

    this.setData({ categories });
    this.filterTemplates();
  },

  // 过滤模板
  filterTemplates() {
    const { categories } = this.data;
    const activeCategory = categories.find(category => category.active);
    
    // 保存原始数据到临时变量，避免在过滤时丢失
    if (!this._originalTemplateList) {
      this._originalTemplateList = [...this.data.templateList];
    }

    // 根据分类过滤模板
    let filteredTemplates = [];
    
    if (activeCategory.value === 'all') {
      // 显示全部模板
      filteredTemplates = [...this._originalTemplateList];
    } else {
      // 按分类过滤
      filteredTemplates = this._originalTemplateList.filter(template => 
        template.category === activeCategory.value
      );
    }
    
    console.log(`过滤后模板数量: ${filteredTemplates.length}, 分类: ${activeCategory.name}`);

    this.setData({ templateList: filteredTemplates });
    
    // 如果过滤后没有数据，显示提示
    if (filteredTemplates.length === 0) {
      wx.showToast({
        title: `暂无${activeCategory.name}类型的模板`,
        icon: 'none',
        duration: 1500
      });
    }
  },

  // 加载模板数据
  loadTemplates() {
    wx.showLoading({
      title: '加载中...'
    });

    // 调用API获取视频模板数据
    wx.request({
      url: 'http://localhost:3002/api/video-templates',
      method: 'GET',
      success: (res) => {
        wx.hideLoading();
        
        // 打印完整的API响应
        console.log('模板API返回结果:', res);
        console.log('响应数据类型:', typeof res.data);
        console.log('响应数据:', JSON.stringify(res.data));
        
        try {
          // 检查响应状态
          if (res.statusCode === 200) {
            let templatesData = [];
            
            // 灵活处理多种数据格式
            if (Array.isArray(res.data)) {
              // 如果返回的是直接数组
              console.log('检测到直接数组格式，数据长度:', res.data.length);
              templatesData = res.data;
            } 
            else if (res.data.success && res.data.data && res.data.data.list) {
              // 检查data.list是否为数组
              if (Array.isArray(res.data.data.list)) {
                console.log('检测到标准格式，list长度:', res.data.data.list.length);
                templatesData = res.data.data.list;
              } else {
                console.log('data.list不是数组:', typeof res.data.data.list);
              }
            }
            else if (res.data.data && Array.isArray(res.data.data)) {
              // 检查data是否为数组
              console.log('检测到data字段是数组，长度:', res.data.data.length);
              templatesData = res.data.data;
            }
            
            // 打印转换前的数据长度
            console.log('转换前模板数量:', templatesData.length);
            
            // 转换API数据格式为前端需要的格式
            const templateList = templatesData.map((item, index) => {
              console.log(`${index + 1}. 原始模板数据:`, item);
              return {
                id: item.template_id || item.id || Math.random().toString(36).substr(2, 9),
                // 使用与封面素材库相同的COS配置，但文件夹改为bookTemp，对中文字符进行URL编码
                image: item.preview_file ? `https://booksnap-1353983545.cos.ap-beijing.myqcloud.com/bookTemp/${encodeURIComponent(item.preview_file)}` : '/images/default-template.jpg',
                // 视频链接：根据接口返回的视频名称生成COS链接，对中文字符进行URL编码
                video: item.video_file ? `https://booksnap-1353983545.cos.ap-beijing.myqcloud.com/bookTemp/${encodeURIComponent(item.video_file)}` : null,
                title: item.title || '未命名模板',
                description: item.description || '暂无描述',
                category: item.category || '通用',
                duration: item.duration || '30秒', // 使用API返回的时长信息
                usageCount: item.like_count || item.usage_count || 0,
                isFavorite: false // 默认未收藏
              };
            });
            
            console.log('转换后模板数量:', templateList.length);
            
            // 设置数据
            this.setData({
              templateList: templateList,
              hasMore: templateList.length >= 10 // 假设每页至少10条数据
            });
            
            // 初始化过滤
            this.filterTemplates();
            
            // 显示成功提示
            wx.showToast({
              title: `成功加载${templateList.length}个模板`,
              icon: 'none',
              duration: 1500
            });
          } else {
            throw new Error(`API请求失败，状态码: ${res.statusCode}`);
          }
        } catch (error) {
          wx.showToast({
            title: '数据格式错误',
            icon: 'error'
          });
          console.error('加载模板失败:', error);
        }
      },
      fail: (error) => {
        wx.hideLoading();
        wx.showToast({
          title: '网络请求失败',
          icon: 'error'
        });
        console.error('网络请求失败:', error);
      }
    });
  },

  // 预览模板
  previewTemplate(e) {
    const template = e.currentTarget.dataset.template;
    
    this.setData({
      showPreview: true,
      previewTemplate: template
    });
  },

  // 关闭预览
  closePreview() {
    this.setData({
      showPreview: false,
      previewTemplate: null
    });
  },

  // 视频播放事件
  onVideoPlay(e) {
    wx.showToast({
      title: '视频开始播放',
      icon: 'success',
      duration: 1000
    });
  },

  // 视频错误事件
  onVideoError(e) {
    wx.showToast({
      title: '视频播放失败',
      icon: 'error'
    });
    
    // 显示错误信息
    this.setData({
      videoError: true,
      errorMessage: '视频加载失败，请检查网络或视频文件'
    });
  },



  // 收藏模板
  favoriteTemplate(e) {
    const templateId = e.currentTarget.dataset.id;
    const templateList = this.data.templateList.map(template => 
      template.id === templateId ? { ...template, isFavorite: !template.isFavorite } : template
    );

    this.setData({ templateList });

    wx.showToast({
      title: templateList.find(t => t.id === templateId).isFavorite ? '收藏成功' : '取消收藏',
      icon: 'success'
    });
  },

  // 下载模板
  downloadTemplate(e) {
    const templateId = e.currentTarget.dataset.id;
    const template = this.data.templateList.find(t => t.id === templateId);

    wx.showLoading({
      title: '下载中...'
    });

    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '下载成功',
        icon: 'success'
      });

      // 实际项目中这里应该调用下载API
    }, 1500);
  },

  // 使用模板
  useTemplate() {
    const { previewTemplate } = this.data;

    wx.showModal({
      title: '使用模板',
      content: '确定要使用这个模板吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中...'
          });

          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({
              title: '使用成功',
              icon: 'success'
            });

            this.closePreview();
            
            // 跳转到编辑页面
            wx.navigateTo({
              url: '/pages/editor/index'
            });
          }, 2000);
        }
      }
    });
  },

  // 下载预览模板
  downloadPreview() {
    const { previewTemplate } = this.data;

    wx.showLoading({
      title: '下载中...'
    });

    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '下载成功',
        icon: 'success'
      });

      this.closePreview();
    }, 1500);
  },



  // 加载更多
  loadMore() {
    wx.showLoading({
      title: '加载中...'
    });

    setTimeout(() => {
      wx.hideLoading();
      // 模拟加载更多数据
      const newTemplates = [
        {
          id: 4,
          image: '/images/template4.jpg',
          title: '节日庆典模板',
          description: '适合节日庆祝和活动',
          category: '节日',
          duration: '40秒',
          isFree: false,
          isVIP: true,
          usageCount: 456
        }
      ];

      this.setData({
        templateList: [...this.data.templateList, ...newTemplates],
        hasMore: false // 模拟没有更多数据
      });
    }, 1000);
  },

  // 用户分享
  onShareAppMessage() {
    return {
      title: '书单助手 - 丰富的视频模板库',
      path: '/pages/templates/index',
      imageUrl: '/images/share-templates.jpg'
    };
  },



  // 分享单个模板
  shareSingleTemplate(template) {
    wx.showShareMenu({
      withShareTicket: true
    });

    wx.showModal({
      title: '分享模板',
      content: `是否要分享模板"${template.title}"？`,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '分享功能已准备',
            icon: 'success'
          });
        }
      }
    });
  },
});