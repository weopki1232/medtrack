const { app, BrowserWindow, shell, Menu, nativeTheme } = require('electron');
const path = require('path');
const fs   = require('fs');
const os   = require('os');

let mainWin;

function createWindow() {
  nativeTheme.themeSource = 'dark';

  mainWin = new BrowserWindow({
    width:    1400,
    height:   860,
    minWidth:  960,
    minHeight: 600,
    webPreferences: {
      nodeIntegration:  false,
      contextIsolation: true,
      allowRunningInsecureContent: false,
      autoplayPolicy: 'no-user-gesture-required',
    },
    title:           'MedTrack — TCAS Study Tracker',
    backgroundColor: '#0c0e18',
    show:            false,
    autoHideMenuBar: true,
    // Use icon.ico if present, otherwise Electron default
    ...(require('fs').existsSync(path.join(__dirname, 'icon.ico')) && { icon: path.join(__dirname, 'icon.ico') }),
  });

  mainWin.loadFile(path.join(__dirname, 'medtrack.html'));

  // Auto-import browser data if extractor dropped mt_export.json in Downloads
  mainWin.webContents.once('did-finish-load', () => {
    const exportFile = path.join(os.homedir(), 'Downloads', 'mt_export.json');
    if (!fs.existsSync(exportFile)) return;
    try {
      const data = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
      const entries = Object.entries(data).filter(([k]) => k.startsWith('mt_'));
      if (entries.length === 0) return;
      const script = entries
        .map(([k, v]) => `localStorage.setItem(${JSON.stringify(k)}, ${JSON.stringify(v)});`)
        .join('\n') + '\nlocation.reload();';
      mainWin.webContents.executeJavaScript(script);
      fs.unlinkSync(exportFile);
    } catch (e) {
      console.error('Auto-import failed:', e);
    }
  });

  // Show window only once it's fully rendered (no white flash)
  mainWin.once('ready-to-show', () => mainWin.show());

  // Handle window.open() calls from the renderer:
  //   • Blank URLs  → open as a child window (used by the Print Report feature)
  //   • Real URLs   → open in system default browser
  mainWin.webContents.setWindowOpenHandler(({ url }) => {
    const isBlank = !url || url === '' || url === 'about:blank';
    if (isBlank) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width:            720,
          height:           900,
          parent:           mainWin,
          autoHideMenuBar:  true,
          backgroundColor: '#ffffff',
          webPreferences: {
            nodeIntegration:  false,
            contextIsolation: true,
          },
        },
      };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Remove native menu bar entirely
  Menu.setApplicationMenu(null);

  // Re-focus main window if user tries to open a second instance
  app.on('second-instance', () => {
    if (mainWin) {
      if (mainWin.isMinimized()) mainWin.restore();
      mainWin.focus();
    }
  });
}

// Single-instance lock
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.whenReady().then(createWindow);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (!BrowserWindow.getAllWindows().length) createWindow();
});
