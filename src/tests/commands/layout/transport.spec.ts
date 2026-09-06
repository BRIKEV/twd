import { afterEach, describe, expect, it, vi } from 'vitest';
import { readSnapshot, writeSnapshot } from '../../../commands/layout/transport';

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('readSnapshot', () => {
  it('asks the plugin for the reference by name', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ exists: true, snap: 'hash abcd', dir: '__twd_snapshots__' }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const reference = await readSnapshot('landing');

    expect(fetchMock).toHaveBeenCalledWith('/__twd/snapshot?name=landing');
    expect(reference.exists).toBe(true);
    expect(reference.dir).toBe('__twd_snapshots__');
  });

  it('explains that the plugin is missing when Vite serves index.html instead', async () => {
    // Vite's SPA fallback answers unknown paths with the app shell at status
    // 200, so without this check the user gets a JSON parse error.
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('<!doctype html><html></html>', {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
      ),
    );

    await expect(readSnapshot('landing')).rejects.toThrow(/twdSnapshot\(\) Vite plugin/);
  });

  it("surfaces the plugin's own reason when it answers JSON with a bad status", async () => {
    // The plugin IS there and refused (missing name, method not allowed, etc).
    // That must never be reported as a missing plugin, or the real reason is
    // thrown away.
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'missing name' }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );

    await expect(readSnapshot('landing')).rejects.toThrow(/missing name/);

    const error: unknown = await readSnapshot('landing').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).not.toContain('Vite plugin');
  });

  it('reports an unreadable response instead of a raw parse error', async () => {
    // A JSON content type that does not actually parse (status 500, a
    // malformed or empty body) must not surface as a raw SyntaxError, and
    // must stay distinct from the missing-plugin path.
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('not json', {
          status: 500,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );

    await expect(readSnapshot('landing')).rejects.toThrow(/unreadable response \(500\)/);

    const error: unknown = await readSnapshot('landing').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).not.toContain('Vite plugin');
  });
});

describe('writeSnapshot', () => {
  it('posts the body as JSON and returns what was written', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ ok: true, written: ['landing.snap'] }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await writeSnapshot('landing', { snap: 'hash abcd' });

    expect(fetchMock).toHaveBeenCalledWith(
      '/__twd/snapshot?name=landing',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.written).toEqual(['landing.snap']);
  });
});
