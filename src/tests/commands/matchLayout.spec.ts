import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Grid } from '../../commands/layout/grid';

vi.mock('../../commands/layout/capture', () => ({
  captureNode: vi.fn(),
}));
vi.mock('../../commands/layout/overlay', () => ({
  renderFailureImage: vi.fn(() => 'data:image/png;base64,AAAA'),
}));

// vi.mock is hoisted above every import, and its factory runs while
// matchLayout's own imports are being resolved. A plain `const logged` declared
// below would still be in its temporal dead zone at that moment, so the factory
// must take it from vi.hoisted instead.
const { logged } = vi.hoisted(() => ({ logged: [] as string[] }));

vi.mock('../../utils/log', () => ({
  log: (message: string) => logged.push(message),
}));

import { captureNode } from '../../commands/layout/capture';
import { matchLayout } from '../../commands/matchLayout';
import { serialize } from '../../commands/layout/snapFile';

const gridOf = (rows: string[]): Grid => ({
  cells: rows.flatMap((row) => [...row].map((char) => (char === '#' ? 50 : 0))),
  rows: rows.length,
  cols: rows[0].length,
});

const REFERENCE_GRID = gridOf(['##..', '..##']);
const MOVED_GRID = gridOf(['####', '####']);

const capture = (grid: Grid, size: string) => ({
  canvas: {} as HTMLCanvasElement,
  hash: 'abcd',
  grid,
  background: '#ffffff',
  size,
});

const referenceSnap = (viewport: string, size = '577x512') =>
  serialize({ hash: 'abcd', size, viewport, grid: REFERENCE_GRID });

/** Fake the plugin: GET returns `snap`, POST records what was written. */
function stubPlugin(snap: string | null) {
  const posted: Record<string, unknown>[] = [];
  const fetchMock = vi.fn((url: string, init?: RequestInit) => {
    const body =
      init?.method === 'POST'
        ? (posted.push(JSON.parse(init.body as string)), { ok: true, written: ['landing.snap'] })
        : { exists: snap !== null, snap, dir: '__twd_snapshots__' };
    return Promise.resolve(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
  });
  vi.stubGlobal('fetch', fetchMock);
  return posted;
}

beforeEach(() => {
  logged.length = 0;
  vi.mocked(captureNode).mockResolvedValue(capture(REFERENCE_GRID, '577x512'));
  window.__TWD_SNAPSHOTS__ = true;
  window.__TWD_UPDATE_SNAPSHOTS__ = undefined;
  window.__TWD_SNAPSHOT_CI__ = undefined;
  window.innerWidth = 1280;
  window.innerHeight = 800;
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete window.__TWD_SNAPSHOTS__;
  delete window.__TWD_UPDATE_SNAPSHOTS__;
  delete window.__TWD_SNAPSHOT_CI__;
});

describe('the gate', () => {
  it('does nothing at all when snapshots are not enabled', async () => {
    window.__TWD_SNAPSHOTS__ = undefined;
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await matchLayout(document.createElement('div'), 'landing');

    expect(fetchMock).not.toHaveBeenCalled();
    expect(captureNode).not.toHaveBeenCalled();
    expect(logged.join('\n')).toContain('twd-cli');
  });
});

describe('creating a reference', () => {
  it('writes the snapshot and passes when there is none', async () => {
    const posted = stubPlugin(null);

    await matchLayout(document.createElement('div'), 'landing');

    expect(posted[0].snap).toContain('viewport 1280x800');
    expect(logged.join('\n')).toContain('saved');
  });

  it('fails instead of creating a reference under CI', async () => {
    window.__TWD_SNAPSHOT_CI__ = true;
    const posted = stubPlugin(null);

    await expect(matchLayout(document.createElement('div'), 'landing')).rejects.toThrow(
      /never creates one/,
    );
    expect(posted).toHaveLength(0);
  });
});

describe('comparing against a reference', () => {
  it('passes silently when nothing moved', async () => {
    const posted = stubPlugin(referenceSnap('1280x800'));

    await matchLayout(document.createElement('div'), 'landing');

    expect(posted).toHaveLength(0);
    expect(logged).toEqual([]);
  });

  it('fails and writes the failure capture when the rows moved', async () => {
    vi.mocked(captureNode).mockResolvedValue(capture(MOVED_GRID, '577x512'));
    const posted = stubPlugin(referenceSnap('1280x800'));

    await expect(matchLayout(document.createElement('div'), 'landing')).rejects.toThrow(
      /Layout snapshot "landing" changed/,
    );
    expect(posted[0].png).toBe('data:image/png;base64,AAAA');
    expect(posted[0].suffix).toBe('.failed');
    expect(posted[0].snap).toBeUndefined();
  });

  it('fails on a size change even when every row still pairs', async () => {
    // A 20px line of text fits inside one cell and does not move its average,
    // so with bits alone adding a note gives distance 0. Size is its own signal.
    vi.mocked(captureNode).mockResolvedValue(capture(REFERENCE_GRID, '577x532'));
    stubPlugin(referenceSnap('1280x800'));

    await expect(matchLayout(document.createElement('div'), 'landing')).rejects.toThrow(
      /the block height changed, 577x512 -> 577x532/,
    );
  });
});

describe('the viewport guard', () => {
  it('skips rather than failing when the viewport does not match', async () => {
    vi.mocked(captureNode).mockResolvedValue(capture(MOVED_GRID, '577x512'));
    stubPlugin(referenceSnap('1920x1080'));

    await matchLayout(document.createElement('div'), 'landing');

    expect(logged.join('\n')).toContain('viewport mismatch');
  });

  it('fails on a viewport mismatch under CI so snapshots cannot silently skip forever', async () => {
    window.__TWD_SNAPSHOT_CI__ = true;
    stubPlugin(referenceSnap('1920x1080'));

    await expect(matchLayout(document.createElement('div'), 'landing')).rejects.toThrow(
      /viewport mismatch/,
    );
  });

  it('compares anyway when the reference predates viewport recording', async () => {
    const legacy = ['hash abcd', 'size 577x512', 'rows 2', 'cols 4', 'grid 3232000000003232'].join(
      '\n',
    );
    stubPlugin(legacy);

    await matchLayout(document.createElement('div'), 'landing');

    expect(logged.join('\n')).not.toContain('viewport mismatch');
  });
});

describe('the update flag', () => {
  it('rewrites the reference and says so out loud', async () => {
    window.__TWD_UPDATE_SNAPSHOTS__ = true;
    vi.mocked(captureNode).mockResolvedValue(capture(MOVED_GRID, '577x512'));
    const posted = stubPlugin(referenceSnap('1280x800'));

    await matchLayout(document.createElement('div'), 'landing');

    expect(posted[0].snap).toBeDefined();
    expect(logged.join('\n')).toContain('updated');
    expect(logged.join('\n')).not.toContain('saved');
  });

  it('does not outrank CI when the reference is missing', async () => {
    window.__TWD_UPDATE_SNAPSHOTS__ = true;
    window.__TWD_SNAPSHOT_CI__ = true;
    const posted = stubPlugin(null);

    await expect(matchLayout(document.createElement('div'), 'landing')).rejects.toThrow(
      /never creates one/,
    );
    expect(posted).toHaveLength(0);
  });
});

describe('the snapshot name', () => {
  it('rejects a name that would not survive becoming a file path', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(matchLayout(document.createElement('div'), '///')).rejects.toThrow(
      /snapshot name/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
