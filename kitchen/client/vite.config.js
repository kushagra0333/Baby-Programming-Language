import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/compile': {
        target: 'https://baby-programming-language-web.vercel.app',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
