import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Prevent Vite from obscuring Rust errors
  clearScreen: false,

  // Tauri expects a fixed port
  server: {
    port: 5173,
    strictPort: true,
  },

  // Build optimizations
  build: {
    target: 'esnext',
    minify: process.env.TAURI_DEBUG ? false : 'esbuild',
    outDir: 'dist',
    emptyOutDir: true,
  },
});
