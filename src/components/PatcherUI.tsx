import React, { useState } from 'react';
import { PatchingStatus, DownloadProgress } from '../types/patcher';
import { ProgressBar } from './ProgressBar';

interface PatcherUIProps {
    status: PatchingStatus;
    progress: DownloadProgress | null;
    error: string | null;
    isReady: boolean;
    onPlay: () => void;
    onSetup?: () => void;
    onLogin: (username: string, password: string) => void;
    onManualPatch: () => void;
    onResetCache: () => void;
    onRetry: () => void;
    onCancel: () => void;
    isGrayFloor: boolean;
    onToggleGrf: () => void;
}

export const PatcherUI: React.FC<PatcherUIProps> = ({
    status,
    progress,
    error,
    isReady,
    onPlay,
    onSetup,
    onLogin,
    onManualPatch,
    onResetCache,
    onRetry,
    onCancel,
    isGrayFloor,
    onToggleGrf
}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const isPatching = ['checking', 'downloading', 'patching'].includes(status.status);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username && password) {
            onLogin(username, password);
        }
    };

    const getStatusText = (): string => {
        switch (status.status) {
            case 'idle':
                return 'Ready to start';
            case 'checking':
                return 'Checking for updates...';
            case 'downloading':
                return status.filename
                    ? `Downloading: ${status.filename} (${status.current}/${status.total})`
                    : 'Downloading patches...';
            case 'patching':
                return status.filename
                    ? `Applying: ${status.filename} (${status.current}/${status.total})`
                    : 'Applying patches...';
            case 'ready':
                return 'Game is up to date!';
            case 'error':
                return 'An error occurred';
            default:
                return '';
        }
    };

    const formatSpeed = (bytesPerSecond: number): string => {
        if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(0)} B/s`;
        if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
        return `${(bytesPerSecond / (1024 * 1024)).toFixed(2)} MB/s`;
    };

    return (
        <div className="flex flex-col h-full p-6">
            {/* Banner Area */}
            <div className="h-44 rounded-xl overflow-hidden relative shadow-2xl mb-6 group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-800 to-purple-900" />
                <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/ragnarok/900/400')] bg-cover bg-center mix-blend-overlay opacity-40 group-hover:opacity-50 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                    <h1 className="text-5xl font-black italic tracking-tighter text-white drop-shadow-2xl">
                        KAFRA CLIENT
                    </h1>
                    <p className="text-blue-300 text-sm font-medium tracking-[0.3em] uppercase mt-2">
                        Premium Ragnarok Launcher
                    </p>
                </div>
            </div>

            <div className="flex gap-6 flex-1 min-h-0">
                {/* Left Column - News & Login */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                    {/* News Panel */}
                    <div className="glass rounded-xl p-4 flex-1 min-h-0">
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                            Latest News
                        </h3>
                        <div className="overflow-y-auto custom-scrollbar space-y-3 pr-2 max-h-32">
                            <NewsItem
                                title="Patcher Updated"
                                date="2024-01-15"
                                category="Update"
                                content="New electron-based patcher with improved performance and modern UI."
                            />
                            <NewsItem
                                title="Server Maintenance"
                                date="2024-01-14"
                                category="Notice"
                                content="Weekly maintenance completed. All servers are online."
                            />
                        </div>
                    </div>

                    {/* SSO Login Form */}
                    <form onSubmit={handleLogin} className="glass rounded-xl p-4">
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Quick Login (SSO)
                        </h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!isReady || !username || !password}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed"
                            >
                                Login
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Column - Status & Actions */}
                <div className="w-52 flex flex-col gap-4">
                    {/* Server Status */}
                    <div className="glass rounded-xl p-4">
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                            </svg>
                            Server Status
                        </h3>
                        <div className="space-y-2">
                            <ServerStatus name="Login" status="online" />
                            <ServerStatus name="Char" status="online" />
                            <ServerStatus name="Map" status="online" />
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="glass rounded-xl p-4 flex-1">
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
                            Actions
                        </h3>
                        <div className="space-y-2">
                            {onSetup && (
                                <button
                                    onClick={onSetup}
                                    className="w-full btn-secondary text-xs"
                                >
                                    Setup
                                </button>
                            )}
                            <button
                                onClick={onToggleGrf}
                                className={`w-full py-2 px-4 rounded transition-all text-xs font-bold border ${isGrayFloor
                                    ? 'bg-slate-700 border-slate-500 text-slate-100'
                                    : 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-600/30'
                                    }`}
                            >
                                {isGrayFloor ? 'Disable Gray Floor' : 'Enable Gray Floor'}
                            </button>
                            <button
                                onClick={onManualPatch}
                                disabled={isPatching}
                                className="w-full btn-secondary text-xs disabled:opacity-50"
                            >
                                Manual Patch
                            </button>
                            <button
                                onClick={onResetCache}
                                disabled={isPatching}
                                className="w-full btn-secondary text-xs disabled:opacity-50"
                            >
                                Reset Cache
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom: Progress & Play Button */}
            <div className="mt-6 space-y-4">
                {/* Status & Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className={`font-medium ${status.status === 'error' ? 'text-red-400' : 'text-slate-400'}`}>
                            {getStatusText()}
                        </span>
                        {progress && (
                            <span className="text-blue-400 font-mono">
                                {formatSpeed(progress.speed)}
                            </span>
                        )}
                    </div>

                    <ProgressBar
                        percentage={progress?.percentage || (status.status === 'ready' ? 100 : 0)}
                        isActive={isPatching}
                    />

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="truncate">{error}</span>
                            <button
                                onClick={onRetry}
                                className="ml-auto text-blue-400 hover:text-blue-300 font-medium"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 text-[10px] text-slate-500 leading-tight">
                        <span className="font-mono">v1.0.0</span>
                        <span className="mx-2">•</span>
                        <span>Kafra Client Engine</span>
                    </div>

                    {isPatching && (
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-all"
                        >
                            Cancel
                        </button>
                    )}

                    <button
                        onClick={onPlay}
                        disabled={!isReady}
                        className="btn-primary"
                    >
                        {isReady ? 'Start Game' : isPatching ? 'Patching...' : 'Please Wait'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Sub-components
interface NewsItemProps {
    title: string;
    date: string;
    category: 'Update' | 'Event' | 'Notice';
    content: string;
}

const NewsItem: React.FC<NewsItemProps> = ({ title, date, category, content }) => {
    const categoryColors = {
        Update: 'border-blue-500 text-blue-300',
        Event: 'border-emerald-500 text-emerald-300',
        Notice: 'border-amber-500 text-amber-300'
    };

    return (
        <div className={`p-3 bg-slate-800/50 rounded-lg border-l-4 ${categoryColors[category].split(' ')[0]}`}>
            <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-semibold ${categoryColors[category].split(' ')[1]}`}>
                    {title}
                </span>
                <span className="text-[10px] text-slate-500">{date}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{content}</p>
        </div>
    );
};

interface ServerStatusProps {
    name: string;
    status: 'online' | 'offline' | 'maintenance';
}

const ServerStatus: React.FC<ServerStatusProps> = ({ name, status }) => {
    const statusConfig = {
        online: { color: 'bg-emerald-500', shadow: 'shadow-emerald-500/50' },
        offline: { color: 'bg-red-500', shadow: 'shadow-red-500/50' },
        maintenance: { color: 'bg-amber-500', shadow: 'shadow-amber-500/50' }
    };

    const { color, shadow } = statusConfig[status];

    return (
        <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">{name}</span>
            <span className={`h-2 w-2 rounded-full ${color} shadow-lg ${shadow}`} />
        </div>
    );
};
