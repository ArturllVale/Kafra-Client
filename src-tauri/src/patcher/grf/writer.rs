use super::types::*;
use std::collections::HashMap;
use std::fs::{File, OpenOptions};
use std::io::{Write, Seek, SeekFrom};

pub struct GrfWriter;

impl GrfWriter {
    pub fn new() -> Self {
        Self
    }

    /// QuickMerge: Append new files to existing GRF without full repack
    pub fn quick_merge(
        &self,
        grf_path: &str,
        header: &GrfHeader,
        mut table: HashMap<String, GrfEntry>,
        new_files: HashMap<String, Vec<u8>>,
        _deletions: std::collections::HashSet<String>,
    ) -> Result<(), String> {
        let mut file = OpenOptions::new()
            .read(true)
            .write(true)
            .open(grf_path)
            .map_err(|e| format!("Failed to open GRF for writing: {}", e))?;

        // Seek to end to append new file data
        let current_end = file.seek(SeekFrom::End(0))
            .map_err(|e| format!("Failed to seek to end: {}", e))?;

        let mut data_offset = current_end;

        // Write new file data
        for (filename, data) in &new_files {
            let normalized = filename.replace('\\', "/");
            
            // For simplicity, we write uncompressed or use a simple compression
            // In production, this would use proper GRF compression
            let entry = GrfEntry {
                filename: normalized.clone(),
                compressed_size: data.len() as i32,
                compressed_size_aligned: data.len() as i32,
                real_size: data.len() as i32,
                flags: 0x01, // FILE flag
                offset: (data_offset - GRF_HEADER_SIZE as u64) as i32,
                is_new: true,
                data: Some(data.clone()),
            };

            file.write_all(data)
                .map_err(|e| format!("Failed to write file data: {}", e))?;

            table.insert(normalized.to_lowercase(), entry);
            data_offset += data.len() as u64;
        }

        // Rebuild file table
        let mut table_data = Vec::new();
        for entry in table.values() {
            // Write filename (null-terminated)
            table_data.extend_from_slice(entry.filename.as_bytes());
            table_data.push(0);

            // Write entry fields
            table_data.extend_from_slice(&entry.compressed_size.to_le_bytes());
            table_data.extend_from_slice(&entry.compressed_size_aligned.to_le_bytes());
            table_data.extend_from_slice(&entry.real_size.to_le_bytes());
            table_data.push(entry.flags);
            table_data.extend_from_slice(&entry.offset.to_le_bytes());
        }

        // Compress table
        use flate2::write::ZlibEncoder;
        use flate2::Compression;
        let mut encoder = ZlibEncoder::new(Vec::new(), Compression::default());
        encoder.write_all(&table_data)
            .map_err(|e| format!("Failed to compress table: {}", e))?;
        let compressed_table = encoder.finish()
            .map_err(|e| format!("Failed to finish compression: {}", e))?;

        // Write compressed table
        let table_offset = data_offset;
        file.write_all(&(compressed_table.len() as i32).to_le_bytes())
            .map_err(|e| format!("Failed to write table size: {}", e))?;
        file.write_all(&(table_data.len() as i32).to_le_bytes())
            .map_err(|e| format!("Failed to write real table size: {}", e))?;
        file.write_all(&compressed_table)
            .map_err(|e| format!("Failed to write compressed table: {}", e))?;

        // Update header with new table offset and file count
        file.seek(SeekFrom::Start(30))
            .map_err(|e| format!("Failed to seek to header: {}", e))?;
        
        let new_table_offset = table_offset - GRF_HEADER_SIZE as u64;
        file.write_all(&new_table_offset.to_le_bytes())
            .map_err(|e| format!("Failed to write table offset: {}", e))?;

        // Update file count (seed + count + 7 = raw_count)
        let new_count = table.len() as i32;
        let seed = 0; // Simplified
        let raw_count = new_count + seed + 7;
        
        file.write_all(&seed.to_le_bytes())
            .map_err(|e| format!("Failed to write seed: {}", e))?;
        file.write_all(&raw_count.to_le_bytes())
            .map_err(|e| format!("Failed to write file count: {}", e))?;

        file.flush()
            .map_err(|e| format!("Failed to flush file: {}", e))?;

        Ok(())
    }
}
