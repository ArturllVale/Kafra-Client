export const GRF_HEADER_SIZE = 46;
export const GRF_SIGNATURE = 'Master of Magic';

export enum GrfFlags {
    File = 0x01, // FILE | 0x01
    MixedCrypt = 0x02, // 0x02 (No encryption in modern clients usually, but standard flag)
    DesCrypt = 0x04 // 0x04
}

export interface GrfHeader {
    signature: string; // 15 bytes
    key: Uint8Array;   // 14 bytes (encryption key)
    fileTableOffset: number; // uint64 (where the file table starts)
    realFileCount: number; // number of non-deleted files
    version: number;   // 0x200 (512) for 2.0
}

export interface GrfEntry {
    filename: string;
    compressedSize: number;
    compressedSizeAligned: number;
    realSize: number;
    flags: number;
    offset: number; // Relative to header end usually, but documentation says offset in file table
    // Internal use
    isNew?: boolean;
    isDeleted?: boolean;
    data?: Buffer; // Cached data for writing
}
