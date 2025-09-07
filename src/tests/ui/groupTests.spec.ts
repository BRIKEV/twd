import { describe, expect, it } from 'vitest';
import * as twd from '../../';
import { tests } from '../../twdRegistry';
import groupTests from "../../ui/groupTests";

describe('groupTests function', () => {
  it('should group tests by their describe blocks', () => {
    twd.describe('Group 1', () => {
      twd.it('Test 1.1', () => {});
      twd.it('Test 1.2', () => {});
    });

    twd.describe('Group 2', () => {
      twd.it('Test 2.1', () => {});
      twd.describe('Subgroup 2.1', () => {
        twd.it('Test 2.1.1', () => {});
      });
    });

    const grouped = groupTests(tests);
    expect(grouped).toEqual([
      {
        name: 'Group 1',
        children: [
          { name: 'Test 1.1', fn: expect.any(Function), status: 'idle', logs: [], suite: ['Group 1'], only: undefined, skip: undefined },
          { name: 'Test 1.2', fn: expect.any(Function), status: 'idle', logs: [], suite: ['Group 1'], only: undefined, skip: undefined },
        ],
      },
      {
        name: 'Group 2',
        children: [
          { name: 'Test 2.1', fn: expect.any(Function), status: 'idle', logs: [], suite: ['Group 2'], only: undefined, skip: undefined },
          {
            name: 'Subgroup 2.1',
            children: [
              { name: 'Test 2.1.1', fn: expect.any(Function), status: 'idle', logs: [], suite: ['Group 2', 'Subgroup 2.1'], only: undefined, skip: undefined },
            ],
          },
        ],
      },
    ]);
  });
});
