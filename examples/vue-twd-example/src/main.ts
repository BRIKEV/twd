import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

if (import.meta.env.DEV) {
  const { initTWD } = await import('./dist/bundled.es.js');
  const darkTheme = {
    // Accent / brand
    primary: '#2dd4bf', // teal / neon-cyan
    buttonPrimary: '#2dd4bf',
    buttonPrimaryText: '#042f2e',
  
    // Backgrounds
    background: '#0b0f14', // near-black
    backgroundSecondary: '#111827', // elevated surfaces
    skipBg: '#111827',
  
    // Borders & dividers
    border: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.12)',
    buttonBorder: 'rgba(255, 255, 255, 0.12)',
  
    // Text
    text: '#e5e7eb',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
  
    // Status colors
    success: '#22c55e',
    successBg: 'rgba(34, 197, 94, 0.15)',
  
    error: '#f87171',
    errorBg: 'rgba(248, 113, 113, 0.15)',
  
    warning: '#facc15',
    warningBg: 'rgba(250, 204, 21, 0.15)',
  
    skip: '#6b7280',
  
    // Buttons
    buttonSecondary: '#111827',
    buttonSecondaryText: '#e5e7eb',
  
    // Layout
    sidebarWidth: '320px',
    borderRadius: '10px',
  
    // Shadows (very subtle, dev-tool style)
    shadow: '0 0 0 1px rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.6)',
    shadowSm: '0 1px 2px rgba(0,0,0,0.4)',
  
    // Icons
    iconColor: '#e5e7eb',
    iconColorSecondary: '#9ca3af',
  };
  
  
  const tests = import.meta.glob("./**/*.twd.test.ts")
  initTWD(tests, { theme: darkTheme });
}

createApp(App).mount('#app')
