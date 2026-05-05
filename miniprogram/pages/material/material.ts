const app = getApp<IAppOption>()

Page({
  data: {
    activeTab: 'all' as 'all' | 'image' | 'video' | 'audio',
    materials: [] as any[],
    filteredMaterials: [] as any[]
  },

  onLoad() {
    this.loadMaterials()
  },

  onShow() {
    this.loadMaterials()
  },

  loadMaterials() {
    const materials = wx.getStorageSync('materials') || []
    this.setData({ materials }, () => {
      this.filterMaterials()
    })
  },

  switchTab(e: any) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab }, () => {
      this.filterMaterials()
    })
  },

  filterMaterials() {
    const { materials, activeTab } = this.data
    let filtered = materials
    if (activeTab !== 'all') {
      filtered = materials.filter(m => m.type === activeTab)
    }
    this.setData({ filteredMaterials: filtered })
  },

  deleteMaterial(e: any) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条素材吗？',
      confirmColor: '#EA4335',
      success: (res) => {
        if (res.confirm) {
          const materials = this.data.materials.filter(m => m.id !== id)
          wx.setStorageSync('materials', materials)
          app.globalData.materials = materials
          app.updateStats()
          app.addLog('material-update', 'success', '删除素材', { materialId: id })
          this.setData({ materials }, () => {
            this.filterMaterials()
          })
          wx.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  },

  goToCrawler() {
    wx.navigateTo({ url: '/pages/crawler/crawler' })
  }
})
