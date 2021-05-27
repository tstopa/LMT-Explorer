const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  MenuItem,
} = require('electron')
const path = require('path')
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit()
}
let mainWindow = null

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, '/../../icons/png/64x64.png'),
  })

  // setting up the menu with just two items
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          // this is the main bit hijack the click event
          click() {
            // construct the select file dialog
            dialog
              .showOpenDialog({
                properties: ['openFile'],
              })
              .then(function (fileObj) {
                // the fileObj has two props
                if (!fileObj.canceled) {
                  mainWindow.webContents.send(
                    'open-file-request-response',
                    fileObj.filePaths[0]
                  )
                }
              })
              // should always handle the error yourself, later Electron release might crash if you don't
              .catch(function (err) {})
          },
        },
        {
          label: 'Exit',
          click() {
            app.quit()
          },
        },
      ],
    },
    {
      label: 'Help',
      click() {
        const options = {
          type: 'question',
          buttons: ['Close'],
          title: 'About',
          message: 'About LMT Explorer',
          detail:
            'This tool is used to visualize and make simpler reading IBM License Metric Tool audit snapshot based on PVU sub-capacity metric.\nLink to the most recent release and source code: https://github.com/tstopa/LMT-Explorer\nLicence: MIT\nAuthors: Kacper Szot, Michał Skoryk\nLMT Explorer is provided as-is, without any warranty and without official support. This is community project and not official IBM tool.',
        }
        dialog.showMessageBox(null, options, (response, checkboxChecked) => {
          console.log(response)
          console.log(checkboxChecked)
        })
      },
    },
  ])
  Menu.setApplicationMenu(menu)
  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.

const visualizationCtxMenu = new Menu()
visualizationCtxMenu.append(
  new MenuItem({
    label: 'show selected products context',
    click: () => mainWindow.webContents.send('show-selected-products'),
  })
)
visualizationCtxMenu.append(
  new MenuItem({
    label: 'show all products context',
    click: () => mainWindow.webContents.send('show-all-products'),
  })
)

ipcMain.on('pop-visualization-ctx-menu', (evnt, args) => {
  visualizationCtxMenu.popup()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
const showError = (error) => {
  dialog.showMessageBox(null, {
    type: 'error',
    buttons: ['ok'],
    defaultId: 2,
    title: 'Error',
    message: 'error occured ',
    detail: error,
  })
}
ipcMain.on('show-error', (event, args) => {
  showError(args)
})
ipcMain.on('open-file-request', (evnt, args) => {
  dialog
    .showOpenDialog({
      properties: ['openFile'],
    })
    .then((fileObj) => {
      // the fileObj has two props
      if (!fileObj.canceled) {
        mainWindow.webContents.send(
          'open-file-request-response',
          fileObj.filePaths[0]
        )
      }
    })
    // should always handle the error yourself, later Electron release might crash if you don't
    .catch(function (err) {})
})
app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
