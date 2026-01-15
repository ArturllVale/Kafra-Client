// Patcher API types exposed via preload script
export interface PatcherAPI {
    // Window controls
    minimize: () => void;
    close: () => void;

    // Configuration
    getConfig: () => Promise<PatcherConfig | null>;

    // Patching operations
    startUpdate: () => Promise<{ success: boolean; error?: string; message?: string }>;
    cancelUpdate: () => void;
    resetCache: () => Promise<{ success: boolean; error?: string }>;
    manualPatch: () => Promise<{ success: boolean; error?: string }>;

    // Game launching
    play: () => Promise<{ success: boolean; error?: string }>;
    setup: () => Promise<{ success: boolean; error?: string }>;
    launchExe: (path: string) => Promise<{ success: boolean; error?: string }>;
    login: (credentials: { username: string; password: string }) => Promise<{ success: boolean; error?: string }>;

    // File operations
    toggleGrf: (options: { normal: string; gray: string }) => Promise<{ success: boolean; isGray?: boolean; error?: string }>;

    // External links
    openExternal: (url: string) => void;

    // Event listeners (return unsubscribe function)
    onPatchingStatus: (callback: (data: PatchingStatus) => void) => () => void;
    onDownloadProgress: (callback: (data: DownloadProgress) => void) => () => void;
    onPatchApplied: (callback: (data: { filename: string }) => void) => () => void;
    onWindowMinimized: (callback: () => void) => () => void;
    onWindowRestored: (callback: () => void) => () => void;
}

export interface PatcherConfig {
    window: {
        title?: string;
        width: number;
        height: number;
        resizable: boolean;
    };
    play: {
        path: string;
        arguments?: string[];
        exit_on_success?: boolean;
    };
    setup?: {
        path: string;
        arguments?: string[];
        exit_on_success?: boolean;
    };
    web: {
        index_url: string;
        preferred_patch_server?: string;
        patch_servers: Array<{
            name: string;
            plist_url: string;
            patch_url: string;
        }>;
    };
    client: {
        default_grf_name: string;
        bgm?: string;
    };
    patching: {
        in_place: boolean;
        check_integrity: boolean;
        create_grf: boolean;
    };
}

export type PatchingStatusType = 'idle' | 'checking' | 'downloading' | 'patching' | 'ready' | 'error';

export interface PatchingStatus {
    status: PatchingStatusType;
    current?: number;
    total?: number;
    filename?: string;
    error?: string;
}

export interface DownloadProgress {
    filename: string;
    downloaded: number;
    total: number;
    speed: number;
    percentage: number;
}

// Declare global window type extension
declare global {
    interface Window {
        patcher: PatcherAPI;
    }
}
