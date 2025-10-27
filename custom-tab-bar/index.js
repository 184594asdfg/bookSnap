Component({
  data: {
    current: 0
  },
  lifetimes: {
    attached() {
      // 获取当前页面路径，设置对应的tab激活状态
      const pages = getCurrentPages();
      if (pages.length > 0) {
        const currentPage = pages[pages.length - 1];
        const route = currentPage.route;
        
        let currentIndex = 0;
        if (route === 'pages/announcement/index') {
          currentIndex = 1;
        } else if (route === 'pages/profile/index') {
          currentIndex = 2;
        }
        
        this.setData({
          current: currentIndex
        });
      }
    }
  },
  methods: {
    switchTab(e) {
      const path = e.currentTarget.dataset.path;
      const index = parseInt(e.currentTarget.dataset.index) || 0;
      
      this.setData({
        current: index
      });
      
      wx.switchTab({
        url: '/' + path
      });
    }
  }
})