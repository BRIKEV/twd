import { beforeEach, describe, expect, it, vi } from 'vitest';

// `mockBridge` captures `const rules = state.rules` at import time, so reassigning
// `window.__TWD_MOCK_STATE__` from a test has no effect on its getters. Mock the two getters
// instead — they are the real unit boundary here.
vi.mock('../../commands/mockBridge', () => ({
  getRequestMockRules: vi.fn(() => []),
  getRequestCounts: vi.fn(() => ({})),
}));

import { getRequestCounts, getRequestMockRules } from '../../commands/mockBridge';
import { collectDiagnostics, formatDiagnostics } from '../../utils/diagnostics';

const setMockState = (aliases: string[], counts: Record<string, number>) => {
  vi.mocked(getRequestMockRules).mockReturnValue(aliases.map((alias) => ({ alias })) as never);
  vi.mocked(getRequestCounts).mockReturnValue(counts);
};

describe('collectDiagnostics', () => {
  beforeEach(() => {
    setMockState([], {});
    window.history.replaceState({}, '', '/t-1/settings/catalog');
  });

  it('should report the current path and search', () => {
    window.history.replaceState({}, '', '/t-1/settings/catalog?tab=erp');

    expect(collectDiagnostics().location).toBe('/t-1/settings/catalog?tab=erp');
  });

  it('should omit mockRules when no rule is registered', () => {
    expect(collectDiagnostics().mockRules).toBeUndefined();
  });

  it('should count every registered rule as triggered when all have hits', () => {
    setMockState(['me', 'catalog'], { me: 1, catalog: 3 });

    expect(collectDiagnostics().mockRules).toEqual({
      registered: 2,
      triggered: 2,
      untriggered: [],
    });
  });

  it('should name the rules with no hits', () => {
    setMockState(['me', 'catalog', 'products'], { me: 1 });

    expect(collectDiagnostics().mockRules).toEqual({
      registered: 3,
      triggered: 1,
      untriggered: ['catalog', 'products'],
    });
  });

  it('should treat a zero count as never requested', () => {
    setMockState(['catalog'], { catalog: 0 });

    expect(collectDiagnostics().mockRules).toEqual({
      registered: 1,
      triggered: 0,
      untriggered: ['catalog'],
    });
  });

  it('should count an alias once when two rules share it', () => {
    setMockState(['catalog', 'catalog'], { catalog: 1 });

    expect(collectDiagnostics().mockRules).toEqual({
      registered: 1,
      triggered: 1,
      untriggered: [],
    });
  });
});

describe('formatDiagnostics', () => {
  const body = (lines: string[]) => lines.slice(1, -1);

  it('should open and close with a rule', () => {
    const lines = formatDiagnostics({ location: '/t-1' });

    expect(lines[0]).toBe(`── TWD diagnostics ${'─'.repeat(37)}`);
    expect(lines[lines.length - 1]).toBe('─'.repeat(56));
  });

  it('should render location alone when no rule was registered', () => {
    expect(body(formatDiagnostics({ location: '/t-1/settings/catalog' }))).toEqual([
      'location    /t-1/settings/catalog',
    ]);
  });

  it('should render a summary only when every rule triggered', () => {
    const lines = formatDiagnostics({
      location: '/t-1',
      mockRules: { registered: 3, triggered: 3, untriggered: [] },
    });

    expect(body(lines)).toEqual(['location    /t-1', 'mock rules  3/3 triggered']);
  });

  it('should name a single miss inline', () => {
    const lines = formatDiagnostics({
      location: '/t-1',
      mockRules: { registered: 7, triggered: 6, untriggered: ['catalog'] },
    });

    expect(body(lines)[1]).toBe('mock rules  6/7 triggered — catalog never requested');
  });

  it('should list several misses under the summary', () => {
    const lines = formatDiagnostics({
      location: '/t-1',
      mockRules: {
        registered: 7,
        triggered: 4,
        untriggered: ['catalog', 'products', 'connections'],
      },
    });

    expect(body(lines).slice(1)).toEqual([
      'mock rules  4/7 triggered — 3 never requested',
      '            ✗ catalog',
      '            ✗ products',
      '            ✗ connections',
    ]);
  });

  it('should cap the list at five and count the rest', () => {
    const untriggered = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const lines = formatDiagnostics({
      location: '/t-1',
      mockRules: { registered: 7, triggered: 0, untriggered },
    });

    expect(body(lines).slice(1)).toEqual([
      'mock rules  0/7 triggered — 7 never requested',
      '            ✗ a',
      '            ✗ b',
      '            ✗ c',
      '            ✗ d',
      '            ✗ e',
      '            +2 more',
    ]);
  });
});
