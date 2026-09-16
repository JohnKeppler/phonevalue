import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const isCapacitor = process.env.CAPACITOR === '1'

export default defineConfig({
  // GitHub Pages PWA needs /phonevalue/; Capacitor Android needs root.
  base: isCapacitor ? '/' : '/phonevalue/',
  plugins: [
    react(),
    tailwindcss(),
    // Skip PWA service worker inside the native shell (avoids SW conflicts).
    ...(isCapacitor
      ? []
      : [
          VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg'],
            manifest: {
              name: 'ValorMóvil',
              short_name: 'ValorMóvil',
              description:
                'ValorMóvil — mide cuanto de tu teléfono aprovechas de verdad',
              lang: 'es',
              theme_color: '#0f172a',
              background_color: '#0f172a',
              display: 'standalone',
              orientation: 'portrait',
              start_url: '/phonevalue/',
              scope: '/phonevalue/',
              icons: [
                {
                  src: 'pwa-192x192.png',
                  sizes: '192x192',
                  type: 'image/png',
                },
                {
                  src: 'pwa-512x512.png',
                  sizes: '512x512',
                  type: 'image/png',
                },
                {
                  src: 'pwa-512x512.png',
                  sizes: '512x512',
                  type: 'image/png',
                  purpose: 'maskable',
                },
              ],
            },
            workbox: {
              navigateFallback: '/phonevalue/index.html',
              globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
            },
          }),
        ]),
  ],
})
