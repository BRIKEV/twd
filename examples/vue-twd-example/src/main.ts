import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

if (import.meta.env.DEV) {
  const { initTWD } = await import('./dist/bundled.es.js');
  const tests = import.meta.glob("./**/*.twd.test.ts")
  initTWD(tests);
}

createApp(App).mount('#app')
