import React, { useState, useEffect, useCallback } from 'react';
import { PatcherUI } from './components/PatcherUI';
import { SettingsModal } from './components/SettingsModal';
import { TitleBar } from './components/TitleBar';
import { PatcherConfig, PatchingStatus, DownloadProgress } from './types/patcher';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';

// Check if running in Tauri
const isTauri = typeof window !== 'undefined' && window.__TAURI__ !== undefined;

const App: React.FC = () => {
    const [config, setConfig] = useState<PatcherConfig | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [status, setStatus] = useState<PatchingStatus>({ status: 'idle' });
    const [progress, setProgress] = useState<DownloadProgress | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isGrayFloor, setIsGrayFloor] = useState(false);
    const [audio] = useState(new Audio());

    // Music setup
    useEffect(() => {
        if (!config) {
            console.log('[DEBUG] Audio: Config not loaded yet, skipping music setup');
            return;
        }

        const bgmFile = config?.client?.bgm || 'bgm.mp3';
        console.log('[DEBUG] Audio: Setting up BGM file:', bgmFile);
        audio.src = `/${bgmFile}`;
        audio.loop = true;
        audio.volume = 0.3;

        // Force play immediately (Electron autoplay policy allows this now)
        const startMusic = async () => {
            try {
                console.log('[DEBUG] Audio: Attempting to play...');
                await audio.play();
                console.log('[DEBUG] Audio: Playing successfully!');
            } catch (e) {
                console.warn("[DEBUG] Audio: Autoplay blocked/failed, waiting for interaction", e);
                const playOnClick = () => {
                    audio.play().catch(console.error);
                    window.removeEventListener('click', playOnClick);
                };
                window.addEventListener('click', playOnClick);
            }
        };
        startMusic();

        // Pause/Resume on window events
        let cleanupMinimize: (() => void) | undefined;
        let cleanupRestore: (() => void) | undefined;

        if (isTauri) {
            // Window minimize/restore events are handled differently in Tauri
            // We can listen to window events if needed, but for now we'll skip this
            // as the music control is less critical
        }

        return () => {
            audio.pause();
            cleanupMinimize?.();
            cleanupRestore?.();
        };
    }, [audio, config]);

    // Handle Mute/Unmute (Pause/Play)
    useEffect(() => {
        if (isMuted) {
            audio.pause();
        } else {
            // Only resume if we are not minimized (hard to check without extra state, but generally safe)
            // If the audio source is set, we can try playing
            if (audio.src) {
                audio.play().catch(console.error);
            }
        }
    }, [isMuted, audio]);

    // Load configuration on mount
    useEffect(() => {
        const loadConfig = async () => {
            if (isTauri) {
                try {
                    const cfg = await invoke<PatcherConfig>('get_config');
                    setConfig(cfg);
                } catch (err) {
                    console.error('Failed to load config:', err);
                }
            } else {
                // Mock config for development in browser
                setConfig({
                    window: { title: 'Kafra Client', width: 900, height: 600, resizable: false },
                    play: { path: 'ragnarok.exe', arguments: [], exit_on_success: true },
                    web: {
                        index_url: '',
                        patch_servers: [
                            { name: 'Primary', plist_url: 'https://example.com/plist.txt', patch_url: 'https://example.com/patches' }
                        ]
                    },
                    client: { default_grf_name: 'data.grf' },
                    patching: { in_place: true, check_integrity: true, create_grf: false }
                });
            }
        };
        loadConfig();
    }, []);

    // Subscribe to patching events
    useEffect(() => {
        if (!isTauri) return;

        let unlistenStatus: (() => void) | null = null;
        let unlistenProgress: (() => void) | null = null;

        const setupListeners = async () => {
            unlistenStatus = await listen<PatchingStatus>('patching-status', (event) => {
                setStatus(event.payload);
                if (event.payload.error) {
                    setError(event.payload.error);
                }
            });

            unlistenProgress = await listen<DownloadProgress>('download-progress', (event) => {
                setProgress(event.payload);
            });
        };

        setupListeners();

        return () => {
            if (unlistenStatus) unlistenStatus();
            if (unlistenProgress) unlistenProgress();
        };
    }, []);

    // Start update automatically on load
    useEffect(() => {
        if (config && isTauri) {
            handleStartUpdate();
        } else if (config && !isTauri) {
            // Simulate patching for browser development
            simulatePatching();
        }
    }, [config]);

    const simulatePatching = async () => {
        setStatus({ status: 'checking' });
        await delay(1000);

        setStatus({ status: 'downloading', current: 1, total: 3, filename: 'patch_001.thor' });
        for (let i = 0; i <= 100; i += 10) {
            setProgress({
                filename: 'patch_001.thor',
                downloaded: i * 1024 * 10,
                total: 1024 * 1000,
                speed: 1024 * 500,
                percentage: i
            });
            await delay(100);
        }

        setStatus({ status: 'patching', current: 1, total: 3, filename: 'patch_001.thor' });
        await delay(500);

        setStatus({ status: 'ready' });
        setProgress(null);
    };

    const handleStartUpdate = useCallback(async () => {
        if (!isTauri) {
            simulatePatching();
            return;
        }

        setError(null);
        try {
            await invoke('start_update');
        } catch (error: any) {
            setError(error);
        }
    }, []);

    const handleCancelUpdate = useCallback(() => {
        if (isTauri) {
            invoke('cancel_update');
        }
        setStatus({ status: 'idle' });
        setProgress(null);
    }, []);

    const handlePlay = useCallback(async () => {
        if (!isTauri) {
            alert('Game would launch here in Tauri');
            return;
        }

        try {
            const result = await invoke<{ success: boolean; error?: string }>('launch_game');
            if (!result.success && result.error) {
                setError(result.error);
            }
        } catch (error: any) {
            setError(error);
        }
    }, []);

    const handleSetup = useCallback(async () => {
        if (!isTauri) {
            alert('Setup would launch here in Tauri');
            return;
        }

        try {
            const result = await invoke<{ success: boolean; error?: string }>('launch_setup');
            if (!result.success && result.error) {
                setError(result.error);
            }
        } catch (error: any) {
            setError(error);
        }
    }, []);

    const handleLogin = useCallback(async (username: string, password: string) => {
        if (!isTauri) {
            alert(`Login with ${username} would happen here in Tauri`);
            return;
        }

        try {
            const result = await invoke<{ success: boolean; error?: string }>('sso_login', { username, password });
            if (!result.success && result.error) {
                setError(result.error);
            }
        } catch (error: any) {
            setError(error);
        }
    }, []);


    const handleResetCache = useCallback(async () => {
        if (!isTauri) return;

        try {
            const result = await invoke<{ success: boolean; error?: string }>('reset_cache');
            if (result.success) {
                handleStartUpdate();
            } else if (result.error) {
                setError(result.error);
            }
        } catch (error: any) {
            setError(error);
        }
    }, [handleStartUpdate]);

    const handleToggleGrf = useCallback(async () => {
        if (!isTauri) {
            setIsGrayFloor(!isGrayFloor);
            return;
        }

        try {
            const result = await invoke<{ success: boolean; is_gray?: boolean; error?: string }>('toggle_grf', {
                normal: config?.client?.normal_grf || 'adata.grf',
                gray: config?.client?.gray_grf || 'sdata.grf'
            });

            if (result.success) {
                setIsGrayFloor(result.is_gray || false);
            } else if (result.error) {
                setError(result.error);
            }
        } catch (error: any) {
            setError(error);
        }
    }, [isGrayFloor]);

    const handleMinimize = useCallback(async () => {
        if (isTauri) {
            const { appWindow } = await import('@tauri-apps/api/window');
            appWindow.minimize();
        } else {
            console.log('Minimize (Mock)');
        }
    }, []);

    const handleClose = useCallback(async () => {
        if (isTauri) {
            const { appWindow } = await import('@tauri-apps/api/window');
            appWindow.close();
        } else {
            alert('Close (Mock): In production this closes the window.');
        }
    }, []);

    return (
        <div className="flex flex-col h-screen w-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
            <TitleBar
                title={config?.window.title || 'RPatchur'}
                onMinimize={handleMinimize}
                onClose={handleClose}
                onSettings={() => setIsSettingsOpen(true)}
                isMuted={isMuted}
                onToggleMute={() => setIsMuted(!isMuted)}
            />

            <main className="flex-1 relative overflow-hidden">
                <PatcherUI
                    status={status}
                    progress={progress}
                    error={error}
                    isReady={status.status === 'ready' || (status.status === 'error' && (config?.play?.skip_error ?? false))}
                    onPlay={handlePlay}
                    onSetup={config?.setup ? handleSetup : undefined}
                    onLogin={handleLogin}
                    onResetCache={handleResetCache}
                    onRetry={handleStartUpdate}
                    onCancel={handleCancelUpdate}
                    isGrayFloor={isGrayFloor}
                    onToggleGrf={handleToggleGrf}
                    isSSOEnabled={config?.client?.sso_login ?? false}
                    config={config}
                />
            </main>

            {isSettingsOpen && (
                <SettingsModal
                    config={config}
                    onClose={() => setIsSettingsOpen(false)}
                />
            )}
        </div>
    );
};

// Helper function for simulation
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default App;
