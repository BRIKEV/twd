/**
 * Draws the failure picture: the current capture with the rows that diverged
 * marked, a size ribbon when the block resized, and a legend.
 */
import type { Capture } from './capture';
import type { Grid } from './grid';
import type { RowOp } from './rowDiff';

const MARK_CHANGED = { fill: 'rgba(255, 0, 0, 0.3)', stroke: 'rgba(220, 0, 0, 0.9)' };
const MARK_NEW_AREA = { fill: 'rgba(255, 150, 0, 0.25)', stroke: 'rgba(220, 120, 0, 0.9)' };

/**
 * Mark the row diff over the current capture.
 *
 * `onlyFirstHunk` matters when the height changed: everything below the change
 * shifts, so marking all of it is noise. The height is already reported exactly
 * by `size`, so the overlay only has to say WHERE the divergence starts.
 * Measured: one case went from 40 scattered boxes to a single band over the hero.
 */
function annotateRowDiff(
  canvas: HTMLCanvasElement,
  current: Grid,
  ops: RowOp[],
  onlyFirstHunk: boolean,
): HTMLCanvasElement {
  const out = document.createElement('canvas');
  out.width = canvas.width;
  out.height = canvas.height;

  const ctx = out.getContext('2d')!;
  ctx.drawImage(canvas, 0, 0);

  const cellW = canvas.width / current.cols;
  const cellH = canvas.height / current.rows;
  ctx.lineWidth = 2;

  let seenHunk = false;
  let inHunk = false;
  for (const op of ops) {
    if (op.op === 'same') {
      if (inHunk) seenHunk = true;
      inHunk = false;
      continue;
    }
    if (op.op === 'removed') continue;
    inHunk = true;
    if (onlyFirstHunk && seenHunk) break;

    const y = op.currentRow * cellH;

    if (op.op === 'added') {
      ctx.fillStyle = MARK_NEW_AREA.fill;
      ctx.strokeStyle = MARK_NEW_AREA.stroke;
      ctx.fillRect(0, y, canvas.width, cellH);
      ctx.strokeRect(0, y, canvas.width, cellH);
      continue;
    }

    ctx.fillStyle = MARK_CHANGED.fill;
    ctx.strokeStyle = MARK_CHANGED.stroke;
    for (let col = 0; col < current.cols; col++) {
      if (!op.cells[col]) continue;
      ctx.fillRect(col * cellW, y, cellW, cellH);
      ctx.strokeRect(col * cellW, y, cellW, cellH);
    }
  }
  return out;
}

/** Bottom band explaining what each colour means. */
function withLegend(
  canvas: HTMLCanvasElement,
  entries: { fill: string; stroke: string; label: string }[],
): HTMLCanvasElement {
  const band = 30;
  const out = document.createElement('canvas');
  out.width = canvas.width;
  out.height = canvas.height + band;

  const ctx = out.getContext('2d')!;
  ctx.drawImage(canvas, 0, 0);
  ctx.fillStyle = 'rgb(245, 245, 245)';
  ctx.fillRect(0, canvas.height, out.width, band);
  ctx.font = '12px monospace';

  let x = 8;
  const y = canvas.height + 10;
  for (const entry of entries) {
    ctx.fillStyle = entry.fill;
    ctx.strokeStyle = entry.stroke;
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, 13, 13);
    ctx.strokeRect(x, y, 13, 13);
    x += 19;

    ctx.fillStyle = 'rgb(60, 60, 60)';
    ctx.fillText(entry.label, x, y + 11);
    x += ctx.measureText(entry.label).width + 20;
  }
  return out;
}

/**
 * Top ribbon with the size change. Drawing the expected size as an outline was
 * tried and confuses: it leaves a large empty area that looks like content. The
 * numbers in a 26px band read at a glance.
 */
function annotateSizeChange(
  canvas: HTMLCanvasElement,
  referenceSize: string,
  currentSize: string,
): HTMLCanvasElement {
  const band = 26;
  const label = `expected ${referenceSize}   ->   actual ${currentSize}`;

  const out = document.createElement('canvas');
  const measure = out.getContext('2d')!;
  measure.font = 'bold 13px monospace';
  out.width = Math.max(canvas.width, Math.ceil(measure.measureText(label).width) + 16);
  out.height = canvas.height + band;

  const ctx = out.getContext('2d')!;
  ctx.fillStyle = 'rgb(255, 235, 235)';
  ctx.fillRect(0, 0, out.width, band);
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = 'rgb(190, 0, 0)';
  ctx.fillText(label, 8, 18);
  ctx.drawImage(canvas, 0, band);
  return out;
}

export function renderFailureImage(input: {
  capture: Capture;
  ops: RowOp[];
  referenceSize: string;
  /**
   * Only true at constant width. When the width changed the cell resizes, so a
   * block that SHRANK can gain rows, and calling those rows "new area" would
   * contradict what the user just saw.
   */
  hasNewArea: boolean;
}): string {
  const { capture, ops, referenceSize, hasNewArea } = input;
  const sizeChanged = referenceSize !== capture.size;

  let canvas = annotateRowDiff(capture.canvas, capture.grid, ops, sizeChanged);
  canvas = withLegend(canvas, [
    { ...MARK_CHANGED, label: 'changed' },
    ...(hasNewArea ? [{ ...MARK_NEW_AREA, label: 'new area' }] : []),
  ]);
  if (sizeChanged) {
    canvas = annotateSizeChange(canvas, referenceSize, capture.size);
  }
  return canvas.toDataURL('image/png');
}
