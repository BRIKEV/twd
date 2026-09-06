/**
 * Rasterize a DOM node inside the browser, with no external dependencies.
 *
 * Pipeline: node -> clone with computed styles inlined -> <svg><foreignObject>
 *        -> data: URI -> <img> -> canvas.drawImage -> anchored grid -> hash
 *
 * html2canvas is not needed. foreignObject renders correctly, web fonts
 * included, verified against Tailwind v4 and shadcn.
 *
 * Known limits, all acceptable for a layout hash:
 *  - external <img> and background-image URLs do not load
 *  - ::before and ::after are not cloned
 *  - cloneNode copies attributes, not live DOM properties
 */
import { COLS, type Grid, toBits } from './grid';

export interface Capture {
  canvas: HTMLCanvasElement;
  hash: string;
  grid: Grid;
  /** CSS pixel size of the captured node, for example "577x512". */
  size: string;
}

/** Subsamples per cell side. */
const SUB = 4;

/** Copy every resolved computed style onto the clone, so CSS vars and stylesheets survive. */
function inlineStyles(source: Element, clone: Element) {
  const computed = getComputedStyle(source);
  const target = (clone as HTMLElement).style;

  for (let i = 0; i < computed.length; i++) {
    const property = computed.item(i);
    target.setProperty(property, computed.getPropertyValue(property));
  }

  for (let i = 0; i < source.children.length; i++) {
    inlineStyles(source.children[i], clone.children[i]);
  }
}

/** First opaque background walking up the ancestors. */
function resolveBackground(el: HTMLElement): string {
  let node: HTMLElement | null = el;
  while (node) {
    const background = getComputedStyle(node).backgroundColor;
    if (background && background !== 'transparent' && !background.startsWith('rgba(0, 0, 0, 0)')) {
      return background;
    }
    node = node.parentElement;
  }
  return '#ffffff';
}

function grayOfColor(color: string): number {
  const probe = document.createElement('canvas');
  probe.width = 1;
  probe.height = 1;
  const ctx = probe.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Anchored grid. The cell is square (width/COLS) and the row count comes from
 * the height, so when the block grows downwards the rows above still sample
 * exactly the same strip of the page.
 *
 * The destination height passed to drawImage is FRACTIONAL on purpose. Rounding
 * it compresses the image into a whole number of rows and misaligns everything
 * again, which was a whole failed iteration.
 */
function averageHash(canvas: HTMLCanvasElement, background: string): { hash: string; grid: Grid } {
  const cell = canvas.width / COLS;
  const exactRows = canvas.height / cell;
  const rows = Math.max(1, Math.ceil(exactRows));

  const small = document.createElement('canvas');
  small.width = COLS * SUB;
  small.height = rows * SUB;
  const ctx = small.getContext('2d')!;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, small.width, small.height);
  ctx.drawImage(canvas, 0, 0, COLS * SUB, exactRows * SUB);

  const backgroundGray = grayOfColor(background);
  const { data } = ctx.getImageData(0, 0, small.width, small.height);
  const grayAt = (i: number) => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

  // A cell is its mean distance from the background colour. See grid.ts for why
  // this beats both absolute brightness and per-cell standard deviation.
  const cells: number[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < COLS; col++) {
      let sum = 0;
      for (let sy = 0; sy < SUB; sy++) {
        for (let sx = 0; sx < SUB; sx++) {
          const x = col * SUB + sx;
          const y = row * SUB + sy;
          sum += Math.abs(grayAt((y * small.width + x) * 4) - backgroundGray);
        }
      }
      // Round here, not just at serialize time. The .snap stores rounded
      // integers, so leaving the in-memory grid fractional means a cell whose
      // density sits just under the ink threshold reads one way live and the
      // other way from the reference, and an unchanged page fails on its second
      // run. Rounding at capture makes the round trip exact.
      cells.push(Math.round(Math.min(255, sum / (SUB * SUB))));
    }
  }

  const grid: Grid = { cells, rows, cols: COLS };
  const bits = toBits(grid)
    .map((bit) => (bit ? '1' : '0'))
    .join('');

  let hash = '';
  for (let i = 0; i < bits.length; i += 4) {
    hash += parseInt(bits.slice(i, i + 4).padEnd(4, '0'), 2).toString(16);
  }
  return { hash, grid };
}

export async function captureNode(el: HTMLElement): Promise<Capture> {
  const rect = el.getBoundingClientRect();
  // Pinned to CSS pixels (dpr = 1) so a retina laptop and CI agree.
  const width = Math.ceil(rect.width);
  const height = Math.ceil(rect.height);

  const clone = el.cloneNode(true) as HTMLElement;
  inlineStyles(el, clone);
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
    `<foreignObject x="0" y="0" width="100%" height="100%">` +
    new XMLSerializer().serializeToString(clone) +
    `</foreignObject></svg>`;

  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  try {
    await img.decode();
  } catch {
    throw new Error(
      'matchLayout could not rasterize the element. This usually means the ' +
        'cloned markup is not valid XHTML.',
    );
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Without this the canvas stays transparent wherever the node paints no
  // background of its own, and transparent reads as black: the hash then sees
  // text floating on black instead of the page. Measured: 44 of 64 cells at 0.
  const background = resolveBackground(el);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0);

  const { hash, grid } = averageHash(canvas, background);

  return { canvas, hash, grid, size: `${width}x${height}` };
}
