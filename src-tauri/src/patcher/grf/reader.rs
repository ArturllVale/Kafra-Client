use super::types::*;
use std::collections::HashMap;
use std::fs::File;
use std::io::{Read, Seek, SeekFrom};

pub struct GrfReader {
    file_path: String,
}

impl GrfReader {
    pub fn new(file_path: String) -> Self {
        Self { file_path }
    }

    pub fn read_header(&self) -> Result<GrfHeader, String> {
        let mut file = File::open(&self.file_path)
            .map_err(|e| format!("Failed to open GRF: {}", e))?;

        let mut buffer = vec![0u8; GRF_HEADER_SIZE];
        file.read_exact(&mut buffer)
            .map_err(|e| format!("Failed to read header: {}", e))?;

        // Signature (15 bytes)
        let signature = String::from_utf8_lossy(&buffer[0..15]).to_string();
        if signature != GRF_SIGNATURE {
            return Err("Invalid GRF signature".to_string());
        }

        // Key (14 bytes)
        let key = buffer[15..29].to_vec();

        // File Table Offset (8 bytes, little-endian u64)
        let file_table_offset = u64::from_le_bytes([
            buffer[30], buffer[31], buffer[32], buffer[33],
            buffer[34], buffer[35], buffer[36], buffer[37],
        ]);

        // Seed and file count
        let seed = i32::from_le_bytes([buffer[38], buffer[39], buffer[40], buffer[41]]);
        let raw_file_count = i32::from_le_bytes([buffer[42], buffer[43], buffer[44], buffer[45]]);
        let real_file_count = raw_file_count - seed - 7;

        Ok(GrfHeader {
            signature,
            key,
            file_table_offset,
            real_file_count,
            version: 0x200,
        })
    }

    pub fn read_file_table(&self, header: &GrfHeader) -> Result<HashMap<String, GrfEntry>, String> {
        let mut file = File::open(&self.file_path)
            .map_err(|e| format!("Failed to open GRF: {}", e))?;

        let absolute_table_offset = header.file_table_offset + GRF_HEADER_SIZE as u64;
        file.seek(SeekFrom::Start(absolute_table_offset))
            .map_err(|e| format!("Failed to seek to table: {}", e))?;

        // Read compressed table size and real size
        let mut table_info = vec![0u8; 8];
        file.read_exact(&mut table_info)
            .map_err(|e| format!("Failed to read table info: {}", e))?;

        let compressed_size = i32::from_le_bytes([table_info[0], table_info[1], table_info[2], table_info[3]]) as usize;
        let _real_size = i32::from_le_bytes([table_info[4], table_info[5], table_info[6], table_info[7]]);

        // Read compressed data
        let mut compressed_data = vec![0u8; compressed_size];
        file.read_exact(&mut compressed_data)
            .map_err(|e| format!("Failed to read compressed table: {}", e))?;

        // Decompress using flate2
        use flate2::read::ZlibDecoder;
        let mut decoder = ZlibDecoder::new(&compressed_data[..]);
        let mut data = Vec::new();
        decoder.read_to_end(&mut data)
            .map_err(|e| format!("Failed to decompress table: {}", e))?;

        // Parse entries
        let mut entries = HashMap::new();
        let mut offset = 0;
        let mut file_count = 0;

        while offset < data.len() && file_count < header.real_file_count {
            // Read filename (null-terminated)
            let mut end_name = offset;
            while end_name < data.len() && data[end_name] != 0 {
                end_name += 1;
            }

            let filename = String::from_utf8_lossy(&data[offset..end_name]).to_string();
            offset = end_name + 1;

            if offset + 17 > data.len() {
                break;
            }

            let entry_compressed_size = i32::from_le_bytes([data[offset], data[offset + 1], data[offset + 2], data[offset + 3]]);
            offset += 4;
            let entry_compressed_size_aligned = i32::from_le_bytes([data[offset], data[offset + 1], data[offset + 2], data[offset + 3]]);
            offset += 4;
            let entry_real_size = i32::from_le_bytes([data[offset], data[offset + 1], data[offset + 2], data[offset + 3]]);
            offset += 4;
            let entry_flags = data[offset];
            offset += 1;
            let entry_offset = i32::from_le_bytes([data[offset], data[offset + 1], data[offset + 2], data[offset + 3]]);
            offset += 4;

            entries.insert(
                filename.to_lowercase(),
                GrfEntry {
                    filename,
                    compressed_size: entry_compressed_size,
                    compressed_size_aligned: entry_compressed_size_aligned,
                    real_size: entry_real_size,
                    flags: entry_flags,
                    offset: entry_offset,
                    is_new: false,
                    data: None,
                },
            );

            file_count += 1;
        }

        Ok(entries)
    }
}
