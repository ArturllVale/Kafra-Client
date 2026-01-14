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
}

export interface PatchingConfig {
    in_place: boolean;
    check_integrity: boolean;
    create_grf: boolean;
}

export interface PatcherConfig {
    window: WindowConfig;
    play: PlayConfig;
    setup?: SetupConfig;
    web: WebConfig;
    client: ClientConfig;
    patching: PatchingConfig;
}

export async function loadConfig(configPath: string): Promise<PatcherConfig> {
    const content = await fs.promises.readFile(configPath, 'utf-8');
    const parsed = YAML.parse(content);

    // Validate and provide defaults
    const config: PatcherConfig = {
        window: {
            title: parsed.window?.title || 'RPatchur',
            width: parsed.window?.width || 900,
            height: parsed.window?.height || 600,
            resizable: parsed.window?.resizable ?? false
        },
        play: {
            path: parsed.play?.path || 'ragnarok.exe',
            arguments: parsed.play?.arguments || [],
            exit_on_success: parsed.play?.exit_on_success ?? true
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
            default_grf_name: parsed.client?.default_grf_name || 'data.grf'
        },
        patching: {
            in_place: parsed.patching?.in_place ?? true,
            check_integrity: parsed.patching?.check_integrity ?? true,
            create_grf: parsed.patching?.create_grf ?? false
        }
    };

    return config;
}

export function getDefaultConfig(): PatcherConfig {
    return {
        window: { title: 'RPatchur', width: 900, height: 600, resizable: false },
        play: { path: 'ragnarok.exe', arguments: [], exit_on_success: true },
        web: { index_url: '', patch_servers: [] },
        client: { default_grf_name: 'data.grf' },
        patching: { in_place: true, check_integrity: true, create_grf: false }
    };
}
