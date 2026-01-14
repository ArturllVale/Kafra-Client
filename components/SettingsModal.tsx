
import React, { useState } from 'react';
import { PatcherConfig } from '../types';

interface SettingsModalProps {
  config: PatcherConfig;
  onSave: (config: PatcherConfig) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ config, onSave, onClose }) => {
  const [localConfig, setLocalConfig] = useState(config);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-800 rounded-xl border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white uppercase tracking-tight">Configuration</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Game Client Path</label>
            <input 
              type="text" 
              value={localConfig.clientName}
              onChange={(e) => setLocalConfig({...localConfig, clientName: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Primary Mirror URL</label>
            <input 
              type="text" 
              value={localConfig.mirrors[0]}
              onChange={(e) => {
                const newMirrors = [...localConfig.mirrors];
                newMirrors[0] = e.target.value;
                setLocalConfig({...localConfig, mirrors: newMirrors});
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">GRF File Target</label>
            <input 
              type="text" 
              value={localConfig.grfPath}
              onChange={(e) => setLocalConfig({...localConfig, grfPath: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="sso"
              checked={localConfig.ssoEnabled}
              onChange={(e) => setLocalConfig({...localConfig, ssoEnabled: e.target.checked})}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-blue-500/20"
            />
            <label htmlFor="sso" className="text-sm text-slate-300">Enable SSO (Launcher Login)</label>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(localConfig)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
