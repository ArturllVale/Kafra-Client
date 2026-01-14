import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("patcher", {
  // Window controls
  minimize: () => ipcRenderer.send("window-minimize"),
  close: () => ipcRenderer.send("window-close"),
  // Configuration
  getConfig: () => ipcRenderer.invoke("get-config"),
  // Patching operations
  startUpdate: () => ipcRenderer.invoke("start-update"),
  cancelUpdate: () => ipcRenderer.send("cancel-update"),
  resetCache: () => ipcRenderer.invoke("reset-cache"),
  manualPatch: () => ipcRenderer.invoke("manual-patch"),
  // Game launching
  play: () => ipcRenderer.invoke("launch-game"),
  setup: () => ipcRenderer.invoke("launch-setup"),
  launchExe: (exePath) => ipcRenderer.invoke("launch-exe", exePath),
  login: (credentials) => ipcRenderer.invoke("sso-login", credentials),
  // File operations
  toggleGrf: (options) => ipcRenderer.invoke("toggle-grf", options),
  // External links
  openExternal: (url) => ipcRenderer.send("open-external", url),
  // Event listeners
  onPatchingStatus: (callback) => {
    const listener = (_, data) => callback(data);
    ipcRenderer.on("patching-status", listener);
    return () => ipcRenderer.removeListener("patching-status", listener);
  },
  onDownloadProgress: (callback) => {
    const listener = (_, data) => callback(data);
    ipcRenderer.on("download-progress", listener);
    return () => ipcRenderer.removeListener("download-progress", listener);
  },
  onPatchApplied: (callback) => {
    const listener = (_, data) => callback(data);
    ipcRenderer.on("patch-applied", listener);
    return () => ipcRenderer.removeListener("patch-applied", listener);
  }
});
