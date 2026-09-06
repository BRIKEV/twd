import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { twdSnapshot } from '../../plugin/twdSnapshot';

let root: string;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'twd-snap-'));
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

/** Mount the plugin's middleware and hand back the handler it registered. */
function mount(options?: { dir?: string; debug?: boolean }) {
  const plugin = twdSnapshot(options);
  const use = vi.fn();
  const configureServer = plugin.configureServer as (server: unknown) => void;
  configureServer({ config: { root }, middlewares: { use } });
  return use.mock.calls[0] as [string, (req: unknown, res: unknown) => void];
}

/** Drive one request through the middleware and resolve when it answers. */
function request(
  handler: (req: unknown, res: unknown) => void,
  init: { method: string; url: string; body?: unknown },
): Promise<{ status: number; body: Record<string, unknown> }> {
  return new Promise((resolve) => {
    const req = Object.assign(
      init.body === undefined
        ? new Readable({ read() {} })
        : Readable.from([JSON.stringify(init.body)]),
      { method: init.method, url: init.url },
    );
    const res = {
      statusCode: 200,
      setHeader: () => undefined,
      end(payload: string) {
        resolve({ status: this.statusCode, body: JSON.parse(payload) });
      },
    };
    handler(req, res);
  });
}

describe('twdSnapshot plugin', () => {
  it('mounts on the TWD snapshot endpoint and only in serve mode', () => {
    const plugin = twdSnapshot();
    const [route] = mount();

    expect(plugin.name).toBe('twd-snapshot');
    expect(plugin.apply).toBe('serve');
    expect(route).toBe('/__twd/snapshot');
  });

  it('reports a missing reference and still names the directory', async () => {
    const [, handler] = mount();

    const { body } = await request(handler, { method: 'GET', url: '/?name=landing' });

    expect(body).toEqual({ exists: false, snap: null, dir: '__twd_snapshots__' });
  });

  it('writes a reference and reads it back', async () => {
    const [, handler] = mount();

    await request(handler, {
      method: 'POST',
      url: '/?name=landing',
      body: { snap: 'hash abcd' },
    });
    const { body } = await request(handler, { method: 'GET', url: '/?name=landing' });

    expect(body.exists).toBe(true);
    expect(body.snap).toBe('hash abcd');
    expect(fs.existsSync(path.join(root, '__twd_snapshots__', 'landing.snap'))).toBe(true);
  });

  it('decodes a data URL into a PNG using the suffix', async () => {
    const [, handler] = mount();
    const png = `data:image/png;base64,${Buffer.from('not really a png').toString('base64')}`;

    const { body } = await request(handler, {
      method: 'POST',
      url: '/?name=landing',
      body: { png, suffix: '.failed' },
    });

    expect(body.written).toEqual(['landing.failed.png']);
    expect(
      fs.readFileSync(path.join(root, '__twd_snapshots__', 'landing.failed.png'), 'utf8'),
    ).toBe('not really a png');
  });

  it('honours a custom directory', async () => {
    const [, handler] = mount({ dir: 'snapshots' });

    await request(handler, { method: 'POST', url: '/?name=landing', body: { snap: 'hash abcd' } });

    expect(fs.existsSync(path.join(root, 'snapshots', 'landing.snap'))).toBe(true);
  });

  it('rejects a request with no usable name', async () => {
    const [, handler] = mount();

    const { status, body } = await request(handler, { method: 'GET', url: '/?name=///' });

    expect(status).toBe(400);
    expect(body.error).toBe('missing name');
  });

  it('refuses methods other than GET and POST', async () => {
    const [, handler] = mount();

    const { status } = await request(handler, { method: 'DELETE', url: '/?name=landing' });

    expect(status).toBe(405);
  });

  it('answers 500 with an error field instead of hanging when the filesystem write fails', async () => {
    const [, handler] = mount();
    const spy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
      throw new Error('EACCES: permission denied, open landing.snap');
    });

    try {
      const { status, body } = await request(handler, {
        method: 'POST',
        url: '/?name=landing',
        body: { snap: 'hash abcd' },
      });

      expect(status).toBe(500);
      expect(body.error).toContain('EACCES');
    } finally {
      spy.mockRestore();
    }
  });
});

describe('debug flag injection', () => {
  it('injects nothing by default', () => {
    const plugin = twdSnapshot();
    const transform = plugin.transformIndexHtml as () => unknown[];
    expect(transform()).toEqual([]);
  });

  it('raises the snapshot flag without clobbering one set before page load', () => {
    // twd-cli sets the flag with evaluateOnNewDocument, which runs before any
    // page script. Plain assignment here would overwrite it, so use ??=.
    const plugin = twdSnapshot({ debug: true });
    const transform = plugin.transformIndexHtml as unknown as () => { children: string }[];

    const [tag] = transform();

    expect(tag.children).toContain('__TWD_SNAPSHOTS__ ??= true');
  });
});
