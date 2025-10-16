import { rmSync } from 'fs';
import { resolve } from 'path';
import type { Plugin } from 'vite';

/**
 * Vite plugin to remove the mock service worker file from the build output.
 * This is useful for production builds where you don't want the mock service worker to be included.
 * 
 * @example
 * ```ts
 * import { removeMockServiceWorker } from 'twd-js';
 * 
 * export default defineConfig({
 *   plugins: [
 *     // ... other plugins
 *     removeMockServiceWorker()
 *   ]
 * });
 * ```
 */
export function removeMockServiceWorker(): Plugin {
  return {
    name: 'remove-mock-sw',
    apply: 'build',
    closeBundle() {
      try {
        rmSync(resolve('dist/mock-sw.js'));
        console.log('🧹 Removed mock-sw.js from build');
      } catch {
        console.log('🧹 No mock-sw.js found in build');
      }
    },
  };
}
