use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadProgress {
    pub filename: String,
    pub downloaded: u64,
    pub total: u64,
    pub speed: f64,
    pub percentage: f64,
}

pub async fn download_patch<F>(
    url: &str,
    dest_path: &str,
    mut on_progress: F,
) -> Result<(), String>
where
    F: FnMut(DownloadProgress),
{
    let client = reqwest::Client::new();
    let response = client
        .get(url)
        .send()
        .await
        .map_err(|e| format!("Failed to start download: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Download failed with status: {}", response.status()));
    }

    let total_length = response.content_length().unwrap_or(0);
    let filename = url.split('/').last().unwrap_or("unknown").to_string();

    let mut file = tokio::fs::File::create(dest_path)
        .await
        .map_err(|e| format!("Failed to create file: {}", e))?;

    let mut downloaded: u64 = 0;
    let mut last_time = std::time::Instant::now();
    let mut last_downloaded: u64 = 0;
    let mut speed: f64 = 0.0;

    use futures_util::StreamExt;
    use tokio::io::AsyncWriteExt;

    let mut stream = response.bytes_stream();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| format!("Error reading chunk: {}", e))?;
        
        file.write_all(&chunk)
            .await
            .map_err(|e| format!("Error writing to file: {}", e))?;

        downloaded += chunk.len() as u64;

        let now = std::time::Instant::now();
        let elapsed = now.duration_since(last_time).as_secs_f64();

        // Update speed every 500ms
        if elapsed >= 0.5 {
            speed = (downloaded - last_downloaded) as f64 / elapsed;
            last_time = now;
            last_downloaded = downloaded;
        }

        let percentage = if total_length > 0 {
            (downloaded as f64 / total_length as f64) * 100.0
        } else {
            0.0
        };

        on_progress(DownloadProgress {
            filename: filename.clone(),
            downloaded,
            total: total_length,
            speed,
            percentage,
        });
    }

    file.flush()
        .await
        .map_err(|e| format!("Failed to flush file: {}", e))?;

    Ok(())
}

pub async fn download_with_retry<F>(
    url: &str,
    dest_path: &str,
    on_progress: F,
    max_retries: u32,
) -> Result<(), String>
where
    F: FnMut(DownloadProgress) + Clone,
{
    let mut last_error = String::new();

    for attempt in 1..=max_retries {
        match download_patch(url, dest_path, on_progress.clone()).await {
            Ok(_) => return Ok(()),
            Err(e) => {
                last_error = e;
                eprintln!("Download attempt {} failed: {}", attempt, last_error);

                if attempt < max_retries {
                    tokio::time::sleep(tokio::time::Duration::from_secs(attempt as u64)).await;
                }
            }
        }
    }

    Err(format!("Download failed after {} retries: {}", max_retries, last_error))
}

pub fn format_bytes(bytes: u64) -> String {
    if bytes == 0 {
        return "0 B".to_string();
    }

    const K: f64 = 1024.0;
    let sizes = ["B", "KB", "MB", "GB"];
    let i = (bytes as f64).log(K).floor() as usize;
    let i = i.min(sizes.len() - 1);

    format!("{:.2} {}", bytes as f64 / K.powi(i as i32), sizes[i])
}

pub fn format_speed(bytes_per_second: f64) -> String {
    format!("{}/s", format_bytes(bytes_per_second as u64))
}
