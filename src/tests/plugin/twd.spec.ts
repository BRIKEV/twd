import { describe, expect, it } from 'vitest';
import { twd } from '../../plugin/twd';

describe('twd vite plugin', () => {
  it('returns a plugin named "twd"', () => {
    const plugin = twd();
    expect(plugin.name).toBe('twd');
  });

  it('only applies in serve (dev) mode', () => {
    const plugin = twd();
    expect(plugin.apply).toBe('serve');
  });

  describe('virtual module', () => {
    it('resolves "virtual:twd/init" to the prefixed virtual id', () => {
      const plugin = twd();
      const resolveId = plugin.resolveId as (id: string) => string | null;
      expect(resolveId.call({}, 'virtual:twd/init')).toBe('\0virtual:twd/init');
    });

    it('does not resolve unrelated ids', () => {
      const plugin = twd();
      const resolveId = plugin.resolveId as (id: string) => string | null;
      expect(resolveId.call({}, 'something-else')).toBeNull();
    });

    it('loads the virtual module with default options', () => {
      const plugin = twd();
      const load = plugin.load as (id: string) => string | null;
      const code = load.call({}, '\0virtual:twd/init');
      expect(code).not.toBeNull();
      expect(code).toContain(`import { initTWD } from 'twd-js/bundled'`);
      expect(code).toContain(`import.meta.glob("/**/*.twd.test.ts")`);
      expect(code).toContain(`initTWD(tests, {`);
      expect(code).toContain(`"open":true`);
      expect(code).toContain(`"position":"left"`);
      expect(code).toContain(`"serviceWorker":true`);
      expect(code).toContain(`"serviceWorkerUrl":"/mock-sw.js"`);
    });

    it('does not load unrelated ids', () => {
      const plugin = twd();
      const load = plugin.load as (id: string) => string | null;
      expect(load.call({}, 'something-else')).toBeNull();
    });

    it('inlines a custom testFilePattern into the glob call', () => {
      const plugin = twd({ testFilePattern: '/src/**/*.twd.test.{ts,tsx}' });
      const load = plugin.load as (id: string) => string | null;
      const code = load.call({}, '\0virtual:twd/init');
      expect(code).toContain(`import.meta.glob("/src/**/*.twd.test.{ts,tsx}")`);
    });

    it('serializes custom init options into initTWD args', () => {
      const plugin = twd({
        position: 'right',
        search: true,
        theme: { primary: '#ff0000' },
        rootSelector: '#my-app',
      });
      const load = plugin.load as (id: string) => string | null;
      const code = load.call({}, '\0virtual:twd/init');
      expect(code).toContain(`"position":"right"`);
      expect(code).toContain(`"search":true`);
      expect(code).toContain(`"theme":{"primary":"#ff0000"}`);
      expect(code).toContain(`"rootSelector":"#my-app"`);
    });

    it('omits testFilePattern from the inlined initTWD options', () => {
      const plugin = twd({ testFilePattern: '/src/**/*.twd.test.ts' });
      const load = plugin.load as (id: string) => string | null;
      const code = load.call({}, '\0virtual:twd/init');
      expect(code).not.toContain(`"testFilePattern"`);
    });
  });

  describe('transformIndexHtml', () => {
    it('injects a script tag pointing at the virtual module', () => {
      const plugin = twd();
      const transform = plugin.transformIndexHtml as () => unknown;
      const result = transform.call({});
      expect(result).toEqual([
        {
          tag: 'script',
          attrs: { type: 'module', src: '/@id/virtual:twd/init' },
          injectTo: 'head',
        },
      ]);
    });
  });
});
