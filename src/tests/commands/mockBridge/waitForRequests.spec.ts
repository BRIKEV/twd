import { describe, it, expect, beforeEach, vi } from 'vitest';
import { waitForRequests, mockRequest, clearRequestMockRules, getRequestMockRules } from '../../../commands/mockBridge';

describe('waitForRequests', () => {
  beforeEach(() => {
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
    clearRequestMockRules();
  });

  it('waits until the rules are executed', async () => {
    const alias = 'delayedAlias';
    const secondAlias = 'secondAlias';
    await mockRequest(alias, { method: 'GET', url: '/bar', response: {} });
    await mockRequest(secondAlias, { method: 'POST', url: '/foo', response: {} });
    const rulePromise = waitForRequests([alias, secondAlias]);
    setTimeout(() => {
      const rules = getRequestMockRules();
      rules[0].executed = true;
      rules[0].request = { delayed: true };
      rules[1].executed = true;
      rules[1].request = { second: true };
      // Simulate waiter callback (directly resolve the promise by marking executed)
      // The waitFor promise will resolve on next tick after executed is set
    }, 50);
    const [firstAliasResult, secondAliasResult] = await rulePromise;
    expect(firstAliasResult.alias).toBe(alias);
    expect(firstAliasResult.executed).toBe(true);
    expect(firstAliasResult.request).toEqual({ delayed: true });
    expect(secondAliasResult.alias).toBe(secondAlias);
    expect(secondAliasResult.executed).toBe(true);
    expect(secondAliasResult.request).toEqual({ second: true });
  });

  it('throws if one rule is not found or not executed', async () => {
    const alias = 'delayedAlias';
    const secondAlias = 'secondAlias';
    await mockRequest(alias, { method: 'GET', url: '/bar', response: {} });
    await mockRequest(secondAlias, { method: 'POST', url: '/foo', response: {} });
    setTimeout(() => {
      const rules = getRequestMockRules();
      rules[0].executed = true;
      rules[0].request = { delayed: true };
      // Simulate waiter callback (directly resolve the promise by marking executed)
      // The waitFor promise will resolve on next tick after executed is set
    }, 50);
    await expect(waitForRequests([alias, secondAlias])).rejects.toThrow(`Rule ${secondAlias} not found or not executed`);
  });
});