/**
 * The grid is the whole trick, and two properties of it are load bearing.
 *
 * The cell is SQUARE and derived from the width (width / COLS); the row count
 * falls out of the height. A grid with a fixed number of rows stretches when
 * the block grows, so every cell then samples a different strip of the page and
 * the marked cells land nowhere near the real change.
 *
 * A cell's value is its mean distance from the page background, not its
 * brightness. Absolute brightness saturates on a white page: nearly every cell
 * reads as filled, the hash comes out as ffffff..., and a change in a light area
 * is invisible. Per-cell standard deviation fails the other way, being
 * hypersensitive to a three pixel shift.
 *
 * See specs/2026-09-03-matchlayout-design.md sections 3 and 9 for the measurements.
 */
export type Grid = { cells: number[]; rows: number; cols: number };

/** Columns in the grid. The cell is width/COLS, so this also sets the resolution. */
export const COLS = 16;

/**
 * Fixed ink threshold, deliberately not relative to the image. A threshold
 * relative to the mean saturates on light pages.
 */
export const INK_THRESHOLD = 10;

/**
 * Build the per-cell density array from the small canvas's raw pixel data.
 * This is the pure heart of capture.ts's averageHash: given pixel data, the
 * small canvas width, the row/col count, the subsample factor and the
 * background grey, it needs no canvas, no DOM, and nothing else. Kept here,
 * separate from the canvas plumbing in capture.ts, so it can be unit tested
 * directly instead of being permanently untestable.
 */
export function computeCells(input: {
  data: Uint8ClampedArray;
  smallWidth: number;
  rows: number;
  cols: number;
  sub: number;
  backgroundGray: number;
}): number[] {
  const { data, smallWidth, rows, cols, sub, backgroundGray } = input;
  const grayAt = (i: number) => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

  // A cell is its mean distance from the background colour. See the module
  // comment above for why this beats both absolute brightness and per-cell
  // standard deviation.
  const cells: number[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let sum = 0;
      for (let sy = 0; sy < sub; sy++) {
        for (let sx = 0; sx < sub; sx++) {
          const x = col * sub + sx;
          const y = row * sub + sy;
          sum += Math.abs(grayAt((y * smallWidth + x) * 4) - backgroundGray);
        }
      }
      // Round here, not just at serialize time. The .snap stores rounded
      // integers, so leaving the in-memory grid fractional means a cell whose
      // density sits just under the ink threshold reads one way live and the
      // other way from the reference, and an unchanged page fails on its second
      // run. Rounding at capture makes the round trip exact: the in-memory grid
      // ends up identical to what gets serialized.
      cells.push(Math.round(Math.min(255, sum / (sub * sub))));
    }
  }
  return cells;
}

/** One bit per cell: is there content here? */
export function toBits(grid: Grid): boolean[] {
  return grid.cells.map((density) => density >= INK_THRESHOLD);
}

/**
 * ASCII render of the bits. This is what makes a .snap reviewable in a pull
 * request without opening an image, so it draws bits and not greys: the preview
 * IS what decides the verdict.
 */
export function printGrid(grid: Grid): string {
  const bits = toBits(grid);
  const lines: string[] = [];
  for (let row = 0; row < grid.rows; row++) {
    const cells: string[] = [];
    for (let col = 0; col < grid.cols; col++) {
      cells.push(bits[row * grid.cols + col] ? '#' : '.');
    }
    lines.push(cells.join(' '));
  }
  return lines.join('\n');
}
