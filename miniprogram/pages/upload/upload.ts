const app = getApp<IAppOption>()

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return `${date.getMonth() + 1}/${date.getDate()}`
}

Page({
  data: {
    videoTasks: [] as any[],
    selectedVideo: null as any,
    platforms: [
      { id: 'douyin', name: '抖音', icon: '抖', enabled: true, selected: false },
      { id: 'kuaishou', name: '快手', icon: '快', enabled: true, selected: false },
      { id: 'xiaohongshu', name: '小红书', icon: '红', enabled: true, selected: false },
      { id: 'bilibili', name: 'B站', icon: 'B', enabled: false, selected: false }
    ],
    selectedPlatforms: [] as string[],
    uploadTitle: '',
    uploadDesc: '',
    uploadTags: '',
    uploading: false,
    uploadTasks: [] as any[]
  },

  onLoad(options: any) {
    this.loadVideoTasks()
    this.loadUploadTasks()

    if (options.videoId) {
      const tasks = wx.getStorageSync('videoTasks') || []
      const video = tasks.find((t: any) => t.id === options.videoId)
      if (video) {
        this.setData({
          selectedVideo: { ...video, createdAtStr: formatTime(video.createdAt) }
        })
      }
    }
  },

  onShow() {
    this.loadVideoTasks()
    this.loadUploadTasks()
  },

  loadVideoTasks() {
    const tasks = wx.getStorageSync('videoTasks') || []
    const videoTasks = tasks
      .filter((t: any) => t.status === 'completed')
      .map((t: any) => ({
        ...t,
        createdAtStr: formatTime(t.createdAt)
      }))
    this.setData({ videoTasks })
  },

  loadUploadTasks() {
    const tasks = wx.getStorageSync('uploadTasks') || []
    const uploadTasks = tasks.map((t: any) => ({
      ...t,
      platformList: t.platforms.map((p: string) => {
        const platform = this.data.platforms.find(pl => pl.id === p)
        return {
          id: p,
          name: platform?.name || p,
          status: t.results?.[p]?.status || t.status,
          progress: t.progress?.[p] || 0
        }
      })
    }))
    this.setData({ uploadTasks })
  },

  selectVideo(e: any) {
    const id = e.currentTarget.dataset.id
    const video = this.data.videoTasks.find((t: any) => t.id === id)
    if (video) {
      this.setData({ selectedVideo: video })
    }
  },

  changeVideo() {
    this.setData({
      selectedVideo: null,
      platforms: this.data.platforms.map(p => ({ ...p, selected: false })),
      selectedPlatforms: []
    })
  },

  togglePlatform(e: any) {
    const id = e.currentTarget.dataset.id
    const platform = this.data.platforms.find(p => p.id === id)
    if (!platform || !platform.enabled) return

    const platforms = this.data.platforms.map(p => {
      if (p.id === id) {
        return { ...p, selected: !p.selected }
      }
      return p
    })
    const selectedPlatforms = platforms.filter(p => p.selected).map(p => p.id)
    this.setData({ platforms, selectedPlatforms })
  },

  onTitleInput(e: any) {
    this.setData({ uploadTitle: e.detail.value })
  },

  onDescInput(e: any) {
    this.setData({ uploadDesc: e.detail.value })
  },

  onTagsInput(e: any) {
    this.setData({ uploadTags: e.detail.value })
  },

  startUpload() {
    if (!this.data.uploadTitle.trim()) {
      wx.showToast({ title: '请输入视频标题', icon: 'none' })
      return
    }

    this.setData({ uploading: true })
    wx.showLoading({ title: '上传中...' })

    const taskId = Date.now().toString()
    const newTask = {
      id: taskId,
      videoId: this.data.selectedVideo.id,
      title: this.data.uploadTitle,
      desc: this.data.uploadDesc,
      tags: this.data.uploadTags,
      platforms: this.data.selectedPlatforms,
      status: 'uploading',
      progress: {} as Record<string, number>,
      results: {} as Record<string, { status: string; url?: string }>,
      createdAt: Date.now()
    }

    // 初始化进度
    this.data.selectedPlatforms.forEach((p: string) => {
      newTask.progress[p] = 0
      newTask.results[p] = { status: 'uploading' }
    })

    let tasks = wx.getStorageSync('uploadTasks') || []
    tasks.unshift(newTask)
    wx.setStorageSync('uploadTasks', tasks)
    this.loadUploadTasks()

    // 模拟上传进度
    let progress = 0
    const interval = setInterval(() => {
      progress += 25
      const currentTasks = (wx.getStorageSync('uploadTasks') || []).map((t: any) => {
        if (t.id === taskId) {
          const newProgress = { ...t.progress }
          this.data.selectedPlatforms.forEach((p: string) => {
            newProgress[p] = Math.min(progress, 100)
          })
          return { ...t, progress: newProgress }
        }
        return t
      })
      wx.setStorageSync('uploadTasks', currentTasks)
      this.loadUploadTasks()

      if (progress >= 100) {
        clearInterval(interval)
        const completedTasks = currentTasks.map((t: any) => {
          if (t.id === taskId) {
            const results: Record<string, { status: string; url?: string }> = {}
            this.data.selectedPlatforms.forEach((p: string) => {
              results[p] = { status: 'completed', url: `https://example.com/${p}/${taskId}` }
            })
            return {
              ...t,
              status: 'completed',
              progress: Object.fromEntries(this.data.selectedPlatforms.map((p: string) => [p, 100])),
              results
            }
          }
          return t
        })

        wx.setStorageSync('uploadTasks', completedTasks)
        app.globalData.uploadTasks = completedTasks
        app.addLog('upload', 'success', `上传视频到 ${this.data.selectedPlatforms.length} 个平台`, {
          taskId,
          platforms: this.data.selectedPlatforms,
          title: this.data.uploadTitle
        })

        this.setData({ uploading: false })
        this.loadUploadTasks()
        wx.hideLoading()
        wx.showToast({ title: '上传成功', icon: 'success' })
      }
    }, 800)
  },

  goToVideo() {
    wx.navigateTo({ url: '/pages/video/video' })
  }
})
