// Modules to control application life and create native browser window
const {app, BrowserWindow, session} = require('electron');

const path = require('path')
const os = require('os')
const isDev = require('electron-is-dev')
const Store = require('electron-store')

Store.initRenderer()
require('@electron/remote/main').initialize()

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  )

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Remove the Menu Bar
  mainWindow.setMenuBarVisibility(false)
}

const reactDevToolsPath = path.join(
  os.homedir(),
  'AppData/Local/Google/Chrome/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.13.5_0'
)

async function loadExtension(){
  await session.defaultSession.loadExtension(reactDevToolsPath)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  // loadExtension()
}).then(async () => {
  if (fs.existsSync(reactDevToolsPath)) await session.defaultSession.loadExtension(reactDevToolsPath)
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.