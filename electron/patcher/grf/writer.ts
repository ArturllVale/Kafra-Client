import fs from 'fs';
import zlib from 'zlib';
import { GRF_HEADER_SIZE, GrfEntry, GrfHeader, GrfFlags, GRF_SIGNATURE } from './types';

export class GrfWriter {
    /**
     * Applies changes to a GRF file using the QuickMerge strategy.
     * Overwrites the previous file table with new file data, then appends a new table.
     */
    public async quickMerge(
        filePath: string,
        existingHeader: GrfHeader,
        existingTable: Map<string, GrfEntry>,
        newFiles: Map<string, Buffer>,
        filesToRemove: Set<string>
    ): Promise<void> {
        // 1. Calculate safe append position (where the old file table starts)
        // The old table is at header.fileTableOffset + GRF_HEADER_SIZE
        let appendOffset = existingHeader.fileTableOffset + GRF_HEADER_SIZE;

        // Open file for modifications
        const fd = fs.openSync(filePath, 'r+');

        try {
            // 2. Process removals (just remove from map)
            for (const file of filesToRemove) {
                existingTable.delete(file.toLowerCase());
            }

            // 3. Write new files starting at appendOffset
            // We overwrite the old table area with new content
            fs.closeSync(fd); // Close 'r+' to use stream or append? No, use fd with writeSync is fine.
            // Re-open not needed if we keep fd.

            const writeFd = fs.openSync(filePath, 'r+');

            let currentOffset = appendOffset;

            for (const [filename, content] of newFiles) {
                // Compress
                const compressed = zlib.deflateSync(content);
                const realSize = content.length;
                const compressedSize = compressed.length;

                // Align size (8 bytes alignment is standard for optimal performance/compatibility)
                // Actually mostly visual or encryption block related, but let's stick to raw size if no encryption
                // Document mentions: "Align(data.Length)"
                // Typically GRF alignment is on encryption boundaries, but let's assume raw zlib stream for now unless encryption active.
                // Re-reading docs: "Alinhar para 8 bytes... size_t alignedSize = (dataToWrite.size() + 7) & ~7;"

                const alignedSize = (compressedSize + 7) & ~7;
                const padding = alignedSize - compressedSize;

                // Write Buffer
                const writeBuffer = Buffer.alloc(alignedSize);
                compressed.copy(writeBuffer);

                fs.writeSync(writeFd, writeBuffer, 0, alignedSize, currentOffset);

                // Update/Add entry
                // Offset in table is relative to GRF_HEADER_SIZE
                const entryOffset = currentOffset - GRF_HEADER_SIZE;

                existingTable.set(filename.toLowerCase(), {
                    filename,
                    compressedSize,
                    compressedSizeAligned: alignedSize,
                    realSize,
                    flags: GrfFlags.File,
                    offset: entryOffset
                });

                currentOffset += alignedSize;
            }

            // 4. Serialize File Table
            // Format: Compressed Block.
            // Block Content: for each file...

            const entriesBuffer = this.serializeFileTable(existingTable);
            const compressedTable = zlib.deflateSync(entriesBuffer);

            // 5. Write Table Info (8 bytes) + Compressed Table
            const tableInfoHeader = Buffer.alloc(8);
            tableInfoHeader.writeInt32LE(compressedTable.length, 0); // Compressed Size
            tableInfoHeader.writeInt32LE(entriesBuffer.length, 4);   // Real Size

            fs.writeSync(writeFd, tableInfoHeader, 0, 8, currentOffset);
            fs.writeSync(writeFd, compressedTable, 0, compressedTable.length, currentOffset + 8);

            const newTableOffset = currentOffset - GRF_HEADER_SIZE;
            const finalFileSize = currentOffset + 8 + compressedTable.length;

            // 6. Update Header
            // FileTableOffset (from header end)
            // RealFileCount
            // RawFileCount (real + seed + 7)

            // Seed usually just random or fixed. Let's keep existing logic or default 0.
            const seed = 0; // Using 0 for simplicity if recreating header logic, or we could read old seed.
            const realFileCount = existingTable.size;
            const rawFileCount = realFileCount + seed + 7;

            const headerBuffer = Buffer.alloc(GRF_HEADER_SIZE);
            headerBuffer.write(GRF_SIGNATURE, 'latin1');
            // Key - preserve or zero? If not encrypted, zero is fine. Docs say: "14 bytes"
            // Start at 15
            // Key is likely constant 0x01... or just allow pass through. 
            // Better to read old header and copy key if possible, but existingHeader types has it.
            if (existingHeader.key) {
                Buffer.from(existingHeader.key).copy(headerBuffer, 15);
            } else {
                // Default key?
            }

            // Offset at 30
            // We need to write BigUInt64
            // Since we use 'r+', we can just write specific parts? Better write full header safely.
            const bigOffset = BigInt(newTableOffset);
            headerBuffer.writeBigUInt64LE(bigOffset, 30);

            headerBuffer.writeInt32LE(seed, 38);
            headerBuffer.writeInt32LE(rawFileCount, 42);

            fs.writeSync(writeFd, headerBuffer, 0, GRF_HEADER_SIZE, 0);

            // 7. Truncate/Resize file
            // fs.ftruncateSync(writeFd, finalFileSize); // Node.js ftruncate
            // Actually, we just wrote up to finalFileSize. Ensure we didn't leave garbage if checking integrity.
            // But usually expanding. If shrinking (rare in Patching), truncate is important.
            // We should use system call.
            try {
                fs.ftruncateSync(writeFd, finalFileSize);
            } catch (e) {
                console.warn("Failed to truncate file, size might be larger than needed", e);
            }

            fs.closeSync(writeFd);

        } catch (error) {
            // Close if open
            try { fs.closeSync(fd); } catch { }
            throw error;
        }
    }

    private serializeFileTable(entries: Map<string, GrfEntry>): Buffer {
        // Calculate size first? Or use dynamic buffer.
        // Each entry:
        // Name (len + 1)
        // 4 (Comp) + 4 (Align) + 4 (Real) + 1 (Flag) + 4 (Offset)
        // = NameLen + 1 + 17 bytes

        const chunks: Buffer[] = [];
        let totalSize = 0;

        for (const entry of entries.values()) {
            const nameBuf = Buffer.from(entry.filename, 'latin1');
            const entryLen = nameBuf.length + 1 + 17;

            const buf = Buffer.alloc(entryLen);
            nameBuf.copy(buf, 0);
            buf[nameBuf.length] = 0; // Null terminator

            let pos = nameBuf.length + 1;
            buf.writeInt32LE(entry.compressedSize, pos); pos += 4;
            buf.writeInt32LE(entry.compressedSizeAligned, pos); pos += 4;
            buf.writeInt32LE(entry.realSize, pos); pos += 4;
            buf.writeUInt8(entry.flags, pos); pos += 1;
            buf.writeInt32LE(entry.offset, pos); pos += 4;

            chunks.push(buf);
            totalSize += entryLen;
        }

        return Buffer.concat(chunks, totalSize);
    }
}
