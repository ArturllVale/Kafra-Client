use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowConfig {
    #[serde(default = "default_title")]
    pub title: String,
    #[serde(default = "default_width")]
    pub width: u32,
    #[serde(default = "default_height")]
    pub height: u32,
    #[serde(default)]
    pub resizable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayConfig {
    pub path: String,
    #[serde(default)]
    pub arguments: Vec<String>,
    #[serde(default = "default_true")]
    pub exit_on_success: bool,
    #[serde(default)]
    pub skip_error: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SetupConfig {
    pub path: String,
    #[serde(default)]
    pub arguments: Vec<String>,
    #[serde(default)]
    pub exit_on_success: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatchServer {
    pub name: String,
    pub plist_url: String,
    pub patch_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebConfig {
    pub index_url: String,
    pub preferred_patch_server: Option<String>,
    #[serde(default)]
    pub patch_servers: Vec<PatchServer>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClientConfig {
    #[serde(default = "default_grf_name")]
    pub default_grf_name: String,
    #[serde(default)]
    pub sso_login: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatchingConfig {
    #[serde(default = "default_true")]
    pub in_place: bool,
    #[serde(default = "default_true")]
    pub check_integrity: bool,
    #[serde(default)]
    pub create_grf: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatchingMessages {
    pub error_download: Option<String>,
    pub error_extract: Option<String>,
    pub error_generic: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameMessages {
    pub launch_error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UiTitles {
    pub news: Option<String>,
    pub sso_login: Option<String>,
    pub server_status: Option<String>,
    pub actions: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UiButtons {
    pub login: Option<String>,
    pub setup: Option<String>,
    pub toggle_gray: Option<String>,
    pub toggle_normal: Option<String>,
    pub reset_cache: Option<String>,
    pub cancel: Option<String>,
    pub play: Option<String>,
    pub patching: Option<String>,
    pub wait: Option<String>,
    pub retry: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UiStatus {
    pub idle: Option<String>,
    pub checking: Option<String>,
    pub downloading: Option<String>,
    pub patching: Option<String>,
    pub ready: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UiMessages {
    pub titles: Option<UiTitles>,
    pub buttons: Option<UiButtons>,
    pub status: Option<UiStatus>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessagesConfig {
    pub patching: Option<PatchingMessages>,
    pub game: Option<GameMessages>,
    pub ui: Option<UiMessages>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatcherConfig {
    pub window: WindowConfig,
    pub play: PlayConfig,
    pub setup: Option<SetupConfig>,
    pub web: WebConfig,
    pub client: ClientConfig,
    pub patching: PatchingConfig,
    pub messages: Option<MessagesConfig>,
}

// Default functions
fn default_title() -> String {
    "Kafra Client".to_string()
}

fn default_width() -> u32 {
    900
}

fn default_height() -> u32 {
    600
}

fn default_true() -> bool {
    true
}

fn default_grf_name() -> String {
    "data.grf".to_string()
}

impl Default for WindowConfig {
    fn default() -> Self {
        Self {
            title: default_title(),
            width: default_width(),
            height: default_height(),
            resizable: false,
        }
    }
}

impl Default for PatcherConfig {
    fn default() -> Self {
        Self {
            window: WindowConfig::default(),
            play: PlayConfig {
                path: "ragnarok.exe".to_string(),
                arguments: vec![],
                exit_on_success: true,
                skip_error: false,
            },
            setup: None,
            web: WebConfig {
                index_url: String::new(),
                preferred_patch_server: None,
                patch_servers: vec![],
            },
            client: ClientConfig {
                default_grf_name: default_grf_name(),
                sso_login: false,
            },
            patching: PatchingConfig {
                in_place: true,
                check_integrity: true,
                create_grf: false,
            },
            messages: None,
        }
    }
}

pub fn load_config<P: AsRef<Path>>(path: P) -> Result<PatcherConfig, String> {
    let content = fs::read_to_string(path)
        .map_err(|e| format!("Failed to read config file: {}", e))?;

    let config: PatcherConfig = serde_yaml::from_str(&content)
        .map_err(|e| format!("Failed to parse config: {}", e))?;

    Ok(config)
}
