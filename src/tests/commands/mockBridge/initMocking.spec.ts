import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { clearRequestMockRules, getRequestMockRules, initRequestMocking, mockRequest, waitForRequest } from '../../../commands/mockBridge';
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

  it('handles first install when no version is stored', async () => {
    // No version in localStorage (first install)
    expect(localStorage.getItem('twd-sw-version')).toBeNull();
    
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
    
    expect(getRegistrationsMock).toHaveBeenCalled(); // Should check for existing registrations
    expect(consoleLogSpy).toHaveBeenCalledWith("[TWD] Updating service worker to version", TWD_VERSION);
    expect(localStorage.getItem('twd-sw-version')).toBe(TWD_VERSION);
    expect(registerMock).toHaveBeenCalledWith(`/mock-sw.js?v=${TWD_VERSION}`);

    // Restore
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: originalSW,
    });
  });

  it('handles version update by unregistering old service workers', async () => {
    // Set old version in localStorage
    const oldVersion = '0.6.0';
    localStorage.setItem('twd-sw-version', oldVersion);
    
    const mockRegistration = { unregister: vi.fn().mockResolvedValue(true) };
    const registerMock = vi.fn().mockResolvedValue({});
    const addEventListenerMock = vi.fn();
    const getRegistrationsMock = vi.fn().mockResolvedValue([mockRegistration]);
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
    
    expect(consoleLogSpy).toHaveBeenCalledWith("[TWD] Updating service worker to version", TWD_VERSION);
    expect(getRegistrationsMock).toHaveBeenCalled();
    expect(mockRegistration.unregister).toHaveBeenCalled();
    expect(localStorage.getItem('twd-sw-version')).toBe(TWD_VERSION);
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
      }
    });

    rule = getRequestMockRules()[0];
    expect(rule.executed).toBe(true);
    expect(rule.request).toEqual({ headers: { foo: "bar" } });

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
