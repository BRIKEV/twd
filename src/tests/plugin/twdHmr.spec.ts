import { describe, it, expect, vi, beforeEach } from 'vitest';
import { twdHmr } from '../../plugin/twdHmr';

describe('twdHmr', () => {
  let mockSend: ReturnType<typeof vi.fn>;
  let mockServer: { ws: { send: ReturnType<typeof vi.fn> } };

  beforeEach(() => {
    mockSend = vi.fn();
    mockServer = {
      ws: {
        send: mockSend,
      },
    };
  });

  it('should return a valid Vite plugin with correct configuration', () => {
    const plugin = twdHmr();

    expect(plugin.name).toBe('twd-hmr');
    expect(plugin.apply).toBe('serve');
    expect(plugin.handleHotUpdate).toBeDefined();
  });

  it('should trigger full reload for TWD test files', () => {
    const plugin = twdHmr();
    const handleHotUpdate = typeof plugin.handleHotUpdate === 'function'
      ? plugin.handleHotUpdate
      : plugin.handleHotUpdate?.handler;

    const context = {
      file: '/path/to/test.twd.test.ts',
      server: mockServer as any,
      modules: [],
      timestamp: Date.now(),
    };

    const result = handleHotUpdate!.call({} as any, context as any);

    expect(mockSend).toHaveBeenCalledWith({
      type: 'full-reload',
      path: '*',
    });
    expect(result).toEqual([]);
  });

  it('should not trigger reload for non-TWD test files', () => {
    const plugin = twdHmr();
    const handleHotUpdate = typeof plugin.handleHotUpdate === 'function'
      ? plugin.handleHotUpdate
      : plugin.handleHotUpdate?.handler;

    const context = {
      file: '/path/to/component.tsx',
      server: mockServer as any,
      modules: [],
      timestamp: Date.now(),
    };

    handleHotUpdate!.call({} as any, context as any);

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should support custom test file pattern', () => {
    const plugin = twdHmr({ testFilePattern: (file) => file.includes('.twd.test.') });
    const handleHotUpdate = typeof plugin.handleHotUpdate === 'function'
      ? plugin.handleHotUpdate
      : plugin.handleHotUpdate?.handler;

    const context = {
      file: '/path/to/test.twd.test.tsx',
      server: mockServer as any,
      modules: [],
      timestamp: Date.now(),
    };

    handleHotUpdate!.call({} as any, context as any);

    expect(mockSend).toHaveBeenCalled();
  });
});

