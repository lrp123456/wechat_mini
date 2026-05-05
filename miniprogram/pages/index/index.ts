const app = getApp<IAppOption>()

Page({
  data: {
    stats: {
      totalMaterials: 0,
      availableMaterials: 0,
      audioMaterials: 0
    },
    platforms: [
      { id: 'pinterest', name: 'Pinterest' },
      { id: 'unsplash', name: 'Unsplash' },
      { id: 'pexels', name: 'Pexels' },
      { id: 'pixabay', name: 'Pixabay' }
    ],
    videoStyles: [
      { id: 'vlog', name: 'Vlog风格' },
      { id: 'cinematic', name: '电影感' },
      { id: 'minimal', name: '极简风' },
      { id: 'dynamic', name: '动感节奏' },
      { id: 'warm', name: '温暖治愈' }
    ],
    selectedPlatformIndex: -1,
    selectedPlatform: '',
    selectedStyleIndex: -1,
    selectedStyle: '',
    updating: false,
    generating: false
  },

  onLoad() {
    this.loadStats()
  },

  onShow() {
    this.loadStats()
  },

  loadStats() {
    const stats = app.globalData.stats
    this.setData({ stats })
  },

  onPlatformChange(e: any) {
    const index = e.detail.value
    const platform = this.data.platforms[index]
    this.setData({
      selectedPlatformIndex: index,
      selectedPlatform: platform.name
    })
  },

  onStyleChange(e: any) {
    const index = e.detail.value
    const style = this.data.videoStyles[index]
    this.setData({
      selectedStyleIndex: index,
      selectedStyle: style.name
    })
  },

  onUpdateMaterial() {
    if (!this.data.selectedPlatform) {
      wx.showToast({ title: '请选择更新平台', icon: 'none' })
      return
    }
    this.setData({ updating: true })
    wx.showLoading({ title: '更新中...' })

    setTimeout(() => {
      const newMaterials = [
        { id: Date.now().toString(), type: 'image' as const, url: `https://picsum.photos/400/300?random=${Date.now()}`, title: `${this.data.selectedPlatform}素材`, tags: ['新素材'], source: this.data.selectedPlatform, status: 'available' as const, createdAt: Date.now() }
      ]
      const materials = wx.getStorageSync('materials') || []
      materials.unshift(...newMaterials)
      wx.setStorageSync('materials', materials)
      app.globalData.materials = materials
      app.updateStats()
      app.addLog('material-update', 'success', `从 ${this.data.selectedPlatform} 更新了素材`, { count: newMaterials.length })

      this.setData({
        updating: false,
        stats: app.globalData.stats
      })
      wx.hideLoading()
      wx.showToast({ title: '更新成功', icon: 'success' })
    }, 2000)
  },

  onGenerateVideo(e: any) {
    const type = e.currentTarget.dataset.type
    if (!this.data.selectedStyle) {
      wx.showToast({ title: '请选择视频风格', icon: 'none' })
      return
    }
    this.setData({ generating: true })
    wx.showLoading({ title: '生成中...' })

    setTimeout(() => {
      const task = {
        id: Date.now().toString(),
        style: this.data.selectedStyle,
        type: type as 'no-narration' | 'with-narration',
        materials: [],
        status: 'completed' as const,
        progress: 100,
        outputUrl: `https://picsum.photos/400/300?random=${Date.now()}`,
        createdAt: Date.now(),
        completedAt: Date.now()
      }
      const tasks = wx.getStorageSync('videoTasks') || []
      tasks.unshift(task)
      wx.setStorageSync('videoTasks', tasks)
      app.globalData.videoTasks = tasks
      app.addLog('video-generate', 'success', `生成${type === 'no-narration' ? '无解说' : '带解说'}视频：${this.data.selectedStyle}`, { taskId: task.id })

      this.setData({ generating: false })
      wx.hideLoading()
      wx.showToast({ title: '生成成功', icon: 'success' })

      wx.navigateTo({ url: '/pages/video/video' })
    }, 3000)
  },

  navigateTo(e: any) {
    const page = e.currentTarget.dataset.page
    const urlMap: Record<string, string> = {
      crawler: '/pages/crawler/crawler',
      material: '/pages/material/material',
      video: '/pages/video/video',
      upload: '/pages/upload/upload'
    }
    wx.navigateTo({ url: urlMap[page] })
  }
})
