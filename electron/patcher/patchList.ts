import axios from 'axios';

export interface PatchInfo {
    index: number;
    filename: string;
}

/**
 * Fetches and parses a patch list file (plist.txt)
 * Format: Each line contains "<index> <filename>"
 */
export async function fetchPatchList(plistUrl: string): Promise<PatchInfo[]> {
    try {
        const response = await axios.get(plistUrl, {
            responseType: 'text',
            timeout: 30000
        });

        const lines = response.data.split('\n').filter((line: string) => line.trim());
        const patches: PatchInfo[] = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) {
                continue; // Skip empty lines and comments
            }

            // Format: "index filename" or just "filename"
            const parts = trimmed.split(/\s+/);
            if (parts.length >= 2) {
                const index = parseInt(parts[0], 10);
                const filename = parts[1];
                if (!isNaN(index) && filename) {
                    patches.push({ index, filename });
                }
            } else if (parts.length === 1) {
                // Just filename, use array index
                patches.push({ index: patches.length, filename: parts[0] });
            }
        }

        // Sort by index
        patches.sort((a, b) => a.index - b.index);

        return patches;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                // No patch list found, assume up to date
                return [];
            }
            throw new Error(`Failed to fetch patch list: ${error.message}`);
        }
        throw error;
    }
}

/**
 * Reads a local cache file to determine which patches have been applied
 */
export function getAppliedPatches(cachePath: string): number[] {
    try {
        const fs = require('fs');
        if (fs.existsSync(cachePath)) {
            const content = fs.readFileSync(cachePath, 'utf-8');
            const cache = JSON.parse(content);
            return cache.appliedPatches || [];
        }
    } catch {
        // Ignore errors
    }
    return [];
}

/**
 * Save the applied patches to cache
 */
export function saveAppliedPatches(cachePath: string, patches: number[]): void {
    const fs = require('fs');
    const cache = { appliedPatches: patches, lastUpdated: new Date().toISOString() };
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

/**
 * Filter patches to get only unapplied ones
 */
export function getUnappliedPatches(allPatches: PatchInfo[], appliedIndices: number[]): PatchInfo[] {
    const appliedSet = new Set(appliedIndices);
    return allPatches.filter(patch => !appliedSet.has(patch.index));
}
