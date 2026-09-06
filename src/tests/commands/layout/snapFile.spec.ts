import { describe, expect, it } from 'vitest';
import { computeCells, type Grid, toBits } from '../../../commands/layout/grid';
import { parse, serialize, widthOf } from '../../../commands/layout/snapFile';

const grid: Grid = { cells: [0, 50, 50, 0], rows: 2, cols: 2 };

describe('serialize', () => {
  it('writes a parseable header and a reviewable ASCII preview', () => {
    const text = serialize({ hash: 'abcd', size: '577x512', viewport: '1280x800', grid });

    expect(text).toContain('hash abcd');
    expect(text).toContain('size 577x512');
    expect(text).toContain('viewport 1280x800');
    expect(text).toContain('rows 2');
    expect(text).toContain('cols 2');
    expect(text).toContain('grid 00323200');
    expect(text).toContain('# . #');
    expect(text).toContain('# # .');
  });
});

describe('widthOf', () => {
  it('reads the width out of a size string', () => {
    expect(widthOf('577x512')).toBe(577);
  });
});

describe('parse', () => {
  it('round trips a serialized snapshot', () => {
    const text = serialize({ hash: 'abcd', size: '577x512', viewport: '1280x800', grid });

    expect(parse(text)).toEqual({
      hash: 'abcd',
      size: '577x512',
      viewport: '1280x800',
      grid,
    });
  });

  it('reads a snapshot written before viewports were recorded', () => {
    // Files on disk from the spike have no viewport line. They must keep
    // working, with the viewport guard skipped rather than the read failing.
    const legacy = ['hash abcd', 'size 577x512', 'rows 2', 'cols 2', 'grid 00323200'].join('\n');

    expect(parse(legacy).viewport).toBeNull();
  });

  it('throws on a file that is not a snapshot', () => {
    expect(() => parse('this is not a snapshot')).toThrow(/not readable/);
  });

  it('pins that serialize/parse round trip a grid built the way capture.ts builds one', () => {
    // This test's job is narrower than its name might suggest: it pins
    // serialize/parse, not capture.ts's rounding. The capture-time rounding
    // that keeps an unchanged page from disagreeing with its own reference is
    // pinned directly against computeCells in grid.spec.ts, where it can
    // actually fail if that rounding is removed.
    //
    // Here, `original` is sourced from a real computeCells call (the same
    // danger-band construction used in grid.spec.ts: a 4x4 sub-cell whose raw
    // mean density is 9.75, which computeCells rounds to 10) rather than a
    // hard-coded literal, so the fixture is honest about where the rounded
    // value comes from. What this test actually guards is that serialize,
    // which independently rounds densities for the hex file format, and
    // parse, which reads them back, do not introduce any further drift of
    // their own on top of that.
    const sub = 4;
    const greys = Array.from({ length: sub * sub }, (_, i) => (i === 0 ? 6 : 10));
    const data = new Uint8ClampedArray(greys.length * 4);
    greys.forEach((grey, i) => {
      data[i * 4] = grey;
      data[i * 4 + 1] = grey;
      data[i * 4 + 2] = grey;
      data[i * 4 + 3] = 255;
    });
    const [density] = computeCells({
      data,
      smallWidth: sub,
      rows: 1,
      cols: 1,
      sub,
      backgroundGray: 0,
    });

    const original: Grid = { cells: [density, 50], rows: 1, cols: 2 };
    const text = serialize({
      hash: 'abcd',
      size: '10x10',
      viewport: '1280x800',
      grid: original,
    });
    const parsed = parse(text);

    expect(toBits(original)).toEqual(toBits(parsed.grid));
  });
});
