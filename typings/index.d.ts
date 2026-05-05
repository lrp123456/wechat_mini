/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
    materials: any[],
    videoTasks: any[],
    uploadTasks: any[],
    workflowLogs: any[],
    stats: {
      totalMaterials: number,
      availableMaterials: number,
      audioMaterials: number
    }
  },
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
  initMockData: () => void,
  addLog: (type: string, status: string, message: string, details?: any) => void,
  updateStats: () => void
}
