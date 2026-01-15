use super::grf::{GrfReader, GrfWriter};
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::Path;
use zip::ZipArchive;

pub fn extract_thor_patch(
    thor_path: &str,
    target_dir: &str,
    default_grf_name: &str,
) -> Result<(), String> {
    // Check for "ASSF" signature (legacy format)
    let mut file = fs::File::open(thor_path)
        .map_err(|e| format!("Failed to open THOR file: {}", e))?;

    let mut signature = [0u8; 4];
    use std::io::{Read, Seek};
    if file.read_exact(&mut signature).is_ok() && &signature == b"ASSF" {
        // Legacy THOR format
        return extract_legacy_thor(thor_path, target_dir, default_grf_name);
    }

    // Reset cursor for ZIP check
    file.seek(std::io::SeekFrom::Start(0))
        .map_err(|e| format!("Failed to seek file: {}", e))?;

    let mut archive = ZipArchive::new(file)
        .map_err(|e| format!("Failed to read THOR archive (not ZIP or legacy): {}", e))?;

    // Separate files by destination
    let mut grf_files: HashMap<String, Vec<u8>> = HashMap::new();
    let mut disk_files: Vec<(String, Vec<u8>)> = Vec::new();

    let grf_path = Path::new(target_dir).join(default_grf_name);
    let use_grf = grf_path.exists();

    for i in 0..archive.len() {
        let mut file = archive.by_index(i)
            .map_err(|e| format!("Failed to read archive entry: {}", e))?;

        if file.is_dir() {
            continue;
        }

        let entry_name = file.name().to_string();
        let normalized = entry_name.replace('\\', "/");

        let mut data = Vec::new();
        std::io::Read::read_to_end(&mut file, &mut data)
            .map_err(|e| format!("Failed to read file data: {}", e))?;

        // Files in data/ go to GRF if it exists, otherwise to disk
        if use_grf && (normalized.starts_with("data/") || normalized.starts_with("data\\")) {
            grf_files.insert(normalized, data);
        } else {
            disk_files.push((entry_name, data));
        }
    }

    apply_patch_files(target_dir, default_grf_name, grf_files, disk_files)
}

fn apply_patch_files(
    target_dir: &str, 
    default_grf_name: &str, 
    grf_files: HashMap<String, Vec<u8>>, 
    disk_files: Vec<(String, Vec<u8>)>
) -> Result<(), String> {
    // Extract disk files
    for (entry_name, data) in disk_files {
        let target_path = Path::new(target_dir).join(&entry_name);
        
        if let Some(parent) = target_path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        }

        fs::write(&target_path, data)
            .map_err(|e| format!("Failed to write file: {}", e))?;
    }

    // Patch GRF files
    if !grf_files.is_empty() {
        let grf_path = Path::new(target_dir).join(default_grf_name);
        println!("Patching {} files into {}...", grf_files.len(), default_grf_name);

        let reader = GrfReader::new(grf_path.to_string_lossy().to_string());
        let writer = GrfWriter::new();

        let header = reader.read_header()
            .map_err(|e| format!("Failed to read GRF header: {}", e))?;
        
        let table = reader.read_file_table(&header)
            .map_err(|e| format!("Failed to read GRF table: {}", e))?;

        writer.quick_merge(
            &grf_path.to_string_lossy(),
            &header,
            table,
            grf_files,
            HashSet::new(),
        )?;
    }

    Ok(())
}

