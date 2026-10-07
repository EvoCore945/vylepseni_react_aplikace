import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      Utils: fileURLToPath(new URL('./src/utils', import.meta.url)),
    },
  },

  publicDir: 'static',

  server: {
    port: 9000,
    open: true,
    proxy: {
      '/api/v1': {
        target: 'http://localhost',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/v3/rest.php'),
      },
    },
  },
});