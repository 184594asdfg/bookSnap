// pages/covers/index.js
Page({
  data: {
    searchKeyword: '',
    categories: [
      { id: 1, name: '全部', value: 'all', active: true },
      { id: 2, name: '个人成长', value: 'personal_growth', active: false },
      { id: 3, name: '文学艺术', value: 'literature_art', active: false },
      { id: 4, name: '商业职场', value: 'business_career', active: false },
      { id: 5, name: '生活美学', value: 'life_aesthetics', active: false },
      { id: 6, name: '知识科普', value: 'knowledge_science', active: false }
    ],
    filters: [],
    coverList: [],
    hasMore: true,
    showPreview: false,
    previewCover: null,
    currentPage: 1,
    pageSize: 20,
    isLoading: false
  },

  onLoad(options) {
    console.log('封面素材库页面加载', options);
    this.loadCovers();
  },

  // 搜索输入事件
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  // 搜索框获得焦点
  onSearchFocus(e) {
    this.setData({
      searchFocused: true
    });
  },

  // 搜索框失去焦点
  onSearchBlur(e) {
    this.setData({
      searchFocused: false
    });
  },

  // 执行搜索
  onSearch() {
    const { searchKeyword } = this.data;
    console.log('执行搜索，关键词:', searchKeyword);
    
    if (searchKeyword && searchKeyword.trim()) {
      this.loadCovers(true);
    } else {
      // 如果搜索关键词为空，显示所有数据
      this.setData({
        searchKeyword: ''
      });
      this.loadCovers(true);
    }
  },

  // 分类点击
  onCategoryClick(e) {
    const categoryValue = e.currentTarget.dataset.category;
    const categories = this.data.categories.map(category => ({
      ...category,
      active: category.value === categoryValue
    }));

    this.setData({ categories });
    this.loadCovers(true);
  },

  // 筛选点击
  onFilterClick(e) {
    const filterValue = e.currentTarget.dataset.filter;
    const filters = this.data.filters.map(filter => ({
      ...filter,
      active: filter.value === filterValue
    }));

    this.setData({ filters });
    this.loadCovers(true);
  },



  // 生成COS图片URL
  generateImageUrl(fileName) {
    if (!fileName) return '';
    
    // COS配置信息
    const bucket = 'booksnap-1353983545';
    const region = 'ap-beijing';
    const folder = 'bookImg';
    
    // 直接使用文件名，因为API返回的文件名已经包含扩展名
    const finalFileName = fileName;
    
    // 生成完整的COS URL
    const cosUrl = `https://${bucket}.cos.${region}.myqcloud.com/${folder}/${finalFileName}`;
    console.log('生成的图片URL:', cosUrl);
    return cosUrl;
  },




  // 加载封面数据
  loadCovers(reset = false) {
    if (this.data.isLoading) return;
    
    this.setData({
      isLoading: true
    });

    const { currentPage, pageSize, searchKeyword } = this.data;
    const page = reset ? 1 : currentPage;
    
    // 获取当前选中的分类和筛选条件
    const selectedCategory = this.data.categories.find(cat => cat.active)?.value || 'all';
    const selectedFilter = this.data.filters.find(filter => filter.active)?.value || 'new';
    
    // 构建请求参数
    const params = {
      page: page,
      limit: pageSize,
      sort: selectedFilter
    };
    
    // 只有当分类不是'全部'时才传递category参数
    if (selectedCategory !== 'all') {
      params.category = selectedCategory;
    }
    
    // 暂时不传递搜索参数，因为API搜索功能可能有问题
    // if (searchKeyword) {
    //   params.search = searchKeyword;
    // }

    console.log('开始请求API，参数:', params);
    
    // 调用API接口
    wx.request({
      url: 'http://localhost:3002/api/cover-materials',
      data: params,
      method: 'GET',
      success: (res) => {
        console.log('API响应状态码:', res.statusCode);
        console.log('API响应数据:', res.data);
        
        if (res.statusCode === 200 && res.data && res.data.success) {
          const responseData = res.data.data;
          let newCovers = responseData.list || [];
          
          // 如果API返回空数据，显示空状态
          if (newCovers.length === 0) {
            this.setData({
              coverList: [],
              currentPage: 1,
              hasMore: false
            });
            return;
          }
          
          // 如果有关键词，在前端进行搜索过滤
          if (searchKeyword && searchKeyword.trim()) {
            const keyword = searchKeyword.toLowerCase().trim();
            newCovers = newCovers.filter(cover => 
              cover.title.toLowerCase().includes(keyword) ||
              (cover.author && cover.author.toLowerCase().includes(keyword))
            );
          }
          
          // 处理图片URL，直接使用接口返回的图片数据
          const processedCovers = newCovers.map(cover => ({
            ...cover,
            image: cover.file_name ? this.generateImageUrl(cover.file_name) : '',
            author: cover.author || '未知作者'
          }));
          
          if (reset) {
            this.setData({
              coverList: processedCovers,
              currentPage: 1,
              hasMore: responseData.total > processedCovers.length
            });
          } else {
            this.setData({
              coverList: [...this.data.coverList, ...processedCovers],
              currentPage: page,
              hasMore: responseData.total > this.data.coverList.length + processedCovers.length
            });
          }
        } else {
          wx.showToast({
            title: '数据加载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({
          isLoading: false
        });
        wx.hideLoading();
      }
    });
  },



  // 预览封面
  previewCover(e) {
    const cover = e.currentTarget.dataset.cover;
    this.setData({
      showPreview: true,
      previewCover: cover
    });
  },

  // 关闭预览
  closePreview() {
    this.setData({
      showPreview: false,
      previewCover: null
    });
  },

  // 收藏封面
  favoriteCover(e) {
    const coverId = e.currentTarget.dataset.id;
    const coverList = this.data.coverList.map(cover => 
      cover.material_id === coverId ? { ...cover, isFavorite: !cover.isFavorite } : cover
    );

    this.setData({ coverList });

    wx.showToast({
      title: coverList.find(c => c.material_id === coverId).isFavorite ? '收藏成功' : '取消收藏',
      icon: 'success'
    });
  },

  // 下载封面 - 保存到手机相册
  downloadCover(e) {
    const coverId = e.currentTarget.dataset.id;
    const cover = this.data.coverList.find(c => c.material_id === coverId);
    
    if (!cover || !cover.image) {
      wx.showToast({
        title: '图片不可用',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '下载中...'
    });

    // 下载图片到临时文件
    wx.downloadFile({
      url: cover.image,
      success: (res) => {
        if (res.statusCode === 200) {
          // 保存到手机相册
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.hideLoading();
              wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 2000
              });
            },
            fail: (err) => {
              wx.hideLoading();
              console.error('保存失败:', err);
              
              // 检查是否授权
              if (err.errMsg.includes('auth deny')) {
                wx.showModal({
                  title: '需要相册权限',
                  content: '请授权访问相册以保存图片',
                  success: (modalRes) => {
                    if (modalRes.confirm) {
                      wx.openSetting({
                        success: (settingRes) => {
                          console.log('设置页面打开结果:', settingRes);
                        }
                      });
                    }
                  }
                });
              } else {
                wx.showToast({
                  title: '保存失败',
                  icon: 'none'
                });
              }
            }
          });
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('下载失败:', err);
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        });
      }
    });
  },

  // 下载预览封面
  downloadPreview() {
    const { previewCover } = this.data;

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

  // 使用封面
  useCover() {
    const { previewCover } = this.data;

    wx.showModal({
      title: '使用封面',
      content: '确定要使用这个封面吗？',
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

  // 加载更多
  loadMore() {
    if (!this.data.hasMore || this.data.isLoading) return;
    
    this.setData({
      currentPage: this.data.currentPage + 1
    });
    
    this.loadCovers(false);
  },

  // 用户分享
  onShareAppMessage() {
    return {
      title: '书单助手 - 丰富的书籍封面素材库',
      path: '/pages/covers/index',
      imageUrl: '/images/share-covers.jpg'
    };
  },


});