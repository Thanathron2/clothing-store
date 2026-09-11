import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/slipok': {
        target: 'https://api.slipok.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/slipok/, '')
      }
    }
  }
})
