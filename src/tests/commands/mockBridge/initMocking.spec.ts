import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clearRequestMockRules, getRequestMockRules, initRequestMocking, mockRequest, waitForRequest } from '../../../commands/mockBridge';

// Fake service worker API
class FakeServiceWorker {
  listeners: Record<string, Function[]> = {};
  controller = { postMessage: vi.fn() };

  addEventListener(type: string, cb: Function) {
    this.listeners[type] ??= [];
    this.listeners[type].push(cb);
  }

  dispatchMessage(data: any) {
    this.listeners["message"]?.forEach((cb) => cb({ data }));
  }

  async register() {
    return Promise.resolve();
  }
}

describe('initRequestMocking', () => {
  let fakeSW: FakeServiceWorker;

  beforeEach(() => {
    fakeSW = new FakeServiceWorker();
    // @ts-ignore
    navigator.serviceWorker = fakeSW;
    clearRequestMockRules();
  });

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

  it("should mark rule as executed and update request when EXECUTED message is received", async () => {
    await initRequestMocking();

    await mockRequest("getUser", {
      method: "GET",
      url: "/api/user/1",
      response: { id: 1, name: "Kevin" },
    });

    // Initially not executed
    let rule = getRequestMockRules()[0];
    expect(rule.executed).toBe(false);

    // Fire EXECUTED message
    fakeSW.dispatchMessage({
      type: "EXECUTED",
      alias: "getUser",
      request: { headers: { foo: "bar" } },
    });

    rule = getRequestMockRules()[0];
    expect(rule.executed).toBe(true);
    expect(rule.request).toEqual({ headers: { foo: "bar" } });
  });

  it("should resolve waitForRequest when EXECUTED arrives", async () => {
    await initRequestMocking();

    await mockRequest("createUser", {
      method: "POST",
      url: "/api/user",
      response: { ok: true },
    });

    // Trigger EXECUTED asynchronously
    setTimeout(() => {
      fakeSW.dispatchMessage({
        type: "EXECUTED",
        alias: "createUser",
        request: { body: { name: "Alice" } },
      });
    }, 50);

    const rule = await waitForRequest("createUser");
    expect(rule.executed).toBe(true);
    expect(rule.request).toEqual({ body: { name: "Alice" } });
  });
});
