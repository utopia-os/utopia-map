import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// __dirname-Ersatz für ESModules
const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
  server: {
    host: true,
    port: 5174,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'localhost-cert.pem')),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 1) Fange exakt den Pfad zu utopia-ui/dist/Profile.*.js ab:
          //    → Ut­opia-ui baut Profile als "dist/Profile.esm.js" (bzw. Profile.cjs.js) aus.
          if (
            id.includes('node_modules/utopia-ui/dist/Profile') &&
            /\.(esm|cjs)\.js$/.test(id)
          ) {
            return 'profile-form'   // Chunk-Name: profile-form.[hash].js
          }

          // 2) Alle anderen Dateien aus utopia-ui in 'utopia-ui-vendor' bündeln:
          if (id.includes('node_modules/utopia-ui/')) {
            return 'utopia-ui-vendor'
          }

          // 3) Alle übrigen node_modules-Pakete ins generische 'vendor'-Chunk:
          if (id.includes('node_modules/')) {
            return 'vendor'
          }
        }
      }
    }
  }
});
