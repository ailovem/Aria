import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      proxy: {
        '/v1': {
          target: env.ARIA_SITE_DEV_API_PROXY || 'http://127.0.0.1:8787',
          changeOrigin: true,
        },
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          aiConan: resolve(__dirname, 'ai-conan.html'),
        },
      },
    },
  }
})
