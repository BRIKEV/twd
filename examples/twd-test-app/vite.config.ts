import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import istanbul from 'vite-plugin-istanbul';
import { twdRemote } from 'twd-relay/vite';
import type { PluginOption } from 'vite';
import { twd, removeMockServiceWorker } from '../../src/vite-plugin';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    istanbul({
      include: 'src/**/*',
      exclude: ['node_modules', 'dist', 'twd-tests/**'],
      extension: ['.ts', '.tsx'],
      requireEnv: process.env.CI ? true : false,
    }),
    twdRemote() as PluginOption,
    twd({
      testFilePattern: '/**/*.twd.test.{ts,tsx}',
      open: false,
      search: true,
      pace: true,
      // Responsive testing: tests tagged with a viewport only run in Run All when
      // the window matches it. Untagged tests run at every width.
      viewports: {
        mobile: { maxWidth: 767 },
        desktop: { minWidth: 1024 },
      },
    }),
    removeMockServiceWorker(),
  ],
  resolve: {
    alias: {
      'twd-js/bundled': path.resolve(__dirname, '../../dist/bundled.es.js'),
    },
  },
});
