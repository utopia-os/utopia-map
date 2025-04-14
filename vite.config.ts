import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5174
  },
  plugins: [
    react(),
    tailwindcss(),
  ]
})

{/**
VitePWA({manifest: {
      "short_name": "Utopia Game",
      "name": "Utopia - A Real Life Manifestation Game",
      "icons": [
        {
          "src": "3markers-globe.svg",
          "sizes": "any",
          "type": "image/svg+xml"
        },
        {
          "src": "3markers-globe_256.png",
          "sizes": "256x256",
          "type": "image/png"
        },
      ],
      "start_url": "/",
      "display": "fullscreen",
      "orientation": "natural"
    }})
   */}