import path from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { twd } from '../../src/vite-plugin';

const darkTheme = {
  primary: '#2dd4bf',
  buttonPrimary: '#2dd4bf',
  buttonPrimaryText: '#042f2e',

  background: '#0b0f14',
  backgroundSecondary: '#111827',
  skipBg: '#111827',

  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.12)',
  buttonBorder: 'rgba(255, 255, 255, 0.12)',

  text: '#e5e7eb',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',

  success: '#22c55e',
  successBg: 'rgba(34, 197, 94, 0.15)',

  error: '#f87171',
  errorBg: 'rgba(248, 113, 113, 0.15)',

  warning: '#facc15',
  warningBg: 'rgba(250, 204, 21, 0.15)',

  skip: '#6b7280',

  buttonSecondary: '#111827',
  buttonSecondaryText: '#e5e7eb',

  sidebarWidth: '320px',
  borderRadius: '10px',

  shadow: '0 0 0 1px rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.6)',
  shadowSm: '0 1px 2px rgba(0,0,0,0.4)',

  iconColor: '#e5e7eb',
  iconColorSecondary: '#9ca3af',
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    twd({ theme: darkTheme, search: true }),
  ],
  resolve: {
    alias: {
      'twd-js/bundled': path.resolve(__dirname, './src/dist/bundled.es.js'),
    },
  },
});
