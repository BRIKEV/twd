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
  });
});
