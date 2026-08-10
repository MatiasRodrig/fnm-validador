import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl()
  ],
  server: {
    host: true,
    port: 6101,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:6100',
        changeOrigin: true,
        secure: false
      }
    }
  }
})