import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const VENDOR_CHUNKS: Record<string, string[]> = {
  // React core — changes rarely, long-term cacheable
  'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
  // State management
  'vendor-redux':    ['@reduxjs/toolkit', 'react-redux'],
  // Firebase — large, almost never changes
  'vendor-firebase': ['firebase/app', 'firebase/auth'],
  // Supabase — large, almost never changes
  'vendor-supabase': ['@supabase/supabase-js'],
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          for (const [chunk, pkgs] of Object.entries(VENDOR_CHUNKS)) {
            if (pkgs.some(pkg => id.includes(`/node_modules/${pkg}/`))) {
              return chunk
            }
          }
        },
      },
    },
  },
})
