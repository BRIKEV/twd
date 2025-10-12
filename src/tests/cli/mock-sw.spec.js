// sw.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../cli/utils/notifyClients.js', () => ({
  notifyClients: vi.fn(),
}));

import { handleFetch, handleMessage, rules } from '../../cli/mock-sw.js';
import { notifyClients } from '../../cli/utils/notifyClients.js';


global.self = {
  clients: {
    matchAll: vi.fn(() => Promise.resolve([])),
  },
};

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
    clone: vi.fn(() => ({
      json: vi.fn(() => Promise.resolve({})),
    })),
    headers: {
      get: vi.fn(() => 'application/json'),
    },
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
    const responsePromise = event.respondWith.mock.calls[0][0];
    const response = await responsePromise;
    expect(response).toBeInstanceOf(Response);
    expect(response.body).toBe(JSON.stringify({ ok: true }));
    expect(response.init.status).toBe(200);
    expect(response.init.headers['Content-Type']).toBe('application/json');
  });

  it('should return the request when it is a json content type', async () => {
    const rule = { alias: 'match', method: 'POST', url: '/foo', response: { ok: true } };
    rules.push(rule);

    const event = mockEvent({
      request: {
        method: 'POST',
        url: 'https://api.test/foo',
        clone: vi.fn(() => ({
          json: vi.fn(() => Promise.resolve({ foo: 'bar' })),
        })),
        headers: {
          get: () => 'application/json',
        },
      }
    });
    await handleFetch(event);
    const responsePromise = event.respondWith.mock.calls[0][0];
    await responsePromise; // wait for the response to be generated

    // Wait a tick for the notifyClients to be called
    await Promise.resolve();

    expect(notifyClients).toHaveBeenCalledWith(
      expect.any(Array),
      rule,
      { foo: 'bar' }
    );
  });

  it('should return the request when it is a form data content type', async () => {
    const rule = { alias: 'match', method: 'POST', url: '/foo', response: { ok: true } };
    rules.push(rule);

    const event = mockEvent({
      request: {
        method: 'POST',
        url: 'https://api.test/foo',
        clone: vi.fn(() => ({
          formData: vi.fn(() => {
            const formData = new FormData();
            formData.append('key1', 'value1');
            formData.append('key2', 'value2');
            return Promise.resolve(formData);
          }),
        })),
        headers: {
          get: () => 'multipart/form-data',
        },
      }
    });
    await handleFetch(event);
    const responsePromise = event.respondWith.mock.calls[0][0];
    await responsePromise; // wait for the response to be generated

    // Wait a tick for the notifyClients to be called
    await Promise.resolve();

    expect(notifyClients).toHaveBeenCalledWith(
      expect.any(Array),
      rule,
      { key1: 'value1', key2: 'value2' },
    );
  });

  it('should return the request when it is a text content type', async () => {
    const rule = { alias: 'match', method: 'POST', url: '/foo', response: { ok: true } };
    rules.push(rule);

    const event = mockEvent({
      request: {
        method: 'POST',
        url: 'https://api.test/foo',
        clone: vi.fn(() => ({
          text: vi.fn(() => Promise.resolve('plain text')),
        })),
        headers: {
          get: () => 'text/plain',
        },
      }
    });
    await handleFetch(event);
    const responsePromise = event.respondWith.mock.calls[0][0];
    await responsePromise; // wait for the response to be generated

    // Wait a tick for the notifyClients to be called
    await Promise.resolve();

    expect(notifyClients).toHaveBeenCalledWith(
      expect.any(Array),
      rule,
      'plain text',
    );
  });

  it('should return the request when it is a octet-stream content type', async () => {
    const rule = { alias: 'match', method: 'POST', url: '/foo', response: { ok: true } };
    rules.push(rule);

    const arrayBuffer = new ArrayBuffer(8);
    const event = mockEvent({
      request: {
        method: 'POST',
        url: 'https://api.test/foo',
        clone: vi.fn(() => ({
          arrayBuffer: vi.fn(() => Promise.resolve(arrayBuffer)),
        })),
        headers: {
          get: () => 'application/octet-stream',
        },
      }
    });
    await handleFetch(event);
    const responsePromise = event.respondWith.mock.calls[0][0];
    await responsePromise; // wait for the response to be generated

    // Wait a tick for the notifyClients to be called
    await Promise.resolve();

    expect(notifyClients).toHaveBeenCalledWith(
      expect.any(Array),
      rule,
      arrayBuffer,
    );
  });

  it('should return the request when it is a image content type', async () => {
    const rule = { alias: 'match', method: 'POST', url: '/foo', response: { ok: true } };
    rules.push(rule);

    const blob = new Blob(['image content'], { type: 'image/png' });
    const event = mockEvent({
      request: {
        method: 'POST',
        url: 'https://api.test/foo',
        clone: vi.fn(() => ({
          blob: vi.fn(() => Promise.resolve(blob)),
        })),
        headers: {
          get: () => 'image/png',
        },
      }
    });
    await handleFetch(event);
    const responsePromise = event.respondWith.mock.calls[0][0];
    await responsePromise; // wait for the response to be generated

    // Wait a tick for the notifyClients to be called
    await Promise.resolve();

    expect(notifyClients).toHaveBeenCalledWith(
      expect.any(Array),
      rule,
      blob,
    );
  });

  it('should return request text when is non valid content type', async () => {
    const rule = { alias: 'match', method: 'POST', url: '/foo', response: { ok: true } };
    rules.push(rule);

    const event = mockEvent({
      request: {
        method: 'POST',
        url: 'https://api.test/foo',
        clone: vi.fn(() => ({
          text: vi.fn(() => Promise.resolve('some text')),
        })),
        headers: {
          get: () => 'unknown/type',
        },
      }
    });
    await handleFetch(event);
    const responsePromise = event.respondWith.mock.calls[0][0];
    await responsePromise; // wait for the response to be generated

    // Wait a tick for the notifyClients to be called
    await Promise.resolve();

    expect(notifyClients).toHaveBeenCalledWith(
      expect.any(Array),
      rule,
      'some text',
    );
  });

  it('does not respond when no rule matches', async () => {
    const event = mockEvent();
    await handleFetch(event);
    expect(event.respondWith).not.toHaveBeenCalled();
  })
})
