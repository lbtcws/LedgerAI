import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [
    uni()
  ],
  base: '/LedgerAI/',
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
