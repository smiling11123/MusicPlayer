export {}

declare global {
  interface ElectronAPI {
    minimize: () => Promise<void> | void
    toggleMaximize: () => Promise<boolean> | boolean
    close: () => Promise<void> | void
    isMaximized?: () => Promise<boolean> | boolean
    // 如需更多方法，按上面格式继续添加
  }

  interface Window {
    electronAPI?: ElectronAPI
  }
}
