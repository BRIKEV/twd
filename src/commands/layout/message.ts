/**
 * Every string the user reads. The failure message says what moved and what to
 * do about it, and nothing else.
 *
 * The spike also printed the two hashes and an ASCII render of the grid. Both
 * are dropped: a user can do nothing with "00dd000020000018", and the ASCII
 * grid is a worse version of the picture that <name>.failed.png already shows
 * with the changed cells boxed in red.
 */
import { COLS } from './grid';
import { widthOf } from './snapFile';

export function layoutChangedMessage(input: {
  name: string;
  dir: string;
  referenceSize: string;
  currentSize: string;
  rowsDiffering: number;
}): string {
  const { name, dir, referenceSize, currentSize, rowsDiffering } = input;
  const widthChanged = widthOf(referenceSize) !== widthOf(currentSize);
  const sizeChanged = referenceSize !== currentSize;

  const headline = widthChanged
    ? `the block width changed, ${referenceSize} -> ${currentSize}`
    : sizeChanged
      ? `the block height changed, ${referenceSize} -> ${currentSize}`
      : `${rowsDiffering} rows differ`;

  return [
    ``,
    `Layout snapshot "${name}" changed - ${headline}`,
    ``,
    // The cell is width/COLS, so once the width moves no cell lines up with its
    // counterpart in the reference and the overlay can only be a hint.
    ...(widthChanged
      ? [
          `  The width changed, so the grid rescaled (cell = width/${COLS}) and the`,
          `  marked cells in the capture are indicative, not one to one.`,
          ``,
        ]
      : []),
    `  Reference:  ${dir}/${name}.snap`,
    `  Capture:    ${dir}/${name}.failed.png`,
    ``,
    `  Accept:  npx twd-cli --update-snapshots`,
    ``,
  ].join('\n');
}

export const savedMessage = (name: string) => `Layout snapshot "${name}" saved`;

export const updatedMessage = (name: string) => `Layout snapshot "${name}" updated`;

export const skippedDisabledMessage = (name: string) =>
  `Layout snapshot "${name}" skipped - layout snapshots are decided by twd-cli. ` +
  `Pass twdSnapshot({ debug: true }) to run them in the sidebar.`;

export const skippedViewportMessage = (name: string, reference: string, current: string) =>
  `Layout snapshot "${name}" skipped - viewport mismatch (reference ${reference}, ` +
  `current ${current}). Run twd-cli to validate layout snapshots.`;

export const missingReferenceMessage = (name: string, dir: string) =>
  `Layout snapshot "${name}" has no reference, and CI never creates one.\n\n` +
  `  Expected:  ${dir}/${name}.snap`;

export const viewportMismatchMessage = (name: string, reference: string, current: string) =>
  `Layout snapshot "${name}" viewport mismatch: reference ${reference}, current ${current}.`;