fn extract_legacy_thor(
    thor_path: &str,
    target_dir: &str,
    default_grf_name: &str,
) -> Result<(), String> {
    let mut file = fs::File::open(thor_path)
        .map_err(|e| format!("Failed to open THOR file: {}", e))?;

    let mut header = vec![0u8; 35]; // Read minimal header size
    use std::io::{Read, Seek};
    file.read_exact(&mut header)
        .map_err(|e| format!("Failed to read legacy header: {}", e))?;

    // Validate Magic (first 24 bytes)
    // "ASSF (C) 2007 Aeomin DEV"
    let magic_slice = &header[0..24];
    let magic_str = String::from_utf8_lossy(magic_slice);
    if !magic_str.starts_with("ASSF") {
         return Err("Invalid legacy THOR magic".to_string());
    }

    // Parse Mode (at 0x1D)
    let mode = u16::from_le_bytes([header[0x1D], header[0x1E]]);
    
    let mut file_table_offset: u32 = 0;
    let mut _file_table_comp_len: u32 = 0;
    let mut target_grf_file = String::new();

    if mode == 0x30 {
        let target_grf_len = header[0x1F] as usize;
        let mut name_buffer = vec![0u8; target_grf_len];
        
        file.seek(std::io::SeekFrom::Start(0x20)).unwrap();
        file.read_exact(&mut name_buffer).unwrap();
        target_grf_file = String::from_utf8_lossy(&name_buffer).to_string();

        let mut table_info = [0u8; 8];
        file.read_exact(&mut table_info).unwrap();
        
        _file_table_comp_len = u32::from_le_bytes([table_info[0], table_info[1], table_info[2], table_info[3]]);
        file_table_offset = u32::from_le_bytes([table_info[4], table_info[5], table_info[6], table_info[7]]);
    } else {
        // Mode 0x21 (EXE update) or others not fully supported in this snippet
        // Assuming 0x30 for standard patching
        return Err(format!("Unsupported THOR mode: 0x{:X}", mode));
    }

    // Read Compressed File Table
    file.seek(std::io::SeekFrom::Start(file_table_offset as u64))
        .map_err(|e| format!("Failed to seek to file table: {}", e))?;

    // We rely on standard Read to get the compressed chunk. 
    // Since we don't know exact end, we might need strictly file_table_comp_len.
    // However, usually we can just read `_file_table_comp_len` bytes.
    let mut compressed_table = vec![0u8; _file_table_comp_len as usize];
    file.read_exact(&mut compressed_table)
        .map_err(|e| format!("Failed to read compressed table: {}", e))?;

    // Decompress Table
    use flate2::read::ZlibDecoder;
    let mut decoder = ZlibDecoder::new(&compressed_table[..]);
    let mut table_data = Vec::new();
    decoder.read_to_end(&mut table_data)
        .map_err(|e| format!("Failed to decompress file table: {}", e))?;

    // Parse Entries
    let mut pos = 0;
    let mut grf_files: HashMap<String, Vec<u8>> = HashMap::new();
    let mut disk_files: Vec<(String, Vec<u8>)> = Vec::new();
    let grf_path = Path::new(target_dir).join(default_grf_name);
    let use_grf = grf_path.exists();

    while pos < table_data.len() {
        if pos + 1 > table_data.len() { break; }
        
        let name_len = table_data[pos] as usize;
        pos += 1;
        
        if pos + name_len > table_data.len() { break; }
        let name = String::from_utf8_lossy(&table_data[pos..pos+name_len]).to_string();
        pos += name_len;

        if pos + 13 > table_data.len() { break; }
        
        let flags = table_data[pos];
        pos += 1;
        
        let offset = u32::from_le_bytes([table_data[pos], table_data[pos+1], table_data[pos+2], table_data[pos+3]]);
        pos += 4;
        
        let size_compressed = u32::from_le_bytes([table_data[pos], table_data[pos+1], table_data[pos+2], table_data[pos+3]]);
        pos += 4;
        
        let _size_decompressed = u32::from_le_bytes([table_data[pos], table_data[pos+1], table_data[pos+2], table_data[pos+3]]);
        pos += 4;

        // Perform Extraction
        if flags == 1 { // File
             let mut current_pos = file.stream_position().unwrap();
             file.seek(std::io::SeekFrom::Start(offset as u64)).unwrap();
             
             let mut entry_compressed = vec![0u8; size_compressed as usize];
             file.read_exact(&mut entry_compressed).unwrap();
             
             // Decompress entry data
             // Thor files are typically ZLIB compressed if size_compressed < size_decompressed
             // If equal, might be stored. But usually assume ZLIB for Thor.
             let mut entry_decoder = ZlibDecoder::new(&entry_compressed[..]);
             let mut entry_data = Vec::new();
             
             if entry_decoder.read_to_end(&mut entry_data).is_err() {
                 println!("Warning: Failed to decompress {}, assuming stored", name);
                 entry_data = entry_compressed;
             }

             let normalized = name.replace('\\', "/");
             if use_grf && (normalized.starts_with("data/") || normalized.starts_with("data\\")) {
                grf_files.insert(normalized, entry_data);
             } else {
                disk_files.push((name, entry_data));
             }

             file.seek(std::io::SeekFrom::Start(current_pos)).unwrap();
        } else if flags == 5 { // Delete
             // TODO: Implement deletion logic later
        }
    }

    apply_patch_files(target_dir, default_grf_name, grf_files, disk_files)
}

pub fn _validate_thor_patch(thor_path: &str) -> Result<bool, String> {
    if !Path::new(thor_path).exists() {
        return Err("File not found".to_string());
    }

    let file = fs::File::open(thor_path)
        .map_err(|e| format!("Failed to open file: {}", e))?;

    let archive = ZipArchive::new(file)
        .map_err(|_| "Invalid archive format".to_string())?;

    if archive.len() == 0 {
        return Err("Empty archive".to_string());
    }

    Ok(true)
}
