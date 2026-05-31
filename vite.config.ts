import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Keep ALL firebase/* and @firebase/* packages together
          if (id.includes('/node_modules/firebase/') || id.includes('/node_modules/@firebase/')) {
            return 'vendor-firebase'
          }
          // Keep ALL @supabase/* packages together
          if (id.includes('/node_modules/@supabase/')) {
            return 'vendor-supabase'
          }
          // React ecosystem
          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/react-router') ||
            id.includes('/node_modules/scheduler/')
          ) {
            return 'vendor-react'
          }
          // State management
          if (
            id.includes('/node_modules/@reduxjs/') ||
            id.includes('/node_modules/react-redux/') ||
            id.includes('/node_modules/redux/')
          ) {
            return 'vendor-redux'
          }
        },
      },
    },
  },
})
