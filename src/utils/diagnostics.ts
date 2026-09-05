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
  const location = `${window.location.pathname}${window.location.search}${window.location.hash}`;
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

const WIDTH = 56;
const HEADER = `── TWD diagnostics ${'─'.repeat(WIDTH - 19)}`;
const FOOTER = '─'.repeat(WIDTH);
const LABEL = '            ';
const LIST_CAP = 5;

/**
 * Renders the signal, not the data: a page with fifteen mocks must not produce fifteen lines. The
 * rules that *did* trigger are only interesting as a count — it is the misses that name a bug.
 */
export const formatDiagnostics = (diagnostics: TestDiagnostics): string[] => {
  const lines = [HEADER, `location    ${diagnostics.location}`];
  const mockRules = diagnostics.mockRules;

  if (mockRules) {
    const { registered, triggered, untriggered } = mockRules;
    const summary = `${triggered}/${registered} triggered`;

    if (untriggered.length === 0) {
      lines.push(`mock rules  ${summary}`);
    } else if (untriggered.length === 1) {
      lines.push(`mock rules  ${summary} — ${untriggered[0]} never requested`);
    } else {
      lines.push(`mock rules  ${summary} — ${untriggered.length} never requested`);
      for (const alias of untriggered.slice(0, LIST_CAP)) lines.push(`${LABEL}✗ ${alias}`);
      const rest = untriggered.length - LIST_CAP;
      if (rest > 0) lines.push(`${LABEL}+${rest} more`);
    }
  }

  lines.push(FOOTER);
  return lines;
};
