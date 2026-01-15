# Kafra Client - Tauri Migration Complete  ⚡

**Ragnarok Online Patcher/Launcher** built with Tauri, React, and Rust.

## 🎯 Migration Benefits

- **Size**: ~10-15MB (was ~130MB with Electron)
- **Performance**: 30-50% faster startup
- **Memory**: 50-70% less RAM usage

## 🚀 Quick Start

### Prerequisites
- [Rust](https://rustup.rs/)
- [Bun](https://bun.sh/) (or npm/yarn)
- Windows (primary target)

### Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev
```

### Build

```bash
# Build for Windows (NSIS installer + portable)
bun run build

# Build portable only
bun run build:portable
```

Output: `src-tauri/target/release/bundle/`

## 📁 Project Structure

```
kafra-client/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── types/             # TypeScript types
│   └── App.tsx            # Main app
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── config.rs      # Configuration loading
│   │   ├── patcher/       # Patching system
│   │   │   ├── downloader.rs   # HTTP downloads
│   │   │   ├── patch_list.rs   # Patch list parsing
│   │   │   ├── thor_patcher.rs # THOR extraction
│   │   │   └── grf/            # GRF reader/writer
│   │   └── main.rs        # Tauri commands
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
└── config.yml             # Patcher configuration

```

## ⚙️ Configuration

Edit `config.yml` to configure the patcher. See [docs/CONFIG.md](docs/CONFIG.md) for details.

## 🔧 Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Rust (Tauri)
- **Build**: Vite
- **Patching**: Native THOR + GRF implementation

## 📦 Dependencies

**Rust Crates**:
- `tauri` - Application framework
- `serde` / `serde_yaml` - Configuration parsing
- `reqwest` - HTTP client
- `tokio` - Async runtime
- `zip` - THOR archive handling
- `flate2` - GRF compression

**NPM Packages**:
- `@tauri-apps/api` - Tauri frontend API
- `react` - UI framework
- `tailwindcss` - Styling

## 🎮 Features

- ✅ Auto-update system with progress tracking
- ✅ THOR patch extraction
- ✅ Native GRF patching (QuickMerge algorithm)
- ✅ Game launcher with SSO support
- ✅ Setup.exe launcher
- ✅ GRF toggle (pvp/normal floor)
- ✅ Cache management
- ✅ Custom error messages
- ✅ Background music
- ✅ Frameless window UI

## 📝 License

MIT
