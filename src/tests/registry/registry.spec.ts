import { describe, it, expect, beforeEach } from 'vitest';
import { tests, register, clearTests, pushSuite, popSuite } from '../../twdRegistry';

describe('Registry register tests', () => {
  beforeEach(() => {
    clearTests();
  });

  it('should register tests in array', () => {
    register('test 1', () => {});
    expect(tests).toHaveLength(1);
    expect(tests[0].name).toBe('test 1');
    expect(tests[0].status).toBe('idle');
    expect(tests[0].logs).toEqual([]);
    expect(tests[0].suite).toEqual([]);
    expect(tests[0].only).toBeUndefined();
    expect(tests[0].skip).toBeUndefined();
    clearTests();
    expect(tests).toHaveLength(0);
  });

  it('should register tests with only and skip', () => {
    register('test only', () => {}, { only: true });
    register('test skip', () => {}, { skip: true });
    expect(tests).toHaveLength(2);
    expect(tests[0].only).toBe(true);
    expect(tests[0].skip).toBeUndefined();
    expect(tests[1].only).toBeUndefined();
    expect(tests[1].skip).toBe(true);
  });

  it('should include suite names', () => {
    // Simulate suite nesting
    pushSuite('outer suite');
    pushSuite('inner suite');
    register('test in inner suite', () => {});
    popSuite();
    popSuite();
    expect(tests).toHaveLength(1);
    expect(tests[0].name).toBe('test in inner suite');
    expect(tests[0].suite).toEqual(['outer suite', 'inner suite']);
    expect(tests).toEqual([{
      name: 'test in inner suite',
      fn: expect.any(Function),
      status: 'idle',
      logs: [],
      suite: ['outer suite', 'inner suite'],
      only: undefined,
      skip: undefined,
    }]);
  });
});
