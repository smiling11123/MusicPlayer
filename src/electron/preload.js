
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.invoke('window-minimize'),
  toggleMaximize: () => ipcRenderer.invoke('window-toggle-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  global_toggle: (callback) => ipcRenderer.on('global-toggle-play', callback),
  global_next: (callback) => ipcRenderer.on('global-next', callback),
  global_prev: (callback) => ipcRenderer.on('global-prev', callback),
  remove_toggle: (callback) => ipcRenderer.removeListener('global-toggle-play', callback),
  remove_next: (callback) => ipcRenderer.removeListener('global-next', callback),
  remove_prev: (callback) => ipcRenderer.removeListener('global-prev', callback),
  toggleDesktopLyric: () => ipcRenderer.send('toggle-desktop-lyric'),
  sendLyricUpdate: (data) => ipcRenderer.send('update-lyric-info', data),
  setIgnoreMouse: (ignore) => ipcRenderer.send('set-ignore-mouse-events', ignore),
  onLyricUpdate: (callback) => ipcRenderer.on('on-lyric-update', callback),
  removeLyricListener: (callback) => ipcRenderer.removeListener('on-lyric-update', callback)
})
