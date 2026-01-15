---
description: Corrigir modo dev e estrutura do projeto
---

# Fix Dev Mode & Cleanup Project Structure

## Problemas Identificados

### 1. ❌ Erro de Compilação Rust (CRÍTICO)
**Arquivo**: `src-tauri/src/main.rs:344`
**Erro**: A função `tauri::api::shell::open()` requer 3 argumentos, mas apenas 2 foram fornecidos.
**Causa**: A API mudou na versão 1.x do Tauri.

### 2. ❌ Pasta `dist/` Obsoleta
**Conteúdo**: Build antigo do Electron (`RPatchur-*.exe`, `win-unpacked/`, etc.)
**Status**: Projeto migrou de Electron para Tauri - esta pasta NÃO é mais necessária.
**Ação**: **DELETAR**

### 3. ✅ Pasta `src/` (Frontend React)
**Conteúdo**: `App.tsx`, `components/`, `main.tsx`, etc.
**Status**: **NECESSÁRIA** - Contém o frontend React do Tauri
**Ação**: **MANTER**

### 4. ✅ Pasta `src-tauri/` (Backend Rust)
**Conteúdo**: Código Rust, patcher logic, GRF handling
**Status**: **NECESSÁRIA** - Contém o backend Tauri
**Ação**: **MANTER**

## Plano de Correção

### Passo 1: Corrigir erro de compilação
**Arquivo**: `src-tauri/src/main.rs`
**Linha**: 344
**Mudança**: Adicionar dependência `open` e reescrever função

```rust
// ANTES (ERRO):
#[tauri::command]
fn open_external(url: String) -> Result<(), String> {
    tauri::api::shell::open(&url, None).map_err(|e| e.to_string())
}

// DEPOIS (CORRETO):
#[tauri::command]
fn open_external(url: String) -> Result<(), String> {
    open::that(&url).map_err(|e| e.to_string())
}
```

**Adicionar ao `Cargo.toml`**:
```toml
open = "5.0"
```

### Passo 2: Adicionar import no main.rs
```rust
use open;
```

### Passo 3: Remover pasta `dist/` obsoleta
```powershell
Remove-Item -Path "dist" -Recurse -Force
```

### Passo 4: Atualizar `.gitignore` para evitar commit de builds
Garantir que `dist/` está listado (já deve estar).

### Passo 5: Testar compilação
```bash
cd src-tauri
cargo build
```

### Passo 6: Executar em modo dev
```bash
bun run dev
```

## Estrutura Final Esperada

```
Kafra-Client/
├── src/                    ✅ Frontend React/TypeScript (Tauri)
├── src-tauri/              ✅ Backend Rust (Tauri)
├── public/                 ✅ Assets estáticos
├── node_modules/           (gerado)
├── dist/                   ❌ REMOVIDO (build Electron antigo)
├── index.html              ✅ Entry point Vite
├── package.json            ✅ Configuração do projeto
├── vite.config.ts          ✅ Config do Vite
└── config.yml              ✅ Configuração do patcher
```

## Resultado Esperado
- ✅ Compilação Rust bem-sucedida
- ✅ `bun run dev` funciona sem erros
- ✅ Aplicação Tauri abre corretamente
- ✅ Estrutura de pastas limpa e organizada
