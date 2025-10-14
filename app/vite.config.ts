import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import tsConfigPaths from 'vite-tsconfig-paths'

// __dirname-Ersatz für ESModules
const __dirname = path.dirname(new URL(import.meta.url).pathname)

export default defineConfig({
  server: {
    host: true,
    port: 5174,
    /**
     * https: {
     *   key: fs.readFileSync(path.resolve(__dirname, 'localhost-key.pem')),
     *   cert: fs.readFileSync(path.resolve(__dirname, 'localhost-cert.pem')),
     * },
     */
  },
  plugins: [react(), tailwindcss(), tsConfigPaths()],
  build: {
    sourcemap: true,
    modulePreload: {
      // Don't preload maplibre chunks - only load when actually needed
      resolveDependencies: (_filename, deps) => {
        return deps.filter((dep) => !dep.includes('maplibre'))
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Handle lib source (dev) or dist (prod)
          if (id.includes('lib/src') || id.includes('lib/dist')) {
            // Separate chunk for MapLibre components
            if (id.includes('MapLibre')) {
              return 'maplibre-layer'
            }
            return 'utopia-ui'
          }
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler') || id.includes('use-sync-external-store')) {
              return 'react'
            }
            if (id.includes('tiptap')) {
              return 'tiptap'
            }
            if (id.includes('leaflet')) {
              return 'leaflet'
            }
            // Separate chunk for maplibre-gl
            if (id.includes('maplibre-gl')) {
              return 'maplibre-gl'
            }
            return 'vendor'
          }
        },
      },
    },
  },
})
