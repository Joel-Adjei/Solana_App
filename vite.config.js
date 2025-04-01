import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || "/Solana_App",
  optimizeDeps: {
    include: ['@solana/web3.js'],
  },
  build: {
    rollupOptions: {
      external: ['@solana/web3.js'],
    },
  },
})
