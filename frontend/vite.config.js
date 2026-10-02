import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const modulePath = id.replace(/\\/g, '/');
          if (modulePath.includes('/node_modules/recharts/') || /\/node_modules\/d3-[^/]+\//.test(modulePath)) {
            return 'charts';
          }
          if (modulePath.includes('/node_modules/lucide-react/')) {
            return 'icons';
          }
          if (/\/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler|@remix-run)\//.test(modulePath)) {
            return 'react-vendor';
          }
        },
      },
    },
  },
});
