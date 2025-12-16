import type { Plugin } from 'vite';

/**
 * Options for the TWD HMR plugin.
 */
export interface TwdHmrOptions {
  /**
   * Pattern to match test files. Defaults to `.twd.test.ts`.
   * Can be a string (checked with `endsWith`) or a function that returns a boolean.
   * @default ".twd.test.ts"
   */
  testFilePattern?: string | ((file: string) => boolean);
}

/**
 * Vite plugin to handle HMR for TWD test files.
 * When a TWD test file is updated, it forces a full page reload to prevent
 * duplicate test entries that occur when HMR reloads test modules.
 * 
 * This plugin only runs in development mode (serve) and does not affect Vitest test runs.
 * 
 * @param options - Configuration options for the plugin
 * @example
 * ```ts
 * import { twdHmr } from 'twd-js/vite-plugin';
 * 
 * export default defineConfig({
 *   plugins: [
 *     // ... other plugins
 *     twdHmr() // Uses default pattern: .twd.test.ts
 *   ]
 * });
 * ```
 * @example
 * ```ts
 * // Custom pattern
 * twdHmr({ testFilePattern: '.twd.test.tsx' })
 * ```
 * @example
 * ```ts
 * // Custom function
 * twdHmr({ 
 *   testFilePattern: (file) => file.includes('.twd.test.') 
 * })
 * ```
 */
export function twdHmr(options: TwdHmrOptions = {}): Plugin {
  const { testFilePattern = '.twd.test.ts' } = options;
  
  const isTestFile = typeof testFilePattern === 'function'
    ? testFilePattern
    : (file: string) => file.endsWith(testFilePattern);

  return {
    name: 'twd-hmr',
    apply: 'serve', // Only run in dev mode, not during Vitest test runs
    handleHotUpdate({ file, server }) {
      if (isTestFile(file)) {
        // Force a full page reload when TWD test files change
        // This prevents duplicate test entries that occur with HMR module reloading
        server.ws.send({
          type: 'full-reload',
          path: '*',
        });
        return []; // Stop normal HMR for this file
      }
    },
  };
}

