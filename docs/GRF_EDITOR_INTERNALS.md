# GRF Editor - Documentação Técnica Completa

Baseado na análise do código fonte do [GRF Editor do Tokei](https://github.com/Tokeiburu/GRFEditor).

## Índice

1. [Formato GRF](#1-formato-grf)
2. [Formato GPF](#2-formato-gpf)
3. [Formato RGZ](#3-formato-rgz)
4. [Formato THOR](#4-formato-thor)
5. [Processo de Leitura](#5-processo-de-leitura)
6. [Processo de Escrita/Salvamento](#6-processo-de-escritasalvamento)
7. [Merge de GRFs](#7-merge-de-grfs)
8. [Criptografia DES](#8-criptografia-des)
9. [Compressão ZLIB](#9-compressão-zlib)
10. [Implementação Correta para o Launcher](#10-implementação-correta-para-o-launcher)

---

## 1. Formato GRF

### 1.1 Estrutura do Header (46 bytes para v1.x/2.0, variável para v3.0)

```
Offset  Tamanho  Campo                 Descrição
------  -------  --------------------  ------------------------------------------
0x00    16       Magic                 "Master of Magic\0" (null-padded)
0x10    14       Key                   Encryption key (geralmente bytes 1-14)
0x1E    4/8      FileTableOffset       Offset da tabela de arquivos (relativo ao fim do header)
                                       v1.x/2.0: 4 bytes (uint32)
                                       v3.0: 8 bytes (int64)
0x22    4        Seed                  v1.x/2.0: Seed para cálculo de file count
                                       v3.0: RealFilesCount (int32)
0x26    4        FilesCount            v1.x/2.0: RealFilesCount + Seed + 7
                                       v3.0: não usado
0x2A    4        Version               0x0102, 0x0103, 0x0200 ou 0x0300
```

**Constante importante:**
```cpp
const int GRF_HEADER_SIZE = 46;  // DataByteSize
```

### 1.2 Versões Suportadas

| Versão | Hex    | Descrição                                    |
|--------|--------|----------------------------------------------|
| 1.2    | 0x0102 | Alpha GRF com criptografia DES               |
| 1.3    | 0x0103 | Alpha GRF com criptografia DES               |
| 2.0    | 0x0200 | GRF padrão (mais comum)                      |
| 3.0    | 0x0300 | GRF grande (suporte >4GB, offset de 64 bits) |

### 1.3 Cálculo do Número Real de Arquivos

```cpp
// Versão 1.x e 2.0
int realFileCount = filesCount - seed - 7;

// Versão 3.0
int realFileCount = filesCount; // Direto, sem cálculo
```

### 1.4 Estrutura do Layout do Arquivo GRF

```
+------------------+  <- Offset 0
|     Header       |  (46 bytes)
+------------------+  <- Offset 46 (GRF_HEADER_SIZE)
|                  |
|   Dados dos      |
|   Arquivos       |
|   (comprimidos)  |
|                  |
+------------------+  <- Header.FileTableOffset + 46
| TableSizeComp(4) |  Tamanho comprimido da tabela
| TableSize (4)    |  Tamanho descomprimido da tabela
| Tabela Comprim.  |  Dados da tabela (ZLIB)
+------------------+  <- EOF
```

### 1.5 Estrutura de uma Entrada na Tabela de Arquivos (v2.0)

```
Offset  Tamanho  Campo                 Descrição
------  -------  --------------------  ------------------------------------------
0x00    N+1      FileName              Nome do arquivo (null-terminated)
N+1     4        SizeCompressed        Tamanho comprimido
N+5     4        SizeCompressedAligned Tamanho alinhado (múltiplo de 8)
N+9     4        SizeDecompressed      Tamanho original
N+13    1        Flags                 Tipo e flags de criptografia
N+14    4/8      Offset                Offset dos dados (v2.0: 4 bytes, v3.0: 8 bytes)
```

### 1.6 Flags de Entrada

```cpp
const uint8_t FLAG_FILE           = 0x01;  // É um arquivo
const uint8_t FLAG_ENCRYPT_MIXED  = 0x02;  // Criptografia DES mista
const uint8_t FLAG_ENCRYPT_HEADER = 0x04;  // Criptografia DES no header
const uint8_t FLAG_ADDED          = 0x08;  // Adicionado pelo autopatcher
const uint8_t FLAG_DIRECTORY      = 0x00;  // Diretório (sem FLAG_FILE)
const uint8_t FLAG_REMOVE_FILE    = 0x05;  // Marcar para remoção (THOR)
```

### 1.7 Alinhamento de Dados

**CRÍTICO:** Todos os dados comprimidos devem ser alinhados para 8 bytes!

```cpp
int Align(int size) {
    return (size + 7) & ~7;  // Arredonda para múltiplo de 8
}

// Exemplo: 
// size = 100 -> aligned = 104
// size = 104 -> aligned = 104
// size = 105 -> aligned = 112
```

---

## 2. Formato GPF

GPF é idêntico ao GRF, apenas com extensão diferente. O GRF Editor trata ambos da mesma forma.

---

## 3. Formato RGZ

### 3.1 Estrutura

RGZ é um arquivo GZIP contendo:
- Sequência de entradas com tipo ('d' = diretório, 'f' = arquivo, 'e' = fim)
- Cada entrada tem nome e dados

### 3.2 Formato de Entrada

```cpp
struct RgzEntry {
    char type;           // 'd' = diretório, 'f' = arquivo, 'e' = fim
    uint8_t nameLength;  // Comprimento do nome
    char name[nameLength]; // Nome (sem null terminator)
    
    // Se type == 'f':
    uint32_t dataSize;   // Tamanho dos dados
    uint8_t data[dataSize]; // Dados do arquivo
};
```

### 3.3 Leitura de RGZ

```cpp
void ReadRgz(Stream compressedStream) {
    GZipStream decompressing(compressedStream);
    
    while (true) {
        char type = decompressing.ReadByte();
        
        if (type == 'e') break;  // Fim do arquivo
        
        int nameLen = decompressing.ReadByte();
        string name = decompressing.ReadString(nameLen);
        
        if (type == 'f') {
            int size = decompressing.ReadInt32();
            byte[] data = decompressing.ReadBytes(size);
            // Adicionar arquivo...
        }
        // type == 'd' é apenas diretório, ignorar
    }
}
```

---

## 4. Formato THOR

### 4.1 Header THOR

```
Offset  Tamanho  Campo                 Descrição
------  -------  --------------------  ------------------------------------------
0x00    24       Magic                 "ASSF (C) 2007 Aeomin DEV"
0x18    1        UseGrfMerging         0 = extrair para disco, 1 = merge em GRF
0x19    4        NumberOfFiles         Número de arquivos
0x1D    2        Mode                  0x30 = patch normal, 0x21 = EXE update
```

**Se Mode == 0x30 (patch normal):**
```
0x1F    1        TargetGrfLength       Comprimento do nome do GRF alvo
0x20    N        TargetGrf             Nome do GRF alvo (ex: "data.grf")
0x20+N  4        FileTableCompLen      Tamanho comprimido da tabela
0x24+N  4        FileTableOffset       Offset da tabela de arquivos
```

**Se Mode == 0x21 (EXE update):**
```
0x1F    1        TargetGrfLength       Comprimento do nome
0x20    N        TargetGrf             Nome do arquivo
0x21+N  1        Padding               0x00
```

### 4.2 Estrutura de Entrada THOR

```cpp
struct ThorEntry {
    uint8_t nameLength;
    char name[nameLength];
    uint8_t flags;           // 0x01 = arquivo, 0x05 = remover
    uint32_t offset;         // Offset no THOR
    uint32_t sizeCompressed;
    uint32_t sizeDecompressed;
};
```

### 4.3 Escrita de THOR

```cpp
void WriteThor(Stream stream, Container thor) {
    // Header
    stream.WriteAnsi("ASSF (C) 2007 Aeomin DEV");
    stream.WriteByte(UseGrfMerging ? 1 : 0);
    stream.WriteInt32(entries.Count);
    
    // Determinar modo
    bool isPatcherOrGameExe = false;
    if (entries.Count == 1 && entries[0].Extension == ".exe") {
        isPatcherOrGameExe = true;
    }
    
    short mode = isPatcherOrGameExe ? 0x21 : 0x30;
    stream.WriteInt16(mode);
    
    if (UseGrfMerging) {
        stream.WriteByte(TargetGrf.Length);
        stream.WriteAnsi(TargetGrf);
    } else {
        stream.WriteByte(0);
        stream.WriteAnsi("");
    }
    
    if (isPatcherOrGameExe) {
        stream.WriteByte(0x00);
    } else {
        stream.WriteInt32(FileTableCompressedLength);
        stream.WriteInt32(FileTableOffset);
    }
}
```

---

## 5. Processo de Leitura

### 5.1 Leitura de GRF

```cpp
GrfError ReadGrf(const string& filepath) {
    // 1. Abrir arquivo
    FileStream file(filepath, Read);
    
    // 2. Ler header (46 bytes)
    byte header[46];
    file.Read(header, 46);
    
    // 3. Validar magic
    if (memcmp(header, "Master of Magic", 15) != 0) {
        return INVALID_MAGIC;
    }
    
    // 4. Extrair campos do header
    uint32_t version = ReadUInt32(header + 42);
    uint8_t majorVersion = (version >> 8) & 0xFF;
    uint8_t minorVersion = version & 0xFF;
    
    uint64_t fileTableOffset;
    int realFileCount;
    
    if (majorVersion == 3) {
        // v3.0 - offsets de 64 bits
        fileTableOffset = ReadInt64(header + 30);
        realFileCount = ReadInt32(header + 38);
    } else {
        // v1.x/2.0 - offsets de 32 bits
        fileTableOffset = ReadUInt32(header + 30);
        int seed = ReadInt32(header + 34);
        int filesCount = ReadInt32(header + 38);
        realFileCount = filesCount - seed - 7;
    }
    
    // 5. Ler tabela de arquivos
    file.Seek(GRF_HEADER_SIZE + fileTableOffset);
    
    uint32_t tableSizeCompressed = file.ReadUInt32();
    uint32_t tableSize = file.ReadUInt32();
    
    byte[] compressedTable = file.ReadBytes(tableSizeCompressed);
    byte[] table = Decompress(compressedTable, tableSize);
    
    // 6. Parsear entradas
    ParseFileTable(table, majorVersion, minorVersion);
    
    return OK;
}
```

### 5.2 Leitura de Entrada de Arquivo

```cpp
void ParseFileTable(byte[] data, int major, int minor) {
    int pos = 0;
    
    while (pos < data.Length) {
        GrfEntry entry;
        
        // Nome (null-terminated)
        int nameStart = pos;
        while (data[pos] != 0) pos++;
        entry.filename = string(data + nameStart, pos - nameStart);
        pos++; // Pula null terminator
        
        // Atributos
        entry.sizeCompressed = ReadUInt32(data + pos); pos += 4;
        entry.sizeCompressedAligned = ReadUInt32(data + pos); pos += 4;
        entry.sizeDecompressed = ReadUInt32(data + pos); pos += 4;
        entry.flags = data[pos++];
        
        // Offset
        if (major == 3) {
            entry.offset = ReadInt64(data + pos); pos += 8;
        } else {
            entry.offset = ReadUInt32(data + pos); pos += 4;
        }
        
        entries[entry.filename] = entry;
    }
}
```

---

## 6. Processo de Escrita/Salvamento

### 6.1 Modos de Salvamento

O GRF Editor suporta vários modos:

| Modo          | Descrição                                                |
|---------------|----------------------------------------------------------|
| **GrfSave**   | Salva com recompactação (copia arquivos não modificados) |
| **QuickMerge**| Apenas adiciona novos arquivos ao final                  |
| **Repack**    | Recompacta todo o GRF (defragmenta)                      |
| **Compact**   | Compacta e remove duplicatas                             |

### 6.2 Processo QuickMerge (RECOMENDADO PARA PATCHING)

**Esta é a forma correta de adicionar arquivos sem reescrever o GRF inteiro:**

```cpp
long WriteDataQuick(Container grf, Stream originalStream, Container grfAdd) {
    // 1. Fechar leitura do GRF
    grf.Close();
    
    // 2. Calcular onde termina o último arquivo
    auto sortedEntries = grf.Table.OrderBy(p => p.FileExactOffset);
    long endStreamOffset = sortedEntries.Last().FileExactOffset 
                         + sortedEntries.Last().SizeCompressedAligned;
    
    if (endStreamOffset < GRF_HEADER_SIZE) {
        endStreamOffset = GRF_HEADER_SIZE;
    }
    
    // 3. Calcular espaços livres (arquivos deletados)
    QuickMergeHelper helper(grf);
    
    // 4. Para cada novo arquivo
    for (auto& entry : entriesToAdd) {
        byte[] data = GetCompressedData(entry);
        
        // Tentar reutilizar espaço livre
        long? freeOffset = helper.GetNextFreeIndex(entry);
        
        if (freeOffset != null) {
            // Usar espaço livre existente
            entry.TemporaryOffset = freeOffset.Value;
            originalStream.Seek(freeOffset.Value);
        } else {
            // Adicionar ao final
            entry.TemporaryOffset = endStreamOffset;
            originalStream.Seek(endStreamOffset);
            endStreamOffset += Align(data.Length);
        }
        
        originalStream.Write(data, data.Length);
        
        // Adicionar à tabela
        grf.Table.AddEntry(entry);
    }
    
    // 5. Atualizar header e tabela
    grf.Header.FileTableOffset = endStreamOffset - GRF_HEADER_SIZE;
    grf.Header.RealFilesCount = grf.Table.Count;
    
    // 6. Escrever nova tabela de arquivos
    originalStream.Seek(endStreamOffset);
    int tableSize = WriteFileTable(grf.Header, originalStream);
    
    // 7. Reescrever header
    originalStream.Seek(0);
    WriteHeader(grf.Header, originalStream);
    
    // 8. Truncar arquivo
    originalStream.SetLength(endStreamOffset + tableSize);
    
    return endStreamOffset;
}
```

### 6.3 Processo de Repack Completo (WriteData)

```cpp
void WriteData(Container grf, Stream originalStream, Stream grfStream) {
    // 1. Escrever a partir do offset 46
    grfStream.Seek(GRF_HEADER_SIZE);
    
    long currentOffset = GRF_HEADER_SIZE;
    
    // 2. Copiar arquivos existentes (não adicionados)
    auto existingEntries = grf.Table.Where(p => !p.Added).OrderBy(p => p.Offset);
    
    for (auto& entry : existingEntries) {
        // Ler dados do arquivo original
        originalStream.Seek(entry.Offset + GRF_HEADER_SIZE);
        byte[] data = originalStream.ReadBytes(entry.SizeCompressedAligned);
        
        // Aplicar/remover criptografia se necessário
        if (grf.Header.IsVersion(1)) {
            entry.DesEncrypt(data);
        } else if (grf.Header.IsVersion(2)) {
            entry.DesDecrypt(data);
        }
        
        // Escrever no novo arquivo
        grfStream.Write(data, data.Length);
        
        // Atualizar offset
        entry.TemporaryOffset = currentOffset;
        currentOffset += data.Length;
    }
    
    // 3. Adicionar novos arquivos
    auto newEntries = grf.Table.Where(p => p.Added);
    
    for (auto& entry : newEntries) {
        // Comprimir dados
        byte[] rawData = GetRawData(entry);
        byte[] compressed = Compress(rawData);
        
        // Alinhar
        int alignedSize = Align(compressed.Length);
        byte[] aligned = new byte[alignedSize];
        memcpy(aligned, compressed, compressed.Length);
        
        // Criptografar se necessário
        if (grf.Header.IsVersion(1)) {
            entry.DesEncrypt(aligned);
        }
        
        // Escrever
        grfStream.Write(aligned, alignedSize);
        
        // Atualizar entry
        entry.TemporaryOffset = currentOffset;
        entry.SizeCompressed = compressed.Length;
        entry.SizeCompressedAligned = alignedSize;
        entry.SizeDecompressed = rawData.Length;
        
        currentOffset += alignedSize;
    }
    
    // 4. Atualizar header
    grf.Header.FileTableOffset = currentOffset - GRF_HEADER_SIZE;
    grf.Header.RealFilesCount = grf.Table.Count;
    
    // 5. Escrever tabela de arquivos
    WriteFileTable(grf.Header, grfStream);
    
    // 6. Escrever header no início
    grfStream.Seek(0);
    WriteHeader(grf.Header, grfStream);
}
```

### 6.4 Escrita do Header

```cpp
void WriteHeader(GrfHeader header, Stream stream) {
    stream.Seek(0);
    
    // Magic (16 bytes, null-padded)
    byte magic[16] = "Master of Magic\0";
    stream.Write(magic, 16);
    
    // Key (14 bytes)
    byte key[14] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14};
    stream.Write(key, 14);
    
    if (header.IsVersion(3, 0)) {
        // v3.0 - offset de 64 bits
        stream.WriteInt64(header.FileTableOffset);
        stream.WriteInt32(header.RealFilesCount);
    } else {
        // v1.x/2.0 - offset de 32 bits
        stream.WriteUInt32((uint32_t)header.FileTableOffset);
        stream.WriteInt32(header.Seed);
        stream.WriteInt32(header.RealFilesCount + 7 + header.Seed);
    }
    
    // Version
    uint32_t version = (header.MajorVersion << 8) | header.MinorVersion;
    stream.WriteUInt32(version);
}
```

### 6.5 Escrita da Tabela de Arquivos

```cpp
int WriteFileTable(GrfHeader header, Stream stream) {
    MemoryStream tableBuffer;
    
    // Ordenar por offset temporário
    auto entries = grf.Table.OrderBy(p => p.TemporaryOffset);
    
    for (auto& entry : entries) {
        if (entry.Deleted) continue;
        
        // Nome + null terminator
        byte[] filename = ToAnsi(entry.filename);
        tableBuffer.Write(filename, filename.Length);
        tableBuffer.WriteByte(0);
        
        // Atributos
        tableBuffer.WriteUInt32(entry.SizeCompressed);
        tableBuffer.WriteUInt32(entry.SizeCompressedAligned);
        tableBuffer.WriteUInt32(entry.SizeDecompressed);
        tableBuffer.WriteByte(entry.Flags);
        
        // Offset (relativo ao fim do header)
        if (header.IsVersion(3, 0)) {
            tableBuffer.WriteInt64(entry.TemporaryOffset - GRF_HEADER_SIZE);
        } else {
            tableBuffer.WriteUInt32((uint32_t)(entry.TemporaryOffset - GRF_HEADER_SIZE));
        }
    }
    
    // Comprimir tabela
    byte[] tableData = tableBuffer.ToArray();
    byte[] compressed = Compress(tableData);
    
    // Escrever tamanhos e dados
    stream.WriteUInt32(compressed.Length);    // TableSizeCompressed
    stream.WriteUInt32(tableData.Length);     // TableSize
    stream.Write(compressed, compressed.Length);
    
    return compressed.Length + 8;  // 8 = 2 x int32
}
```

---

## 7. Merge de GRFs

### 7.1 Merge com THOR

```cpp
PatchResult ApplyPatchToGrf(ThorArchive thor, GrfFile grf) {
    PatchResult result;
    
    for (auto& entry : thor.GetEntries()) {
        if (entry.relativePath == "data.integrity") {
            continue;  // Pular arquivo de integridade
        }
        
        if (entry.isRemoved) {
            // Marcar para remoção no GRF
            grf.RemoveFile(entry.relativePath);
            result.filesRemoved++;
            continue;
        }
        
        // Ler dados do THOR
        byte[] data = thor.ReadFileContent(entry.relativePath);
        
        // Adicionar/substituir no GRF
        grf.AddFile(entry.relativePath, data, true);
        result.filesAdded++;
    }
    
    // Salvar GRF
    grf.Save();  // Usar QuickMerge internamente
    
    return result;
}
```

### 7.2 Merge de dois GRFs

```cpp
void MergeGrfs(GrfFile baseGrf, GrfFile addGrf) {
    // Para cada arquivo no GRF a adicionar
    for (auto& entry : addGrf.Table.Entries) {
        if (entry.Flags & FLAG_REMOVE_FILE) {
            // Remover do base
            baseGrf.Table.DeleteEntry(entry.RelativePath);
        } else {
            // Adicionar/substituir
            byte[] data = addGrf.GetCompressedData(entry);
            baseGrf.Table.AddEntry(entry.RelativePath, data);
        }
    }
    
    // Salvar com QuickMerge
    baseGrf.QuickSave();
}
```

---

## 8. Criptografia DES

### 8.1 Quando Aplicar

- **v1.x (0x0102, 0x0103):** Todos os arquivos são criptografados
- **v2.0:** Geralmente não usa DES, mas pode ter arquivos legados
- **Detecção:** `entry.Cycle > -1` indica que o arquivo está criptografado

### 8.2 Ciclo de Criptografia

```cpp
int CalculateCycle(int sizeCompressed) {
    if (sizeCompressed < 3) return 1;
    return sizeCompressed / 3;
}
```

### 8.3 Descriptografia

```cpp
void DesDecrypt(byte[] data, int flags, int cycle) {
    if (flags & FLAG_ENCRYPT_MIXED) {
        // Criptografia mista
        DecryptMixed(data, cycle);
    } else if (flags & FLAG_ENCRYPT_HEADER) {
        // Apenas header criptografado
        DecryptHeader(data);
    }
}
```

---

## 9. Compressão ZLIB

### 9.1 Compressão

```cpp
byte[] Compress(byte[] data) {
    z_stream strm;
    deflateInit(&strm, Z_DEFAULT_COMPRESSION);
    
    byte[] output(data.Length * 2);  // Buffer generoso
    strm.next_in = data;
    strm.avail_in = data.Length;
    strm.next_out = output;
    strm.avail_out = output.Length;
    
    deflate(&strm, Z_FINISH);
    deflateEnd(&strm);
    
    output.Resize(strm.total_out);
    return output;
}
```

### 9.2 Descompressão

```cpp
byte[] Decompress(byte[] compressed, int expectedSize) {
    byte[] output(expectedSize);
    
    z_stream strm;
    inflateInit(&strm);
    
    strm.next_in = compressed;
    strm.avail_in = compressed.Length;
    strm.next_out = output;
    strm.avail_out = expectedSize;
    
    inflate(&strm, Z_FINISH);
    inflateEnd(&strm);
    
    return output;
}
```

---

## 10. Implementação Correta para o Launcher

### 10.1 Problemas Identificados no Código Atual

1. **WriteFileData não copia arquivos não modificados**
   - O código atual assume que arquivos não modificados mantêm seus offsets
   - Isso só funciona se NENHUM arquivo for adicionado
   - Se arquivos forem adicionados, os offsets mudam e a tabela fica inconsistente

2. **Falta de QuickMerge**
   - O método correto é adicionar novos arquivos ao FINAL do GRF
   - Não reescrever arquivos existentes

### 10.2 Solução: Implementar QuickMerge Corretamente

```cpp
GrfError GrfFile::Save(GrfProgressCallback progressCb) {
    if (!m_isModified) return GrfError::OK;
    
    // 1. Encontrar onde termina o último arquivo
    uint64_t endOffset = GRF_HEADER_SIZE;
    for (auto& pair : m_entries) {
        if (!pair.second.isDeleted && !pair.second.isNew) {
            uint64_t entryEnd = GRF_HEADER_SIZE + pair.second.offset 
                              + pair.second.sizeCompressedAligned;
            if (entryEnd > endOffset) {
                endOffset = entryEnd;
            }
        }
    }
    
    // 2. Reabrir arquivo para escrita
    m_fileStream.close();
    m_fileStream.open(m_filePath, std::ios::in | std::ios::out | std::ios::binary);
    
    // 3. Posicionar no final dos dados existentes
    m_fileStream.seekp(endOffset);
    
    // 4. Escrever apenas arquivos novos/modificados
    for (auto& pair : m_entries) {
        GrfEntry& entry = pair.second;
        
        if (entry.isDeleted) continue;
        
        if (entry.isNew || entry.isModified) {
            // Preparar dados
            std::vector<uint8_t> dataToWrite = entry.cachedData;
            
            // Alinhar para 8 bytes
            size_t alignedSize = (dataToWrite.size() + 7) & ~7;
            dataToWrite.resize(alignedSize, 0);
            
            // Aplicar criptografia se necessário
            if (entry.IsEncrypted()) {
                EncryptEntry(entry, dataToWrite);
            }
            
            // Escrever
            m_fileStream.write(reinterpret_cast<char*>(dataToWrite.data()), 
                              dataToWrite.size());
            
            // Atualizar offset (relativo ao header)
            entry.offset = endOffset - GRF_HEADER_SIZE;
            entry.sizeCompressedAligned = alignedSize;
            entry.isNew = false;
            entry.isModified = false;
            
            endOffset += alignedSize;
        }
    }
    
    // 5. Atualizar header
    m_header.fileTableOffset = endOffset - GRF_HEADER_SIZE;
    m_header.realFileCount = 0;
    for (auto& pair : m_entries) {
        if (!pair.second.isDeleted) {
            m_header.realFileCount++;
        }
    }
    m_header.rawFileCount = m_header.realFileCount + m_header.seed + 7;
    
    // 6. Escrever tabela de arquivos
    GrfError err = WriteFileTable();
    if (err != GrfError::OK) return err;
    
    // 7. Escrever header
    m_fileStream.seekp(0);
    err = WriteHeader();
    if (err != GrfError::OK) return err;
    
    // 8. Truncar arquivo se necessário
    // (não necessário para QuickMerge, apenas adiciona)
    
    m_isModified = false;
    return GrfError::OK;
}
```

### 10.3 Pontos Críticos para Não Corromper o GRF

1. **NUNCA reescrever dados de arquivos não modificados**
   - Seus offsets na tabela devem permanecer inalterados

2. **Sempre alinhar dados para 8 bytes**
   ```cpp
   size_t aligned = (size + 7) & ~7;
   ```

3. **Offset na tabela é RELATIVO ao header**
   ```cpp
   uint32_t tableOffset = realOffset - GRF_HEADER_SIZE;
   ```

4. **FileTableOffset no header é RELATIVO ao header**
   ```cpp
   header.FileTableOffset = dataEndOffset - GRF_HEADER_SIZE;
   ```

5. **Atualizar fileCount corretamente**
   ```cpp
   // v2.0
   rawFileCount = realFileCount + seed + 7;
   ```

6. **Comprimir tabela de arquivos com ZLIB**

7. **Usar encoding ANSI/Latin1 para nomes de arquivos (preservar EUC-KR)**

---

## Conclusão

O problema no código atual é que `WriteFileData` tenta ser "esperto" demais ao não reescrever arquivos não modificados, mas não atualiza os offsets corretamente quando novos arquivos são adicionados.

A solução correta (como o GRF Editor faz) é usar **QuickMerge**:
1. Manter todos os arquivos existentes onde estão
2. Adicionar novos arquivos ao FINAL do arquivo
3. Reescrever apenas a tabela de arquivos e o header

Isso evita corrupção e é muito mais rápido que reescrever o GRF inteiro.
