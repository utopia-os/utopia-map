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
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('lib/src')) {
            return 'utopia-ui'
          }
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'react'
            }
            if (id.includes('tiptap')) {
              return 'tiptap'
            }
            if (id.includes('leaflet')) {
              return 'leaflet'
            }
            if (id.includes('lib/node_modules')) {
              return 'utopia-ui-vendor'
            } else return 'vendor'
          }
        },
      },
    },
  },
})
