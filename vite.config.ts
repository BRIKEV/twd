/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'TWD',
      fileName: (format) => `twd.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
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
    exclude: ['node_modules', 'dist', 'examples'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**'],
      exclude: ['src/tests/**', 'examples/**', 'dist/**'],
    },
  },
});
