// pages/home/index.js
Page({
  data: {
    // 页面数据
    searchValue: ""
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

  // 加载首页数据
  loadHomeData() {
    return new Promise((resolve) => {
      // 模拟数据加载
      setTimeout(() => {
        console.log('首页数据加载完成');
        resolve();
      }, 500);
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

  // 导航到去水印页面（功能暂未实现）
  gotoWatermark() {
    wx.showModal({
      title: '功能暂未开放',
      content: '去水印功能正在开发中，敬请期待！',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 导航到文案提取页面（功能暂未实现）
  gotoTextExtract() {
    wx.showModal({
      title: '功能暂未开放',
      content: '文案提取功能正在开发中，敬请期待！',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 导航到封面素材页面
  gotoCovers() {
    wx.navigateTo({
      url: '/pages/covers/index'
    });
  },

  // 导航到视频模板页面
  gotoTemplates() {
    wx.navigateTo({
      url: '/pages/templates/index'
    });
  },

  // 导航到热门素材页面（功能暂未实现）
  gotoHotMaterials() {
    wx.showModal({
      title: '功能暂未开放',
      content: '热门素材功能正在开发中，敬请期待！',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 导航到推荐字体页面（功能暂未实现）
  gotoFonts() {
    wx.showModal({
      title: '功能暂未开放',
      content: '推荐字体功能正在开发中，敬请期待！',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 开始创作
  startCreating() {
    wx.showActionSheet({
      itemList: ['去水印', '文案提取', '封面素材', '视频模板'],
      success: (res) => {
        const index = res.tapIndex;
        
        // 检查是否选择了已禁用的功能
        if (index === 0 || index === 1) {
          wx.showModal({
            title: '功能暂未开放',
            content: index === 0 ? '去水印功能正在开发中，敬请期待！' : '文案提取功能正在开发中，敬请期待！',
            showCancel: false,
            confirmText: '知道了'
          });
          return;
        }
        
        const urls = [
          null, // 去水印（已禁用）
          null, // 文案提取（已禁用）
          '/pages/covers/index',
          '/pages/templates/index'
        ];
        
        if (urls[index]) {
          wx.navigateTo({
            url: urls[index]
          });
        }
      }
    });
  },


});