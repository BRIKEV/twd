import { describe, it, expect } from 'vitest';
import { removeMockServiceWorker } from '../../plugin/removeMockServiceWorker';

describe('removeMockServiceWorker', () => {
  it('should return a valid Vite plugin object', () => {
    const plugin = removeMockServiceWorker();

    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('remove-mock-sw');
    expect(plugin.apply).toBe('build');
    expect(plugin.closeBundle).toBeDefined();
    expect(typeof plugin.closeBundle).toBe('function');
  });

  it('should have the correct plugin configuration', () => {
    const plugin = removeMockServiceWorker();

    // Verify the plugin name
    expect(plugin.name).toBe('remove-mock-sw');

    // Verify it only applies during build
    expect(plugin.apply).toBe('build');
  });
});
