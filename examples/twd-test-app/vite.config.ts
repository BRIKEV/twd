import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import istanbul from 'vite-plugin-istanbul';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // configure istanbul plugin
    istanbul({
      include: 'src/**/*',
      exclude: ['node_modules', 'dist', 'twd-tests/**'],
      extension: ['.ts', '.tsx'],
      requireEnv: process.env.CI ? true : false,
    }),
  ],
})
