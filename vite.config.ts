import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  envPrefix: 'VITE_',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    host: '0.0.0.0',
    open: true,
    strictPort: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  preview: {
    port: 3001,
    host: '0.0.0.0',
    open: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    target: 'esnext',
    modulePreload: {
      polyfill: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', 'lucide-react'],
          charts: ['recharts'],
          utils: ['date-fns', 'zustand']
        }
      }
    }
  }
});
