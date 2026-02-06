import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { clearRequestMockRules, getRequestMockRules, initRequestMocking, mockRequest, waitForRequest, resetMockingState } from '../../../commands/mockBridge';
import { TWD_VERSION } from '../../../constants/version';

// Fake service worker API
class FakeServiceWorker {
  listeners: Record<string, Function[]> = {};
  controller = { postMessage: vi.fn() };
  registrations: any[] = [];

  addEventListener(type: string, cb: Function) {
    this.listeners[type] ??= [];
    this.listeners[type].push(cb);
  }

  dispatchMessage(data: any) {
    this.listeners["message"]?.forEach((cb) => cb({ data }));
  }

  dispatchControllerChange() {
    this.listeners["controllerchange"]?.forEach((cb) => cb());
  }

  async register() {
    return Promise.resolve();
  }

  async getRegistrations() {
    return Promise.resolve(this.registrations);
  }
}

describe('initRequestMocking', () => {
  let fakeSW: FakeServiceWorker;
  let consoleLogSpy: any;

  beforeEach(() => {
    fakeSW = new FakeServiceWorker();
    // @ts-ignore
    navigator.serviceWorker = fakeSW;
    clearRequestMockRules();
    resetMockingState();
    localStorage.clear();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('registers the service worker and sets up message listener when version matches', async () => {
    // Set current version in localStorage
    localStorage.setItem('twd-sw-version', TWD_VERSION);
    
    // Mock navigator.serviceWorker
    const registerMock = vi.fn().mockResolvedValue({});
    const addEventListenerMock = vi.fn();
    const getRegistrationsMock = vi.fn().mockResolvedValue([]);
    const originalSW = navigator.serviceWorker;
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register: registerMock,
        addEventListener: addEventListenerMock,
        getRegistrations: getRegistrationsMock,
        controller: { postMessage: vi.fn() }, // Controller exists
      },
    });

    await initRequestMocking();
    
    expect(registerMock).toHaveBeenCalledWith(`/mock-sw.js?v=${TWD_VERSION}`);
    expect(addEventListenerMock).toHaveBeenCalledWith('message', expect.any(Function));
    expect(getRegistrationsMock).not.toHaveBeenCalled(); // No update needed
    expect(consoleLogSpy).not.toHaveBeenCalledWith("[TWD] Updating service worker to version", TWD_VERSION);

    // Restore
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: originalSW,
    });
  });

  it('registers the service worker and sets up message listener when version matches and custom path config is sent', async () => {
    // Set current version in localStorage
    localStorage.setItem('twd-sw-version', TWD_VERSION);
    
    // Mock navigator.serviceWorker
    const registerMock = vi.fn().mockResolvedValue({});
    const addEventListenerMock = vi.fn();
    const getRegistrationsMock = vi.fn().mockResolvedValue([]);
    const originalSW = navigator.serviceWorker;
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register: registerMock,
        addEventListener: addEventListenerMock,
        getRegistrations: getRegistrationsMock,
        controller: { postMessage: vi.fn() }, // Controller exists
      },
    });

    await initRequestMocking('/test-path/mock-sw.js');
    
    expect(registerMock).toHaveBeenCalledWith(`/test-path/mock-sw.js?v=${TWD_VERSION}`);
    expect(addEventListenerMock).toHaveBeenCalledWith('message', expect.any(Function));
    expect(getRegistrationsMock).not.toHaveBeenCalled(); // No update needed
    expect(consoleLogSpy).not.toHaveBeenCalledWith("[TWD] Updating service worker to version", TWD_VERSION);

    // Restore
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: originalSW,
    }); 
  });

  it('handles first install when no version is stored', async () => {    
    const registerMock = vi.fn().mockResolvedValue({});
    const addEventListenerMock = vi.fn();
    const getRegistrationsMock = vi.fn().mockResolvedValue([]);
    const originalSW = navigator.serviceWorker;
    
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register: registerMock,
        addEventListener: addEventListenerMock,
        getRegistrations: getRegistrationsMock,
        controller: { postMessage: vi.fn() },
      },
    });

    await initRequestMocking();
    
    expect(registerMock).toHaveBeenCalledWith(`/mock-sw.js?v=${TWD_VERSION}`);

    // Restore
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: originalSW,
    });
  });

  it('waits for controller when not immediately available', async () => {
    localStorage.setItem('twd-sw-version', TWD_VERSION);
    
    let controllerChangeHandler: Function;
    const registerMock = vi.fn().mockResolvedValue({});
    const addEventListenerMock = vi.fn((type: string, handler: Function, options?: any) => {
      if (type === 'controllerchange') {
        controllerChangeHandler = handler;
      }
    });
    const getRegistrationsMock = vi.fn().mockResolvedValue([]);
    const originalSW = navigator.serviceWorker;
    
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register: registerMock,
        addEventListener: addEventListenerMock,
        getRegistrations: getRegistrationsMock,
        controller: null, // No controller initially
      },
    });

    // Start the initialization
    const initPromise = initRequestMocking();
    
    // Simulate controller becoming available
    setTimeout(() => {
      controllerChangeHandler!();
    }, 50);
    
    await initPromise;
    
    expect(addEventListenerMock).toHaveBeenCalledWith('controllerchange', expect.any(Function), { once: true });
    expect(registerMock).toHaveBeenCalledWith(`/mock-sw.js?v=${TWD_VERSION}`);

    // Restore
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: originalSW,
    });
  });

  it("should mark rule as executed and update request when EXECUTED message is received", async () => {
    // Set up proper service worker mock
    localStorage.setItem('twd-sw-version', TWD_VERSION);
    let messageHandler: Function;
    const originalSW = navigator.serviceWorker;
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register: vi.fn().mockResolvedValue({}),
        addEventListener: vi.fn((type: string, handler: Function) => {
          if (type === 'message') {
            messageHandler = handler;
          }
        }),
        getRegistrations: vi.fn().mockResolvedValue([]),
        controller: { postMessage: vi.fn() },
      },
    });

    await initRequestMocking();

    await mockRequest("getUser", {
      method: "GET",
      url: "/api/user/1",
      response: { id: 1, name: "Kevin" },
    });

    // Initially not executed
    let rule = getRequestMockRules()[0];
    expect(rule.executed).toBe(false);

    // Fire EXECUTED message through the registered handler
    messageHandler!({
      data: {
        type: "EXECUTED",
        alias: "getUser",
        request: { headers: { foo: "bar" } },
        hitCount: 1,
      }
    });

    rule = getRequestMockRules()[0];
    expect(rule.executed).toBe(true);
    expect(rule.request).toEqual({ headers: { foo: "bar" } });
    expect(rule.hitCount).toBe(1);

    // Restore
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: originalSW,
    });
  });

  it("should store hitCount from EXECUTED message on the rule", async () => {
    // Set up proper service worker mock
    localStorage.setItem('twd-sw-version', TWD_VERSION);
    let messageHandler: Function;
    const originalSW = navigator.serviceWorker;
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register: vi.fn().mockResolvedValue({}),
        addEventListener: vi.fn((type: string, handler: Function) => {
          if (type === 'message') {
            messageHandler = handler;
          }
        }),
        getRegistrations: vi.fn().mockResolvedValue([]),
        controller: { postMessage: vi.fn() },
      },
    });

    await initRequestMocking();

    await mockRequest("getUser", {
      method: "GET",
      url: "/api/user/1",
      response: { id: 1, name: "Kevin" },
    });

    // Simulate multiple EXECUTED messages with increasing hitCount
    messageHandler!({
      data: {
        type: "EXECUTED",
        alias: "getUser",
        request: null,
        hitCount: 1,
      }
    });

    let rule = getRequestMockRules()[0];
    expect(rule.hitCount).toBe(1);

    messageHandler!({
      data: {
        type: "EXECUTED",
        alias: "getUser",
        request: null,
        hitCount: 5,
      }
    });

    rule = getRequestMockRules()[0];
    expect(rule.hitCount).toBe(5);

    // Restore
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: originalSW,
    });
  });

  it("should resolve waitForRequest when EXECUTED arrives", async () => {
    // Set up proper service worker mock
    localStorage.setItem('twd-sw-version', TWD_VERSION);
    let messageHandler: Function;
    const originalSW = navigator.serviceWorker;
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register: vi.fn().mockResolvedValue({}),
        addEventListener: vi.fn((type: string, handler: Function) => {
          if (type === 'message') {
            messageHandler = handler;
          }
        }),
        getRegistrations: vi.fn().mockResolvedValue([]),
        controller: { postMessage: vi.fn() },
      },
    });

    await initRequestMocking();

    await mockRequest("createUser", {
      method: "POST",
      url: "/api/user",
      response: { ok: true },
    });

    // Trigger EXECUTED asynchronously
    setTimeout(() => {
      messageHandler!({
        data: {
          type: "EXECUTED",
          alias: "createUser",
          request: { body: { name: "Alice" } },
        }
      });
    }, 50);

    const rule = await waitForRequest("createUser");
    expect(rule.executed).toBe(true);
    expect(rule.request).toEqual({ body: { name: "Alice" } });

    // Restore
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: originalSW,
    });
  });

  it('handles service worker not supported', async () => {
    const originalSW = navigator.serviceWorker;
    // @ts-ignore
    delete navigator.serviceWorker;

    // Should not throw and should complete successfully
    await expect(initRequestMocking()).resolves.toBeUndefined();

    // Restore
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: originalSW,
    });
  });

});

