import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
        '@solana/web3.js',
        'react-toastify',
        '@solana/wallet-adapter-wallets',
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-base',
      '@solana/wallet-adapter-react-ui',
      '@solana/spl-token'
      ],
  },
  build: {
    rollupOptions: {
      external: [
        '@solana/web3.js',
        'react-toastify',
        '@solana/wallet-adapter-wallets',
        '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-base',
      '@solana/wallet-adapter-react-ui',
      '@solana/spl-token'
      ],
    },
  },
})
