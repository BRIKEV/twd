import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as twd from '../../runner';

describe('twd runner', () => {
  beforeEach(() => {
    twd.clearTests();
    vi.clearAllMocks();
  });

  it('should call describe and it functions correctly when running only', () => {
    const itSpy = vi.spyOn(twd, 'it');
    const testFn = vi.fn();
    const groupFn = vi.fn(() => {
      twd.it('does something', testFn);
      twd.it('does something second test', testFn);
    });
    twd.describe.only('My group', groupFn);
    expect(groupFn).toHaveBeenCalled();
    expect(itSpy).toHaveBeenCalledWith('does something', testFn);
    expect(itSpy).toHaveBeenCalledWith('does something second test', testFn);
    expect(testFn).not.toHaveBeenCalled();
    itSpy.mockRestore();
    const tests = twd.handlers;
    const testArray = Array.from(tests.values());
    expect(testArray).toHaveLength(3);
    expect(testArray[0].name).toBe('My group');
    expect(testArray[1].name).toBe('does something');
    expect(testArray[2].name).toBe('does something second test');
    expect(testArray[0].parent).toEqual(undefined);
    expect(testArray[0].type).toEqual('suite');
    expect(testArray[1].parent).toEqual(expect.anything());
    expect(testArray[1].type).toEqual('test');
    expect(testArray[2].parent).toEqual(expect.anything());
    expect(testArray[2].type).toEqual('test');
  });

  it('should skip tests when describe.skip is used', () => {
    const itSpy = vi.spyOn(twd, 'it');
    const testFn = vi.fn();
    const groupFn = vi.fn(() => {
      twd.it('does something', testFn);
      twd.it('does something second test', testFn);
    });
    twd.describe.skip('My group', groupFn);
    expect(groupFn).toHaveBeenCalled();
    expect(itSpy).toHaveBeenCalledWith('does something', testFn);
    expect(itSpy).toHaveBeenCalledWith('does something second test', testFn);
    expect(testFn).not.toHaveBeenCalled();
    itSpy.mockRestore();
    const tests = twd.handlers;
    const testArray = Array.from(tests.values());
    expect(testArray).toHaveLength(3);
    expect(testArray[0].name).toBe('My group');
    expect(testArray[1].name).toBe('does something');
    expect(testArray[2].name).toBe('does something second test');
    expect(testArray[0].parent).toEqual(undefined);
    expect(testArray[0].type).toEqual('suite');
    expect(testArray[1].parent).toEqual(expect.anything());
    expect(testArray[1].type).toEqual('test');
    expect(testArray[2].parent).toEqual(expect.anything());
    expect(testArray[2].type).toEqual('test');
  });

  it('should run only test even with describe.skip when it.only is used', () => {
    const itSpy = vi.spyOn(twd, 'it');
    const testFn = vi.fn();
    const groupFn = vi.fn(() => {
      twd.it.only('does something', testFn);
      twd.it('does something second test', testFn);
    });
    twd.describe.skip('My group', groupFn);
    expect(groupFn).toHaveBeenCalled();
    expect(itSpy).toHaveBeenNthCalledWith(1, 'does something second test', testFn);
    expect(testFn).not.toHaveBeenCalled();
    itSpy.mockRestore();
    const tests = twd.handlers;
    const testArray = Array.from(tests.values());
    expect(testArray).toHaveLength(3);
    expect(testArray[0].name).toBe('My group');
    expect(testArray[1].name).toBe('does something');
    expect(testArray[2].name).toBe('does something second test');
    expect(testArray[0].parent).toEqual(undefined);
    expect(testArray[0].type).toEqual('suite');
    expect(testArray[1].parent).toEqual(expect.anything());
    expect(testArray[1].type).toEqual('test');
    expect(testArray[2].parent).toEqual(expect.anything());
    expect(testArray[2].type).toEqual('test');
  });

  it('should run two only describes, skip one inside a describe', () => {
    const itSpy = vi.spyOn(twd, 'it');
    const testFn = vi.fn();
    const groupFn1 = vi.fn(() => {
      twd.it('does something', testFn);
    });
    const groupFn2 = vi.fn(() => {
      twd.it('does something second test', testFn);
    });
    const groupFn3 = vi.fn(() => {
      twd.it('does something third test', testFn);
    });
    twd.describe.only('My group 1', groupFn1);
    twd.describe.only('My group 2', groupFn2);
    twd.describe.skip('My group 3', groupFn3);
    expect(groupFn1).toHaveBeenCalled();
    expect(groupFn2).toHaveBeenCalled();
    expect(groupFn3).toHaveBeenCalled();
    expect(itSpy).toHaveBeenCalledWith('does something', testFn);
    expect(itSpy).toHaveBeenCalledWith('does something second test', testFn);
    expect(itSpy).toHaveBeenCalledWith('does something third test', testFn);
    expect(testFn).not.toHaveBeenCalled();
    itSpy.mockRestore();
    const tests = twd.handlers;
    const testArray = Array.from(tests.values());
    expect(testArray).toHaveLength(6);
  });
});
