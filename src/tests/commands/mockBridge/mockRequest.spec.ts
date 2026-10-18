import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  clearRequestMockRules,
  getRequestMockRules,
  mockRequest,
  resetMockingState,
} from '../../../commands/mockBridge';
import { TWD_VERSION } from '../../../constants/version';

describe('mockBridge mock request methods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send mock rules to the service worker', async () => {
    const mockUrl = 'https://api.example.com/data';
    const alias = 'getData';
    const mockResponse = { message: 'Hello, World!' };

    // Ensure navigator.serviceWorker exists
    if (!('serviceWorker' in navigator)) {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {},
        configurable: true,
        writable: true,
      });
    }

    // Save original controller (may be undefined)
    const originalController = navigator.serviceWorker.controller;
    const postMessageMock = vi.fn();
    Object.defineProperty(navigator.serviceWorker, 'controller', {
      configurable: true,
      get: () => ({ postMessage: postMessageMock }),
    });

    // Set up the mock response
    await mockRequest(alias, {
      url: mockUrl,
      status: 200,
      method: 'GET',
      response: mockResponse,
      responseHeaders: { 'Content-Type': 'application/json' },
    });
    await mockRequest(alias, {
      url: mockUrl,
      status: 200,
      method: 'GET',
      response: mockResponse,
      responseHeaders: { 'Content-Type': 'application/json' },
      urlRegex: true,
    });

    expect(postMessageMock).toHaveBeenNthCalledWith(
      1,
      {
        type: 'ADD_RULE',
        rule: expect.objectContaining({
          alias,
          url: mockUrl,
          status: 200,
          method: 'GET',
          response: mockResponse,
          responseHeaders: { 'Content-Type': 'application/json' },
          executed: false,
        }),
        version: TWD_VERSION,
      },
      [expect.any(MessagePort)],
    );

    expect(postMessageMock).toHaveBeenNthCalledWith(
      2,
      {
        type: 'ADD_RULE',
        rule: expect.objectContaining({
          alias,
          url: mockUrl,
          status: 200,
          method: 'GET',
          response: mockResponse,
          responseHeaders: { 'Content-Type': 'application/json' },
          executed: false,
          urlRegex: true,
        }),
        version: TWD_VERSION,
      },
      [expect.any(MessagePort)],
    );

    expect(getRequestMockRules().length).toBe(1);
    expect(getRequestMockRules()[0].alias).toBe(alias);

    // Test that delay is passed through when provided
    await mockRequest('delayedRequest', {
      url: mockUrl,
      status: 200,
      method: 'GET',
      response: mockResponse,
      delay: 500,
    });

    expect(postMessageMock).toHaveBeenCalledWith(
      {
        type: 'ADD_RULE',
        rule: expect.objectContaining({
          alias: 'delayedRequest',
          delay: 500,
          executed: false,
        }),
        version: TWD_VERSION,
      },
      [expect.any(MessagePort)],
    );

    // clear rules
    clearRequestMockRules();
    expect(getRequestMockRules().length).toBe(0);
    expect(postMessageMock).toHaveBeenCalledTimes(4);
    expect(postMessageMock).toHaveBeenNthCalledWith(4, {
      type: 'CLEAR_RULES',
      version: TWD_VERSION,
    });

    // Restore original controller
    Object.defineProperty(navigator.serviceWorker, 'controller', {
      configurable: true,
      get: () => originalController,
    });
  });

  it('should call __twdCollectMock when defined', async () => {
    const collectMock = vi.fn();
    window.__twdCollectMock = collectMock;

    // Set up a running test in TWD state
    const testId = 'test-abc123';
    window.__TWD_STATE__ = {
      handlers: new Map([
        [
          testId,
          { id: testId, name: 'my test', type: 'test', status: 'running', logs: [], depth: 1 },
        ],
      ]),
      beforeEachHooks: new Map(),
      afterEachHooks: new Map(),
      stack: [],
    };

    const postMessageMock = vi.fn();
    Object.defineProperty(navigator.serviceWorker, 'controller', {
      configurable: true,
      get: () => ({ postMessage: postMessageMock }),
    });

    await mockRequest('testAlias', {
      url: 'https://api.example.com/test',
      method: 'POST',
      status: 201,
      response: { id: 1 },
    });

    expect(collectMock).toHaveBeenCalledWith({
      alias: 'testAlias',
      url: 'https://api.example.com/test',
      method: 'POST',
      status: 201,
      response: { id: 1 },
      responseHeaders: undefined,
      urlRegex: false,
      testId: testId,
    });

    delete window.__twdCollectMock;
    delete window.__TWD_STATE__;
  });

  it('should call __twdCollectMock with urlRegex when provided', async () => {
    const collectMock = vi.fn();
    window.__twdCollectMock = collectMock;

    const testId = 'test-regex456';
    window.__TWD_STATE__ = {
      handlers: new Map([
        [
          testId,
          { id: testId, name: 'regex test', type: 'test', status: 'running', logs: [], depth: 1 },
        ],
      ]),
      beforeEachHooks: new Map(),
      afterEachHooks: new Map(),
      stack: [],
    };

    const postMessageMock = vi.fn();
    Object.defineProperty(navigator.serviceWorker, 'controller', {
      configurable: true,
      get: () => ({ postMessage: postMessageMock }),
    });

    await mockRequest('regexAlias', {
      url: 'https://api.example.com/.*',
      method: 'GET',
      status: 200,
      response: [],
      urlRegex: true,
    });

    expect(collectMock).toHaveBeenCalledWith({
      alias: 'regexAlias',
      url: 'https://api.example.com/.*',
      method: 'GET',
      status: 200,
      response: [],
      responseHeaders: undefined,
      urlRegex: true,
      testId: testId,
    });

    delete window.__twdCollectMock;
    delete window.__TWD_STATE__;
  });

  it('should call __twdCollectMock with responseHeaders when provided', async () => {
    const collectMock = vi.fn();
    window.__twdCollectMock = collectMock;

    const testId = 'test-headers789';
    window.__TWD_STATE__ = {
      handlers: new Map([
        [
          testId,
          { id: testId, name: 'headers test', type: 'test', status: 'running', logs: [], depth: 1 },
        ],
      ]),
      beforeEachHooks: new Map(),
      afterEachHooks: new Map(),
      stack: [],
    };

    const postMessageMock = vi.fn();
    Object.defineProperty(navigator.serviceWorker, 'controller', {
      configurable: true,
      get: () => ({ postMessage: postMessageMock }),
    });

    await mockRequest('qrCode', {
      url: '/v1/esims/123/qr_code',
      method: 'GET',
      status: 200,
      response: 'fake-qr-data',
      responseHeaders: { 'Content-Type': 'image/png' },
    });

    expect(collectMock).toHaveBeenCalledWith({
      alias: 'qrCode',
      url: '/v1/esims/123/qr_code',
      method: 'GET',
      status: 200,
      response: 'fake-qr-data',
      responseHeaders: { 'Content-Type': 'image/png' },
      urlRegex: false,
      testId: testId,
    });

    delete window.__twdCollectMock;
    delete window.__TWD_STATE__;
  });

  it('should not call __twdCollectMock when no test is running', async () => {
    const collectMock = vi.fn();
    window.__twdCollectMock = collectMock;

    // Set up TWD state with no running test
    window.__TWD_STATE__ = {
      handlers: new Map([
        [
          'idle-test',
          { id: 'idle-test', name: 'idle test', type: 'test', status: 'idle', logs: [], depth: 1 },
        ],
      ]),
      beforeEachHooks: new Map(),
      afterEachHooks: new Map(),
      stack: [],
    };

    const postMessageMock = vi.fn();
    Object.defineProperty(navigator.serviceWorker, 'controller', {
      configurable: true,
      get: () => ({ postMessage: postMessageMock }),
    });

    await mockRequest('orphanAlias', {
      url: 'https://api.example.com/orphan',
      method: 'GET',
      status: 200,
      response: {},
    });

    expect(collectMock).not.toHaveBeenCalled();

    // Service worker messaging still works
    expect(postMessageMock).toHaveBeenCalled();

    delete window.__twdCollectMock;
    delete window.__TWD_STATE__;
  });

  it('should not call __twdCollectMock when __TWD_STATE__ is not available', async () => {
    const collectMock = vi.fn();
    window.__twdCollectMock = collectMock;

    const originalState = window.__TWD_STATE__;
    delete window.__TWD_STATE__;

    const postMessageMock = vi.fn();
    Object.defineProperty(navigator.serviceWorker, 'controller', {
      configurable: true,
      get: () => ({ postMessage: postMessageMock }),
    });

    await mockRequest('noStateAlias', {
      url: 'https://api.example.com/nostate',
      method: 'GET',
      status: 200,
      response: {},
    });

    expect(collectMock).not.toHaveBeenCalled();
    expect(postMessageMock).toHaveBeenCalled();

    delete window.__twdCollectMock;
    if (originalState) window.__TWD_STATE__ = originalState;
  });
});

