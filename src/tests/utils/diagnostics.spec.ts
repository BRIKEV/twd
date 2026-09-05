import { beforeEach, describe, expect, it, vi } from 'vitest';

// `mockBridge` captures `const rules = state.rules` at import time, so reassigning
// `window.__TWD_MOCK_STATE__` from a test has no effect on its getters. Mock the two getters
// instead — they are the real unit boundary here.
vi.mock('../../commands/mockBridge', () => ({
  getRequestMockRules: vi.fn(() => []),
  getRequestCounts: vi.fn(() => ({})),
}));

import { getRequestCounts, getRequestMockRules } from '../../commands/mockBridge';
import { collectDiagnostics } from '../../utils/diagnostics';

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
