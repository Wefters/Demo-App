import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { wefterDevtools } from '@wefterjs/devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss(), wefterDevtools()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/signal-test': {
        target: 'https://api.uptimesignal.io', 
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/signal-test/, '') 
      }
    }
  },
  resolve: {
    // One @wefterjs/core for the whole app: each linked plugin otherwise brings its own copy.
    dedupe: ['@wefterjs/core'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
