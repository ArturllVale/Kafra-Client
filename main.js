
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    frame: false, // Remove a borda padrão para usar o design customizado
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    backgroundColor: '#0f172a'
  });

  // Em desenvolvimento, carrega do servidor local. Em produção, carrega o arquivo index.html
  const startUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, 'index.html')}`;

  win.loadURL(startUrl);

  // Handlers para os botões de controle da janela
  ipcMain.on('window-min', () => win.minimize());
  ipcMain.on('window-close', () => win.close());

  // Handler para lançar o jogo
  ipcMain.on('launch-game', (event, clientPath) => {
    console.log('Lançando game:', clientPath);
    // Aqui você usaria o módulo 'child_process' para executar o .exe do jogo
    // const { exec } = require('child_process');
    // exec(clientPath);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
