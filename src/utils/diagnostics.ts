import { getRequestCounts, getRequestMockRules } from '../commands/mockBridge';

/** A snapshot of what TWD observed during a test, captured when the test fails. */
export interface TestDiagnostics {
  /** Path + search at the moment of failure. */
  location: string;
  /** Omitted entirely when the test registered no mock rules. */
  mockRules?: {
    registered: number;
    triggered: number;
    untriggered: string[];
  };
}

export const collectDiagnostics = (): TestDiagnostics => {
  const location = `${window.location.pathname}${window.location.search}`;
  // Distinct aliases: `rules` is shared module state, and a duplicated alias would inflate the
  // registered count so the summary reads as a miss that never happened.
  const aliases = [...new Set(getRequestMockRules().map((rule) => rule.alias))];

  if (aliases.length === 0) return { location };

  const counts = getRequestCounts();
  const untriggered = aliases.filter((alias) => (counts[alias] ?? 0) === 0);

  return {
    location,
    mockRules: {
      registered: aliases.length,
      triggered: aliases.length - untriggered.length,
      untriggered,
    },
  };
};
