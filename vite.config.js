import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Base path matches the GitHub Pages repository path.
const BASE_PATH = process.env.VITE_BASE_PATH || '/futura-leyenda/'

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
