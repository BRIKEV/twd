import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { removeMockServiceWorker } from '../../src';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
