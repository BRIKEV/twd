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
