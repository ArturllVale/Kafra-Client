import fs from 'fs';
import zlib from 'zlib';
import { GRF_HEADER_SIZE, GRF_SIGNATURE, GrfEntry, GrfHeader } from './types';

export class GrfReader {
    private filePath: string;
    private descriptor: number | null = null;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    public close() {
        if (this.descriptor !== null) {
            fs.closeSync(this.descriptor);
            this.descriptor = null;
        }
    }

    private open() {
        if (!fs.existsSync(this.filePath)) {
            throw new Error(`GRF file not found: ${this.filePath}`);
        }
        this.descriptor = fs.openSync(this.filePath, 'r');
    }

    public readHeader(): GrfHeader {
        if (this.descriptor === null) this.open();

        const buffer = Buffer.alloc(GRF_HEADER_SIZE);
        fs.readSync(this.descriptor!, buffer, 0, GRF_HEADER_SIZE, 0);

        // Signature Check (15 bytes)
        const signature = buffer.toString('latin1', 0, 15);
        if (signature !== GRF_SIGNATURE) {
            throw new Error('Invalid GRF signature');
        }

        // Key (14 bytes) - 15 to 29
        const key = buffer.subarray(15, 29);

        // File Table Offset (uint64) - 30 to 37
        // Note: JS numbers lose precision > 2^53, but GRF sizes usually fit.
        // We use BigInt just in case then convert.
        const fileTableOffset = Number(buffer.readBigUInt64LE(30));

        // Real File Count (uint32) - 38 to 41 (Actually seeds + counts in old versions, but for 2.0 structure...)
        // Wait, standard 2.0 structure:
        // 0-14: Sig
        // 15-29: Key
        // 30-37: FileTableOffset
        // 38-41: Seed (uint32) - often realFileCount - seed - 7 logic?
        // 42-45: RealFileCount (uint32)
        // Let's re-verify specific offset. 
        // Docs say: 46 bytes.
        // Offset 38 (4 bytes) = Seed
        // Offset 42 (4 bytes) = FilesCount (Raw)
        // RealFileCount = Raw - Seed - 7

        const seed = buffer.readInt32LE(38);
        const rawFileCount = buffer.readInt32LE(42);
        const realFileCount = rawFileCount - seed - 7;

        const version = 0x200; // Assuming 2.0 for this implementation

        return {
            signature,
            key,
            fileTableOffset,
            realFileCount,
            version
        };
    }

    public async readFileTable(header: GrfHeader): Promise<Map<string, GrfEntry>> {
        if (this.descriptor === null) this.open();

        // 1. Read Compressed Table Info (8 bytes: CompressedSize, RealSize)
        const tableInfoBuffer = Buffer.alloc(8);
        const absoluteTableOffset = header.fileTableOffset + GRF_HEADER_SIZE;

        fs.readSync(this.descriptor!, tableInfoBuffer, 0, 8, absoluteTableOffset);

        const compressedSize = tableInfoBuffer.readInt32LE(0);
        const realSize = tableInfoBuffer.readInt32LE(4);

        // 2. Read Compressed Data
        const compressedData = Buffer.alloc(compressedSize);
        fs.readSync(this.descriptor!, compressedData, 0, compressedSize, absoluteTableOffset + 8);

        // 3. Decompress
        const data = zlib.unzipSync(compressedData); // or inflateSync

        if (data.length !== realSize) {
            console.warn(`Warning: Decompressed table size mismatch. Expected ${realSize}, got ${data.length}`);
        }

        // 4. Parse Entries
        // Entry format: 
        // FileName (string, null terminated?)
        // CompressedSize (4)
        // CompressedSizeAligned (4)
        // RealSize (4)
        // Flags (1)
        // Offset (4)

        const entries = new Map<string, GrfEntry>();
        let offset = 0;
        let fileCount = 0;

        while (offset < data.length && fileCount < header.realFileCount) {
            // Read filename (variable length, null terminated generally or specific parsing logic)
            // Usually read until 0x00
            let endName = offset;
            while (endName < data.length && data[endName] !== 0) {
                endName++;
            }

            const filename = data.toString('latin1', offset, endName); // Encoding usually EUC-KR or ANSI, usage Latin1 preserves bytes
            offset = endName + 1; // Skip null

            const entryCompressedSize = data.readInt32LE(offset);
            offset += 4;
            const entryCompressedSizeAligned = data.readInt32LE(offset);
            offset += 4;
            const entryRealSize = data.readInt32LE(offset);
            offset += 4;
            const entryFlags = data.readUInt8(offset);
            offset += 1;
            const entryOffset = data.readInt32LE(offset);
            offset += 4;

            entries.set(filename.toLowerCase(), {
                filename,
                compressedSize: entryCompressedSize,
                compressedSizeAligned: entryCompressedSizeAligned,
                realSize: entryRealSize,
                flags: entryFlags,
                offset: entryOffset
            });

            fileCount++;
        }

        return entries;
    }
}
