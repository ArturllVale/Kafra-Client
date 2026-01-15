import React, { useState, useEffect, useCallback } from 'react';
import { PatcherUI } from './components/PatcherUI';
import { SettingsModal } from './components/SettingsModal';
import { TitleBar } from './components/TitleBar';
import { PatcherConfig, PatchingStatus, DownloadProgress } from './types/patcher';

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.patcher !== undefined;

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
        const bgmFile = config?.client?.bgm || 'bgm.mp3';
        audio.src = `/${bgmFile}`;
        audio.loop = true;
        audio.volume = 0.3;

        // Force play immediately (Electron autoplay policy allows this now)
        const startMusic = async () => {
            try {
                await audio.play();
            } catch (e) {
                console.warn("Autoplay blocked/failed, waiting for interaction", e);
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

        if (isElectron) {
            cleanupMinimize = window.patcher.onWindowMinimized(() => {
                console.log("Window minimized, pausing music");
                audio.pause();
            });

            cleanupRestore = window.patcher.onWindowRestored(() => {
                console.log("Window restored, resuming music");
                // Resume play, the mute effect will pause it immediately if needed
                audio.play().catch(console.error);
            });
        }

        return () => {
            audio.pause();
            cleanupMinimize?.();
            cleanupRestore?.();
        };
    }, [audio, config]); // Removed isMuted from dependencies to prevent reload

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
            if (isElectron) {
                try {
                    const cfg = await window.patcher.getConfig();
                    setConfig(cfg);
                } catch (err) {
                    console.error('Failed to load config:', err);
                }
            } else {
                // Mock config for development in browser
                setConfig({
                    window: { title: 'RPatchur', width: 900, height: 600, resizable: false },
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
        if (!isElectron) return;

        const unsubStatus = window.patcher.onPatchingStatus((data) => {
            setStatus(data);
            if (data.error) {
                setError(data.error);
            }
        });

        const unsubProgress = window.patcher.onDownloadProgress((data) => {
            setProgress(data);
        });

        const unsubPatch = window.patcher.onPatchApplied(({ filename }) => {
            console.log('Patch applied:', filename);
        });

        return () => {
            unsubStatus();
            unsubProgress();
            unsubPatch();
        };
    }, []);

    // Start update automatically on load
    useEffect(() => {
        if (config && isElectron) {
            handleStartUpdate();
        } else if (config && !isElectron) {
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
        if (!isElectron) {
            simulatePatching();
            return;
        }

        setError(null);
        const result = await window.patcher.startUpdate();
        if (!result.success && result.error) {
            setError(result.error);
        }
    }, []);

    const handleCancelUpdate = useCallback(() => {
        if (isElectron) {
            window.patcher.cancelUpdate();
        }
        setStatus({ status: 'idle' });
        setProgress(null);
    }, []);

    const handlePlay = useCallback(async () => {
        if (!isElectron) {
            alert('Game would launch here in Electron');
            return;
        }

        const result = await window.patcher.play();
        if (!result.success && result.error) {
            setError(result.error);
        }
    }, []);

    const handleSetup = useCallback(async () => {
        if (!isElectron) {
            alert('Setup would launch here in Electron');
            return;
        }

        const result = await window.patcher.setup();
        if (!result.success && result.error) {
            setError(result.error);
        }
    }, []);

    const handleLogin = useCallback(async (username: string, password: string) => {
        if (!isElectron) {
            alert(`Login with ${username} would happen here in Electron`);
            return;
        }

        const result = await window.patcher.login({ username, password });
        if (!result.success && result.error) {
            setError(result.error);
        }
    }, []);

    const handleManualPatch = useCallback(async () => {
        if (!isElectron) {
            alert('Manual patch dialog would open here in Electron');
            return;
        }

        const result = await window.patcher.manualPatch();
        if (!result.success && result.error) {
            setError(result.error);
        }
    }, []);

    const handleResetCache = useCallback(async () => {
        if (!isElectron) return;

        const result = await window.patcher.resetCache();
        if (result.success) {
            handleStartUpdate();
        } else if (result.error) {
            setError(result.error);
        }
    }, [handleStartUpdate]);

    const handleToggleGrf = useCallback(async () => {
        if (!isElectron) {
            setIsGrayFloor(!isGrayFloor);
            return;
        }

        const result = await window.patcher.toggleGrf({
            normal: 'adata.grf',
            gray: 'sdata.grf'
        });

        if (result.success) {
            setIsGrayFloor(result.isGray || false);
        } else if (result.error) {
            setError(result.error);
        }
    }, [isGrayFloor]);

    const handleMinimize = useCallback(() => {
        if (isElectron) {
            window.patcher.minimize();
        } else {
            console.log('Minimize (Mock)');
        }
    }, []);

    const handleClose = useCallback(() => {
        if (isElectron) {
            window.patcher.close();
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
                    isReady={status.status === 'ready'}
                    onPlay={handlePlay}
                    onSetup={config?.setup ? handleSetup : undefined}
                    onLogin={handleLogin}
                    onManualPatch={handleManualPatch}
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
