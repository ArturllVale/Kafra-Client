import fs from 'fs';
import YAML from 'yaml';

export interface WindowConfig {
    title?: string;
    width: number;
    height: number;
    resizable: boolean;
}

export interface PlayConfig {
    path: string;
    arguments?: string[];
    exit_on_success?: boolean;
    skip_error?: boolean;
}

export interface SetupConfig {
    path: string;
    arguments?: string[];
    exit_on_success?: boolean;
}

export interface PatchServer {
    name: string;
    plist_url: string;
    patch_url: string;
}

export interface WebConfig {
    index_url: string;
    preferred_patch_server?: string;
    patch_servers: PatchServer[];
}

export interface ClientConfig {
    default_grf_name: string;
    sso_login?: boolean;

}

export interface PatchingConfig {
    in_place: boolean;
    check_integrity: boolean;
    create_grf: boolean;
}

export interface MessagesConfig {
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
            progress_status?: string;
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
}

export interface PatcherConfig {
    window: WindowConfig;
    play: PlayConfig;
    setup?: SetupConfig;
    web: WebConfig;
    client: ClientConfig;
    patching: PatchingConfig;
    messages?: MessagesConfig;
}

export async function loadConfig(configPath: string): Promise<PatcherConfig> {
    const content = await fs.promises.readFile(configPath, 'utf-8');
    const parsed = YAML.parse(content);

    // Validate and provide defaults
    const config: PatcherConfig = {
        window: {
            title: parsed.window?.title || 'Kafra Client',
            width: parsed.window?.width || 900,
            height: parsed.window?.height || 600,
            resizable: parsed.window?.resizable ?? false
        },
        play: {
            path: parsed.play?.path || 'ragnarok.exe',
            arguments: parsed.play?.arguments || [],
            exit_on_success: parsed.play?.exit_on_success ?? true,
            skip_error: parsed.play?.skip_error ?? false
        },
        setup: parsed.setup ? {
            path: parsed.setup.path,
            arguments: parsed.setup.arguments || [],
            exit_on_success: parsed.setup.exit_on_success ?? false
        } : undefined,
        web: {
            index_url: parsed.web?.index_url || '',
            preferred_patch_server: parsed.web?.preferred_patch_server,
            patch_servers: (parsed.web?.patch_servers || []).map((server: any) => ({
                name: server.name || 'default',
                plist_url: server.plist_url || '',
                patch_url: server.patch_url || ''
            }))
        },
        client: {
            default_grf_name: parsed.client?.default_grf_name || 'data.grf',
            sso_login: parsed.client?.sso_login ?? false

        },
        patching: {
            in_place: parsed.patching?.in_place ?? true,
            check_integrity: parsed.patching?.check_integrity ?? true,
            create_grf: parsed.patching?.create_grf ?? false
        },
        messages: {
            patching: {
                error_download: parsed.messages?.patching?.error_download || 'Failed to download patch',
                error_extract: parsed.messages?.patching?.error_extract || 'Failed to extract patch',
                error_generic: parsed.messages?.patching?.error_generic || 'An error occurred during patching'
            },
            game: {
                launch_error: parsed.messages?.game?.launch_error || 'Failed to launch game'
            },
            ui: {
                titles: {
                    news: parsed.messages?.ui?.titles?.news || 'Latest News',
                    sso_login: parsed.messages?.ui?.titles?.sso_login || 'Quick Login (SSO)',
                    server_status: parsed.messages?.ui?.titles?.server_status || 'Server Status',
                    actions: parsed.messages?.ui?.titles?.actions || 'Actions',
                },
                buttons: {
                    login: parsed.messages?.ui?.buttons?.login || 'Login',
                    setup: parsed.messages?.ui?.buttons?.setup || 'Setup',
                    toggle_gray: parsed.messages?.ui?.buttons?.toggle_gray || 'Disable Gray Floor',
                    toggle_normal: parsed.messages?.ui?.buttons?.toggle_normal || 'Enable Gray Floor',
                    manual_patch: parsed.messages?.ui?.buttons?.manual_patch || 'Manual Patch',
                    reset_cache: parsed.messages?.ui?.buttons?.reset_cache || 'Reset Cache',
                    cancel: parsed.messages?.ui?.buttons?.cancel || 'Cancel',
                    play: parsed.messages?.ui?.buttons?.play || 'Start Game',
                    patching: parsed.messages?.ui?.buttons?.patching || 'Patching...',
                    wait: parsed.messages?.ui?.buttons?.wait || 'Please Wait',
                    retry: parsed.messages?.ui?.buttons?.retry || 'Retry'
                },
                status: {
                    idle: parsed.messages?.ui?.status?.idle || 'Ready to start',
                    checking: parsed.messages?.ui?.status?.checking || 'Checking for updates...',
                    downloading: parsed.messages?.ui?.status?.downloading || 'Downloading: ${filename} (${current}/${total})',
                    patching: parsed.messages?.ui?.status?.patching || 'Applying: ${filename} (${current}/${total})',
                    ready: parsed.messages?.ui?.status?.ready || 'Game is up to date!',
                    error: parsed.messages?.ui?.status?.error || 'An error occurred'
                }
            }
        }
    };

    return config;
}

export function getDefaultConfig(): PatcherConfig {
    return {
        window: { title: 'Kafra Client', width: 900, height: 600, resizable: false },
        play: { path: 'ragnarok.exe', arguments: [], exit_on_success: true },
        web: { index_url: '', patch_servers: [] },
        client: { default_grf_name: 'data.grf' },
        patching: { in_place: true, check_integrity: true, create_grf: false }
    };
}
