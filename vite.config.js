import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { API_URL } from './src/url/config';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Exposes dev server to local network
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: API_URL, // Replace with your backend IP
        changeOrigin: true,
        secure: false
      },
      '/auth': {
        target: API_URL,
        changeOrigin: true,
        secure: false
      }
    }
  }
});