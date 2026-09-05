import { describe, expect, it, vi } from 'vitest';
import { reportResults } from '../../../runner-ci';
import type { Handler } from '../../../runner';

const test = (overrides: Partial<Handler> = {}): Handler => ({
  id: 't1',
  name: 'failing',
  type: 'test',
  logs: [],
  depth: 0,
  handler: () => {},
  ...overrides,
});

describe('reportResults with diagnostics', () => {
  it('should print each line of a multi-line error on its own line', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    reportResults([test()], [{ id: 't1', status: 'fail', error: 'boom\nlocation    /t-1' }]);

    const printed = log.mock.calls.map(([line]) => String(line)).join('\n');
    expect(printed).toContain('boom');
    expect(printed).toContain('location    /t-1');
    // The old single-line format would have embedded a raw "\n" inside one call.
    expect(log.mock.calls.some(([line]) => String(line).includes('boom\nlocation'))).toBe(false);

    log.mockRestore();
  });
});
