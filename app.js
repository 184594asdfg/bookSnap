// app.js
App({
  onLaunch() {
    // 小程序启动时的初始化逻辑
    console.log('书单助手小程序启动');
    
    // 检查登录状态
    this.checkLoginStatus();
  },
  
  onShow() {
    // 小程序显示时的逻辑
    console.log('书单助手小程序显示');
  },
  
  onHide() {
    // 小程序隐藏时的逻辑
    console.log('书单助手小程序隐藏');
  },
  
  checkLoginStatus() {
    // 检查用户登录状态
    const token = wx.getStorageSync('token');
    if (!token) {
      // 未登录，可以跳转到登录页面或显示登录提示
      console.log('用户未登录');
    } else {
      console.log('用户已登录');
    }
  },
  
  globalData: {
    userInfo: null,
    baseUrl: 'https://api.example.com', // 后端API地址
    version: '1.0.0'
  }
});