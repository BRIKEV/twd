import { describe, it, expect, beforeEach, vi } from 'vitest';
import { waitForRequest, mockRequest, clearRequestMockRules, getRequestMockRules } from '../../../commands/mockBridge';

describe('waitForRequest', () => {
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

  it('resolves when the rule is executed', async () => {
    // Simulate a rule being executed
    const alias = 'testAlias';
    await mockRequest(alias, { method: 'GET', url: '/foo', response: {} });
    // Simulate execution
    const rulePromise = waitForRequest(alias);
    // Manually mark as executed (simulate SW message)
    const rules = getRequestMockRules();
    rules[0].executed = true;
    rules[0].request = { foo: 'bar' };
    const result = await rulePromise;
    expect(result.alias).toBe(alias);
    expect(result.executed).toBe(true);
    expect(result.request).toEqual({ foo: 'bar' });
  });

  it('waits until the rule is executed', async () => {
    const alias = 'delayedAlias';
    await mockRequest(alias, { method: 'GET', url: '/bar', response: {} });
    const rulePromise = waitForRequest(alias);
    setTimeout(() => {
      const rules = getRequestMockRules();
      rules[0].executed = true;
      rules[0].request = { delayed: true };
      // Simulate waiter callback (directly resolve the promise by marking executed)
      // The waitFor promise will resolve on next tick after executed is set
    }, 50);
    const result = await rulePromise;
    expect(result.alias).toBe(alias);
    expect(result.executed).toBe(true);
    expect(result.request).toEqual({ delayed: true });
  });

  it('throws if the rule is not found or not executed', async () => {
    const alias = 'nonExistentAlias';
    await expect(waitForRequest(alias)).rejects.toThrow(`Rule ${alias} not found`);
  });

  it('checks if the rule is executed within the given time', async () => {
    const alias = 'delayedAlias';
    await mockRequest(alias, { method: 'GET', url: '/bar', response: {} });
    
    // Mark the rule as executed immediately
    const rules = getRequestMockRules();
    const rule = rules.find((r) => r.alias === alias);
    if (rule) {
      rule.executed = true;
      rule.request = { delayed: true };
    }

    // Now await the waitForRequest - it should succeed immediately
    const result = await waitForRequest(alias, 1, 10);
    expect(result.alias).toBe(alias);
    expect(result.executed).toBe(true);
    expect(result.request).toEqual({ delayed: true });
  });

  it('throws if the rule is not executed within the given time', async () => {
    const alias = 'notExecutedAlias';
    await mockRequest(alias, { method: 'GET', url: '/not-executed', response: {} });
    await expect(waitForRequest(alias, 1, 10)).rejects.toThrow(`Rule ${alias} was not executed within 10ms`);
  });
});
