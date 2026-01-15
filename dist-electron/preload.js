"use strict";
const electron = require("electron");
console.log("Preload script loaded successfully");
electron.contextBridge.exposeInMainWorld("patcher", {
  // Window controls
  minimize: () => electron.ipcRenderer.send("window-minimize"),
  close: () => electron.ipcRenderer.send("window-close"),
  // Configuration
  getConfig: () => electron.ipcRenderer.invoke("get-config"),
  // Patching operations
  startUpdate: () => electron.ipcRenderer.invoke("start-update"),
  cancelUpdate: () => electron.ipcRenderer.send("cancel-update"),
  resetCache: () => electron.ipcRenderer.invoke("reset-cache"),
  manualPatch: () => electron.ipcRenderer.invoke("manual-patch"),
  // Game launching
  play: () => electron.ipcRenderer.invoke("launch-game"),
  setup: () => electron.ipcRenderer.invoke("launch-setup"),
  launchExe: (exePath) => electron.ipcRenderer.invoke("launch-exe", exePath),
  login: (credentials) => electron.ipcRenderer.invoke("sso-login", credentials),
  // File operations
  toggleGrf: (options) => electron.ipcRenderer.invoke("toggle-grf", options),
  // External links
  openExternal: (url) => electron.ipcRenderer.send("open-external", url),
  // Event listeners
  onPatchingStatus: (callback) => {
    const listener = (_, data) => callback(data);
    electron.ipcRenderer.on("patching-status", listener);
    return () => electron.ipcRenderer.removeListener("patching-status", listener);
  },
  onDownloadProgress: (callback) => {
    const listener = (_, data) => callback(data);
    electron.ipcRenderer.on("download-progress", listener);
    return () => electron.ipcRenderer.removeListener("download-progress", listener);
  },
  onPatchApplied: (callback) => {
    const listener = (_, data) => callback(data);
    electron.ipcRenderer.on("patch-applied", listener);
    return () => electron.ipcRenderer.removeListener("patch-applied", listener);
  },
  onWindowMinimized: (callback) => {
    const listener = () => callback();
    electron.ipcRenderer.on("window-minimized", listener);
    return () => electron.ipcRenderer.removeListener("window-minimized", listener);
  },
  onWindowRestored: (callback) => {
    const listener = () => callback();
    electron.ipcRenderer.on("window-restored", listener);
    return () => electron.ipcRenderer.removeListener("window-restored", listener);
  }
});
