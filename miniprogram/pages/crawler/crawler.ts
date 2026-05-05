const app = getApp<IAppOption>()

Page({
  data: {
    keyword: '',
    count: '',
    filter: 'like' as 'like' | 'save' | 'comments',
    submitting: false,
    results: [] as Array<{
      id: string;
      url: string;
      title: string;
      likes: number;
      saves: number;
      selected: boolean;
    }>,
    showEmpty: true,
    selectedCount: 0
  },

  onKeywordInput(e: any) {
    this.setData({ keyword: e.detail.value })
  },

  onCountInput(e: any) {
    this.setData({ count: e.detail.value })
  },

  onFilterChange(e: any) {
    this.setData({ filter: e.currentTarget.dataset.filter })
  },

  onSubmit() {
    if (!this.data.keyword.trim()) {
      wx.showToast({ title: '请输入查询词', icon: 'none' })
      return
    }
    if (!this.data.count || parseInt(this.data.count) <= 0) {
      wx.showToast({ title: '请输入有效的爬取数量', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '爬取中...' })

    // 模拟爬取
    setTimeout(() => {
      const count = parseInt(this.data.count)
      const results = Array.from({ length: Math.min(count, 8) }, (_, i) => ({
        id: `crawler_${Date.now()}_${i}`,
        url: `https://picsum.photos/400/300?random=${Date.now() + i}`,
        title: `${this.data.keyword} ${i + 1}`,
        likes: Math.floor(Math.random() * 1000) + 100,
        saves: Math.floor(Math.random() * 500) + 50,
        selected: false
      }))

      app.addLog('crawler', 'success', `Pinterest爬取完成：${this.data.keyword}`, {
        keyword: this.data.keyword,
        count: results.length,
        filter: this.data.filter
      })

      this.setData({
        submitting: false,
        results,
        showEmpty: false,
        selectedCount: 0
      })
      wx.hideLoading()
      wx.showToast({ title: `爬取成功 ${results.length} 条`, icon: 'success' })
    }, 2500)
  },

  toggleSelect(e: any) {
    const id = e.currentTarget.dataset.id
    const results = this.data.results.map(item => {
      if (item.id === id) {
        return { ...item, selected: !item.selected }
      }
      return item
    })
    const selectedCount = results.filter(r => r.selected).length
    this.setData({ results, selectedCount })
  },

  importSelected() {
    const selected = this.data.results.filter(r => r.selected)
    const materials = wx.getStorageSync('materials') || []

    const newMaterials = selected.map(item => ({
      id: item.id,
      type: 'image' as const,
      url: item.url,
      title: item.title,
      tags: [this.data.keyword, 'Pinterest'],
      source: 'Pinterest',
      status: 'available' as const,
      createdAt: Date.now(),
      metadata: { width: 400, height: 300 }
    }))

    materials.unshift(...newMaterials)
    wx.setStorageSync('materials', materials)
    app.globalData.materials = materials
    app.updateStats()

    app.addLog('material-update', 'success', `从 Pinterest 导入 ${selected.length} 条素材`, {
      keyword: this.data.keyword,
      count: selected.length
    })

    wx.showToast({ title: `导入成功 ${selected.length} 条`, icon: 'success' })

    // 重置选中状态
    this.setData({
      results: this.data.results.map(r => ({ ...r, selected: false })),
      selectedCount: 0
    })
  }
})
