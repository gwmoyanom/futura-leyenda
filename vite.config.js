import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Base path matches your GitHub repository name.
// Change 'polla-mundialista' to your actual repo name when deploying.
const BASE_PATH = process.env.VITE_BASE_PATH || '/polla-mundialista/'

export default defineConfig({
  plugins: [react()],

  // Required for GitHub Pages subdirectory deployment
  base: process.env.NODE_ENV === 'production' ? BASE_PATH : '/',

  resolve: {
    alias: {
      // Allows imports like: import Button from '@/components/ui/Button'
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
