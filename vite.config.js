import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Therapist App',
        short_name: 'Therapist',
        description: 'Therapy Booking and Management App',
        theme_color: '#0d6efd',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: './src/assets/vite.svg',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: './src/assets/vite.svg',
            sizes: '512x512',
            type: 'image/png'
          },

        ]
      }, devOptions: {
        enabled: true   // ✅ ADD THIS
      },
    })
  ],

  // ✅ CORRECT PLACE
  server: {
    port: 3000,
    strictPort: true
  }
})