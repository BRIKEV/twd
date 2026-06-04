import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  clearRequestMockRules,
  getRequestMockRules,
  mockRequest,
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

    expect(postMessageMock).toHaveBeenNthCalledWith(1, {
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
    });

    expect(postMessageMock).toHaveBeenNthCalledWith(2, {
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
    });

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

    expect(postMessageMock).toHaveBeenCalledWith({
      type: 'ADD_RULE',
      rule: expect.objectContaining({
        alias: 'delayedRequest',
        delay: 500,
        executed: false,
      }),
      version: TWD_VERSION,
    });

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
