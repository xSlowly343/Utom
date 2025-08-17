const { app, BrowserWindow, Menu, ipcMain, dialog, globalShortcut } = require('electron');
const path = require('path');
const isDev = process.argv.includes('--dev');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, '../assets/icons/icon.png'),
    titleBarStyle: 'default',
    show: false,
    frame: true
  });

  // Load the index.html file
  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Register global shortcuts
  registerGlobalShortcuts();
}

function registerGlobalShortcuts() {
  // Global shortcut for taking screenshots
  globalShortcut.register('Ctrl+Shift+S', () => {
    if (mainWindow) {
      mainWindow.webContents.send('take-screenshot');
    }
  });

  // Global shortcut for raid notifications
  globalShortcut.register('Ctrl+Shift+R', () => {
    if (mainWindow) {
      mainWindow.webContents.send('show-raid-notification');
    }
  });
}

// Create menu template
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Raid',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('new-raid');
            }
          }
        },
        {
          label: 'Import Characters',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('import-characters');
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('open-settings');
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Actual Size',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.setZoomLevel(0);
            }
          }
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.setZoomLevel(1);
            }
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.setZoomLevel(-1);
            }
          }
        }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Screenshot Tool',
          accelerator: 'Ctrl+Shift+S',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('open-screenshot-tool');
            }
          }
        },
        {
          label: 'Text Recognition',
          accelerator: 'Ctrl+Shift+T',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('open-text-recognition');
            }
          }
        },
        {
          label: 'Raid Scheduler',
          accelerator: 'Ctrl+Shift+R',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('open-raid-scheduler');
            }
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Lost Ark Raid Manager',
              message: 'Lost Ark Raid Manager v1.0.0',
              detail: 'Приложение для управления рейдами и персонажами в Lost Ark'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  dialog.showErrorBox('Error', 'An unexpected error occurred: ' + error.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});