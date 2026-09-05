import { beforeEach, describe, expect, it, vi } from 'vitest';

// Same reason as the collector's spec: mockBridge's getters close over state captured at import.
vi.mock('../../commands/mockBridge', () => ({
  getRequestMockRules: vi.fn(() => []),
  getRequestCounts: vi.fn(() => ({})),
}));

import { getRequestCounts, getRequestMockRules } from '../../commands/mockBridge';
import * as twd from '../../runner';

const setMockState = (aliases: string[], counts: Record<string, number>) => {
  vi.mocked(getRequestMockRules).mockReturnValue(aliases.map((alias) => ({ alias })) as never);
  vi.mocked(getRequestCounts).mockReturnValue(counts);
};

const mockEvents = () => ({
  onStart: vi.fn(),
  onPass: vi.fn(),
  onFail: vi.fn(),
  onSkip: vi.fn(),
  onSuiteStart: vi.fn(),
  onSuiteEnd: vi.fn(),
});

describe('runner diagnostics', () => {
  beforeEach(() => {
    twd.clearTests();
    setMockState(['catalog'], { catalog: 1 });
    window.history.replaceState({}, '', '/t-1/settings/catalog');
  });

  it('should attach diagnostics to a failing test', async () => {
    twd.describe('Suite', () => {
      twd.it('failing', () => {
        throw new Error('boom');
      });
    });

    const events = mockEvents();
    await new twd.TestRunner(events).runAll();

    const [failed] = events.onFail.mock.calls[0];
    expect(failed.diagnostics).toEqual({
      location: '/t-1/settings/catalog',
      mockRules: { registered: 1, triggered: 1, untriggered: [] },
    });
  });

  it('should not attach diagnostics to a passing test', async () => {
    twd.describe('Suite', () => {
      twd.it('passing', () => {});
    });

    const events = mockEvents();
    await new twd.TestRunner(events).runAll();

    const [passed] = events.onPass.mock.calls[0];
    expect(passed.diagnostics).toBeUndefined();
  });

  it('should collect before afterEach clears the mock counts', async () => {
    twd.describe('Suite', () => {
      twd.afterEach(() => setMockState([], {}));
      twd.it('failing', () => {
        throw new Error('boom');
      });
    });

    const events = mockEvents();
    await new twd.TestRunner(events).runAll();

    const [failed] = events.onFail.mock.calls[0];
    // Would be `undefined` if collection ran after the hooks.
    expect(failed.diagnostics.mockRules).toEqual({
      registered: 1,
      triggered: 1,
      untriggered: [],
    });
  });

  it('should clear diagnostics from a prior failed attempt once a retry passes', async () => {
    let callCount = 0;
    twd.describe('Suite', () => {
      twd.it('flaky', () => {
        callCount++;
        if (callCount === 1) throw new Error('boom');
      });
    });

    const events = mockEvents();
    await new twd.TestRunner(events, { retryCount: 2 }).runAll();

    const [passed] = events.onPass.mock.calls[0];
    expect(passed.diagnostics).toBeUndefined();
  });
});
