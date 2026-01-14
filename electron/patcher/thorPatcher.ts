import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';

/**
 * THOR patch file structure:
 * THOR files are ZIP archives with a specific structure containing:
 * - data/ folder for loose files to extract
 * - Files to be added to GRF (we extract to file system in this implementation)
 */
export async function extractThorPatch(
    thorPath: string,
    targetDir: string,
    defaultGrfName: string
): Promise<void> {
    if (!fs.existsSync(thorPath)) {
        throw new Error(`THOR patch file not found: ${thorPath}`);
    }

    const zip = new AdmZip(thorPath);
    const entries = zip.getEntries();

    for (const entry of entries) {
        if (entry.isDirectory) {
            continue;
        }

        const entryName = entry.entryName;
        let targetPath: string;

        // Determine target path based on file structure
        if (entryName.startsWith('data/')) {
            // Loose files go to the game directory
            targetPath = path.join(targetDir, entryName);
        } else if (entryName.includes('/')) {
            // Other paths are extracted as-is
            targetPath = path.join(targetDir, entryName);
        } else {
            // Root files go to target directory
            targetPath = path.join(targetDir, entryName);
        }

        // Create directory if needed
        const targetDirPath = path.dirname(targetPath);
        if (!fs.existsSync(targetDirPath)) {
            fs.mkdirSync(targetDirPath, { recursive: true });
        }

        // Extract file
        try {
            const content = entry.getData();
            fs.writeFileSync(targetPath, content);
        } catch (error) {
            console.error(`Failed to extract ${entryName}:`, error);
            throw new Error(`Failed to extract ${entryName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

/**
 * Validate a THOR patch file
 */
export function validateThorPatch(thorPath: string): { valid: boolean; error?: string } {
    try {
        if (!fs.existsSync(thorPath)) {
            return { valid: false, error: 'File not found' };
        }

        const zip = new AdmZip(thorPath);
        const entries = zip.getEntries();

        if (entries.length === 0) {
            return { valid: false, error: 'Empty archive' };
        }

        return { valid: true };
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : 'Invalid archive format'
        };
    }
}

/**
 * Get list of files in a THOR patch
 */
export function getThorPatchContents(thorPath: string): string[] {
    try {
        const zip = new AdmZip(thorPath);
        return zip.getEntries()
            .filter(entry => !entry.isDirectory)
            .map(entry => entry.entryName);
    } catch {
        return [];
    }
}
