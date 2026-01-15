use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatchInfo {
    pub index: u32,
    pub filename: String,
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
        // No patch list found, assume up to date
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
        
        // Skip empty lines and comments
        if trimmed.is_empty() || trimmed.starts_with("//") || trimmed.starts_with('#') {
            continue;
        }

        let parts: Vec<&str> = trimmed.split_whitespace().collect();

        if parts.len() >= 2 {
            // Format: "index filename"
            if let Ok(index) = parts[0].parse::<u32>() {
                patches.push(PatchInfo {
                    index,
                    filename: parts[1].to_string(),
                });
            }
        } else if parts.len() == 1 {
            // Just filename, use array index
            patches.push(PatchInfo {
                index: patches.len() as u32,
                filename: parts[0].to_string(),
            });
        }
    }

    // Sort by index
    patches.sort_by_key(|p| p.index);

    Ok(patches)
}

pub fn _get_applied_patches(cache_path: &str) -> Vec<u32> {
    match std::fs::read_to_string(cache_path) {
        Ok(content) => {
            if let Ok(cache) = serde_json::from_str::<serde_json::Value>(&content) {
                if let Some(applied) = cache.get("appliedPatches").and_then(|v| v.as_array()) {
                    return applied
                        .iter()
                        .filter_map(|v| v.as_u64().map(|n| n as u32))
                        .collect();
                }
            }
            vec![]
        }
        Err(_) => vec![],
    }
}

pub fn _save_applied_patches(cache_path: &str, patches: &[u32]) -> Result<(), String> {
    let cache = serde_json::json!({
        "appliedPatches": patches,
        "lastUpdated": chrono::Utc::now().to_rfc3339()
    });

    std::fs::write(cache_path, serde_json::to_string_pretty(&cache).unwrap())
        .map_err(|e| format!("Failed to save cache: {}", e))
}

pub fn _get_unapplied_patches(all_patches: &[PatchInfo], applied_indices: &[u32]) -> Vec<PatchInfo> {
    let applied_set: std::collections::HashSet<u32> = applied_indices.iter().copied().collect();
    
    all_patches
        .iter()
        .filter(|patch| !applied_set.contains(&patch.index))
        .cloned()
        .collect()
}
