/// <reference types="vitest" />
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// add plugin for code coverage
import istanbul from 'vite-plugin-istanbul';
// TWD HMR plugin to prevent test duplication on hot reload
import { twdHmr } from '../../src/plugin/twdHmr';
import { twd } from '../../src/plugin/twd';

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
    twd({ testFilePattern: '/**/*.twd.test.{ts,tsx}', open: false, search: true }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      'twd-js/bundled': path.resolve(__dirname, './src/dist/bundled.es.js'),
    },
  },
  server: {
    watch: {
      ignored: ["**/data/data.json", "**data/routes.json"],
    },
  },
})