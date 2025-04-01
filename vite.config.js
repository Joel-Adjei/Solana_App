import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || "/Solana_App",
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
  // Remove the external configuration since these are core dependencies
  // that should be bundled with your application
  build: {
    // Either remove this section entirely or modify it to exclude only truly external resources
    // rollupOptions: {
    //   external: [
    //     // Remove packages that you actually need bundled
    //   ],
    // },
  },
})
