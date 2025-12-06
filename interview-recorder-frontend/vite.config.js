import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      },
      manifest: {
        name: 'Interview Recorder - CSC4301',
        short_name: 'Interviewer',
        description: 'Offline interview recorder for timetable problem research',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        icon: 'src/assets/icon.png', // This will be created later
        icons: [
          {
            src: 'src/assets/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'src/assets/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          }
        ]
      }
    })
  ],
})
