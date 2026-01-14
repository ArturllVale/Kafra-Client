import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { loadConfig, PatcherConfig } from './patcher/config';
import { fetchPatchList, PatchInfo } from './patcher/patchList';
import { downloadPatch, DownloadProgress } from './patcher/downloader';
import { extractThorPatch } from './patcher/thorPatcher';

// ESM compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let config: PatcherConfig | null = null;

function createWindow() {
    const windowConfig = config?.window || { width: 900, height: 600, resizable: false };

    mainWindow = new BrowserWindow({
        width: windowConfig.width,
        height: windowConfig.height,
        frame: false,
        resizable: windowConfig.resizable,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        backgroundColor: '#0f172a',
        icon: path.join(__dirname, '../public/icon.ico'),
        title: windowConfig.title || 'RPatchur'
    });

    // Development vs Production URL
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// IPC Handlers
function setupIpcHandlers() {
    // Window controls
    ipcMain.on('window-minimize', () => mainWindow?.minimize());
    ipcMain.on('window-close', () => mainWindow?.close());

    // Get configuration
    ipcMain.handle('get-config', () => {
        return config;
    });

    // Start patching process
    ipcMain.handle('start-update', async () => {
        if (!config) {
            return { success: false, error: 'No configuration loaded' };
        }

        try {
            // Send status: checking
            mainWindow?.webContents.send('patching-status', { status: 'checking' });

            // Fetch patch list
            const patchServer = config.web.patch_servers[0];
            if (!patchServer) {
                throw new Error('No patch server configured');
            }

            const patches = await fetchPatchList(patchServer.plist_url);

            if (patches.length === 0) {
                mainWindow?.webContents.send('patching-status', { status: 'ready' });
                return { success: true, message: 'Already up to date' };
            }

            // Download and apply patches
            for (let i = 0; i < patches.length; i++) {
                const patch = patches[i];
                const patchUrl = `${patchServer.patch_url}/${patch.filename}`;
                const tempPath = path.join(app.getPath('temp'), patch.filename);

                // Download
                mainWindow?.webContents.send('patching-status', {
                    status: 'downloading',
                    current: i + 1,
                    total: patches.length,
                    filename: patch.filename
                });

                await downloadPatch(patchUrl, tempPath, (progress: DownloadProgress) => {
                    mainWindow?.webContents.send('download-progress', progress);
                });

                // Extract/Apply
                mainWindow?.webContents.send('patching-status', {
                    status: 'patching',
                    current: i + 1,
                    total: patches.length,
                    filename: patch.filename
                });

                const targetDir = path.dirname(app.getPath('exe'));
                await extractThorPatch(tempPath, targetDir, config.client?.default_grf_name || 'data.grf');

                // Cleanup temp file
                try {
                    fs.unlinkSync(tempPath);
                } catch (e) {
                    // Ignore cleanup errors
                }
            }

            mainWindow?.webContents.send('patching-status', { status: 'ready' });
            return { success: true };
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            mainWindow?.webContents.send('patching-status', { status: 'error', error: errorMsg });
            return { success: false, error: errorMsg };
        }
    });

    // Cancel update
    ipcMain.on('cancel-update', () => {
        // TODO: Implement cancellation token
        mainWindow?.webContents.send('patching-status', { status: 'idle' });
    });

    // Launch game
    ipcMain.handle('launch-game', async () => {
        if (!config?.play?.path) {
            return { success: false, error: 'Game path not configured' };
        }

        try {
            const gamePath = path.resolve(path.dirname(app.getPath('exe')), config.play.path);
            const args = config.play.arguments || [];

            spawn(gamePath, args, {
                detached: true,
                stdio: 'ignore',
                cwd: path.dirname(gamePath)
            }).unref();

            if (config.play.exit_on_success !== false) {
                app.quit();
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to launch game' };
        }
    });

    // Launch setup
    ipcMain.handle('launch-setup', async () => {
        if (!config?.setup?.path) {
            return { success: false, error: 'Setup path not configured' };
        }

        try {
            const setupPath = path.resolve(path.dirname(app.getPath('exe')), config.setup.path);
            const args = config.setup.arguments || [];

            spawn(setupPath, args, {
                detached: true,
                stdio: 'ignore',
                cwd: path.dirname(setupPath)
            }).unref();

            if (config.setup.exit_on_success === true) {
                app.quit();
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to launch setup' };
        }
    });

    // SSO Login
    ipcMain.handle('sso-login', async (_, credentials: { username: string; password: string }) => {
        if (!config?.play?.path) {
            return { success: false, error: 'Game path not configured' };
        }

        try {
            const gamePath = path.resolve(path.dirname(app.getPath('exe')), config.play.path);
            const args = [...(config.play.arguments || []), '-t', credentials.username, credentials.password];

            spawn(gamePath, args, {
                detached: true,
                stdio: 'ignore',
                cwd: path.dirname(gamePath)
            }).unref();

            if (config.play.exit_on_success !== false) {
                app.quit();
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to launch with SSO' };
        }
    });

    // Manual patch
    ipcMain.handle('manual-patch', async () => {
        const result = await dialog.showOpenDialog(mainWindow!, {
            title: 'Select THOR Patch File',
            filters: [{ name: 'THOR Patches', extensions: ['thor'] }],
            properties: ['openFile']
        });

        if (result.canceled || result.filePaths.length === 0) {
            return { success: false, error: 'No file selected' };
        }

        try {
            mainWindow?.webContents.send('patching-status', {
                status: 'patching',
                filename: path.basename(result.filePaths[0])
            });

            const targetDir = path.dirname(app.getPath('exe'));
            await extractThorPatch(result.filePaths[0], targetDir, config?.client?.default_grf_name || 'data.grf');

            mainWindow?.webContents.send('patching-status', { status: 'ready' });
            mainWindow?.webContents.send('patch-applied', { filename: path.basename(result.filePaths[0]) });

            return { success: true };
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to apply patch';
            mainWindow?.webContents.send('patching-status', { status: 'error', error: errorMsg });
            return { success: false, error: errorMsg };
        }
    });

    // Reset cache
    ipcMain.handle('reset-cache', async () => {
        try {
            const cachePath = path.join(app.getPath('userData'), 'patch-cache.json');
            if (fs.existsSync(cachePath)) {
                fs.unlinkSync(cachePath);
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to reset cache' };
        }
    });

    // Open external URL
    ipcMain.on('open-external', (_, url: string) => {
        shell.openExternal(url);
    });

    // Toggle GRF initialization order in data.ini (e.g. for Gray Floor)
    ipcMain.handle('toggle-grf', async (_, { normal, gray }: { normal: string; gray: string }) => {
        try {
            const dataIniPath = path.resolve(path.dirname(app.getPath('exe')), 'data.ini');

            let content = "";
            if (fs.existsSync(dataIniPath)) {
                content = fs.readFileSync(dataIniPath, 'utf-8');
            }

            // Simple parser to find current order
            const isGrayFirst = content.includes(`0=${gray}`);

            const newContent = `[Data]\r\n0=${isGrayFirst ? normal : gray}\r\n1=${isGrayFirst ? gray : normal}\r\n`;

            fs.writeFileSync(dataIniPath, newContent, { encoding: 'utf-8' });

            return { success: true, isGray: !isGrayFirst };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to toggle GRF' };
        }
    });

    // Launch a specific executable by path
    ipcMain.handle('launch-exe', async (_, exePath: string) => {
        try {
            const fullPath = path.resolve(path.dirname(app.getPath('exe')), exePath);
            if (!fs.existsSync(fullPath)) {
                throw new Error(`File not found: ${exePath}`);
            }

            spawn(fullPath, [], {
                detached: true,
                stdio: 'ignore',
                cwd: path.dirname(fullPath)
            }).unref();

            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to launch EXE' };
        }
    });
}

// App lifecycle
app.whenReady().then(async () => {
    // Load configuration
    const configPath = path.join(path.dirname(app.getPath('exe')), 'rpatchur.yml');
    const devConfigPath = path.join(__dirname, '../rpatchur.yml');

    try {
        if (fs.existsSync(configPath)) {
            config = await loadConfig(configPath);
        } else if (fs.existsSync(devConfigPath)) {
            config = await loadConfig(devConfigPath);
        } else {
            // Use defaults
            config = {
                window: { title: 'RPatchur', width: 900, height: 600, resizable: false },
                play: { path: 'ragnarok.exe', arguments: [], exit_on_success: true },
                web: { index_url: '', patch_servers: [] },
                client: { default_grf_name: 'data.grf' },
                patching: { in_place: true, check_integrity: true, create_grf: false }
            };
        }
    } catch (error) {
        console.error('Failed to load config:', error);
    }

    setupIpcHandlers();
    createWindow();
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
