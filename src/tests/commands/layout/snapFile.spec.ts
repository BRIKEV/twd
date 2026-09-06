import { describe, expect, it } from 'vitest';
import type { Grid } from '../../../commands/layout/grid';
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
});
