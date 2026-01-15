// Prevents additional console window on Windows in release mode
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod config;
mod patcher;

use config::PatcherConfig;
#[cfg(debug_assertions)]
use config::load_config;
use patcher::downloader::{download_patch, DownloadProgress};
use patcher::patch_list::fetch_patch_list;
use patcher::thor_patcher::extract_thor_patch;
use serde::{Deserialize, Serialize};
use std::process::Command;
use std::sync::{Arc, Mutex};
use tauri::{Manager, State};

#[derive(Debug, Clone, Serialize, Deserialize)]
struct PatchingStatus {
    status: String,
    current: Option<u32>,
    total: Option<u32>,
    filename: Option<String>,
    error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct CommandResult {
    success: bool,
    error: Option<String>,
    message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ToggleResult {
    success: bool,
    is_gray: Option<bool>,
    error: Option<String>,
}

struct AppState {
    config: Arc<Mutex<Option<PatcherConfig>>>,
}

#[tauri::command]
fn get_config(state: State<AppState>) -> Result<PatcherConfig, String> {
    let config_lock = state.config.lock().unwrap();
    config_lock.clone().ok_or_else(|| "No configuration loaded".to_string())
}

#[tauri::command]
async fn start_update(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
) -> Result<CommandResult, String> {
    let config = {
        let config_lock = state.config.lock().unwrap();
        config_lock.clone().ok_or_else(|| "No configuration loaded".to_string())?
    };

    let app_clone = app.clone();

    tokio::spawn(async move {
        // Send status: checking
        let _ = app_clone.emit_all("patching-status", PatchingStatus {
            status: "checking".to_string(),
            current: None,
            total: None,
            filename: None,
            error: None,
        });

        // Fetch patch list
        let patch_server = match config.web.patch_servers.first() {
            Some(server) => server,
            None => {
                let _ = app_clone.emit_all("patching-status", PatchingStatus {
                    status: "error".to_string(),
                    current: None,
                    total: None,
                    filename: None,
                    error: Some("No patch server configured".to_string()),
                });
                return;
            }
        };

        let patches = match fetch_patch_list(&patch_server.plist_url).await {
            Ok(p) => p,
            Err(e) => {
                let _ = app_clone.emit_all("patching-status", PatchingStatus {
                    status: "error".to_string(),
                    current: None,
                    total: None,
                    filename: None,
                    error: Some(e),
                });
                return;
            }
        };

        if patches.is_empty() {
            let _ = app_clone.emit_all("patching-status", PatchingStatus {
                status: "ready".to_string(),
                current: None,
                total: None,
                filename: None,
                error: None,
            });
            return;
        }

        // Download and apply patches
        let exe_path = std::env::current_exe().unwrap();
        let target_dir = exe_path.parent().unwrap().to_string_lossy().to_string();
        let temp_dir = std::env::temp_dir();

        for (i, patch) in patches.iter().enumerate() {
            let patch_url = format!("{}/{}", patch_server.patch_url, patch.filename);
            let temp_path = temp_dir.join(&patch.filename);

            // Send downloading status
            let _ = app_clone.emit_all("patching-status", PatchingStatus {
                status: "downloading".to_string(),
                current: Some(i as u32 + 1),
                total: Some(patches.len() as u32),
                filename: Some(patch.filename.clone()),
                error: None,
            });

            // Download
            let app_for_progress = app_clone.clone();
            let download_result = download_patch(
                &patch_url,
                &temp_path.to_string_lossy(),
                move |progress: DownloadProgress| {
                    let _ = app_for_progress.emit_all("download-progress", progress);
                },
            ).await;

            if let Err(e) = download_result {
                let error_msg = config.messages.as_ref()
                    .and_then(|m| m.patching.as_ref())
                    .and_then(|p| p.error_download.clone())
                    .unwrap_or_else(|| format!("Download failed: {}", e));

                let _ = app_clone.emit_all("patching-status", PatchingStatus {
                    status: "error".to_string(),
                    current: None,
                    total: None,
                    filename: None,
                    error: Some(error_msg),
                });
                return;
            }

            // Send patching status
            let _ = app_clone.emit_all("patching-status", PatchingStatus {
                status: "patching".to_string(),
                current: Some(i as u32 + 1),
                total: Some(patches.len() as u32),
                filename: Some(patch.filename.clone()),
                error: None,
            });

            // Extract/Apply
            if let Err(e) = extract_thor_patch(
                &temp_path.to_string_lossy(),
                &target_dir,
                &config.client.default_grf_name,
            ) {
                let error_msg = config.messages.as_ref()
                    .and_then(|m| m.patching.as_ref())
                    .and_then(|p| p.error_extract.clone())
                    .unwrap_or_else(|| format!("Extraction failed: {}", e));

                let _ = app_clone.emit_all("patching-status", PatchingStatus {
                    status: "error".to_string(),
                    current: None,
                    total: None,
                    filename: None,
                    error: Some(error_msg),
                });
                return;
            }

            // Cleanup
            let _ = std::fs::remove_file(temp_path);
        }

        // Done
        let _ = app_clone.emit_all("patching-status", PatchingStatus {
            status: "ready".to_string(),
            current: None,
            total: None,
            filename: None,
            error: None,
        });
    });

    Ok(CommandResult {
        success: true,
        error: None,
        message: None,
    })
}

#[tauri::command]
fn cancel_update(app: tauri::AppHandle) -> Result<(), String> {
    // TODO: Implement cancellation with tokio cancellation token
    let _ = app.emit_all("patching-status", PatchingStatus {
        status: "idle".to_string(),
        current: None,
        total: None,
        filename: None,
        error: None,
    });
    Ok(())
}

#[tauri::command]
fn launch_game(state: State<AppState>) -> Result<CommandResult, String> {
    let config = {
        let config_lock = state.config.lock().unwrap();
        config_lock.clone().ok_or_else(|| "No configuration loaded".to_string())?
    };

    let exe_path = std::env::current_exe().map_err(|e| e.to_string())?;
    let exe_dir = exe_path.parent().ok_or("Failed to get exe directory")?;
    let game_path = exe_dir.join(&config.play.path);

    if !game_path.exists() {
        return Ok(CommandResult {
            success: false,
            error: Some(format!("Game executable not found at: {}", game_path.display())),
            message: None,
        });
    }

    let _child = Command::new(&game_path)
        .args(&config.play.arguments)
        .current_dir(game_path.parent().unwrap())
        .spawn()
        .map_err(|e| format!("Failed to launch game: {}", e))?;

    if config.play.exit_on_success {
        std::process::exit(0);
    }

    Ok(CommandResult {
        success: true,
        error: None,
        message: None,
    })
}

#[tauri::command]
fn launch_setup(state: State<AppState>) -> Result<CommandResult, String> {
    let config = {
        let config_lock = state.config.lock().unwrap();
        config_lock.clone().ok_or_else(|| "No configuration loaded".to_string())?
    };

    let setup_config = config.setup.ok_or("Setup not configured")?;

    let exe_path = std::env::current_exe().map_err(|e| e.to_string())?;
    let exe_dir = exe_path.parent().ok_or("Failed to get exe directory")?;
    let setup_path = exe_dir.join(&setup_config.path);

    let _child = Command::new(&setup_path)
        .args(&setup_config.arguments)
        .current_dir(setup_path.parent().unwrap())
        .spawn()
        .map_err(|e| format!("Failed to launch setup: {}", e))?;

    if setup_config.exit_on_success {
        std::process::exit(0);
    }

    Ok(CommandResult {
        success: true,
        error: None,
        message: None,
    })
}

#[tauri::command]
fn sso_login(
    state: State<AppState>,
    username: String,
    password: String,
) -> Result<CommandResult, String> {
    let config = {
        let config_lock = state.config.lock().unwrap();
        config_lock.clone().ok_or_else(|| "No configuration loaded".to_string())?
    };

    let exe_path = std::env::current_exe().map_err(|e| e.to_string())?;
    let exe_dir = exe_path.parent().ok_or("Failed to get exe directory")?;
    let game_path = exe_dir.join(&config.play.path);

    let mut args = config.play.arguments.clone();
    args.push("-t".to_string());
    args.push(username);
    args.push(password);

    let _child = Command::new(&game_path)
        .args(&args)
        .current_dir(game_path.parent().unwrap())
        .spawn()
        .map_err(|e| format!("Failed to launch with SSO: {}", e))?;

    if config.play.exit_on_success {
        std::process::exit(0);
    }

    Ok(CommandResult {
        success: true,
        error: None,
        message: None,
    })
}

#[tauri::command]
fn reset_cache() -> Result<CommandResult, String> {
    let cache_path = std::env::current_exe()
        .map_err(|e| e.to_string())?
        .parent()
        .ok_or("Failed to get directory")?
        .join("patch-cache.json");

    if cache_path.exists() {
        std::fs::remove_file(cache_path).map_err(|e| e.to_string())?;
    }

    Ok(CommandResult {
        success: true,
        error: None,
        message: None,
    })
}

#[tauri::command]
fn open_external(url: String) -> Result<(), String> {
    open::that(&url).map_err(|e| e.to_string())
}

#[tauri::command]
fn toggle_grf(state: State<AppState>) -> Result<ToggleResult, String> {
    let config = {
        let config_lock = state.config.lock().unwrap();
        config_lock.clone().ok_or_else(|| "No configuration loaded".to_string())?
    };

    let normal_grfs = config.client.normal_grf.ok_or("Normal GRFs not configured")?;
    let gray_grfs = config.client.gray_grf.ok_or("Gray GRFs not configured")?;

    let exe_path = std::env::current_exe().map_err(|e| e.to_string())?;
    let data_ini_path = exe_path.parent()
        .ok_or("Failed to get directory")?
        .join("data.ini");

    // Read as bytes to handle potential non-UTF8 characters (common in legacy INI files)
    let content_bytes = if data_ini_path.exists() {
        std::fs::read(&data_ini_path).map_err(|e| format!("Failed to read data.ini: {}", e))?
    } else {
        Vec::new()
    };
    let content = String::from_utf8_lossy(&content_bytes);

    // Determine current state by checking if the first entry of Gray GRFs is strictly present (key=value)
    // We use the first key of Gray GRF config as the reference.
    let (g_key, g_val) = gray_grfs.iter().next().ok_or("Gray GRF config empty")?;
    
    // We search for "1=Graydata.grf" (example) to avoid ambiguity if names are shared
    let search_marker = format!("{}={}", g_key, g_val);
    let is_currently_gray = content.contains(&search_marker);

    let target_grfs = if is_currently_gray { &normal_grfs } else { &gray_grfs };
    
    // Parse existing zero entry to preserve it
    let mut zero_entry = None;
    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("0=") {
             zero_entry = Some(trimmed.to_string());
             break;
        }
    }

    let mut new_content = String::from("[Data]\r\n");
    
    // Preserve 0 if it existed
    if let Some(z) = zero_entry {
        new_content.push_str(&format!("{}\r\n", z));
    }
    
    for (index, filename) in target_grfs {
        new_content.push_str(&format!("{}={}\r\n", index, filename));
    }

    std::fs::write(&data_ini_path, new_content)
        .map_err(|e| format!("Failed to write data.ini: {}", e))?;



    Ok(ToggleResult {
        success: true,
        is_gray: Some(!is_currently_gray),
        error: None,
    })
}

#[tauri::command]
fn launch_exe(exe_path: String) -> Result<CommandResult, String> {
    let current_exe = std::env::current_exe().map_err(|e| e.to_string())?;
    let exe_dir = current_exe.parent().ok_or("Failed to get directory")?;
    let full_path = exe_dir.join(&exe_path);

    if !full_path.exists() {
        return Ok(CommandResult {
            success: false,
            error: Some(format!("File not found: {}", exe_path)),
            message: None,
        });
    }

    let _child = Command::new(&full_path)
        .current_dir(full_path.parent().unwrap())
        .spawn()
        .map_err(|e| format!("Failed to launch: {}", e))?;

    Ok(CommandResult {
        success: true,
        error: None,
        message: None,
    })
}

fn main() {
    // In release mode, config is embedded at compile time
    #[cfg(not(debug_assertions))]
    let config = {
        const EMBEDDED_CONFIG: &str = include_str!("../../config.yml");
        match serde_yaml::from_str::<PatcherConfig>(EMBEDDED_CONFIG) {
            Ok(cfg) => Some(cfg),
            Err(e) => {
                eprintln!("Failed to parse embedded config: {}", e);
                Some(PatcherConfig::default())
            }
        }
    };

    // In debug mode, load config from external file for easier development
    #[cfg(debug_assertions)]
    let config = {
        let exe_path = std::env::current_exe().unwrap();
        let mut config_path = exe_path.parent().unwrap().join("config.yml");
        
        println!("[DEBUG] Executable path: {:?}", exe_path);
        
        // Try to find config in project root (parent of src-tauri)
        if let Ok(cwd) = std::env::current_dir() {
            println!("[DEBUG] Current working directory: {:?}", cwd);
            
            let dev_path = cwd.join("config.yml");
            if dev_path.exists() {
                config_path = dev_path;
            } else if let Some(parent) = cwd.parent() {
                let root_path = parent.join("config.yml");
                if root_path.exists() {
                    config_path = root_path;
                }
            }
        }
        
        println!("[DEBUG] Final config path: {:?}", config_path);
        
        if config_path.exists() {
            match load_config(&config_path) {
                Ok(cfg) => {
                    println!("[DEBUG] Config loaded: {} ({}x{})", 
                        cfg.window.title, cfg.window.width, cfg.window.height);
                    Some(cfg)
                }
                Err(e) => {
                    println!("[ERROR] Failed to load config: {}", e);
                    Some(PatcherConfig::default())
                }
            }
        } else {
            println!("[DEBUG] Config not found, using defaults");
            Some(PatcherConfig::default())
        }
    };

    let app_state = AppState {
        config: Arc::new(Mutex::new(config)),
    };

    tauri::Builder::default()
        .manage(app_state)
        .setup(|app| {
            let state = app.state::<AppState>();
            let config_lock = state.config.lock().unwrap();

            if let Some(config) = &*config_lock {
                if let Some(window) = app.get_window("main") {
                    let _ = window.set_title(&config.window.title);
                    let _ = window.set_size(tauri::Size::Physical(tauri::PhysicalSize {
                        width: config.window.width,
                        height: config.window.height,
                    }));
                    let _ = window.set_resizable(config.window.resizable);
                    let _ = window.center();
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_config,
            start_update,
            cancel_update,
            launch_game,
            launch_setup,
            sso_login,
            reset_cache,
            open_external,
            toggle_grf,
            launch_exe
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
