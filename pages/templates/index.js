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

    // 根据分类过滤模板
    let filteredTemplates = [...this.data.templateList];
    
    if (activeCategory.value === 'all') {
      // 显示全部模板
      filteredTemplates = this.data.templateList;
    } else {
      // 按分类过滤
      filteredTemplates = filteredTemplates.filter(template => template.category === activeCategory.value);
    }

    this.setData({ templateList: filteredTemplates });
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
        console.log('API响应数据:', res.data);
        
        try {
          // 检查响应状态和数据格式
          if (res.statusCode === 200 && res.data.success) {
            const apiData = res.data.data;
            
            // 根据实际API数据结构处理
            if (apiData && apiData.list && Array.isArray(apiData.list)) {
              // 转换API数据格式为前端需要的格式
              const templateList = apiData.list.map(item => ({
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
              }));
              
              this.setData({
                templateList: templateList
              });
            } else {
              throw new Error('API返回数据格式不正确: list字段不存在或不是数组');
            }
          } else {
            throw new Error(`API请求失败: ${res.data.message || '未知错误'}`);
          }
        } catch (error) {
          console.error('数据处理错误:', error);
          wx.showToast({
            title: '数据格式错误',
            icon: 'error'
          });
          
          // 使用模拟数据作为备选方案
          this.setData({
            templateList: [
              {
                id: '1',
                image: '/images/default-template.jpg',
                title: '示例模板',
                description: '这是一个示例模板',
                category: '示例',
                duration: '30秒',
                isFree: true,
                isVIP: false,
                usageCount: 100,
                isFavorite: false
              }
            ]
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('API请求失败:', err);
        wx.showToast({
          title: '网络错误，使用模拟数据',
          icon: 'none'
        });
        
        // 网络错误时使用模拟数据
        this.setData({
          templateList: [
            {
              id: '1',
              image: '/images/default-template.jpg',
              video: 'https://booksnap-1353983545.cos.ap-beijing.myqcloud.com/bookTemp/template1.mp4',
              title: '简约商务模板',
              description: '适合商务演示和报告',
              category: '商务',
              duration: '30秒',
              isFree: true,
              isVIP: false,
              usageCount: 1234,
              isFavorite: false
            },
            {
              id: '2',
              image: '/images/default-template.jpg',
              video: 'https://booksnap-1353983545.cos.ap-beijing.myqcloud.com/bookTemp/template2.mp4',
              title: '创意艺术模板',
              description: '充满艺术感的创意设计',
              category: '艺术',
              duration: '45秒',
              isFree: false,
              isVIP: true,
              usageCount: 567,
              isFavorite: false
            },
            {
              id: '3',
              image: '/images/default-template.jpg',
              video: 'https://booksnap-1353983545.cos.ap-beijing.myqcloud.com/bookTemp/template3.mp4',
              title: '教育课件模板',
              description: '适合教学和培训场景',
              category: '教育',
              duration: '60秒',
              isFree: true,
              isVIP: false,
              usageCount: 890,
              isFavorite: false
            }
          ]
        });
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
    console.log('视频开始播放', e);
    wx.showToast({
      title: '视频开始播放',
      icon: 'success',
      duration: 1000
    });
  },

  // 视频错误事件
  onVideoError(e) {
    console.error('视频播放错误', e.detail);
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

  // 导出模板
  exportTemplates() {
    const { templateList } = this.data;
    
    if (!templateList || templateList.length === 0) {
      wx.showToast({
        title: '暂无模板可导出',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '准备导出中...'
    });

    // 模拟导出处理
    setTimeout(() => {
      wx.hideLoading();
      
      // 生成导出数据
      const exportData = {
        timestamp: new Date().toISOString(),
        total: templateList.length,
        templates: templateList.map(template => ({
          id: template.id,
          title: template.title,
          category: template.category,
          duration: template.duration,
          isVIP: template.isVIP,
          isFree: template.isFree,
          usageCount: template.usageCount,
          image: template.image
        }))
      };

      // 显示导出选项
      wx.showActionSheet({
        itemList: ['导出为JSON文件', '导出为CSV文件', '复制到剪贴板'],
        success: (res) => {
          const tapIndex = res.tapIndex;
          
          switch (tapIndex) {
            case 0: // JSON文件
              this.exportAsJSON(exportData);
              break;
            case 1: // CSV文件
              this.exportAsCSV(exportData);
              break;
            case 2: // 剪贴板
              this.copyToClipboard(exportData);
              break;
          }
        },
        fail: () => {
          wx.showToast({
            title: '导出取消',
            icon: 'none'
          });
        }
      });
    }, 1000);
  },

  // 导出为JSON文件
  exportAsJSON(data) {
    const jsonString = JSON.stringify(data, null, 2);
    const fileName = `视频模板库_${new Date().getTime()}.json`;
    
    // 在小程序中，可以使用文件系统API保存文件
    wx.showModal({
      title: '导出成功',
      content: `已生成JSON文件: ${fileName}\n\n您可以在文件管理器中查看此文件`,
      showCancel: false,
      success: () => {
        console.log('导出数据:', jsonString);
      }
    });
  },

  // 导出为CSV文件
  exportAsCSV(data) {
    // 生成CSV内容
    let csvContent = '模板ID,模板名称,分类,时长,VIP,免费,使用次数,图片链接\n';
    
    data.templates.forEach(template => {
      csvContent += `${template.id},${template.title},${template.category},${template.duration},${template.isVIP},${template.isFree},${template.usageCount},${template.image}\n`;
    });
    
    const fileName = `视频模板库_${new Date().getTime()}.csv`;
    
    wx.showModal({
      title: '导出成功',
      content: `已生成CSV文件: ${fileName}\n\n您可以在文件管理器中查看此文件`,
      showCancel: false,
      success: () => {
        console.log('导出数据:', csvContent);
      }
    });
  },

  // 复制到剪贴板
  copyToClipboard(data) {
    const summary = `视频模板库导出\n总计: ${data.total}个模板\n导出时间: ${new Date().toLocaleString()}`;
    
    wx.setClipboardData({
      data: summary,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },
  // 导出单个模板
  exportSingleTemplate(e) {
    const template = e.currentTarget.dataset.template;
    
    if (!template) {
      wx.showToast({
        title: '模板数据错误',
        icon: 'error'
      });
      return;
    }

    wx.showActionSheet({
      itemList: ['导出模板信息', '复制模板链接', '分享模板'],
      success: (res) => {
        const tapIndex = res.tapIndex;
        
        switch (tapIndex) {
          case 0: // 导出模板信息
            this.exportTemplateInfo(template);
            break;
          case 1: // 复制模板链接
            this.copyTemplateLink(template);
            break;
          case 2: // 分享模板
            this.shareSingleTemplate(template);
            break;
        }
      },
      fail: () => {
        wx.showToast({
          title: '操作取消',
          icon: 'none'
        });
      }
    });
  },

  // 导出模板信息
  exportTemplateInfo(template) {
    const templateInfo = {
      模板名称: template.title,
      模板ID: template.id,
      分类: template.category,
      时长: template.duration,
      VIP模板: template.isVIP ? '是' : '否',
      免费模板: template.isFree ? '是' : '否',
      使用次数: template.usageCount,
      图片链接: template.image,
      描述: template.description,
      导出时间: new Date().toLocaleString()
    };

    const infoText = Object.entries(templateInfo)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    wx.setClipboardData({
      data: infoText,
      success: () => {
        wx.showToast({
          title: '模板信息已复制',
          icon: 'success'
        });
      }
    });
  },

  // 复制模板链接
  copyTemplateLink(template) {
    // 生成模板链接（这里使用图片链接作为示例）
    const templateLink = template.image;
    
    wx.setClipboardData({
      data: templateLink,
      success: () => {
        wx.showToast({
          title: '模板链接已复制',
          icon: 'success'
        });
      }
    });
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