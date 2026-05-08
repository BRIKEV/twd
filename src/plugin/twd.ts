import type { Plugin, ResolvedConfig } from 'vite';
import type { TWDTheme } from '../ui/utils/theme';

/**
 * Options for the TWD Vite plugin.
 */
export interface TwdPluginOptions {
  /**
   * Glob pattern used to discover TWD test files via `import.meta.glob`.
   * @default "/**\/*.twd.test.ts"
   */
  testFilePattern?: string;
  /**
   * Whether the TWD sidebar starts open.
   * @default true
   */
  open?: boolean;
  /**
   * Side of the viewport the sidebar is anchored to.
   * @default "left"
   */
  position?: 'left' | 'right';
  /**
   * Whether to register the Mock Service Worker for request mocking.
   * @default true
   */
  serviceWorker?: boolean;
  /**
   * URL of the Mock Service Worker script served by the app.
   * @default "/mock-sw.js"
   */
  serviceWorkerUrl?: string;
  /**
   * Optional theme overrides for the sidebar UI.
   */
  theme?: Partial<TWDTheme>;
  /**
   * Whether to show the search input in the sidebar.
   */
  search?: boolean;
  /**
   * CSS selector for the host element used to mount the sidebar.
   */
  rootSelector?: string;
}

const VIRTUAL_ID = 'virtual:twd/init';
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;
const DEFAULT_PATTERN = '/**/*.twd.test.ts';

const DEFAULT_INIT_OPTIONS = {
  open: true,
  position: 'left',
  serviceWorker: true,
  serviceWorkerUrl: '/mock-sw.js',
} as const;

/**
 * Vite plugin that auto-wires TWD into a dev server.
 * It exposes a virtual module that calls `initTWD` with a glob of test files
 * and injects a `<script type="module">` tag into `index.html` via
 * `transformIndexHtml`, so apps don't need a manual TWD entry point.
 *
 * This plugin only runs in development mode (serve) and does not affect Vitest test runs.
 *
 * @param options - Configuration options for the plugin
 * @example
 * ```ts
 * import { twd } from 'twd-js/vite-plugin';
 *
 * export default defineConfig({
 *   plugins: [
 *     // ... other plugins
 *     twd(),
 *   ],
 * });
 * ```
 * @example
 * ```ts
 * // Custom options
 * twd({
 *   testFilePattern: '/src/**\/*.twd.test.tsx',
 *   position: 'right',
 *   open: false,
 * })
 * ```
 * @example
 * ```ts
 * // Disable the Mock Service Worker (e.g. when the project doesn't use request mocking)
 * twd({
 *   serviceWorker: false,
 * })
 *
 * // Or point to a custom service worker path
 * twd({
 *   serviceWorkerUrl: '/custom/mock-sw.js',
 * })
 * ```
 */
export function twd(options: TwdPluginOptions = {}): Plugin {
  const { testFilePattern = DEFAULT_PATTERN, ...userInitOptions } = options;
  // Track whether the user explicitly set serviceWorkerUrl so we don't
  // double-prefix when applying the resolved Vite base path.
  const userSetServiceWorkerUrl = userInitOptions.serviceWorkerUrl !== undefined;
  const initOptions = { ...DEFAULT_INIT_OPTIONS, ...userInitOptions };

  // Captured from configResolved. Vite normalizes this to start and end
  // with "/" (default "/"). Used to prefix dev-server-relative URLs so
  // the plugin works under non-root `base` configs (e.g. "/platform-admin/").
  let resolvedBase = '/';

  return {
    name: 'twd',
    apply: 'serve',
    configResolved(config: ResolvedConfig) {
      resolvedBase = config.base;
      // If the user didn't override serviceWorkerUrl, prefix the default
      // with the resolved base so the SW resolves under non-root deployments.
      if (!userSetServiceWorkerUrl && resolvedBase !== '/') {
        const trimmed = DEFAULT_INIT_OPTIONS.serviceWorkerUrl.replace(/^\//, '');
        initOptions.serviceWorkerUrl = `${resolvedBase}${trimmed}`;
      }
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) {
        return RESOLVED_VIRTUAL_ID;
      }
      return null;
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return null;
      const patternLiteral = JSON.stringify(testFilePattern);
      const optionsLiteral = JSON.stringify(initOptions);
      return [
        `import { initTWD } from 'twd-js/bundled';`,
        `const tests = import.meta.glob(${patternLiteral});`,
        `initTWD(tests, ${optionsLiteral});`,
      ].join('\n');
    },
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { type: 'module', src: `${resolvedBase}@id/${VIRTUAL_ID}` },
          injectTo: 'head' as const,
        },
      ];
    },
  };
}
