import axios from 'axios';
import fs from 'fs';

export interface DownloadProgress {
    filename: string;
    downloaded: number;
    total: number;
    speed: number;
    percentage: number;
}

export async function downloadPatch(
    url: string,
    destPath: string,
    onProgress?: (progress: DownloadProgress) => void
): Promise<void> {
    const writer = fs.createWriteStream(destPath);

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        timeout: 0, // No timeout for large files
    });

    const totalLength = parseInt(response.headers['content-length'] || '0', 10);
    const filename = url.split('/').pop() || 'unknown';

    let downloaded = 0;
    let lastTime = Date.now();
    let lastDownloaded = 0;
    let speed = 0;

    return new Promise((resolve, reject) => {
        response.data.on('data', (chunk: Buffer) => {
            downloaded += chunk.length;

            const now = Date.now();
            const elapsed = (now - lastTime) / 1000;

            // Update speed every 500ms
            if (elapsed >= 0.5) {
                speed = (downloaded - lastDownloaded) / elapsed;
                lastTime = now;
                lastDownloaded = downloaded;
            }

            if (onProgress) {
                onProgress({
                    filename,
                    downloaded,
                    total: totalLength,
                    speed,
                    percentage: totalLength > 0 ? (downloaded / totalLength) * 100 : 0
                });
            }
        });

        response.data.pipe(writer);

        writer.on('finish', () => {
            writer.close();
            resolve();
        });

        writer.on('error', (err) => {
            fs.unlink(destPath, () => { }); // Delete the file on error
            reject(err);
        });

        response.data.on('error', (err: Error) => {
            writer.close();
            fs.unlink(destPath, () => { }); // Delete the file on error
            reject(err);
        });
    });
}

/**
 * Download multiple files with retry support
 */
export async function downloadWithRetry(
    url: string,
    destPath: string,
    onProgress?: (progress: DownloadProgress) => void,
    maxRetries: number = 3
): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await downloadPatch(url, destPath, onProgress);
            return;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            console.error(`Download attempt ${attempt} failed:`, lastError.message);

            if (attempt < maxRetries) {
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    throw lastError || new Error('Download failed after retries');
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format speed to human readable string
 */
export function formatSpeed(bytesPerSecond: number): string {
    return formatBytes(bytesPerSecond) + '/s';
}
