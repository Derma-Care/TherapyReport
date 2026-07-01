import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import removeConsole from 'vite-plugin-remove-console'
import { COLORS } from './src/Constant/Themes'

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Therapist App',
        short_name: 'Therapist',
        description: 'Therapy Booking and Management App',
        theme_color: COLORS.primary,
        background_color: '#ffffff',
        id: '/',
        scope: '/',
        orientation: 'portrait',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },

        ]
      }, devOptions: {
        enabled: true   // ✅ ADD THIS
      },
    }),

    // ── Strip console only in production build ──────────────────────────────
    ...(command === 'build' ? [removeConsole()] : []),
  ],

  // ✅ CORRECT PLACE
  server: {
    port: 3000,
    strictPort: true
  },

}))
