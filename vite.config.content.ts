import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Separate config for content script - builds as single IIFE file
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't empty, we're building multiple times
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/content/contentScript.ts'),
      name: 'ContentScript',
      formats: ['iife'],
      fileName: () => 'content/contentScript.js',
    },
    rollupOptions: {
      output: {
        extend: true,
        globals: {},
      },
    },
  },
});
