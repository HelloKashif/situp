const { app, BrowserWindow, ipcMain, Tray, screen } = require('electron')
const path = require('path')
const isDev = !app.isPackaged

let tray = null
let uiWindow = null

const WIDTH = 300
const HEIGHT = 350



const URL = isDev
    ? 'http://localhost:8080'
    : `file://${path.join(__dirname, '../build/index.html')}`

app.dock.hide()

app.setLoginItemSettings({ openAtLogin: true }) //@Todo user configurable?

const createTray = () => {
    tray = new Tray('/Users/kashif/Projects/situp/assets/tray-icon.png') //@Todo cleanup hardcoded assets path

    tray.setIgnoreDoubleClickEvents(true)
    tray.on('right-click', toggleWindow)
    tray.on('click', ev => {
        toggleWindow()

        // Show devtools when command clicked
        if (uiWindow.isVisible() && process.defaultApp && ev.metaKey) {
            uiWindow.openDevTools({ mode: 'detach' })
        }
    })
}

const createWindow = () => {
    uiWindow = new BrowserWindow({
        width: WIDTH,
        height: HEIGHT,
        show: false,
        frame: false,
        resizable: false,
        transparent: true,
        fullscreenable: false,
        alwaysOnTop: true,
        acceptFirstMouse: true,
        webPreferences: {
            backgroundThrottling: false,
            nodeIntegration: true,
        },
    })

    //Other wise clicking on icon keeps moving us to different desktop
    uiWindow.setVisibleOnAllWorkspaces(true)

    uiWindow.loadURL(URL)

    uiWindow.on('blur', () => {
        if (!isDev) uiWindow.hide()
    })
}

const toggleWindow = () => {
    if (uiWindow.isVisible()) {
        uiWindow.hide()
    } else {
        showWindow()
    }
}

const showWindow = () => {
    const windowBounds = uiWindow.getBounds()
    const trayBounds = tray.getBounds()
    const pos = {
        x: Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2), //Center below icon,
        y: Math.round(trayBounds.y + trayBounds.height + 5), //slight offset below
    }
    uiWindow.setPosition(pos.x, pos.y, false)
    uiWindow.show()
    uiWindow.focus()
}

const appListeners = [
    {
        key: 'ready',
        handler: () => {
            createTray()
            createWindow()
            if (isDev) showWindow()
        },
    },
    {
        key: 'window-all-closed',
        handler: () => app.quit(),
    },
]
appListeners.forEach(m => app.on(m.key, m.handler))

//Setup messages
const ipcListeners = [
    {
        key: 'show-window',
        handler: () => showWindow(),
    },
    {
        key: 'tick',
        handler: (ev, data) => {
            const next = data.nextCountdown
            tray.setTitle(next.time) //@Todo @Incomplete

            tray.setToolTip(`${next.name} at ${next.time.toLocaleTimeString()}`)
        },
    },
    {
        key: 'msg-quit',
        handler: () => app.quit(),
    },
]
ipcListeners.forEach(m => ipcMain.on(m.key, m.handler))

//Setup ipc handles
const ipcHandleListeners = [
    {
        key: 'msg-handle-quit',
        handler: (ev, arg) => {
            const result = { key: 'DUMMY' }
            return result
        },
    },
]
ipcHandleListeners.forEach(m => {
    if (m.once) {
        ipcMain.handleOnce(m.key, m.handler)
    } else {
        ipcMain.handle(m.key, m.handler)
    }
})
