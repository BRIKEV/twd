import { describe, expect, it } from 'vitest';
import type { Grid } from '../../../commands/layout/grid';
import { type RowOp, diffRows, renderRowDiff, rowDistance } from '../../../commands/layout/rowDiff';

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

describe('renderRowDiff', () => {
  it('marks changed cells, new rows and leaves paired rows as they are', () => {
    const map = renderRowDiff(
      [
        { op: 'same', baselineRow: 0, currentRow: 0 },
        { op: 'changed', baselineRow: 1, currentRow: 1, cells: [false, true, true, false] },
        { op: 'added', currentRow: 2 },
      ],
      { cells: new Array(12).fill(0), rows: 3, cols: 4 },
    );

    const lines = map.trimEnd().split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain('X');
    // Each line is prefixed with its row number so an elided map stays locatable.
    expect(lines[2]).toMatch(/^\s*2\s+~ ~ ~ ~$/);
  });

  it('renders nothing for a diff with no operations', () => {
    expect(renderRowDiff([], { cells: [], rows: 0, cols: 4 })).toBe('');
  });
});

describe('renderRowDiff elision', () => {
  const wideGrid = (rows: number): Grid => ({
    cells: new Array<number>(rows * 4).fill(255),
    rows,
    cols: 4,
  });

  it('keeps untouched rows readable as structure rather than blanking them', () => {
    const map = renderRowDiff(
      [
        { op: 'same', baselineRow: 0, currentRow: 0 },
        { op: 'changed', baselineRow: 1, currentRow: 1, cells: [true, false, false, false] },
      ],
      wideGrid(2),
    );

    // Every cell of the grid is filled, so the unchanged row must show it.
    expect(map).toContain('#');
  });

  it('elides long stretches of unchanged rows so a CI log stays readable', () => {
    const ops: RowOp[] = Array.from({ length: 30 }, (_, row) =>
      row === 15
        ? { op: 'changed', baselineRow: row, currentRow: row, cells: [true, false, false, false] }
        : { op: 'same', baselineRow: row, currentRow: row },
    );

    const map = renderRowDiff(ops, wideGrid(30));
    const lines = map.trimEnd().split('\n');

    expect(lines.length).toBeLessThan(12);
    expect(map).toContain('unchanged');
    expect(map).toContain('X');
  });

  it('does not elide when everything fits', () => {
    const ops: RowOp[] = Array.from({ length: 4 }, (_, row) => ({
      op: 'same',
      baselineRow: row,
      currentRow: row,
    }));

    expect(renderRowDiff(ops, wideGrid(4))).not.toContain('unchanged');
  });
});
