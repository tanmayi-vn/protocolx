import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@designcodeio/threeui/style.css': path.resolve(import.meta.dirname, 'src/shaders/threeui.css'),
      '@designcodeio/threeui': path.resolve(import.meta.dirname, 'src/shaders/landing-pages/LandingPages.tsx'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
