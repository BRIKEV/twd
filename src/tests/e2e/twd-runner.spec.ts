import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as twd from '../../twd';
import { tests, clearTests } from '../../twdRegistry';

describe('twd runner', () => {
  beforeEach(() => {
    clearTests();
    vi.clearAllMocks();
  });

  it('should call describe and it functions correctly', () => {
    const describeSpy = vi.spyOn(twd, 'describe');
    const itSpy = vi.spyOn(twd, 'it');
    const testFn = vi.fn();
    const groupFn = vi.fn(() => {
      twd.it('does something', testFn);
      twd.it('does something second test', testFn);
    });
    twd.describe('My group', groupFn);
    expect(describeSpy).toHaveBeenCalledWith('My group', expect.any(Function));
    expect(groupFn).toHaveBeenCalled();
    expect(itSpy).toHaveBeenCalledWith('does something', testFn);
    expect(itSpy).toHaveBeenCalledWith('does something second test', testFn);
    expect(testFn).not.toHaveBeenCalled();
    describeSpy.mockRestore();
    itSpy.mockRestore();
    expect(tests).toHaveLength(2);
    expect(tests[0].name).toBe('does something');
    expect(tests[1].name).toBe('does something second test');
    expect(tests[0].suite).toEqual(['My group']);
    expect(tests[1].suite).toEqual(['My group']);
  });

  it('should call beforeEach before each test', async () => {
    const beforeEachFn = vi.fn();
    const testFn1 = vi.fn();
    const testFn2 = vi.fn();
    twd.beforeEach(beforeEachFn);
    twd.it('test 1', testFn1);
    twd.it('test 2', testFn2);
    expect(tests).toHaveLength(2);
    await tests[0].fn();
    expect(beforeEachFn).toHaveBeenCalledTimes(1);
    expect(testFn1).toHaveBeenCalledTimes(1);
    await tests[1].fn();
    expect(beforeEachFn).toHaveBeenCalledTimes(2);
    expect(testFn2).toHaveBeenCalledTimes(1);
  });

  it('should register itOnly and itSkip correctly', () => {
    const itOnlySpy = vi.spyOn(twd, 'itOnly');
    const itSkipSpy = vi.spyOn(twd, 'itSkip');
    const testFn = vi.fn();
    twd.itOnly('only test', testFn);
    twd.itSkip('skipped test', testFn);
    expect(itOnlySpy).toHaveBeenCalledWith('only test', testFn);
    expect(itSkipSpy).toHaveBeenCalledWith('skipped test', testFn);
    itOnlySpy.mockRestore();
    itSkipSpy.mockRestore();
    expect(tests).toHaveLength(2);
    expect(tests[0].name).toBe('only test');
    expect(tests[0].only).toBe(true);
    expect(tests[0].skip).toBeUndefined();
    expect(tests[1].name).toBe('skipped test');
    expect(tests[1].skip).toBe(true);
    expect(tests[1].only).toBeUndefined();
  });
});
