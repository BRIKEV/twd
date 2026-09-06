import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin, ViteDevServer } from 'vite';

/**
 * Options for the TWD layout snapshot plugin.
 */
export interface TwdSnapshotOptions {
  /**
   * Directory for `.snap` references and failure captures, relative to the Vite root.
   * @default "__twd_snapshots__"
   */
  dir?: string;
  /**
   * Run layout snapshots in the browser sidebar.
   *
   * Off by default and deliberately so. The sidebar resizes the page, and the
   * dev viewport is whatever size the window happens to be, so a reference
   * created there would fail for everyone else. Layout snapshots are decided by
   * `twd-cli`; this is for inspecting them locally.
   * @default false
   */
  debug?: boolean;
}

const ROUTE = '/__twd/snapshot';
const DEFAULT_DIR = '__twd_snapshots__';

/** The name ends up in a file path, so keep it to characters that survive one. */
const sanitizeName = (name: string) => name.replace(/[^a-zA-Z0-9_-]/g, '');

function readJsonBody(req: IncomingMessage): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk: unknown) => (raw += String(chunk)));
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}') as Record<string, string>);
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Vite plugin that lets `twd.matchLayout` read and write layout snapshots.
 *
 * The browser cannot touch the filesystem; the dev server already has it in
 * front of it, so a middleware is enough. `twd-relay` was considered and is not
 * a fit for this.
 *
 * This plugin holds no snapshot policy. It does not know what an update is, or
 * what CI means, or whether a reference may be created. Every one of those
 * decisions is made by `matchLayout` before the request is sent.
 *
 * @param options - Configuration options for the plugin
 * @example
 * ```ts
 * import { twdSnapshot } from 'twd-js/vite-plugin';
 *
 * export default defineConfig({
 *   plugins: [twdSnapshot()],
 * });
 * ```
 * @example
 * ```ts
 * // Run snapshots in the sidebar while debugging a failure locally
 * twdSnapshot({ debug: true })
 * ```
 */
export function twdSnapshot(options: TwdSnapshotOptions = {}): Plugin {
  const { dir = DEFAULT_DIR, debug = false } = options;

  return {
    name: 'twd-snapshot',
    apply: 'serve',

    configureServer(server: ViteDevServer) {
      const root = path.resolve(server.config.root, dir);

      server.middlewares.use(ROUTE, (req: IncomingMessage, res: ServerResponse) => {
        void (async () => {
          try {
            const query = new URL(req.url ?? '/', 'http://localhost').searchParams;
            const name = sanitizeName(query.get('name') ?? '');
            res.setHeader('content-type', 'application/json');

            if (!name) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'missing name' }));
              return;
            }

            const snapFile = path.join(root, `${name}.snap`);

            if (req.method === 'GET') {
              const exists = fs.existsSync(snapFile);
              res.end(
                JSON.stringify({
                  exists,
                  snap: exists ? fs.readFileSync(snapFile, 'utf8') : null,
                  dir,
                }),
              );
              return;
            }

            if (req.method === 'POST') {
              const body = await readJsonBody(req);
              fs.mkdirSync(root, { recursive: true });

              const suffix = (body.suffix ?? '').replace(/[^a-zA-Z0-9_.-]/g, '');
              const written: string[] = [];

              if (body.snap) {
                fs.writeFileSync(snapFile, body.snap, 'utf8');
                written.push(`${name}.snap`);
              }
              if (body.png) {
                const file = `${name}${suffix}.png`;
                fs.writeFileSync(
                  path.join(root, file),
                  Buffer.from(body.png.replace(/^data:image\/png;base64,/, ''), 'base64'),
                );
                written.push(file);
              }

              res.end(JSON.stringify({ ok: true, dir, written }));
              return;
            }

            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'method not allowed' }));
          } catch (error) {
            // Without this, a throw here (a write on a read-only filesystem, a
            // file that vanished between existsSync and readFileSync, an
            // aborted upload) would leave the response unended: the browser's
            // fetch never settles, matchLayout never resolves, and the test
            // just times out with no diagnosis. Respond instead of throwing.
            if (res.writableEnded) return;
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(error) }));
          }
        })();
      });
    },

    transformIndexHtml() {
      if (!debug) return [];
      return [
        {
          tag: 'script',
          // twd-cli sets this flag with evaluateOnNewDocument, which runs before
          // any page script. Plain assignment would overwrite it, so use ??=.
          children: 'window.__TWD_SNAPSHOTS__ ??= true;',
          injectTo: 'head' as const,
        },
      ];
    },
  };
}
