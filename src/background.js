const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require('electron/main')
const path = require('node:path')
const generateConfig = require('../net/generateConfig')

let mainWindow = null
let lyricWindow =null
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 900,
    frame: false,
    transparent: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      webSecurity: true,
      preload: path.join(__dirname, 'electron', 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    //titleBarStyle: 'hidden',
    // Remove native title bar/overlay so CSS drag regions work on Windows
  })

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  } else {
    mainWindow.loadURL('http://localhost:5173/')
  }

  // 为当前窗口注册控制 IPC（使用 invoke）
  ipcMain.handle('window-minimize', () => {
    if (mainWindow) mainWindow.minimize()
  })
  ipcMain.handle('window-toggle-maximize', () => {
    if (!mainWindow) return
    if (mainWindow.isMaximized()) mainWindow.unmaximize()
    else mainWindow.maximize()
    return mainWindow.isMaximized()
  })
  ipcMain.handle('window-close', () => {
    if (mainWindow) mainWindow.close()
  })
  ipcMain.handle('window-is-maximized', () => {
    return mainWindow ? mainWindow.isMaximized() : false
  })
}

const createLyricWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  lyricWindow = new BrowserWindow({
    width: 800,
    height: 150,
    x: (width - 800)/2,
    y: height - 180,
    frame: false,
    transparent: true,
    show: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      webSecurity: true,
      preload: path.join(__dirname, 'electron', 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })
  if (app.isPackaged) {
    lyricWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'desktop-lyric' })
  } else {
    lyricWindow.loadURL('http://localhost:5173/#/desktop-lyric')
  }

  lyricWindow.once('ready-to-show', () => {
    lyricWindow.show()
  })

  lyricWindow.on('closed', () => {
    lyricWindow = null
  })
}

// === IPC 监听 ===

// 1. 打开/关闭歌词窗口
ipcMain.on('toggle-desktop-lyric', () => {
  if (lyricWindow) {
    lyricWindow.close()
  } else {
    createLyricWindow()
  }
})

// 2. 接收主窗口发来的歌词，转发给歌词窗口
ipcMain.on('update-lyric-info', (event, data) => {
  if (lyricWindow && !lyricWindow.isDestroyed()) {
    lyricWindow.webContents.send('on-lyric-update', data)
  }
})

// 3. 核心：控制鼠标穿透
// ignore: true (鼠标穿透，点击会点到后面的窗口)
// ignore: false (鼠标不穿透，可以拖拽和点击按钮)
ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) return
  // forward: true 让鼠标移动事件依然能触发，用于检测 hover
  win.setIgnoreMouseEvents(ignore, { forward: true })
})

function RegisterGlobalShortCut(){
    if(!mainWindow){ return }
    globalShortcut.register('Ctrl+Alt+c' ,()=> {
      console.log("global-play-toggle")
        mainWindow?.webContents.send('global-toggle-play')
    })
    globalShortcut.register('Ctrl+Alt+x', ()=> {
    mainWindow?.webContents.send('global-next')
  })
    globalShortcut.register('Ctrl+Alt+z', ()=> {
    mainWindow?.webContents.send('global-prev')
  })
}
app.whenReady().then(async () => {
  // Generate anonymous token
  await generateConfig()

  // Start API server
  if (app.isPackaged) {
    const port = 3000
    try {
      const { serveNcmApi } = require('../net/server')
      await serveNcmApi({
        port,
        checkVersion: false,
      })
      console.log(`API server started on port ${port}`)
    } catch (error) {
      console.error('Failed to start API server:', error)
    }
  }

  await createWindow()
  RegisterGlobalShortCut()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
      RegisterGlobalShortCut()
    }
  })
})
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
