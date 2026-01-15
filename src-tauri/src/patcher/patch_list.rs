use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatchInfo {
    pub index: u32,
    pub filename: String,
    pub target_grf: Option<String>,
    pub force_extract: bool,
    pub hash: Option<String>,
    pub size: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocalCache {
    #[serde(rename = "lastPatchId")]
    pub last_patch_id: u32,
    #[serde(rename = "installedPatches")]
    pub installed_patches: Vec<u32>,
    #[serde(rename = "grfVersions", default)]
    pub grf_versions: HashMap<String, String>,
    #[serde(rename = "lastCheck")]
    pub last_check: String,
}

impl Default for LocalCache {
    fn default() -> Self {
        Self {
            last_patch_id: 0,
            installed_patches: Vec::new(),
            grf_versions: HashMap::new(),
            last_check: chrono::Utc::now().to_rfc3339(),
        }
    }
}

pub async fn fetch_patch_list(plist_url: &str) -> Result<Vec<PatchInfo>, String> {
    let client = reqwest::Client::new();
    
    let response = client
        .get(plist_url)
        .timeout(std::time::Duration::from_secs(30))
        .send()
        .await
        .map_err(|e| format!("Failed to fetch patch list: {}", e))?;

    if response.status() == 404 {
        return Ok(vec![]);
    }

    if !response.status().is_success() {
        return Err(format!("Failed to fetch patch list: HTTP {}", response.status()));
    }

    let text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    let mut patches = Vec::new();

    for line in text.lines() {
        let trimmed = line.trim();
        
        if trimmed.is_empty() || trimmed.starts_with("//") || trimmed.starts_with('#') {
            continue;
        }

        let parts: Vec<&str> = trimmed.split_whitespace().collect();

        if parts.len() >= 2 {
            if let Ok(index) = parts[0].parse::<u32>() {
                let filename = parts[1].to_string();
                let mut target_grf = None;
                let mut force_extract = false;
                let mut hash = None;
                let mut size = None;

                // Parse options starting from index 2
                for part in parts.iter().skip(2) {
                    if let Some((key, value)) = part.split_once('=') {
                        match key {
                            "target" => target_grf = Some(value.to_string()),
                            "extract" => force_extract = value == "true",
                            "hash" => hash = Some(value.to_string()),
                            "size" => size = value.parse().ok(),
                            _ => {}
                        }
                    }
                }

                patches.push(PatchInfo {
                    index,
                    filename,
                    target_grf,
                    force_extract,
                    hash,
                    size,
                });
            }
        }
    }

    patches.sort_by_key(|p| p.index);
    Ok(patches)
}

pub fn get_local_cache(cache_path: &str) -> LocalCache {
    match std::fs::read_to_string(cache_path) {
        Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
        Err(_) => LocalCache::default(),
    }
}

pub fn save_local_cache(cache_path: &str, cache: &LocalCache) -> Result<(), String> {
    std::fs::write(cache_path, serde_json::to_string_pretty(cache).unwrap())
        .map_err(|e| format!("Failed to save cache: {}", e))
}

pub fn filter_unapplied_patches(all_patches: &[PatchInfo], cache: &LocalCache) -> Vec<PatchInfo> {
    let installed_set: HashSet<u32> = cache.installed_patches.iter().copied().collect();
    
    all_patches
        .iter()
        .filter(|patch| !installed_set.contains(&patch.index))
        .cloned()
        .collect()
}
