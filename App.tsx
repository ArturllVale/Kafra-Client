
import React, { useState, useEffect, useCallback } from 'react';
import { PatcherUI } from './components/PatcherUI';
import { SettingsModal } from './components/SettingsModal';
import { PatchStatus, PatchState, PatcherConfig } from './types';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [config, setConfig] = useState<PatcherConfig>({
    gameName: "Ragnarok Online: RPATCHUR",
    clientName: "ragnarok.exe",
    mirrors: ["https://mirror1.rpatchur.io", "https://mirror2.rpatchur.io"],
    grfPath: "data.grf",
    patchListUrl: "https://api.rpatchur.io/patches",
    ssoEnabled: true
  });

  const [patchState, setPatchState] = useState<PatchState>({
    status: PatchStatus.IDLE,
    currentFile: null,
    currentProgress: 0,
    totalProgress: 0,
    downloadSpeed: '0 KB/s',
    errorMessage: null,
    isReady: false
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newsSummary, setNewsSummary] = useState<string>("");

  // Helper para detectar se estamos no Electron
  const isElectron = /electron/i.test(navigator.userAgent);

  const fetchAISummary = useCallback(async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Summarize the latest Ragnarok Online patch trends for a launcher news board in 2 sentences.",
      });
      setNewsSummary(response.text || "Welcome to the latest version of rpatchur! Check out our new UI and improved GRF patching engine.");
    } catch (err) {
      setNewsSummary("Stable version 2.4.0 is now live. Enhanced security and faster GRF reading enabled.");
    }
  }, []);

  useEffect(() => {
    fetchAISummary();
    handleStartPatching();
  }, [fetchAISummary]);

  const handleStartPatching = async () => {
    setPatchState(prev => ({ ...prev, status: PatchStatus.CHECKING }));
    await new Promise(r => setTimeout(r, 1500));
    setPatchState(prev => ({ ...prev, status: PatchStatus.DOWNLOADING, currentFile: 'patch_2024_10_25.thor' }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setPatchState(prev => ({
        ...prev,
        currentProgress: progress,
        totalProgress: Math.min(progress * 0.8, 100),
        downloadSpeed: `${(Math.random() * 5 + 2).toFixed(1)} MB/s`
      }));

      if (progress >= 100) {
        clearInterval(interval);
        handleApplyPatch();
      }
    }, 200);
  };

  const handleApplyPatch = async () => {
    setPatchState(prev => ({ ...prev, status: PatchStatus.PATCHING, currentProgress: 0 }));
    await new Promise(r => setTimeout(r, 2000));
    setPatchState(prev => ({ 
      ...prev, 
      status: PatchStatus.COMPLETE, 
      isReady: true,
      currentFile: null,
      currentProgress: 100,
      totalProgress: 100
    }));
  };

  const handleLaunch = () => {
    if (!patchState.isReady) return;
    if (isElectron) {
      // @ts-ignore
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('launch-game', config.clientName);
    } else {
      alert(`Launching ${config.clientName}... (Web Simulation)`);
    }
  };

  const handleClose = () => {
    if (isElectron) {
      // @ts-ignore
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('window-close');
    } else {
      console.log("Closing Simulation");
    }
  };

  const handleMinimize = () => {
    if (isElectron) {
      // @ts-ignore
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('window-min');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-900 text-slate-100 font-sans border border-slate-700 shadow-2xl overflow-hidden rounded-lg">
      <header className="drag-region flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center font-bold text-xs">R</div>
          <span className="text-sm font-semibold tracking-wide uppercase text-slate-300">{config.gameName}</span>
        </div>
        <div className="no-drag flex items-center gap-1">
          <button 
            onClick={handleMinimize}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
          <button 
            onClick={handleClose}
            className="p-1 hover:bg-red-500 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden flex flex-col">
        <PatcherUI 
          state={patchState} 
          onLaunch={handleLaunch} 
          newsSummary={newsSummary}
          ssoEnabled={config.ssoEnabled}
        />
      </main>

      {isSettingsOpen && (
        <SettingsModal 
          config={config} 
          onSave={(newConfig) => { setConfig(newConfig); setIsSettingsOpen(false); }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
