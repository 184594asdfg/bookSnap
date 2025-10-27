// pages/profile/index.js
Page({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '',
      isLogin: false,
      isVip: false
    },
    userStats: {
      processedCount: 0,
      templateCount: 0,
      favoriteCount: 0
    },
    recentActivities: []
  },

  onLoad(options) {
    console.log('个人中心页面加载', options);
    this.loadUserData();
  },

  onShow() {
    // 每次显示页面时检查登录状态
    this.checkLoginStatus();
  },

  // 加载用户数据
  loadUserData() {
    // 从本地存储获取用户数据
    const userInfo = wx.getStorageSync('userInfo') || {};
    const userStats = wx.getStorageSync('userStats') || {};
    const recentActivities = wx.getStorageSync('recentActivities') || [];

    this.setData({
      userInfo: {
        ...this.data.userInfo,
        ...userInfo,
        isLogin: !!userInfo.nickName
      },
      userStats: {
        ...this.data.userStats,
        ...userStats
      },
      recentActivities: recentActivities.slice(0, 5) // 只显示最近5条
    });
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    if (userInfo.nickName && !this.data.userInfo.isLogin) {
      this.loadUserData();
    }
  },

  // 登录
  login() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        console.log('获取用户信息成功', res);
        
        const userInfo = {
          avatarUrl: res.userInfo.avatarUrl,
          nickName: res.userInfo.nickName,
          isLogin: true,
          isVip: false
        };

        // 保存到本地存储
        wx.setStorageSync('userInfo', userInfo);
        
        // 初始化用户统计数据
        const userStats = {
          processedCount: 0,
          templateCount: 0,
          favoriteCount: 0
        };
        wx.setStorageSync('userStats', userStats);

        this.setData({
          userInfo: userInfo,
          userStats: userStats
        });

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('获取用户信息失败', err);
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        });
      }
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的用户数据
          wx.removeStorageSync('userInfo');
          
          this.setData({
            userInfo: {
              avatarUrl: '',
              nickName: '',
              isLogin: false,
              isVip: false
            },
            userStats: {
              processedCount: 0,
              templateCount: 0,
              favoriteCount: 0
            },
            recentActivities: []
          });

          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 升级VIP
  upgradeVip() {
    if (!this.data.userInfo.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '升级VIP会员',
      content: 'VIP会员可享受无限次去水印处理、高清视频导出等特权。月费29.9元，年费299元。',
      confirmText: '立即升级',
      cancelText: '再想想',
      success: (res) => {
        if (res.confirm) {
          // 模拟升级过程
          wx.showLoading({
            title: '正在升级...'
          });

          setTimeout(() => {
            wx.hideLoading();
            
            const userInfo = {
              ...this.data.userInfo,
              isVip: true
            };
            
            wx.setStorageSync('userInfo', userInfo);
            this.setData({ userInfo });

            wx.showToast({
              title: '升级成功！',
              icon: 'success'
            });
          }, 2000);
        }
      }
    });
  },

  // 导航到处理历史
  navigateToHistory() {
    if (!this.data.userInfo.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    wx.navigateTo({
      url: '/pages/history/index'
    });
  },

  // 导航到我的收藏
  navigateToFavorites() {
    if (!this.data.userInfo.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    wx.navigateTo({
      url: '/pages/favorites/index'
    });
  },

  // 导航到我的模板
  navigateToTemplates() {
    if (!this.data.userInfo.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    wx.navigateTo({
      url: '/pages/my-templates/index'
    });
  },

  // 导航到设置
  navigateToSettings() {
    wx.navigateTo({
      url: '/pages/settings/index'
    });
  },

  // 查看全部活动
  viewAllActivities() {
    if (!this.data.userInfo.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    wx.navigateTo({
      url: '/pages/activities/index'
    });
  },

  // 意见反馈
  giveFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/index'
    });
  },

  // 添加活动记录（供其他页面调用）
  addActivity(activity) {
    if (!this.data.userInfo.isLogin) return;

    const activities = wx.getStorageSync('recentActivities') || [];
    activities.unshift({
      id: Date.now(),
      ...activity,
      time: this.formatTime(new Date())
    });

    // 只保留最近50条记录
    const recentActivities = activities.slice(0, 50);
    wx.setStorageSync('recentActivities', recentActivities);

    this.setData({
      recentActivities: recentActivities.slice(0, 5)
    });
  },

  // 更新用户统计（供其他页面调用）
  updateUserStats(stats) {
    if (!this.data.userInfo.isLogin) return;

    const userStats = {
      ...this.data.userStats,
      ...stats
    };

    wx.setStorageSync('userStats', userStats);
    this.setData({ userStats });
  },

  // 格式化时间
  formatTime(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return Math.floor(diff / 60000) + '分钟前';
    } else if (diff < 86400000) { // 1天内
      return Math.floor(diff / 3600000) + '小时前';
    } else {
      return date.getMonth() + 1 + '月' + date.getDate() + '日';
    }
  },

  // 用户分享
  onShareAppMessage() {
    return {
      title: '书单助手 - 专业的视频处理工具',
      path: '/pages/home/index',
      imageUrl: '/images/share-profile.jpg'
    };
  }
});