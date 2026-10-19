import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  clearRequestMockRules,
  getRequestCount,
  getRequestMockRules,
  initRequestMocking,
  mockRequest,
  resetMockingState,
  waitForRequest,
  waitForRequests,
} from '../../../commands/mockBridge';
import { TWD_VERSION } from '../../../constants/version';

// Behaves like an up-to-date mock-sw.js: acks every message and lets the test report hits
class FakeServiceWorker {
  listeners: Record<string, ((event: unknown) => void)[]> = {};
  controller = {
    postMessage: vi.fn((_message: unknown, transfer?: MessagePort[]) => {
      transfer?.[0]?.postMessage({ type: 'ACK', version: TWD_VERSION });
    }),
  };

  addEventListener(type: string, cb: (event: unknown) => void) {
    this.listeners[type] ??= [];
    this.listeners[type].push(cb);
  }

  hit(data: Record<string, unknown>) {
    this.listeners['message']?.forEach((cb) => cb({ data: { type: 'EXECUTED', ...data } }));
  }

  async register() {
    return Promise.resolve();
  }
}

const ruleId = (alias: string) => getRequestMockRules().find((r) => r.alias === alias)?.id;

describe('waitForRequest driven by EXECUTED messages', () => {
  let fakeSW: FakeServiceWorker;
  const originalSW = navigator.serviceWorker;

  beforeEach(async () => {
    fakeSW = new FakeServiceWorker();
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: fakeSW });
    vi.spyOn(console, 'log').mockImplementation(() => {});
    clearRequestMockRules();
    resetMockingState();
    await initRequestMocking();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.useRealTimers();
    vi.restoreAllMocks();
    clearRequestMockRules();
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: originalSW });
  });

  it('resolves as soon as the hit is reported, not on a polling tick', async () => {
    await mockRequest('users', { method: 'GET', url: '/users', response: [] });
    const pending = waitForRequest('users');

    const start = performance.now();
    fakeSW.hit({ alias: 'users', ruleId: ruleId('users'), request: { page: 1 }, hitCount: 1 });
    const rule = await pending;

    expect(performance.now() - start).toBeLessThan(50);
    expect(rule.executed).toBe(true);
    expect(rule.request).toEqual({ page: 1 });
  });

  it('lets the app render the response before resolving', async () => {
    await mockRequest('users', { method: 'GET', url: '/users', response: [] });
    const pending = waitForRequest('users');

    // The worker reports the hit before it returns the response, so the app
    // receives and renders it in a later task
    fakeSW.hit({ alias: 'users', ruleId: ruleId('users'), hitCount: 1 });
    setTimeout(() => {
      const item = document.createElement('li');
      item.textContent = 'Rendered user';
      document.body.append(item);
    }, 0);
    await pending;

    // A synchronous query right after waitForRequest must see the rendered response
    expect(document.body.textContent).toContain('Rendered user');
  });

  it('lets the app render when the hit arrived before the wait started', async () => {
    await mockRequest('users', { method: 'GET', url: '/users', response: [] });
    fakeSW.hit({ alias: 'users', ruleId: ruleId('users'), hitCount: 1 });
    setTimeout(() => {
      const item = document.createElement('li');
      item.textContent = 'Rendered user';
      document.body.append(item);
    }, 0);

    await waitForRequest('users');

    expect(document.body.textContent).toContain('Rendered user');
  });

  it('ignores a late hit on a rule that was replaced under the same alias', async () => {
    await mockRequest('users', { method: 'GET', url: '/users', response: [] });
    const firstId = ruleId('users');
    await mockRequest('users', { method: 'GET', url: '/users', response: [{ id: 1 }] });
    const pending = waitForRequest('users');

    fakeSW.hit({ alias: 'users', ruleId: firstId, request: 'old', hitCount: 1 });
    expect(getRequestMockRules()[0].executed).toBe(false);

    fakeSW.hit({ alias: 'users', ruleId: ruleId('users'), request: 'new', hitCount: 2 });
    const rule = await pending;
    expect(rule.request).toBe('new');
    expect(rule.response).toEqual([{ id: 1 }]);
  });

  it('still counts a hit on a replaced rule in the alias hit count', async () => {
    await mockRequest('users', { method: 'GET', url: '/users', response: [] });
    const firstId = ruleId('users');
    await mockRequest('users', { method: 'GET', url: '/users', response: [{ id: 1 }] });

    fakeSW.hit({ alias: 'users', ruleId: firstId, hitCount: 1 });

    expect(getRequestCount('users')).toBe(1);
  });

  it('accepts hits without a rule id, as sent by workers older than the id', async () => {
    await mockRequest('users', { method: 'GET', url: '/users', response: [] });
    const pending = waitForRequest('users');

    fakeSW.hit({ alias: 'users', request: null, hitCount: 1 });

    await expect(pending).resolves.toMatchObject({ alias: 'users', executed: true });
  });

  it('resolves every pending wait for the same alias', async () => {
    await mockRequest('users', { method: 'GET', url: '/users', response: [] });
    const first = waitForRequest('users');
    const second = waitForRequest('users');

    fakeSW.hit({ alias: 'users', ruleId: ruleId('users'), hitCount: 1 });

    const [a, b] = await Promise.all([first, second]);
    expect(a.alias).toBe('users');
    expect(b.alias).toBe('users');
  });

  it('works for waitForRequests', async () => {
    await mockRequest('users', { method: 'GET', url: '/users', response: [] });
    await mockRequest('posts', { method: 'GET', url: '/posts', response: [] });
    const pending = waitForRequests(['users', 'posts']);

    fakeSW.hit({ alias: 'posts', ruleId: ruleId('posts'), hitCount: 1 });
    fakeSW.hit({ alias: 'users', ruleId: ruleId('users'), hitCount: 1 });

    const rules = await pending;
    expect(rules.map((r) => r.alias)).toEqual(['users', 'posts']);
  });

  it('rejects instead of throwing synchronously when the rule does not exist', async () => {
    let pending: Promise<unknown> | undefined;
    expect(() => {
      pending = waitForRequest('missing');
    }).not.toThrow();
    await expect(pending).rejects.toThrow('Rule missing not found');
  });

  it('rejects after retries * retryDelay with the not-executed message', async () => {
    await mockRequest('users', { method: 'GET', url: '/users', response: [] });
    vi.useFakeTimers();
    const pending = waitForRequest('users', 5, 100);
    const assertion = expect(pending).rejects.toThrow(
      'Rule "users" was not executed within 500ms.',
    );

    await vi.advanceTimersByTimeAsync(499);
    fakeSW.hit({ alias: 'other', hitCount: 1 });
    await vi.advanceTimersByTimeAsync(1);

    await assertion;
  });

  it('waits 3000ms by default, like findBy*', async () => {
    await mockRequest('users', { method: 'GET', url: '/users', response: [] });
    vi.useFakeTimers();
    let settled = false;
    const pending = waitForRequest('users');
    pending
      .catch(() => {})
      .finally(() => {
        settled = true;
      });

    await vi.advanceTimersByTimeAsync(2999);
    expect(settled).toBe(false);
    const assertion = expect(pending).rejects.toThrow(
      'Rule "users" was not executed within 3000ms.',
    );
    await vi.advanceTimersByTimeAsync(1);
    await assertion;
  });

  it('drops pending waits on clearRequestMockRules so they never settle into the next test', async () => {
    await mockRequest('users', { method: 'GET', url: '/users', response: [] });
    vi.useFakeTimers();
    const settled = vi.fn();
    waitForRequest('users').then(settled, settled);

    clearRequestMockRules();
    await vi.advanceTimersByTimeAsync(5000);

    expect(settled).not.toHaveBeenCalled();
  });
});
