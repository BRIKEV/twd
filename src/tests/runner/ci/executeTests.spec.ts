import { beforeEach, describe, expect, it, vi } from 'vitest';
import { executeTests } from '../../../runner-ci';
import * as twd from '../../../runner';

describe('twd Test Runner ci - executeTests', () => {
  beforeEach(() => {
    // Clear all handlers before each test
    twd.clearTests();
    vi.clearAllMocks();
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
    expect(handlers).toHaveLength(3); // 1 suite + 2 tests
    expect(testStatus).toHaveLength(2);
    expect(testStatus[0].status).toBe('pass');
    expect(testStatus[1].status).toBe('pass');
    expect(testFn1).toHaveBeenCalledTimes(1);
    expect(testFn2).toHaveBeenCalledTimes(1);
    expect(afterEachFn).toHaveBeenCalledTimes(2);
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
    expect(handlers).toHaveLength(3); // 1 suite + 2 tests
    expect(testStatus).toHaveLength(2);
    expect(testStatus[0].status).toBe('pass');
    expect(testStatus[1].status).toBe('fail');
    expect(testStatus[1].error).toBe('Test failure');
    expect(testFn1).toHaveBeenCalledTimes(1);
    expect(testFn2).toHaveBeenCalledTimes(1);
  });

  it('should skip tests marked as skip', async () => {
    const testFn1 = vi.fn();
    const testFn2 = vi.fn();
    twd.describe('Group with a skipped test', () => {
      twd.it('test 1', testFn1);
      twd.it.skip('test 2', testFn2);
    });
    const { handlers, testStatus } = await executeTests();
    expect(handlers).toHaveLength(3); // 1 suite + 2 tests
    expect(testStatus).toHaveLength(2);
    expect(testStatus[0].status).toBe('pass');
    expect(testStatus[1].status).toBe('skip');
    expect(testFn1).toHaveBeenCalledTimes(1);
    expect(testFn2).toHaveBeenCalledTimes(0);
  });
});