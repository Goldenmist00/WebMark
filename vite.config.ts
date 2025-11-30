import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        serviceWorker: resolve(__dirname, 'src/background/serviceWorker.ts'),
        contentScript: resolve(__dirname, 'src/content/contentScript.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'serviceWorker') {
            return 'background/[name].js';
          }
          if (chunkInfo.name === 'contentScript') {
            return 'content/[name].js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.css') {
            return 'popup/index.css';
          }
          return 'assets/[name]-[hash].[ext]';
        },
      },
      // This is the key: prevent code splitting for content script
      preserveEntrySignatures: 'strict',
    },
  },
  // Optimize dependencies to be bundled
  optimizeDeps: {
    include: ['react', 'react-dom', 'uuid'],
  },
});
