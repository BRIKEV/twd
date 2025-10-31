import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as twd from '../../runner';

describe('twd runner', () => {
  beforeEach(() => {
    twd.clearTests();
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

  it('should throw error if beforeEach is called outside describe', () => {
    expect(() => {
      twd.beforeEach(() => {});
    }).toThrow('beforeEach() must be inside a describe()');
  });

  it('should call beforeEach before each test', async () => {
    const beforeEachFn = vi.fn();
    const testFn1 = vi.fn();
    const testFn2 = vi.fn();
    twd.describe('Group with beforeEach', () => {
      twd.beforeEach(beforeEachFn);
      twd.it('test 1', testFn1);
      twd.it('test 2', testFn2);
    });
    
    const tests = twd.handlers;
    const testArray = Array.from(tests.values());
    expect(testArray).toHaveLength(3);
    
    // Create a test runner to properly execute the tests
    const mockEvents = {
      onStart: vi.fn(),
      onPass: vi.fn(),
      onFail: vi.fn(),
      onSkip: vi.fn(),
      onSuiteStart: vi.fn(),
      onSuiteEnd: vi.fn(),
    };
    
    const runner = new twd.TestRunner(mockEvents);
    
    // Run the first test
    const firstTest = testArray.find(t => t.name === 'test 1')!;
    await runner.runSingle(firstTest.id);
    expect(beforeEachFn).toHaveBeenCalledTimes(1);
    expect(testFn1).toHaveBeenCalledTimes(1);
    expect(testFn2).not.toHaveBeenCalled();
    
    // Reset mocks and run the second test
    beforeEachFn.mockClear();
    testFn1.mockClear();
    const secondTest = testArray.find(t => t.name === 'test 2')!;
    await runner.runSingle(secondTest.id);
    expect(beforeEachFn).toHaveBeenCalledTimes(1);
    expect(testFn2).toHaveBeenCalledTimes(1);
    expect(testFn1).not.toHaveBeenCalled();
  });

  it('should throw error if afterEach is called outside describe', () => {
    expect(() => {
      twd.afterEach(() => {});
    }).toThrow('afterEach() must be inside a describe()');
  });

  it('should call afterEach after each test', async () => {
    const afterEachFn = vi.fn();
    const testFn1 = vi.fn();
    const testFn2 = vi.fn();
    twd.describe('Group with afterEach', () => {
      twd.afterEach(afterEachFn);
      twd.it('test 1', testFn1);
      twd.it('test 2', testFn2);
    });
    
    const tests = twd.handlers;
    const testArray = Array.from(tests.values());
    expect(testArray).toHaveLength(3);
    
    // Create a test runner to properly execute the tests
    const mockEvents = {
      onStart: vi.fn(),
      onPass: vi.fn(),
      onFail: vi.fn(),
      onSkip: vi.fn(),
      onSuiteStart: vi.fn(),
      onSuiteEnd: vi.fn(),
    };
    
    const runner = new twd.TestRunner(mockEvents);
    
    // Run the first test
    const firstTest = testArray.find(t => t.name === 'test 1')!;
    await runner.runSingle(firstTest.id);
    expect(afterEachFn).toHaveBeenCalledTimes(1);
    expect(testFn1).toHaveBeenCalledTimes(1);
    expect(testFn2).not.toHaveBeenCalled();
    
    // Reset mocks and run the second test
    afterEachFn.mockClear();
    testFn1.mockClear();
    const secondTest = testArray.find(t => t.name === 'test 2')!;
    await runner.runSingle(secondTest.id);
    expect(afterEachFn).toHaveBeenCalledTimes(1);
    expect(testFn2).toHaveBeenCalledTimes(1);
    expect(testFn1).not.toHaveBeenCalled();
  });

  it('should execute hooks in the correct order', async () => {
    const beforeEachFn1 = vi.fn();
    const beforeEachFn2 = vi.fn();
    const afterEachFn1 = vi.fn();
    const afterEachFn2 = vi.fn();
    twd.describe('Outer suite', () => {
      twd.beforeEach(beforeEachFn1);
      twd.afterEach(afterEachFn1);
      twd.describe('Inner suite', () => {
        twd.beforeEach(beforeEachFn2);
        twd.afterEach(afterEachFn2);
        twd.it('test in inner suite', () => {});
      });
    });
    
    const tests = twd.handlers;
    const testArray = Array.from(tests.values());
    
    // Create a test runner to properly execute the tests
    const mockEvents = {
      onStart: vi.fn(),
      onPass: vi.fn(),
      onFail: vi.fn(),
      onSkip: vi.fn(),
      onSuiteStart: vi.fn(),
      onSuiteEnd: vi.fn(),
    };
    
    const runner = new twd.TestRunner(mockEvents);

    const innerTest = testArray.find(t => t.name === 'test in inner suite')!;
    await runner.runSingle(innerTest.id);

    expect(beforeEachFn1).toHaveBeenCalledBefore(beforeEachFn2);
    expect(afterEachFn2).toHaveBeenCalledBefore(afterEachFn1);
  });

  it('should only run tests marked as only when any test is marked as only', async () => {
    const testFn1 = vi.fn();
    const testFn2 = vi.fn();
    twd.describe('Suite with only', () => {
      twd.it('test 1', testFn1);
      twd.it.only('test 2', testFn2);
    });
    
    const tests = twd.handlers;
    const testArray = Array.from(tests.values());
    expect(testArray).toHaveLength(3);
    
    // Create a test runner to properly execute the tests
    const mockEvents = {
      onStart: vi.fn(),
      onPass: vi.fn(),
      onFail: vi.fn(),
      onSkip: vi.fn(),
      onSuiteStart: vi.fn(),
      onSuiteEnd: vi.fn(),
    };
    
    const runner = new twd.TestRunner(mockEvents);
    
    // Run all tests
    await runner.runAll();
    
    expect(testFn1).not.toHaveBeenCalled();
    expect(testFn2).toHaveBeenCalledTimes(1);
  });

  it('should skip tests marked as skip', async () => {
    const testFn1 = vi.fn();
    const testFn2 = vi.fn();
    twd.describe('Suite with skip', () => {
      twd.it('test 1', testFn1);
      twd.it.skip('test 2', testFn2);
    });
    
    const tests = twd.handlers;
    const testArray = Array.from(tests.values());
    expect(testArray).toHaveLength(3);
    
    // Create a test runner to properly execute the tests
    const mockEvents = {
      onStart: vi.fn(),
      onPass: vi.fn(),
      onFail: vi.fn(),
      onSkip: vi.fn(),
      onSuiteStart: vi.fn(),
      onSuiteEnd: vi.fn(),
    };
    
    const runner = new twd.TestRunner(mockEvents);
    
    // Run all tests
    await runner.runAll();
    
    expect(testFn1).toHaveBeenCalledTimes(1);
    expect(testFn2).not.toHaveBeenCalled();
    expect(mockEvents.onSkip).toHaveBeenCalledWith(expect.objectContaining({ name: 'test 2' }));
  });
});
