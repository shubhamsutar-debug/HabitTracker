import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'HabitTrack',
        short_name: 'HabitTrack',
        description: 'Offline personal habit tracker. Build consistency every day.',
        theme_color: '#2E7D5B',
        background_color: '#0d2818',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        shortcuts: [
          {
            name: 'Today\'s Progress',
            short_name: 'Widget',
            description: 'Quick view of today\'s habits and streak',
            url: '/widget',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Today\'s Habits',
            short_name: 'Today',
            description: 'Check off today\'s habits',
            url: '/',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Cache Google Fonts stylesheet + woff2 files
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: true },
    }),
  ],

  build: {
    rollupOptions: {
      output: {
        // Split heavy vendor libs into separate cached chunks
        manualChunks(id: string) {
          if (id.includes('recharts') || id.includes('d3-') || id.includes('reselect') || id.includes('redux')) {
            return 'vendor-recharts'
          }
          if (id.includes('@dnd-kit')) {
            return 'vendor-dndkit'
          }
          if (id.includes('node_modules/react') || id.includes('react-router') || id.includes('react-dom')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/idb')) {
            return 'vendor-idb'
          }
        },
      },
    },
    // Raise the warning threshold since we're splitting intentionally
    chunkSizeWarningLimit: 600,
  },
})
