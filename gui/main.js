const electron = require('electron');  
const { app, BrowserWindow } = require('electron')

const createWindow = () => {
    const win = new BrowserWindow({
      width: 1000,
      height: 1000,
      webPreferences: {
        nodeIntegration: true,
      },
    })
    
    let mainSession = win.webContents.session
    
    // win.loadFile('./views/index.html');
    win.loadURL('http://localhost:3000/')

    mainSession.cookies.get({}, (error, cookies) => {
      console.log(cookies)
    })
  }

  app.whenReady().then(() => {
    createWindow()
  })

  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })