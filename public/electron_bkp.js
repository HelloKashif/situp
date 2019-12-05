'use strict'

const { app, Tray, BrowserWindow, Menu, ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')
const isDev = !app.isPackaged

// @Cleanup pass it during build phase
const isDebugBuild = true

if (isDev) {
    process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
}

let uiWindow

const prefsPath = path.join(app.getPath('userData'), 'prefs.json')
let prefs = {
    bounds: { width: 1024, height: 768 },
    normalViewBounds: {},
    focusViewBounds: { width: 450, height: 700 },
    zoomFactor: 1,
    currentIndex: 0,
    startTime: 25 * 60,
}
try {
    //@FIXME fix this crazy issue that app window sometime goes off screen if user changed their resolution of main display settings
    const fromFile = JSON.parse(fs.readFileSync(prefsPath, 'utf-8'))
    prefs = { ...prefs, ...fromFile }
} catch (e) {}

ipcMain.on('get-prefs', () => {
    uiWindow.webContents.send('prefs', prefs)
})

ipcMain.on('save-prefs', (e, data) => {
    prefs = { ...prefs, ...data }
})

const template = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Exit',
                click() {
                    app.quit()
                },
                accelerator: 'CmdOrCtrl+Q',
            },
        ],
    },
]

if (process.platform === 'darwin') {
    template.unshift({
        label: app.name,
        submenu: [
            {
                label: 'Quit',
                accelerator: 'CmdOrCtrl+Q',
                click() {
                    app.quit()
                },
            },
        ],
    })
}

if (isDebugBuild) {
    template.push({
        label: 'Dev',
        submenu: [
            {
                label: 'Open Devtools',
                click() {
                    uiWindow.webContents.openDevTools()
                },
                accelerator: 'CmdOrCtrl+I',
                //@FIXME for some reason cmd+alt+i doesnt work here
            },
            {
                label: 'Reload',
                click() {
                    uiWindow.webContents.reload()
                },
                accelerator: 'CmdOrCtrl+R',
            },
        ],
    })
}

const createUIWindow = () => {
    uiWindow = new BrowserWindow({
        // ...prefs.bounds,
        enableLargerThanScreen: true,
        show: false,
        // frame:false,
        // titleBarStyle: 'hiddenInset',
        title: 'SitUp',
        webPreferences: {
            devTools: true,
            nodeIntegration: true,
        },
    })

    uiWindow.loadURL(
        isDev ? 'http://localhost:8080' : `file://${path.join(__dirname, '../build/index.html')}`,
    )

    uiWindow.once('ready-to-show', () => {
        const { x, y, width, height } = prefs.bounds
        // if (x && y) {
        //     uiWindow.setPosition(x, y)
        // }
        if (width && height) {
            uiWindow.setSize(width, height)
        }

        uiWindow.show()
        uiWindow.focus()
        uiWindow.webContents.zoomFactor = prefs.zoomFactor
    })

    uiWindow.on('enter-full-screen', () => {
        uiWindow.webContents.send('enter-full-screen')
    })
    uiWindow.on('leave-full-screen', () => {
        uiWindow.webContents.send('leave-full-screen')
    })

    uiWindow.on('close', () => {
        try {
            prefs = { ...prefs, bounds: uiWindow.getBounds() }

            // @FIXME replace with async
            fs.writeFileSync(prefsPath, JSON.stringify(prefs))
        } catch (e) {
            console.log('Could not write preferences')
        }
    })

    uiWindow.on('closed', () => {
        uiWindow = null
    })

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    //Remove toolbar for non mac
    if (process.platform !== 'darwin') uiWindow.setMenu(null)
    // isDev && uiWindow.webContents.openDevTools()
}

let tray = null
app.on('ready', () => {
    createUIWindow()
    tray = new Tray("/Users/kashif/Projects/situp/src/assets/tray-icon.png")
    tray.setToolTip("Hello")

})

app.on('before-quit', () => {
    uiWindow.webContents.send('before-quit')
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (uiWindow === null) {
        createUIWindow()
    }
})
