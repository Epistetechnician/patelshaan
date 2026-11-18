import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
          if (id.includes('replays.json') || id.includes('ecdsafail-data.json')) {
            return 'research-data'
          }
          if (id.includes('/src/content/writings/')) {
            return 'writings'
          }
        },
      },
    },
  },
})
