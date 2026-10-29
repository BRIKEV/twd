import { existsSync, rmSync } from 'fs';
import { dirname, isAbsolute, relative, resolve } from 'path';
import type { Plugin } from 'vite';

/**
 * Options for the `removeMockServiceWorker` Vite plugin.
 */
export interface RemoveMockServiceWorkerOptions {
  /**
   * Path of the mock service worker, relative to the build output directory.
   * Match it to `serviceWorkerUrl` if you serve the worker from a custom path.
   * @default "mock-sw.js"
   */
  fileName?: string;
}

/**
 * Vite plugin to remove the mock service worker file from the build output.
 * This is useful for production builds where you don't want the mock service worker to be included.
 *
 * The file is removed from the output directory of each build, so a custom
 * `build.outDir` or a framework layout such as React Router's `build/client`
 * works without extra configuration. Server builds are skipped silently,
 * since Vite only copies `public/` into the client output.
 *
 * @example
 * ```ts
 * import { removeMockServiceWorker } from 'twd-js/vite-plugin';
 *
 * export default defineConfig({
 *   plugins: [
 *     // ... other plugins
 *     removeMockServiceWorker()
 *   ]
 * });
 * ```
 */
export function removeMockServiceWorker(options: RemoveMockServiceWorkerOptions = {}): Plugin {
  const fileName = (options.fileName ?? 'mock-sw.js').replace(/^\/+/, '');
  let isSsrBuild = false;

  return {
    name: 'remove-mock-sw',
    apply: 'build',
    configResolved(config) {
      isSsrBuild = Boolean(config.build.ssr);
    },
    writeBundle(outputOptions) {
      // `this.environment` exists on Vite 6+; older versions only expose build.ssr.
      const environment = (this as { environment?: { config: { consumer?: string } } }).environment;
      const isServer = environment ? environment.config.consumer === 'server' : isSsrBuild;

      const outDir = outputOptions.dir ?? (outputOptions.file && dirname(outputOptions.file));
      if (!outDir) return;

      // Show paths inside the project relative to it, anything else in full.
      const relativeOut = relative(process.cwd(), resolve(outDir));
      const shownDir =
        relativeOut.startsWith('..') || isAbsolute(relativeOut)
          ? resolve(outDir)
          : relativeOut || '.';

      const target = resolve(outDir, fileName);
      if (existsSync(target)) {
        rmSync(target);
        console.log(`🧹 twd: removed ${fileName} from ${shownDir}`);
        return;
      }

      if (isServer) return;
      console.warn(
        `⚠️  twd: ${fileName} was not found in ${shownDir}, nothing was removed. ` +
          'If your framework copies public/ outside the Vite build (e.g. Nuxt), remove it from that output instead.',
      );
    },
  };
}
