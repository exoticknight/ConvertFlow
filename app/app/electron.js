'use strict'

const electron = require('electron')
const path = require('path')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const ipcMain = electron.ipcMain
const dialog = electron.dialog

const env = require('./env')

let mainWindow
let config = {}

if (process.env.NODE_ENV === 'development') {
  config = require('../config')
  config.url = `http://localhost:${config.port}`
} else {
  config.devtron = false
  config.url = `file://${__dirname}/dist/index.html`
}

if (!env.checkAndSetEnv()) {
  dialog.showErrorBox('Error', 'Missing ffmpeg or ffprobe')
  app.quit()
  return
}

const Converter = require('./electron/Converter.js')()

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    'height': 610,
    'width': 810,
    'resizable': false,
    'accept-first-mouse': true,
    'title': config.name,
    'show': false,
    'frame': false,
    'transparent': true
  })

  if (process.env.NODE_ENV === 'development') {
    BrowserWindow.addDevToolsExtension(path.join(__dirname, '../node_modules/devtron'))

    let installExtension = require('electron-devtools-installer')

    installExtension.default(installExtension.VUEJS_DEVTOOLS)
      .then((name) => mainWindow.webContents.openDevTools())
      .catch((err) => console.log('An error occurred: ', err))
  }

  mainWindow.loadURL(config.url)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.on( 'did-finish-load', function () {
      mainWindow.show();
      mainWindow.setTitle( config.name )
  })

  console.log('mainWindow opened')
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * message direct
 */
// app contorl
ipcMain.on( 'app-quit', event => {
  event.returnValue = true
  mainWindow.close()
})

ipcMain.on( 'app-minimize', event => {
  event.returnValue = true
  mainWindow.minimize()
})

// converter
ipcMain.on( 'get-media-duration', ( event, arg ) => {
  Converter.getMediaDuration( arg )
    .then( result => {
        event.returnValue = result
    })
    .catch( err => {
        event.returnValue = 0
    })
})

ipcMain.on( 'convert', ( event, arg ) => {
  Converter.convert( event.sender, arg )
})