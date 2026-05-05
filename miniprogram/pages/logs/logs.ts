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
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const typeNameMap: Record<string, string> = {
  'crawler': '采集',
  'material-update': '素材',
  'video-generate': '视频',
  'upload': '上传'
}

const statusNameMap: Record<string, string> = {
  'success': '成功',
  'failed': '失败',
  'processing': '处理中'
}

Page({
  data: {
    activeFilter: 'all' as string,
    logs: [] as any[],
    filteredLogs: [] as any[],
    stats: {
      total: 0,
      success: 0,
      failed: 0
    }
  },

  onLoad() {
    this.loadLogs()
  },

  onShow() {
    this.loadLogs()
  },

  loadLogs() {
    const logs = wx.getStorageSync('workflowLogs') || []
    const processedLogs = logs.map((log: any) => ({
      ...log,
      typeName: typeNameMap[log.type] || log.type,
      statusName: statusNameMap[log.status] || log.status,
      timeStr: formatTime(log.createdAt),
      detailText: log.details ? JSON.stringify(log.details, null, 2) : ''
    }))

    this.setData({ logs: processedLogs }, () => {
      this.filterLogs()
      this.updateStats()
    })
  },

  filterLogs(e?: any) {
    const filter = e ? e.currentTarget.dataset.filter : this.data.activeFilter
    const { logs } = this.data

    let filtered = logs
    if (filter !== 'all') {
      filtered = logs.filter((log: any) => log.type === filter)
    }

    this.setData({
      activeFilter: filter,
      filteredLogs: filtered
    })
  },

  updateStats() {
    const { logs } = this.data
    this.setData({
      stats: {
        total: logs.length,
        success: logs.filter((l: any) => l.status === 'success').length,
        failed: logs.filter((l: any) => l.status === 'failed').length
      }
    })
  },

  clearLogs() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有日志记录吗？此操作不可恢复。',
      confirmColor: '#EA4335',
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync('workflowLogs', [])
          app.globalData.workflowLogs = []
          this.setData({
            logs: [],
            filteredLogs: [],
            stats: { total: 0, success: 0, failed: 0 }
          })
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  }
})