describe('mockBridge mockRequest service worker ack', () => {
  const originalController = navigator.serviceWorker?.controller;
  const options = { method: 'GET', url: '/api/ack', response: {} };

  const setController = (controller: unknown) => {
    Object.defineProperty(navigator.serviceWorker, 'controller', {
      configurable: true,
      get: () => controller,
    });
  };

  // Behaves like an up-to-date mock-sw.js: answers on the port it was given
  const ackingWorker = (version = TWD_VERSION) => ({
    postMessage: vi.fn((_message: unknown, transfer?: MessagePort[]) => {
      transfer?.[0]?.postMessage({ type: 'ACK', version });
    }),
  });

  beforeEach(() => {
    resetMockingState();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    setController(originalController);
  });

  it('resolves as soon as the worker acks, without waiting for the timeout', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setController(ackingWorker());

    const start = performance.now();
    await mockRequest('ack', options);

    expect(performance.now() - start).toBeLessThan(50);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not resolve before the worker acks', async () => {
    let ack: () => void = () => {};
    setController({
      postMessage: vi.fn((_message: unknown, transfer?: MessagePort[]) => {
        ack = () => transfer?.[0]?.postMessage({ type: 'ACK', version: TWD_VERSION });
      }),
    });

    let resolved = false;
    const pending = mockRequest('slowAck', options).then(() => {
      resolved = true;
    });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(resolved).toBe(false);

    ack();
    await pending;
    expect(resolved).toBe(true);
  });

  it('resolves after the timeout and warns once when the worker never acks', async () => {
    vi.useFakeTimers();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setController({ postMessage: vi.fn() });

    const first = mockRequest('noAck1', options);
    await vi.advanceTimersByTimeAsync(100);
    await first;
    const second = mockRequest('noAck2', options);
    await vi.advanceTimersByTimeAsync(100);
    await second;

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('npx twd-js init public'));
  });

  it('warns once when the worker acks with a different version', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setController(ackingWorker('0.0.0'));

    await mockRequest('oldVersion1', options);
    await mockRequest('oldVersion2', options);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('0.0.0'));
  });

  it('resolves immediately when there is no controlling worker', async () => {
    vi.useFakeTimers();
    setController(null);

    let resolved = false;
    void mockRequest('noWorker', options).then(() => {
      resolved = true;
    });
    await vi.advanceTimersByTimeAsync(0);

    expect(resolved).toBe(true);
  });

  // Answers each message after its own delay in ms; null means it never answers
  const workerAnsweringAfter = (...delays: (number | null)[]) => {
    let call = 0;
    return {
      postMessage: vi.fn((_message: unknown, transfer?: MessagePort[]) => {
        const delay = delays[call++];
        if (delay === null || delay === undefined) return;
        setTimeout(() => transfer?.[0]?.postMessage({ type: 'ACK', version: TWD_VERSION }), delay);
      }),
    };
  };

  it('keeps waiting for a worker that has acked before when it is busy', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setController(workerAnsweringAfter(0, 300));
    await mockRequest('first', options);

    const start = performance.now();
    await mockRequest('busy', options);

    // Giving up after 100ms would let the app's request reach the worker before the rule
    expect(performance.now() - start).toBeGreaterThanOrEqual(290);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('learns that the worker acks from an ack that arrives after the first timeout', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    setController(workerAnsweringAfter(150, 300));
    await mockRequest('slowFirst', options);
    await new Promise((resolve) => setTimeout(resolve, 100)); // the late ack arrives

    const start = performance.now();
    await mockRequest('busy', options);

    expect(performance.now() - start).toBeGreaterThanOrEqual(290);
  });

  it('stops waiting for a worker that acked before after 2s', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    setController(workerAnsweringAfter(0, null));
    await mockRequest('first', options);

    vi.useFakeTimers();
    let resolved = false;
    const pending = mockRequest('stuck', options).then(() => {
      resolved = true;
    });
    await vi.advanceTimersByTimeAsync(1999);
    expect(resolved).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(resolved).toBe(true);
  });
});
