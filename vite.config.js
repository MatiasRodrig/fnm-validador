import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  if (command === 'serve' && process.env.NODE_ENV === 'production') {
    process.env.NODE_ENV = 'development';
  }

  return {
    plugins: [
      react(),
      basicSsl()
    ],
    server: {
      host: true,
      port: 6101,
      hmr: process.env.VITE_DISABLE_HMR === 'true'
        ? false
        : (process.env.VITE_HMR_HOST
            ? { host: process.env.VITE_HMR_HOST, clientPort: 443, protocol: 'wss' }
            : false),
      allowedHosts: [
        'fnm.sanvicentemisiones.com',
        'validador.sanvicentemisiones.com',
        '.sanvicentemisiones.com'
      ],
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:6100',
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
})