// pages/announcement/index.js
Page({
  data: {
    // 输入框字符计数
    charCount: 0,
    // 建议内容
    suggestionContent: "",
    // 建议列表
    suggestions: [
      {
        id: 1,
        content: "希望增加更多书籍封面模板，特别是文学类书籍",
        time: "2小时前",
        votes: 15
      },
      {
        id: 2,
        content: "建议添加视频背景音乐库功能",
        time: "1天前",
        votes: 8
      },
      {
        id: 3,
        content: "希望支持更多视频格式的导入",
        time: "3天前",
        votes: 12
      }
    ]
  },

  onLoad() {
    console.log('公告页面加载');
  },

  onShow() {
    console.log('公告页面显示');
  },

  // 输入框内容变化
  onSuggestionInput(e) {
    const content = e.detail.value;
    this.setData({
      suggestionContent: content,
      charCount: content.length
    });
  },

  // 提交建议
  submitSuggestion() {
    const { suggestionContent, suggestions } = this.data;
    
    if (!suggestionContent.trim()) {
      wx.showToast({
        title: '请输入建议内容',
        icon: 'none'
      });
      return;
    }

    if (suggestionContent.length < 5) {
      wx.showToast({
        title: '建议内容至少5个字',
        icon: 'none'
      });
      return;
    }

    // 模拟提交成功
    const newSuggestion = {
      id: Date.now(),
      content: suggestionContent,
      time: '刚刚',
      votes: 0
    };

    this.setData({
      suggestions: [newSuggestion, ...suggestions],
      suggestionContent: '',
      charCount: 0
    });

    wx.showToast({
      title: '提交成功',
      icon: 'success',
      duration: 2000
    });

    // 清空输入框
    setTimeout(() => {
      this.setData({
        suggestionContent: '',
        charCount: 0
      });
    }, 500);
  },

  // 投票功能
  voteSuggestion(e) {
    const id = e.currentTarget.dataset.id;
    const { suggestions } = this.data;
    
    const updatedSuggestions = suggestions.map(item => {
      if (item.id === id) {
        return {
          ...item,
          votes: item.votes + 1
        };
      }
      return item;
    });

    // 按投票数排序
    updatedSuggestions.sort((a, b) => b.votes - a.votes);

    this.setData({
      suggestions: updatedSuggestions
    });

    wx.showToast({
      title: '投票成功',
      icon: 'success',
      duration: 1000
    });
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '书单助手 - 官方公告与功能建议',
      path: '/pages/announcement/index'
    };
  }
})