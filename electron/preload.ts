import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('patcher', {
    // Window controls
    minimize: () => ipcRenderer.send('window-minimize'),
    close: () => ipcRenderer.send('window-close'),

    // Configuration
    getConfig: (): Promise<any> => ipcRenderer.invoke('get-config'),

    // Patching operations
    startUpdate: (): Promise<{ success: boolean; error?: string; message?: string }> =>
        ipcRenderer.invoke('start-update'),
    cancelUpdate: () => ipcRenderer.send('cancel-update'),
    resetCache: (): Promise<{ success: boolean; error?: string }> =>
        ipcRenderer.invoke('reset-cache'),
    manualPatch: (): Promise<{ success: boolean; error?: string }> =>
        ipcRenderer.invoke('manual-patch'),

    // Game launching
    play: (): Promise<{ success: boolean; error?: string }> =>
        ipcRenderer.invoke('launch-game'),
    setup: (): Promise<{ success: boolean; error?: string }> =>
        ipcRenderer.invoke('launch-setup'),
    launchExe: (exePath: string): Promise<{ success: boolean; error?: string }> =>
        ipcRenderer.invoke('launch-exe', exePath),
    login: (credentials: { username: string; password: string }): Promise<{ success: boolean; error?: string }> =>
        ipcRenderer.invoke('sso-login', credentials),

    // File operations
    toggleGrf: (options: { normal: string; gray: string }): Promise<{ success: boolean; isGray?: boolean; error?: string }> =>
        ipcRenderer.invoke('toggle-grf', options),

    // External links
    openExternal: (url: string) => ipcRenderer.send('open-external', url),

    // Event listeners
    onPatchingStatus: (callback: (data: PatchingStatusData) => void) => {
        const listener = (_: any, data: PatchingStatusData) => callback(data);
        ipcRenderer.on('patching-status', listener);
        return () => ipcRenderer.removeListener('patching-status', listener);
    },

    onDownloadProgress: (callback: (data: DownloadProgressData) => void) => {
        const listener = (_: any, data: DownloadProgressData) => callback(data);
        ipcRenderer.on('download-progress', listener);
        return () => ipcRenderer.removeListener('download-progress', listener);
    },

    onPatchApplied: (callback: (data: { filename: string }) => void) => {
        const listener = (_: any, data: { filename: string }) => callback(data);
        ipcRenderer.on('patch-applied', listener);
        return () => ipcRenderer.removeListener('patch-applied', listener);
    }
});

// Types for IPC communication
interface PatchingStatusData {
    status: 'idle' | 'checking' | 'downloading' | 'patching' | 'ready' | 'error';
    current?: number;
    total?: number;
    filename?: string;
    error?: string;
}

interface DownloadProgressData {
    filename: string;
    downloaded: number;
    total: number;
    speed: number;
    percentage: number;
}
