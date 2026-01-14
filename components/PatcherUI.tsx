
import React from 'react';
import { PatchState, PatchStatus } from '../types';

interface PatcherUIProps {
  state: PatchState;
  onLaunch: () => void;
  newsSummary: string;
  ssoEnabled: boolean;
}

export const PatcherUI: React.FC<PatcherUIProps> = ({ state, onLaunch, newsSummary, ssoEnabled }) => {
  const isPatching = state.status !== PatchStatus.COMPLETE && state.status !== PatchStatus.IDLE && state.status !== PatchStatus.ERROR;

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      {/* Visual Header / Banner Area */}
      <div className="h-40 rounded-lg overflow-hidden relative shadow-lg bg-gradient-to-br from-blue-900 to-slate-800 flex items-center justify-center group">
        <img 
          src="https://picsum.photos/seed/ro/800/400" 
          alt="Game Banner" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-black italic tracking-tighter text-white drop-shadow-lg">R-PATCHUR</h1>
          <p className="text-blue-300 text-sm font-medium tracking-widest uppercase mt-1">Next-Gen Patcher & Launcher</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left: News/Info */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 flex flex-col gap-3 min-h-0">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Latest News</h3>
            <div className="overflow-y-auto space-y-3 pr-2">
              <div className="p-3 bg-slate-700/30 rounded border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-bold text-blue-200">System Update</span>
                  <span className="text-[10px] text-slate-500">2024-10-25</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {newsSummary}
                </p>
              </div>
              <div className="p-3 bg-slate-700/30 rounded border-l-4 border-emerald-500">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-bold text-emerald-200">New GRF Support</span>
                  <span className="text-[10px] text-slate-500">2024-10-20</span>
                </div>
                <p className="text-xs text-slate-400">Added support for GRF v0x200 and multiple patch mirrors.</p>
              </div>
            </div>
          </div>

          {/* SSO Mock */}
          {ssoEnabled && (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Username" 
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs focus:border-blue-500 outline-none"
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Server Status */}
        <div className="w-48 flex flex-col gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Server Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Login</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Map</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Char</span>
                <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></span>
              </div>
            </div>
          </div>
          <div className="mt-auto bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 text-center">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Mirror</div>
            <div className="text-xs font-mono text-blue-400 truncate">main-us-east.net</div>
          </div>
        </div>
      </div>

      {/* Progress & Actions */}
      <div className="mt-auto flex flex-col gap-4">
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
            <span>{state.status === PatchStatus.COMPLETE ? 'System Up to Date' : (state.currentFile || 'Ready')}</span>
            <span>{state.status === PatchStatus.DOWNLOADING && state.downloadSpeed}</span>
          </div>
          
          {/* Progress Bars */}
          <div className="space-y-1.5">
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${state.currentProgress}%` }}
              ></div>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700 p-[1px]">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-300 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${state.totalProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 text-[10px] text-slate-500 leading-tight">
            Version 1.0.4-stable<br/>
            Engine: rpatchur-core v2.1
          </div>
          
          <button
            onClick={onLaunch}
            disabled={!state.isReady}
            className={`px-12 py-3 rounded text-sm font-black uppercase tracking-widest shadow-lg transition-all transform active:scale-95 ${
              state.isReady 
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-500/20 cursor-pointer' 
              : 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600 opacity-50'
            }`}
          >
            {state.isReady ? 'Start Game' : isPatching ? 'Patching...' : 'Initializing'}
          </button>
        </div>
      </div>
    </div>
  );
};
