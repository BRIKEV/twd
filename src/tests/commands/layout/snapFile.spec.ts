import { describe, expect, it } from 'vitest';
import { type Grid, toBits } from '../../../commands/layout/grid';
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

  it('pins the capture-to-file round trip for a density in the ink-threshold danger band', () => {
    // 9.7 is a raw per-cell density in the danger band: it sits just under
    // INK_THRESHOLD (10), so toBits reads it as empty, but Math.round(9.7) is
    // exactly 10, which toBits reads as filled. capture.ts's averageHash now
    // rounds every cell with Math.round before handing the grid to
    // matchLayout, so `original` models what a live capture actually holds
    // post-fix. serialize() has always rounded densities for the file (the
    // format is hex bytes, it has no fractional representation), so a
    // reference written from that same raw 9.7 lands on 10 too. Without the
    // capture.ts rounding, `original` would still carry the bare 9.7 (empty)
    // while `parsed` would read 10 (filled): an unchanged page would then
    // disagree with its own reference on the very next run. This pins that,
    // with the fix, the two agree.
    const original: Grid = { cells: [Math.round(9.7), 50], rows: 1, cols: 2 };
    const text = serialize({
      hash: 'abcd',
      size: '10x10',
      viewport: '1280x800',
      grid: { cells: [9.7, 50], rows: 1, cols: 2 },
    });
    const parsed = parse(text);

    expect(toBits(original)).toEqual(toBits(parsed.grid));
  });
});
