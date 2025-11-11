import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

if (import.meta.env.DEV) {
  const { initTWD } = await import('../../../src/bundled.tsx');
  initTWD(import.meta.glob("./**/*.twd.test.ts"));
}

createApp(App).mount('#app')
