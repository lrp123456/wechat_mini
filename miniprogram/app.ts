// app.ts
import { Material, VideoTask, UploadTask, WorkflowLog } from './utils/types'

interface IAppOption {
  globalData: {
    materials: Material[]
    videoTasks: VideoTask[]
    uploadTasks: UploadTask[]
    workflowLogs: WorkflowLog[]
    stats: {
      totalMaterials: number
      availableMaterials: number
      audioMaterials: number
    }
  }
  initMockData: () => void
  addLog: (type: WorkflowLog['type'], status: WorkflowLog['status'], message: string, details?: any) => void
  updateStats: () => void
}

App<IAppOption>({
  globalData: {
    materials: [],
    videoTasks: [],
    uploadTasks: [],
    workflowLogs: [],
    stats: {
      totalMaterials: 0,
      availableMaterials: 0,
      audioMaterials: 0
    }
  },

  onLaunch() {
    this.initMockData()
  },

  initMockData() {
    const mockMaterials: Material[] = [
      { id: '1', type: 'image', url: 'https://picsum.photos/400/300?random=1', title: '风景素材1', tags: ['风景', '自然'], source: 'Pinterest', status: 'available', createdAt: Date.now() - 86400000, metadata: { width: 400, height: 300 } },
      { id: '2', type: 'image', url: 'https://picsum.photos/400/300?random=2', title: '城市夜景', tags: ['城市', '夜景'], source: 'Pinterest', status: 'available', createdAt: Date.now() - 172800000, metadata: { width: 400, height: 300 } },
      { id: '3', type: 'image', url: 'https://picsum.photos/400/300?random=3', title: '美食摄影', tags: ['美食', '摄影'], source: 'Unsplash', status: 'available', createdAt: Date.now() - 259200000, metadata: { width: 400, height: 300 } },
      { id: '4', type: 'video', url: 'https://picsum.photos/400/300?random=4', title: '动态背景', tags: ['动态', '背景'], source: '本地', status: 'available', createdAt: Date.now() - 345600000, metadata: { width: 400, height: 300, duration: 15 } },
      { id: '5', type: 'audio', url: '', title: '轻快背景音乐', tags: ['音乐', '轻快'], source: '本地', status: 'available', createdAt: Date.now() - 432000000, metadata: { duration: 180, size: 2048 } },
      { id: '6', type: 'image', url: 'https://picsum.photos/400/300?random=5', title: '人物肖像', tags: ['人物', '肖像'], source: 'Pinterest', status: 'used', createdAt: Date.now() - 518400000, metadata: { width: 400, height: 300 } },
      { id: '7', type: 'image', url: 'https://picsum.photos/400/300?random=6', title: '抽象艺术', tags: ['抽象', '艺术'], source: 'Unsplash', status: 'available', createdAt: Date.now() - 604800000, metadata: { width: 400, height: 300 } },
      { id: '8', type: 'audio', url: '', title: '激励音乐', tags: ['音乐', '激励'], source: '本地', status: 'available', createdAt: Date.now() - 691200000, metadata: { duration: 240, size: 3072 } },
    ]

    const storedMaterials = wx.getStorageSync('materials')
    if (!storedMaterials || storedMaterials.length === 0) {
      wx.setStorageSync('materials', mockMaterials)
      this.globalData.materials = mockMaterials
    } else {
      this.globalData.materials = storedMaterials
    }

    const storedLogs = wx.getStorageSync('workflowLogs')
    if (storedLogs) {
      this.globalData.workflowLogs = storedLogs
    }

    this.updateStats()
  },

  addLog(type: WorkflowLog['type'], status: WorkflowLog['status'], message: string, details?: any) {
    const log: WorkflowLog = {
      id: Date.now().toString(),
      type,
      status,
      message,
      details,
      createdAt: Date.now()
    }
    this.globalData.workflowLogs.unshift(log)
    wx.setStorageSync('workflowLogs', this.globalData.workflowLogs)
  },

  updateStats() {
    const materials = this.globalData.materials
    this.globalData.stats = {
      totalMaterials: materials.length,
      availableMaterials: materials.filter(m => m.status === 'available').length,
      audioMaterials: materials.filter(m => m.type === 'audio').length
    }
  }
})
