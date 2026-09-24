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
  },
});