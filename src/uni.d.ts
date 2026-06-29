// src/uni.d.ts - UniApp 全局类型声明
declare const uni: {
  request: (options: {
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    header?: Record<string, string>
    data?: any
    timeout?: number
  }) => Promise<{
    statusCode: number
    data: any
  }>
  getStorageSync: (key: string) => any
  setStorageSync: (key: string, data: any) => void
  removeStorageSync: (key: string) => void
  getClipboardData: (options?: { success?: (res: { data: string }) => void }) => void
  setClipboardData: (options: { data: string }) => void
  showToast: (options: { title: string; icon?: 'success' | 'error' | 'none'; duration?: number }) => void
  showModal: (options: {
    title: string
    content: string
    showCancel?: boolean
    confirmText?: string
    cancelText?: string
  }) => Promise<{ confirm: boolean }>
}