describe('initRequestMocking - multiple calls protection', () => {
  let originalSW: any;

  beforeEach(() => {
    originalSW = navigator.serviceWorker;
    clearRequestMockRules();
    resetMockingState();
    localStorage.clear();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: originalSW,
    });
  });

  it('should not add duplicate message listeners on multiple init calls', async () => {
    localStorage.setItem('twd-sw-version', TWD_VERSION);

    const addEventListenerMock = vi.fn();

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register: vi.fn().mockResolvedValue({}),
        addEventListener: addEventListenerMock,
        getRegistrations: vi.fn().mockResolvedValue([]),
        controller: { postMessage: vi.fn() },
      },
    });

    // Call init multiple times
    await initRequestMocking();
    await initRequestMocking();
    await initRequestMocking();

    // Count message listener registrations
    const messageListenerCalls = addEventListenerMock.mock.calls
      .filter((call: any[]) => call[0] === 'message');

    // Should only have 1 message listener, not 3
    expect(messageListenerCalls.length).toBe(1);
  });

  it('should warn when init is called multiple times', async () => {
    localStorage.setItem('twd-sw-version', TWD_VERSION);

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register: vi.fn().mockResolvedValue({}),
        addEventListener: vi.fn(),
        getRegistrations: vi.fn().mockResolvedValue([]),
        controller: { postMessage: vi.fn() },
      },
    });

    await initRequestMocking();
    await initRequestMocking(); // Second call should warn

    expect(consoleWarnSpy).toHaveBeenCalledWith('[TWD] Request mocking already initialized');

    consoleWarnSpy.mockRestore();
  });
});
