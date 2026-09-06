import { describe, expect, it } from 'vitest';
import {
  computeCells,
  INK_THRESHOLD,
  printGrid,
  toBits,
  type Grid,
} from '../../../commands/layout/grid';

/** Build an RGBA buffer for a square block of sub x sub grey pixels, one row wide. */
const greyPixels = (greys: number[]): Uint8ClampedArray => {
  const data = new Uint8ClampedArray(greys.length * 4);
  greys.forEach((grey, i) => {
    data[i * 4] = grey;
    data[i * 4 + 1] = grey;
    data[i * 4 + 2] = grey;
    data[i * 4 + 3] = 255;
  });
  return data;
};

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

describe('computeCells', () => {
  it('rounds a cell whose mean density lands in the danger band [9.5, 10.0) to an integer, so the grid stores quantized integers and the capture-to-file round trip is exact', () => {
    // One 4x4 sub-cell (sub = 4, the real SUB value from capture.ts), grey
    // against a black background (backgroundGray = 0). 15 of the 16 subpixels
    // are 10 grey levels from the background, one is 6 levels away:
    // (15 * 10 + 6) / 16 = 9.75, squarely inside [9.5, 10.0), not on either
    // edge. Math.round(9.75) is 10 (INK_THRESHOLD), which is what makes this
    // cell read as filled. Without that rounding, computeCells would return
    // the bare 9.75: Number.isInteger(9.75) is false, so the assertion below
    // fails immediately, and separately toBits would read 9.75 as empty
    // (9.75 < 10) even though the same density rounded for the .snap file
    // reads as filled. That mismatch, an unchanged page disagreeing with its
    // own reference on the next run, is exactly the bug capture.ts's fix closes.
    const sub = 4;
    const greys = Array.from({ length: sub * sub }, (_, i) => (i === 0 ? 6 : 10));
    const data = greyPixels(greys);

    const cells = computeCells({ data, smallWidth: sub, rows: 1, cols: 1, sub, backgroundGray: 0 });

    expect(cells).toEqual([10]);
    expect(cells.every(Number.isInteger)).toBe(true);
  });

  it('gives a density of 0 for a region that exactly matches the background', () => {
    const sub = 2;
    const data = greyPixels(new Array(sub * sub).fill(128));

    const cells = computeCells({
      data,
      smallWidth: sub,
      rows: 1,
      cols: 1,
      sub,
      backgroundGray: 128,
    });

    expect(cells).toEqual([0]);
  });

  it('gives a high density for a region that strongly contrasts with the background', () => {
    const sub = 2;
    const data = greyPixels(new Array(sub * sub).fill(200));

    const cells = computeCells({ data, smallWidth: sub, rows: 1, cols: 1, sub, backgroundGray: 0 });

    expect(cells).toEqual([200]);
  });

  it('caps the density at 255 even when the raw distance is larger', () => {
    const sub = 1;
    const data = greyPixels([255]);

    // backgroundGray is a plain number: computeCells does not clamp it to
    // 0-255 (grayOfColor never produces one out of range, but nothing in
    // computeCells itself enforces that), so a very low value drives the raw
    // distance well past 255 and exercises the Math.min cap on its own.
    const cells = computeCells({
      data,
      smallWidth: sub,
      rows: 1,
      cols: 1,
      sub,
      backgroundGray: -1000,
    });

    expect(cells).toEqual([255]);
  });
});
