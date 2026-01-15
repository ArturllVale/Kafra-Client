import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { GrfReader, GrfWriter } from './grf';

/**
 * THOR patch file structure extraction and GRF merging.
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

    // Files destined for GRF
    const grfFiles = new Map<string, Buffer>();
    // Files destined for Disk
    const diskFiles: AdmZip.IZipEntry[] = [];

    const grfPath = path.join(targetDir, defaultGrfName);
    // Check if we should patch GRF (exists and we have files for it)
    // For now, let's always try to patch GRF if files are in 'data/' and GRF exists.
    // Otherwise fallback to disk extraction (folders).
    const useGrf = fs.existsSync(grfPath);

    for (const entry of entries) {
        if (entry.isDirectory) continue;

        const entryName = entry.entryName; // e.g. "data/xml/iteminfo.lua"

        // Check filtering logic
        // Usually only 'data/' folder content goes to GRF
        // Root files (updater.exe, dlls) go to disk
        // normalize path separators
        const normalized = entryName.replace(/\\/g, '/');

        if (useGrf && (normalized.startsWith('data/') || normalized.startsWith('data\\'))) {
            // Add to GRF batch
            // Note: entryName in GRF usually keeps 'data\...' prefix or relative?
            // Standard RO GRF contains paths like "data\texture\..."
            // So we keep the full path.
            grfFiles.set(normalized, entry.getData());
        } else {
            diskFiles.push(entry);
        }
    }

    // 1. Process Disk Files
    for (const entry of diskFiles) {
        const entryName = entry.entryName;
        // Logic for disk extraction
        const targetPath = path.join(targetDir, entryName);
        const targetDirPath = path.dirname(targetPath);

        if (!fs.existsSync(targetDirPath)) {
            fs.mkdirSync(targetDirPath, { recursive: true });
        }

        const content = entry.getData();
        fs.writeFileSync(targetPath, content);
    }

    // 2. Process GRF Files
    if (grfFiles.size > 0) {
        console.log(`Patching ${grfFiles.size} files into ${defaultGrfName}...`);

        // GRF Logic
        const reader = new GrfReader(grfPath);
        const writer = new GrfWriter();

        try {
            const header = reader.readHeader();
            const table = await reader.readFileTable(header);
            reader.close(); // Close read handle before writing

            await writer.quickMerge(grfPath, header, table, grfFiles, new Set());
        } catch (error) {
            console.error('Failed to patch GRF:', error);
            // Fallback: extract to disk if GRF fails?
            // Or throw error. Since user approved Native Patching, error is better to alert integrity issues.
            throw new Error(`Failed to patch GRF ${defaultGrfName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
