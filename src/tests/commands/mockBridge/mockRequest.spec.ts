import { describe, expect, it, vi, beforeEach } from 'vitest';
import { clearRequestMockRules, getRequestMockRules, mockRequest } from '../../../commands/mockBridge';
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

    // clear rules
    clearRequestMockRules();
    expect(getRequestMockRules().length).toBe(0);
    expect(postMessageMock).toHaveBeenCalledTimes(3);
    expect(postMessageMock).toHaveBeenNthCalledWith(3, { type: "CLEAR_RULES", version: TWD_VERSION });

    // Restore original controller
    Object.defineProperty(navigator.serviceWorker, 'controller', {
      configurable: true,
      get: () => originalController,
    });
  });
});