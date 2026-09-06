/**
 * The .snap file. Only this file is committed; the PNGs are gitignored, because
 * a reference PNG does not survive a clean checkout and so would never exist in
 * CI. The failure preview is rebuilt from the bits over the CURRENT capture, so
 * it never needs the previous image.
 */
import { COLS, printGrid, type Grid } from './grid';

export interface LayoutSnap {
  /** Decides the verdict. */
  hash: string;
  /** The exact signal: the block grew or shrank. */
  size: string;
  /** The viewport the reference was taken at. Null for files written before this was recorded. */
  viewport: string | null;
  /** The greys, kept so the bits can be rebuilt and the change located. */
  grid: Grid;
}

export function serialize(snap: {
  hash: string;
  size: string;
  viewport: string;
  grid: Grid;
}): string {
  const gridHex = snap.grid.cells
    .map((density) => Math.round(density).toString(16).padStart(2, '0'))
    .join('');
  const preview = printGrid(snap.grid)
    .split('\n')
    .map((line) => `# ${line}`)
    .join('\n');

  return [
    `hash ${snap.hash}`,
    `size ${snap.size}`,
    `viewport ${snap.viewport}`,
    `rows ${snap.grid.rows}`,
    `cols ${snap.grid.cols}`,
    `grid ${gridHex}`,
    ``,
    `# preview (# = filled, . = empty)`,
    preview,
    ``,
  ].join('\n');
}

/**
 * The width out of a "WxH" size. The grid cell is width/COLS, so a change here
 * rescales every cell and invalidates a cell-by-cell comparison.
 */
export function widthOf(size: string): number {
  return Number(size.split('x')[0]);
}

export function parse(text: string): LayoutSnap {
  const read = (key: string) => new RegExp(`^${key} (.+)$`, 'm').exec(text)?.[1] ?? '';

  const hash = read('hash');
  const gridHex = read('grid');
  if (!hash || !gridHex) {
    throw new Error('Layout snapshot file is not readable. Delete it and let it be recreated.');
  }

  const cells: number[] = [];
  for (let i = 0; i < gridHex.length; i += 2) {
    cells.push(parseInt(gridHex.slice(i, i + 2), 16));
  }

  const cols = Number(read('cols')) || COLS;
  const rows = Number(read('rows')) || Math.ceil(cells.length / cols);

  return {
    hash,
    size: read('size'),
    viewport: read('viewport') || null,
    grid: { cells, rows, cols },
  };
}
