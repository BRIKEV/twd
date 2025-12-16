/// <reference types="vitest" />
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// add plugin for code coverage
import istanbul from 'vite-plugin-istanbul';
// TWD HMR plugin to prevent test duplication on hot reload
import { twdHmr } from '../../src/plugin/twdHmr';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // TWD HMR plugin - clears tests when test files are updated
    twdHmr(),
    // configure istanbul plugin
    istanbul({
      include: 'src/**/*',
      exclude: ['node_modules', 'tests/'],
      extension: ['.ts', '.tsx'],
      requireEnv: process.env.CI ? true : false,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    watch: {
      ignored: ["**/data/data.json", "**data/routes.json"],
    },
  },
})