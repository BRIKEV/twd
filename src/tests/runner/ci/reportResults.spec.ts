import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { reportResults, executeTests } from '../../../runner-ci';
import * as twd from '../../../runner';

describe('twd Test Runner ci - reportResults', () => {
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
    expect(console.log).toHaveBeenNthCalledWith(2, '  ✓ test 1');
    expect(console.log).toHaveBeenNthCalledWith(3, '  ✓ test 2');
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
    expect(console.log).toHaveBeenNthCalledWith(2, '  ✓ test 1');
    expect(console.log).toHaveBeenNthCalledWith(3, '  ✗ test 2');
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
    expect(console.log).toHaveBeenNthCalledWith(2, '  ✓ test 1');
    expect(console.log).toHaveBeenNthCalledWith(3, '  ○ test 2');
  });
});