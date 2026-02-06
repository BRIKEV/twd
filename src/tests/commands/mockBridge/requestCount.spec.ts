import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { clearRequestMockRules, getRequestCount, getRequestCounts, initRequestMocking, mockRequest, resetMockingState } from '../../../commands/mockBridge';
import { TWD_VERSION } from '../../../constants/version';

describe('request count tracking', () => {
  let messageHandler: Function;
  let originalSW: any;

  beforeEach(() => {
    originalSW = navigator.serviceWorker;
    resetMockingState();
    localStorage.clear();

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

    clearRequestMockRules();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: originalSW,
    });
  });

  it('should return 0 for unknown alias', async () => {
    await initRequestMocking();
    expect(getRequestCount('nonExistent')).toBe(0);
  });

  it('should increment count when EXECUTED message is received', async () => {
    await initRequestMocking();

    await mockRequest('getUser', {
      method: 'GET',
      url: '/api/user/1',
      response: { id: 1, name: 'Kevin' },
    });

    expect(getRequestCount('getUser')).toBe(0);

    // Simulate first EXECUTED
    messageHandler({
      data: {
        type: 'EXECUTED',
        alias: 'getUser',
        request: null,
        hitCount: 1,
      },
    });

    expect(getRequestCount('getUser')).toBe(1);

    // Simulate second EXECUTED
    messageHandler({
      data: {
        type: 'EXECUTED',
        alias: 'getUser',
        request: null,
        hitCount: 2,
      },
    });

    expect(getRequestCount('getUser')).toBe(2);
  });

  it('should return a snapshot of all counts via getRequestCounts', async () => {
    await initRequestMocking();

    await mockRequest('getUser', {
      method: 'GET',
      url: '/api/user',
      response: { id: 1 },
    });

    await mockRequest('listPosts', {
      method: 'GET',
      url: '/api/posts',
      response: [],
    });

    messageHandler({
      data: { type: 'EXECUTED', alias: 'getUser', request: null, hitCount: 2 },
    });

    messageHandler({
      data: { type: 'EXECUTED', alias: 'listPosts', request: null, hitCount: 1 },
    });

    const counts = getRequestCounts();
    expect(counts).toEqual({ getUser: 2, listPosts: 1 });

    // Should be a copy, not a reference
    counts.getUser = 999;
    expect(getRequestCount('getUser')).toBe(2);
  });

  it('should reset counts when clearRequestMockRules is called', async () => {
    await initRequestMocking();

    await mockRequest('getUser', {
      method: 'GET',
      url: '/api/user',
      response: { id: 1 },
    });

    messageHandler({
      data: { type: 'EXECUTED', alias: 'getUser', request: null, hitCount: 3 },
    });

    expect(getRequestCount('getUser')).toBe(3);

    clearRequestMockRules();

    expect(getRequestCount('getUser')).toBe(0);
    expect(getRequestCounts()).toEqual({});
  });

  it('should fallback to incrementing count when hitCount is not provided', async () => {
    await initRequestMocking();

    await mockRequest('legacyRule', {
      method: 'GET',
      url: '/api/legacy',
      response: {},
    });

    // Simulate EXECUTED without hitCount (legacy SW)
    messageHandler({
      data: {
        type: 'EXECUTED',
        alias: 'legacyRule',
        request: null,
      },
    });

    expect(getRequestCount('legacyRule')).toBe(1);

    messageHandler({
      data: {
        type: 'EXECUTED',
        alias: 'legacyRule',
        request: null,
      },
    });

    expect(getRequestCount('legacyRule')).toBe(2);
  });
});
