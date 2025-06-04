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
    /**
     * https: {
     *   key: fs.readFileSync(path.resolve(__dirname, 'localhost-key.pem')),
     *   cert: fs.readFileSync(path.resolve(__dirname, 'localhost-cert.pem')),
     * },
     */
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/utopia-ui/dist/Profile') &&
            /\.(esm|cjs)\.js$/.test(id)
          ) {
            return 'profile-form'
          }

          if (id.includes('node_modules/utopia-ui/')) {
            return 'utopia-ui-vendor'
          }

          if (id.includes('node_modules/')) {
            return 'vendor'
          }
        }
      }
    }
  }
});
