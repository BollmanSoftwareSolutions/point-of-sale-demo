import { defineConfig, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// The `test` block configures Vitest. It's cast to Vite's UserConfig because the
// project's Vite (rolldown) and Vitest's bundled Vite types differ.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
} as UserConfig)
