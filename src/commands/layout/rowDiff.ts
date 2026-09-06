/**
 * Diff rows by content, not by position.
 *
 * The problem this solves: when a section near the top changes height,
 * EVERYTHING below it shifts, and a positional comparison marks the whole page
 * as changed. Measured on a real landing page: the page went from 2451 to 2617
 * pixels tall and the overlay came out as scattered boxes everywhere, none of
 * them over an actual change.
 *
 * So the page is treated as a sequence of rows and diffed with an LCS, the same
 * way git diffs lines. A row that only moved pairs up and is not marked. Only
 * rows that genuinely appear, disappear or change are reported.
 */
import { type Grid, toBits } from './grid';

export type RowOp =
  | { op: 'same'; baselineRow: number; currentRow: number }
  | { op: 'changed'; baselineRow: number; currentRow: number; cells: boolean[] }
  | { op: 'added'; currentRow: number }
  | { op: 'removed'; baselineRow: number };

/** The bits of each row, as a matrix. */
function rowsOf(grid: Grid): boolean[][] {
  const bits = toBits(grid);
  return Array.from({ length: grid.rows }, (_, r) =>
    bits.slice(r * grid.cols, r * grid.cols + grid.cols),
  );
}

function hamming(a: boolean[], b: boolean[]): number {
  let distance = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) distance++;
  return distance;
}

/**
 * LCS with tolerance: two rows count as "the same" when they differ by at most
 * `tolerance` cells. Without the tolerance a row that shifts half a pixel stops
 * pairing and we are back to noise.
 */
export function diffRows(baseline: Grid, current: Grid, tolerance = 1): RowOp[] {
  const a = rowsOf(baseline);
  const b = rowsOf(current);
  const same = (i: number, j: number) => hamming(a[i], b[j]) <= tolerance;

  const lcs: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] = same(i, j) ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const ops: RowOp[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (same(i, j)) {
      ops.push({ op: 'same', baselineRow: i, currentRow: j });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      ops.push({ op: 'removed', baselineRow: i });
      i++;
    } else {
      ops.push({ op: 'added', currentRow: j });
      j++;
    }
  }
  while (i < a.length) ops.push({ op: 'removed', baselineRow: i++ });
  while (j < b.length) ops.push({ op: 'added', currentRow: j++ });

  // The LCS emits removed and added in runs rather than alternating. Group them
  // into contiguous hunks and pair them up inside each hunk, so we can mark
  // WHICH cells changed instead of painting a whole row as new.
  const merged: RowOp[] = [];
  for (let k = 0; k < ops.length;) {
    if (ops[k].op === 'same') {
      merged.push(ops[k++]);
      continue;
    }

    let end = k;
    while (end < ops.length && ops[end].op !== 'same') end++;
    const hunk = ops.slice(k, end);
    const removed = hunk.filter((op) => op.op === 'removed') as { baselineRow: number }[];
    const added = hunk.filter((op) => op.op === 'added') as { currentRow: number }[];

    const paired = Math.min(removed.length, added.length);
    for (let n = 0; n < paired; n++) {
      const baselineRow = removed[n].baselineRow;
      const currentRow = added[n].currentRow;
      merged.push({
        op: 'changed',
        baselineRow,
        currentRow,
        cells: a[baselineRow].map((bit, col) => bit !== b[currentRow][col]),
      });
    }
    for (let n = paired; n < added.length; n++) {
      merged.push({ op: 'added', currentRow: added[n].currentRow });
    }
    for (let n = paired; n < removed.length; n++) {
      merged.push({ op: 'removed', baselineRow: removed[n].baselineRow });
    }
    k = end;
  }
  return merged;
}

/** How many rows failed to pair. This is the real layout distance. */
export function rowDistance(ops: RowOp[]): number {
  return ops.filter((op) => op.op !== 'same').length;
}
