// pages/home/index.js
Page({
  data: {
    // 页面数据
    searchValue: "",
    // 首页配置数据
    homeConfig: {
      heroHeight: '200rpx',
      heroGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      heroTitle: '书单助手',
      heroTagline: '智能创作，轻松上手',
      showUserStats: true
    },
    // 功能板块数据
    sections: [
      {
        sectionKey: 'covers',
        sectionName: '封面素材',
        sectionDesc: '海量高清书籍封面',
        sectionIcon: '📖',
        navigateUrl: '/pages/covers/index',
        badgeType: 'recommend',
        badgeText: '推荐',
        isEnabled: true,
        isDisabled: false
      },
      {
        sectionKey: 'templates',
        sectionName: '视频模板',
        sectionDesc: '热门书单视频模板',
        sectionIcon: '🎬',
        navigateUrl: '/pages/templates/index',
        badgeType: 'hot',
        badgeText: '热门',
        isEnabled: true,
        isDisabled: false
      },
      {
        sectionKey: 'watermark',
        sectionName: '去水印',
        sectionDesc: '智能去除视频水印',
        sectionIcon: '💧',
        navigateUrl: '/pages/watermark/index',
        badgeType: 'coming-soon',
        badgeText: '即将上线',
        isEnabled: true,
        isDisabled: true
      },
      {
        sectionKey: 'text_extract',
        sectionName: '文案提取',
        sectionDesc: '智能提取视频文案',
        sectionIcon: '📝',
        navigateUrl: '/pages/text-extract/index',
        badgeType: 'coming-soon',
        badgeText: '即将上线',
        isEnabled: true,
        isDisabled: true
      },
      {
        sectionKey: 'hot_materials',
        sectionName: '热门素材',
        sectionDesc: '丰富的剪辑素材库',
        sectionIcon: '🎨',
        navigateUrl: '/pages/hot-materials/index',
        badgeType: 'coming-soon',
        badgeText: '即将上线',
        isEnabled: true,
        isDisabled: true
      },
      {
        sectionKey: 'fonts',
        sectionName: '推荐字体',
        sectionDesc: '精选书单专用字体',
        sectionIcon: '🔤',
        navigateUrl: '/pages/fonts/index',
        badgeType: 'coming-soon',
        badgeText: '即将上线',
        isEnabled: true,
        isDisabled: true
      }
    ],
    // 加载状态
    loading: false
  },

  onLoad() {
    console.log('首页加载');
    this.loadHomeData();
  },

  onShow() {
    console.log('首页显示');
  },

  onPullDownRefresh() {
    // 下拉刷新
    this.loadHomeData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onShareAppMessage() {
    return {
      title: '书单助手 - 短视频创作一站式工具',
      path: '/pages/home/index'
    };
  },

  // 加载首页数据 - 从API获取配置
  loadHomeData() {
    this.setData({ loading: true });
    
    return new Promise((resolve) => {
      // 调用新的API获取首页配置
      wx.request({
        url: 'http://localhost:3002/api/home-sections', // 新的接口地址
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200) {
            // 统一处理数据，支持多种格式
            let sectionsData = [];
            
            // 检查是否是数组
            if (Array.isArray(res.data)) {
              sectionsData = res.data;
            }
            // 检查是否是包含data.list字段的对象（用户提示的数据结构）
            else if (typeof res.data === 'object' && res.data !== null && res.data.data && res.data.data.list) {
              if (Array.isArray(res.data.data.list)) {
                sectionsData = res.data.data.list;
              }
            }
            // 检查是否是包含sections字段的对象
            else if (typeof res.data === 'object' && res.data !== null && res.data.sections) {
              if (Array.isArray(res.data.sections)) {
                sectionsData = res.data.sections;
              }
            }
            // 如果是对象但没有预期的列表字段，尝试查找其他可能的列表字段或单个板块
            else if (typeof res.data === 'object' && res.data !== null) {
              // 检查是否有其他可能的列表字段
              const possibleListFields = ['list', 'items', 'sections', 'data'];
              let foundList = false;
              
              for (const field of possibleListFields) {
                if (res.data[field] && Array.isArray(res.data[field])) {
                  sectionsData = res.data[field];
                  foundList = true;
                  break;
                }
              }
              
              // 检查是否包含必要的板块字段（单个板块）
              if (!foundList && (res.data.sectionName || res.data.id || res.data.sectionKey)) {
                sectionsData = [res.data];
              }
            }
            
            // 字段映射：确保字段名统一
            const mappedSections = sectionsData.map(section => {
              return {
                sectionKey: section.sectionKey || section.id || `section_${Date.now()}_${Math.random()}`,
                sectionName: section.sectionName || section.name || '未命名板块',
                sectionDesc: section.sectionDesc || section.description || '',
                sectionIcon: section.sectionIcon || section.icon || '📚',
                navigateUrl: section.navigateUrl || section.url || '',
                badgeType: section.badgeType || section.type || '',
                badgeText: section.badgeText || section.text || '',
                isEnabled: section.isEnabled ?? section.s_enabled ?? null,
                isDisabled: section.isDisabled ?? section.is_disabled ?? null,
                id: section.id || section.sectionKey || null
              };
            });
            
            // 更新板块数据
              this.setData({ sections: mappedSections });
              
              // 应用动态样式
              this.applyDynamicStyles();
            } else {
              // 如果请求失败，保持原有数据不变
            }
        },
        fail: (err) => {
        // 请求失败，保持原有数据
      },
        complete: () => {
        this.setData({ loading: false });
        resolve();
      }
      });
    });
  },
  
  // 应用动态样式
  applyDynamicStyles() {
    // 动态设置英雄区域高度和背景
    const query = wx.createSelectorQuery();
    query.select('.hero-section')
      .boundingClientRect()
      .exec((res) => {
        if (res && res[0]) {
          const heroSection = res[0];
          // 这里可以根据需要进行额外的样式调整
        }
      });
  },

  // 搜索功能
  onSearchInput(e) {
    this.setData({
      searchValue: e.detail.value
    });
  },

  onSearchConfirm() {
    const { searchValue } = this.data;
    if (searchValue.trim()) {
      wx.showToast({
        title: '搜索中...',
        icon: 'loading',
        duration: 1000
      });
      
      // 实际项目中这里会调用搜索API
      setTimeout(() => {
        wx.navigateTo({
          url: `/pages/search/result?keyword=${encodeURIComponent(searchValue)}`
        });
      }, 1000);
    }
  },

  // 统一导航方法
  navigateToSection(e) {
    const section = e.currentTarget.dataset.section;
    
    if (section && section.navigateUrl) {
      if (section.isDisabled === 1) {
        // 如果功能已禁用，显示提示
        wx.showModal({
          title: '功能暂未开放',
          content: `${section.sectionName}功能正在开发中，敬请期待！`,
          showCancel: false,
          confirmText: '知道了'
        });
      } else {
        // 跳转到对应页面
        wx.navigateTo({
          url: section.navigateUrl
        });
      }
    }
  },

  // 开始创作
  startCreating() {
    // 从sections数据中获取所有功能列表 (is_enabled=0表示显示)
    const enabledSections = this.data.sections.filter(section => section.isEnabled === 0);
    
    // 提取功能名称列表
    const itemList = enabledSections.map(section => section.sectionName);
    
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        const index = res.tapIndex;
        const selectedSection = enabledSections[index];
        
        if (selectedSection) {
          if (selectedSection.isDisabled === 1) {
            // 如果功能已禁用，显示提示
            wx.showModal({
              title: '功能暂未开放',
              content: `${selectedSection.sectionName}功能正在开发中，敬请期待！`,
              showCancel: false,
              confirmText: '知道了'
            });
          } else {
            // 跳转到对应页面
            wx.navigateTo({
              url: selectedSection.navigateUrl
            });
          }
        }
      }
    });
  },


});