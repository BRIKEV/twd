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
});
