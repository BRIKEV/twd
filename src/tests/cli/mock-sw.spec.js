// sw.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleFetch, handleMessage, rules } from '../../cli/mock-sw.js';

global.self = {
  clients: {
    matchAll: vi.fn(() => Promise.resolve([])),
  },
}

global.Response = class {
  constructor(body, init) {
    this.body = body
    this.init = init
  }
}

const mockEvent = (overrides = {}) => ({
  request: {
    method: 'GET',
    url: 'https://api.test/foo',
    clone: vi.fn(() => ({ text: vi.fn(() => Promise.resolve('')) })),
  },
  respondWith: vi.fn(),
  ...overrides,
});

describe('Service Worker', () => {
  beforeEach(() => {
    rules.length = 0; // clear between tests
  });

  it('adds a rule via message', () => {
    const rule = { alias: 'test', method: 'GET', url: '/foo' };
    handleMessage({ data: { type: 'ADD_RULE', rule } });
    expect(rules).toContainEqual(rule);
  });

  it('clears rules via message', () => {
    rules.push({ alias: 'a' });
    handleMessage({ data: { type: 'CLEAR_RULES' } });
    expect(rules).toEqual([]);
  });

  it('responds to fetch when rule matches', async () => {
    // this rule should match the mockEvent URL
    rules.push({ alias: 'match', method: 'GET', url: '/foo', response: { ok: true } });

    const event = mockEvent();
    await handleFetch(event);

    expect(event.respondWith).toHaveBeenCalled();
  });

  it('does not respond when no rule matches', async () => {
    const event = mockEvent();
    await handleFetch(event);
    expect(event.respondWith).not.toHaveBeenCalled();
  })
})
