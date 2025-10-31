import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { removeMockServiceWorker } from '../../src/vite-plugin';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), removeMockServiceWorker()],
})
