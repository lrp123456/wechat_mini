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
    videoStyles: [
      { id: 'vlog', name: 'Vlog', description: '日常记录', preview: 'https://picsum.photos/200/200?random=10' },
      { id: 'cinematic', name: '电影感', description: '大片质感', preview: 'https://picsum.photos/200/200?random=11' },
      { id: 'minimal', name: '极简', description: '简约风格', preview: 'https://picsum.photos/200/200?random=12' },
      { id: 'dynamic', name: '动感', description: '节奏强烈', preview: 'https://picsum.photos/200/200?random=13' },
      { id: 'warm', name: '治愈', description: '温暖氛围', preview: 'https://picsum.photos/200/200?random=14' },
      { id: 'tech', name: '科技', description: '未来感', preview: 'https://picsum.photos/200/200?random=15' }
    ],
    selectedStyle: '',
    videoType: 'no-narration' as 'no-narration' | 'with-narration',
    bgmOptions: ['轻快', '激励', '舒缓', '电子', '无背景音乐'],
    selectedBgmIndex: -1,
    selectedBgm: '',
    duration: 15,
    generating: false,
    videoTasks: [] as any[]
  },

  onLoad() {
    this.loadTasks()
  },

  onShow() {
    this.loadTasks()
  },

  loadTasks() {
    const tasks = wx.getStorageSync('videoTasks') || []
    const videoTasks = tasks.map((t: any) => ({
      ...t,
      createdAtStr: formatTime(t.createdAt)
    }))
    this.setData({ videoTasks })
  },

  selectStyle(e: any) {
    this.setData({ selectedStyle: e.currentTarget.dataset.id })
  },

  setVideoType(e: any) {
    this.setData({ videoType: e.currentTarget.dataset.type })
  },

  onBgmChange(e: any) {
    const index = e.detail.value
    this.setData({
      selectedBgmIndex: index,
      selectedBgm: this.data.bgmOptions[index]
    })
  },

  onDurationChange(e: any) {
    this.setData({ duration: e.detail.value })
  },

  generateVideo() {
    if (!this.data.selectedStyle) {
      wx.showToast({ title: '请选择视频风格', icon: 'none' })
      return
    }

    const style = this.data.videoStyles.find(s => s.id === this.data.selectedStyle)
    const styleName = style ? style.name : ''

    this.setData({ generating: true })
    wx.showLoading({ title: '生成中...' })

    // 模拟生成过程
    const taskId = Date.now().toString()
    const newTask = {
      id: taskId,
      style: styleName,
      type: this.data.videoType,
      materials: [],
      bgm: this.data.selectedBgm,
      status: 'processing',
      progress: 0,
      createdAt: Date.now(),
      createdAtStr: '刚刚'
    }

    let tasks = wx.getStorageSync('videoTasks') || []
    tasks.unshift(newTask)
    wx.setStorageSync('videoTasks', tasks)
    this.setData({ videoTasks: [newTask, ...this.data.videoTasks] })

    // 模拟进度
    let progress = 0
    const interval = setInterval(() => {
      progress += 20
      const currentTasks = this.data.videoTasks.map(t => {
        if (t.id === taskId) {
          return { ...t, progress }
        }
        return t
      })
      this.setData({ videoTasks: currentTasks })

      if (progress >= 100) {
        clearInterval(interval)
        const completedTasks = currentTasks.map(t => {
          if (t.id === taskId) {
            return {
              ...t,
              status: 'completed',
              progress: 100,
              outputUrl: `https://picsum.photos/400/300?random=${Date.now()}`,
              completedAt: Date.now()
            }
          }
          return t
        })

        wx.setStorageSync('videoTasks', completedTasks)
        app.globalData.videoTasks = completedTasks
        app.addLog('video-generate', 'success', `生成${this.data.videoType === 'no-narration' ? '无解说' : '带解说'}视频：${styleName}`, { taskId })

        this.setData({
          generating: false,
          videoTasks: completedTasks
        })
        wx.hideLoading()
        wx.showToast({ title: '生成成功', icon: 'success' })
      }
    }, 600)
  },

  uploadVideo(e: any) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/upload/upload?videoId=${id}`
    })
  }
})
