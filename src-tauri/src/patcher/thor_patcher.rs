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
    if !Path::new(thor_path).exists() {
        return Err(format!("THOR patch file not found: {}", thor_path));
    }

    let file = fs::File::open(thor_path)
        .map_err(|e| format!("Failed to open THOR file: {}", e))?;

    let mut archive = ZipArchive::new(file)
        .map_err(|e| format!("Failed to read THOR archive: {}", e))?;

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

pub fn validate_thor_patch(thor_path: &str) -> Result<bool, String> {
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
