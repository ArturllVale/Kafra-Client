pub const GRF_HEADER_SIZE: usize = 46;
pub const GRF_SIGNATURE: &str = "Master of Magic";

#[derive(Debug, Clone)]
pub struct GrfHeader {
    pub signature: String,
    pub key: Vec<u8>,
    pub file_table_offset: u64,
    pub real_file_count: i32,
    pub version: u32,
}

#[derive(Debug, Clone)]
pub struct GrfEntry {
    pub filename: String,
    pub compressed_size: i32,
    pub compressed_size_aligned: i32,
    pub real_size: i32,
    pub flags: u8,
    pub offset: i32,
    pub is_new: bool,
    pub data: Option<Vec<u8>>,
}
