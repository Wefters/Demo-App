import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { wefterDevtools } from '@wefterjs/devtools'

/**
 * Vite config of the demo app. `/api` is forwarded to the test backend in `backend/` (`pnpm api`), so the
 * app calls the dev server it is loaded from, which devices can reach. `API_PROXY_TARGET` (in `.env.local`)
 * points it elsewhere.
 */
export default defineConfig(({ mode }) => ({
  plugins: [vue(), tailwindcss(), wefterDevtools()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: loadEnv(mode, process.cwd(), '').API_PROXY_TARGET || 'http://127.0.0.1:4000',
        xfwd: true,
      },
      '/signal-test': {
        target: 'https://api.uptimesignal.io',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/signal-test/, ''),
      },
    },
  },
  resolve: {
    dedupe: ['@wefterjs/core'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
