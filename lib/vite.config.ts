import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import { configDefaults } from 'vitest/config'

export default defineConfig({
  plugins: [react(), svgr()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['setupTest.ts'],
    coverage: {
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: [...configDefaults.exclude, 'src/**/*.cy.tsx'],
      reporter: ['html', 'json-summary'],
      thresholds: {
        lines: 1,
      },
    },
  },
})
