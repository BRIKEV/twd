import { describe, expect, it } from 'vitest';
import { INK_THRESHOLD, printGrid, toBits, type Grid } from '../../../commands/layout/grid';

/** Build a Grid from an ASCII picture, so the tests read like what they assert. */
const fromRows = (rows: string[]): Grid => ({
  cells: rows.flatMap((row) => [...row].map((char) => (char === '#' ? 50 : 0))),
  rows: rows.length,
  cols: rows[0].length,
});

describe('toBits', () => {
  it('counts a cell exactly at the threshold as filled', () => {
    const grid: Grid = { cells: [INK_THRESHOLD, INK_THRESHOLD - 1], rows: 1, cols: 2 };
    expect(toBits(grid)).toEqual([true, false]);
  });

  it('counts an empty cell as not filled', () => {
    const grid: Grid = { cells: [0, 0], rows: 1, cols: 2 };
    expect(toBits(grid)).toEqual([false, false]);
  });
});

describe('printGrid', () => {
  it('renders one line per row with no trailing whitespace', () => {
    expect(printGrid(fromRows(['#.', '.#']))).toBe('# .\n. #');
  });
});
