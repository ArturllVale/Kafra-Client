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
        skip_error?: boolean;
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
        sso_login?: boolean;
    };
    patching: {
        in_place: boolean;
        check_integrity: boolean;
        create_grf: boolean;
    };
    messages?: {
        patching?: {
            error_download?: string;
            error_extract?: string;
            error_generic?: string;
        };
        game?: {
            launch_error?: string;
        };
        ui?: {
            titles?: {
                news?: string;
                sso_login?: string;
                server_status?: string;
                actions?: string;
            };
            buttons?: {
                login?: string;
                setup?: string;
                toggle_gray?: string;
                toggle_normal?: string;
                manual_patch?: string;
                reset_cache?: string;
                cancel?: string;
                play?: string;
                patching?: string;
                wait?: string;
                retry?: string;
            };
            status?: {
                idle?: string;
                checking?: string;
                downloading?: string;
                patching?: string;
                ready?: string;
                error?: string;
            };
        };
    };
    custom_actions?: CustomAction[];
}

export interface CustomAction {
    label: string;
    type: 'exe' | 'link';
    target: string;
    color?: string; // Optional hex or class name (will be sanitized/handled in UI)
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
