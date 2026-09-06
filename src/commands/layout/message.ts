/**
 * Every string the user reads. The failure message says what moved, where, and
 * what to do about it, and nothing else.
 *
 * The hashes the spike printed stay out: nobody can act on
 * "00dd000020000018". The diff map does not, because `<name>.failed.png` is a
 * FILE and CI shows logs. Without the map a CI failure reports a count of rows
 * and nothing else, which is not enough to tell an intended change from a
 * regression without downloading an artifact.
 */
import { COLS } from './grid';
import { widthOf } from './snapFile';

export function layoutChangedMessage(input: {
  name: string;
  dir: string;
  referenceSize: string;
  currentSize: string;
  rowsDiffering: number;
  /** The diff rendered as text. Omitted when there is nothing to show. */
  diff?: string;
}): string {
  const { name, dir, referenceSize, currentSize, rowsDiffering, diff } = input;
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
    ...(diff
      ? [
          `  X = changed    ~ = new row    # = filled    . = empty`,
          diff
            .split('\n')
            .map((line) => (line ? `  ${line}` : ''))
            .join('\n'),
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
