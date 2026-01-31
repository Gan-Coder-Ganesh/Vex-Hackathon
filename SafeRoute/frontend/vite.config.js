import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'SafeRoute Disaster Management',
        short_name: 'SafeRoute',
        description: 'Offline Disaster Shelter Finder and Reporting Tool',
        theme_color: '#18181b',
        background_color: '#18181b',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          // 1. Map Tiles (CartoDB) - StaleWhileRevalidate for speed + updates
          {
            urlPattern: /^https:\/\/.*\.basemaps\.cartocdn\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'map-tiles-cache',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 Year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // 2. Navigation Routing (OSRM) - CacheFirst (Routes don't change often)
          {
            urlPattern: /^https:\/\/router\.project-osrm\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osrm-route-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 Day
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // 3. API Data (Backend) - NetworkFirst (Try live, fallback to cache)
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-data-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 Hour
              },
              networkTimeoutSeconds: 3 // Fallback quickly
            }
          }
        ]
      }
    })
  ],
})
