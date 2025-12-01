const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron/main')
const path = require('node:path')
const generateConfig = require('../net/generateConfig')

let mainWindow = null
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
