import React from 'react';
import { PatcherConfig } from '../types/patcher';

interface SettingsModalProps {
    config: PatcherConfig | null;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ config, onClose }) => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Configuration
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-slate-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Game Settings */}
                    <section>
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
                            Game Settings
                        </h3>
                        <div className="space-y-3">
                            <SettingItem
                                label="Game Executable"
                                value={config?.play.path || 'ragnarok.exe'}
                                readOnly
                            />
                            <SettingItem
                                label="Default GRF"
                                value={config?.client.default_grf_name || 'data.grf'}
                                readOnly
                            />
                        </div>
                    </section>

                    {/* Patch Servers */}
                    <section>
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
                            Patch Servers
                        </h3>
                        <div className="space-y-2">
                            {config?.web.patch_servers.map((server, index) => (
                                <div key={index} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-slate-300">{server.name}</span>
                                        <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                                            Active
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-mono truncate">{server.patch_url}</p>
                                </div>
                            )) || (
                                    <p className="text-sm text-slate-500">No patch servers configured</p>
                                )}
                        </div>
                    </section>

                    {/* Patching Options */}
                    <section>
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
                            Patching Options
                        </h3>
                        <div className="space-y-2">
                            <SettingToggle
                                label="In-place patching"
                                description="Patch GRF files directly without creating backups"
                                value={config?.patching.in_place ?? true}
                                readOnly
                            />
                            <SettingToggle
                                label="Check integrity"
                                description="Verify patch files before applying"
                                value={config?.patching.check_integrity ?? true}
                                readOnly
                            />
                            <SettingToggle
                                label="Create GRF if missing"
                                description="Create new GRF files if they don't exist"
                                value={config?.patching.create_grf ?? false}
                                readOnly
                            />
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700 flex justify-between items-center">
                    <p className="text-xs text-slate-500">
                        Configuration is read from rpatchur.yml
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Sub-components
interface SettingItemProps {
    label: string;
    value: string;
    readOnly?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ label, value, readOnly }) => (
    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
        <span className="text-sm text-slate-300">{label}</span>
        <span className={`text-sm font-mono ${readOnly ? 'text-slate-500' : 'text-white'}`}>
            {value}
        </span>
    </div>
);

interface SettingToggleProps {
    label: string;
    description?: string;
    value: boolean;
    readOnly?: boolean;
}

const SettingToggle: React.FC<SettingToggleProps> = ({ label, description, value }) => (
    <div className="flex items-start justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
        <div className="flex-1">
            <span className="text-sm text-slate-300">{label}</span>
            {description && (
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            )}
        </div>
        <div className={`w-9 h-5 rounded-full relative transition-colors ${value ? 'bg-blue-600' : 'bg-slate-700'}`}>
            <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'left-4' : 'left-0.5'
                    }`}
            />
        </div>
    </div>
);
