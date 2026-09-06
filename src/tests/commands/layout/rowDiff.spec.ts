import { describe, expect, it } from 'vitest';
import type { Grid } from '../../../commands/layout/grid';
import { diffRows, rowDistance } from '../../../commands/layout/rowDiff';

const fromRows = (rows: string[]): Grid => ({
  cells: rows.flatMap((row) => [...row].map((char) => (char === '#' ? 50 : 0))),
  rows: rows.length,
  cols: rows[0].length,
});

describe('diffRows', () => {
  it('reports every row as unchanged for identical grids', () => {
    const grid = fromRows(['##..', '..##']);
    const ops = diffRows(grid, grid);
    expect(ops.every((op) => op.op === 'same')).toBe(true);
    expect(rowDistance(ops)).toBe(0);
  });

  it('pairs rows that only shifted down instead of marking the whole page', () => {
    // This is the reason the diff exists. A positional comparison would mark
    // all four rows; the LCS marks the one row that is actually new.
    const baseline = fromRows(['##..', '.##.', '..##']);
    const current = fromRows(['....', '##..', '.##.', '..##']);

    const ops = diffRows(baseline, current);

    expect(rowDistance(ops)).toBe(1);
    expect(ops.filter((op) => op.op === 'added')).toEqual([{ op: 'added', currentRow: 0 }]);
  });

  it('tolerates a one cell wobble so a subpixel shift does not unpair a row', () => {
    const baseline = fromRows(['#...']);
    const current = fromRows(['##..']);
    expect(rowDistance(diffRows(baseline, current))).toBe(0);
  });

  it('marks the wobble when tolerance is zero', () => {
    const baseline = fromRows(['#...']);
    const current = fromRows(['##..']);
    expect(rowDistance(diffRows(baseline, current, 0))).toBe(1);
  });

  it('pairs a removed row with an added row so the changed cells can be marked', () => {
    const baseline = fromRows(['##..', '####']);
    const current = fromRows(['..##', '####']);

    const ops = diffRows(baseline, current);

    expect(ops).toContainEqual({
      op: 'changed',
      baselineRow: 0,
      currentRow: 0,
      cells: [true, true, true, true],
    });
    expect(rowDistance(ops)).toBe(1);
  });
});
