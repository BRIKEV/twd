/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      copyDtsFiles: true,
      exclude: ['src/tests', 'src/**/tests', '**/*.spec.ts', '**/*.test.ts'],
    }),
  ],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        runner: 'src/runner.ts',
        'vite-plugin': 'src/vite-plugin.ts',
      },
      name: 'TWD',
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'fs', 'path', 'vite'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    exclude: ['node_modules', 'dist', 'examples', 'docs'],
    setupFiles: 'src/tests/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.test.{ts,tsx}',
        '!src/**/*.spec.{ts,tsx}',
        '!src/tests/**',
        '!examples/**',
        '!dist/**',
        '!docs/**',
      ],
      exclude: [
        'src/tests/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'examples/**',
        'dist/**',
        'docs/**',
        'coverage/**'
      ],
    },
  },
});
