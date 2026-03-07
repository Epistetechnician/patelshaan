import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['.up.railway.app'],
    fs: {
      allow: [fileURLToPath(new URL('..', import.meta.url))],
    },
  },
  preview: {
    allowedHosts: ['.up.railway.app'],
  },
})
