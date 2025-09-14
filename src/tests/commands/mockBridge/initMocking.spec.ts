import { describe, it, expect, vi } from 'vitest';
import { initRequestMocking } from '../../../commands/mockBridge';

describe('initRequestMocking', () => {
  it('registers the service worker and sets up message listener', async () => {
    // Mock navigator.serviceWorker
    const registerMock = vi.fn().mockResolvedValue({});
    const addEventListenerMock = vi.fn();
    const originalSW = navigator.serviceWorker;
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register: registerMock,
        addEventListener: addEventListenerMock,
      },
    });

    await initRequestMocking();
    expect(registerMock).toHaveBeenCalledWith('/mock-sw.js?v=1');
    expect(addEventListenerMock).toHaveBeenCalledWith('message', expect.any(Function));

    // Restore
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: originalSW,
    });
  });
});
