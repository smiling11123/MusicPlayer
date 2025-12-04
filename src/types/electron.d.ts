export {}

declare global {
  interface ElectronAPI {
    minimize: () => Promise<void> | void
    toggleMaximize: () => Promise<boolean> | boolean
    close: () => Promise<void> | void
    isMaximized?: () => Promise<boolean> | boolean
    toggleDesktopLyric: () => void
    sendLyricUpdate: (data: { text: string; trans: string }) => void
    setIgnoreMouse: (ignore: boolean) => void
    onLyricUpdate: (callback: (event: any, data: any) => void) => void
    removeLyricListener: (callback: (event: any, data: any) => void) => void
    onTogglePlay: (callback: () => void) => void
    onPlayNext: (callback: () => void) => void
    onPlayPrev: (callback: () => void) => void
    removeTogglePlay: (callback: () => void) => void
    removePlayNext: (callback: () => void) => void
    removePlayPrev: (callback: () => void) => void
    deskLyricStatus: (callback: (event: any, Status: boolean) => void) => void
    // Auto Updater
    checkForUpdate: () => void
    downloadUpdate: () => void
    quitAndInstall: () => void
    onAutoUpdaterMessage: (
      callback: (event: any, data: { message: string; data: any }) => void,
    ) => void
    // 如需更多方法，按上面格式继续添加
  }

  interface Window {
    electronAPI?: ElectronAPI
  }
}
