import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/wifiscout/',
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  server: {
    proxy: {
      '/wifiscout/api': { target: 'http://localhost:3010', changeOrigin: true },
      '/wifiscout/uploads': { target: 'http://localhost:3010', changeOrigin: true }
    }
  },
  build: {
    outDir: '../server/public',
    emptyOutDir: true
  }
})
