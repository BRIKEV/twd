import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { reportResults, executeTests } from '../../../runner-ci';
import * as twd from '../../../runner';

// ANSI color codes
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';

describe('twd Test Runner ci - reportResults', () => {
  const ICON_PASS = `${GREEN}✓${RESET}`;
  const ICON_FAIL = `${RED}✗${RESET}`;
  const ICON_SKIP = `${YELLOW}○${RESET}`;

  let originalConsoleLog = console.log;
  beforeEach(() => {
    // Clear all handlers before each test
    twd.clearTests();
    vi.clearAllMocks();
    console.log = vi.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });
  
  it('should execute tests and report results', async () => {
    const afterEachFn = vi.fn();
    const testFn1 = vi.fn();
    const testFn2 = vi.fn();
    twd.describe('Group with afterEach', () => {
      twd.afterEach(afterEachFn);
      twd.it('test 1', testFn1);
      twd.it('test 2', testFn2);
    });
    const { handlers, testStatus } = await executeTests();
    reportResults(handlers, testStatus);
    expect(console.log).toHaveBeenNthCalledWith(1, 'Group with afterEach');
    expect(console.log).toHaveBeenNthCalledWith(2, `  ${ICON_PASS} test 1`);
    expect(console.log).toHaveBeenNthCalledWith(3, `  ${ICON_PASS} test 2`);
  });

  it('should handle test failures correctly', async () => {
    const testFn1 = vi.fn();
    const testFn2 = vi.fn(() => {
      throw new Error('Test failure');
    });
    twd.describe('Group with a failing test', () => {
      twd.it('test 1', testFn1);
      twd.it('test 2', testFn2);
    });
    const { handlers, testStatus } = await executeTests();
    reportResults(handlers, testStatus);
    expect(console.log).toHaveBeenNthCalledWith(1, 'Group with a failing test');
    expect(console.log).toHaveBeenNthCalledWith(2, `  ${ICON_PASS} test 1`);
    expect(console.log).toHaveBeenNthCalledWith(3, `  ${ICON_FAIL} test 2`);
  });

  it('should skip tests marked as skip', async () => {
    const testFn1 = vi.fn();
    const testFn2 = vi.fn();
    twd.describe('Group with a skipped test', () => {
      twd.it('test 1', testFn1);
      twd.it.skip('test 2', testFn2);
    });
    const { handlers, testStatus } = await executeTests();
    reportResults(handlers, testStatus);
    expect(console.log).toHaveBeenNthCalledWith(1, 'Group with a skipped test');
    expect(console.log).toHaveBeenNthCalledWith(2, `  ${ICON_PASS} test 1`);
    expect(console.log).toHaveBeenNthCalledWith(3, `  ${ICON_SKIP} test 2`);
  });

  it('should handle nested describes with only and skip', async () => {
    const testFn1 = vi.fn();
    const testFn2 = vi.fn();
    const testFn3 = vi.fn();
    twd.describe('Outer suite', () => {
      twd.it('test 1', testFn1);
      twd.describe.only('Inner suite', () => {
        twd.it.skip('test 2', testFn2);
        twd.it('test 3', testFn3);
      });
    });
    const { handlers, testStatus } = await executeTests();
    reportResults(handlers, testStatus);
    expect(console.log).toHaveBeenNthCalledWith(1, 'Outer suite');
    expect(console.log).toHaveBeenNthCalledWith(2, `  ${ICON_SKIP} test 1`);
    expect(console.log).toHaveBeenNthCalledWith(3, '  Inner suite');
    expect(console.log).toHaveBeenNthCalledWith(4, `    ${ICON_SKIP} test 2`);
    expect(console.log).toHaveBeenNthCalledWith(5, `    ${ICON_PASS} test 3`);
  });

  it('should only report tests marked as only', async () => {
    const testFn1 = vi.fn();
    const testFn2 = vi.fn();
    const testFn3 = vi.fn();
    const testFn4 = vi.fn();
    twd.describe('Group with only test', () => {
      twd.it.only('test 1', testFn1);
      twd.it('test 2', testFn2);
      twd.describe.skip('Skipped suite', () => {
        twd.it('test 3', testFn3);
        twd.it.only('test 4', testFn4);
      });
    });
    const { handlers, testStatus } = await executeTests();
    reportResults(handlers, testStatus);
    expect(console.log).toHaveBeenNthCalledWith(1, 'Group with only test');
    expect(console.log).toHaveBeenNthCalledWith(2, `  ${ICON_PASS} test 1`);
    expect(console.log).toHaveBeenNthCalledWith(3, `  ${ICON_SKIP} test 2`);
    expect(console.log).toHaveBeenNthCalledWith(4, '  Skipped suite');
    expect(console.log).toHaveBeenNthCalledWith(5, `    ${ICON_SKIP} test 3`);
    expect(console.log).toHaveBeenNthCalledWith(6, `    ${ICON_PASS} test 4`);
  });

  it('should only report tests marked as only', async () => {
    const testFn1 = vi.fn();
    const testFn2 = vi.fn();
    const testFn3 = vi.fn();
    const testFn4 = vi.fn();
    twd.describe('Group with only test', () => {
      twd.it.only('test 1', testFn1);
      twd.it('test 2', testFn2);
      twd.it.skip('test no handler');
      twd.describe.skip('Skipped suite', () => {
        twd.it('test 3', testFn3);
        twd.it('test 4', testFn4);
      });
    });
    const { handlers, testStatus } = await executeTests();
    reportResults(handlers, testStatus);
    expect(console.log).toHaveBeenNthCalledWith(1, 'Group with only test');
    expect(console.log).toHaveBeenNthCalledWith(2, `  ${ICON_PASS} test 1`);
    expect(console.log).toHaveBeenNthCalledWith(3, `  ${ICON_SKIP} test 2`);
    expect(console.log).toHaveBeenNthCalledWith(4, `  ${ICON_SKIP} test no handler`);
    expect(console.log).toHaveBeenNthCalledWith(5, '  Skipped suite');
    expect(console.log).toHaveBeenNthCalledWith(6, `    ${ICON_SKIP} test 3`);
    expect(console.log).toHaveBeenNthCalledWith(7, `    ${ICON_SKIP} test 4`);
  });
});