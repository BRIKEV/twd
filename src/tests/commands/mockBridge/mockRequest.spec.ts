import { describe, expect, it, vi } from 'vitest';
import { clearRequestMockRules, getRequestMockRules, mockRequest } from '../../../commands/mockBridge';

describe('mockBridge mock request methods', () => {
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
      headers: { 'Content-Type': 'application/json' },
    });

    expect(postMessageMock).toHaveBeenCalledWith({
      type: 'ADD_RULE',
      rule: expect.objectContaining({
        alias,
        url: mockUrl,
        status: 200,
        method: 'GET',
        response: mockResponse,
        headers: { 'Content-Type': 'application/json' },
        executed: false,
      }),
    });

    // Restore original controller
    Object.defineProperty(navigator.serviceWorker, 'controller', {
      configurable: true,
      get: () => originalController,
    });

    expect(getRequestMockRules().length).toBe(1);
    expect(getRequestMockRules()[0].alias).toBe(alias);

    // clear rules
    clearRequestMockRules();
    expect(getRequestMockRules().length).toBe(0);
  });
});