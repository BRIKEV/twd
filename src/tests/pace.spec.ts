import { describe, it, expect, afterEach, vi } from 'vitest';
import { setPace, getKeyDelay, getPaceGeneration, pace } from '../pace';

describe('setPace', () => {
  afterEach(() => {
    setPace(0);
  });

  it('stores and returns a positive pace', () => {
    expect(setPace(500)).toBe(500);
  });

  it('clamps to the 5000ms ceiling so a typo cannot hang a run', () => {
    expect(setPace(99999)).toBe(5000);
  });

  it.each([
    ['zero', 0],
    ['a negative number', -100],
    ['NaN', NaN],
    ['Infinity', Infinity],
    ['undefined', undefined],
    ['null', null],
    ['a string', '500'],
    ['an object', {}],
  ])('treats %s as disabled rather than throwing', (_label, input) => {
    expect(setPace(input)).toBe(0);
    expect(getKeyDelay()).toBe(0);
  });
});

describe('getKeyDelay', () => {
  afterEach(() => {
    setPace(0);
  });

  it.each([
    [200, 20],
    [500, 50],
    [600, 60],
    [2000, 60],
  ])('derives %ims pace into a %ims key delay', (paceMs, expected) => {
    setPace(paceMs);
    expect(getKeyDelay()).toBe(expected);
  });
});

describe('pace', () => {
  afterEach(() => {
    setPace(0);
    vi.useRealTimers();
  });

  // This is the zero-cost invariant. It fails if someone later makes `pace` an
  // `async` function, which would silently allocate a promise on every command.
  it('returns undefined and not a Promise when disabled', () => {
    setPace(0);
    const result = pace();
    expect(result).toBeUndefined();
    expect(result).not.toBeInstanceOf(Promise);
  });

  it('returns a Promise when enabled', () => {
    setPace(500);
    expect(pace()).toBeInstanceOf(Promise);
  });

  it('resolves only after the configured delay', async () => {
    vi.useFakeTimers();
    setPace(500);
    let resolved = false;
    const pending = Promise.resolve(pace()).then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(499);
    expect(resolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(resolved).toBe(true);
  });
});

describe('getPaceGeneration', () => {
  afterEach(() => {
    setPace(0);
  });

  // The userEvent proxy caches a user-event instance built from the key delay.
  // Keying that cache on the delay alone is not enough, because setting the
  // same value twice must still invalidate. The generation makes it exact.
  it('increments on every setPace call, including a repeat of the same value', () => {
    const start = getPaceGeneration();

    setPace(500);
    expect(getPaceGeneration()).toBe(start + 1);

    setPace(500);
    expect(getPaceGeneration()).toBe(start + 2);

    setPace(0);
    expect(getPaceGeneration()).toBe(start + 3);
  });
});

describe('the window hook', () => {
  afterEach(() => {
    setPace(0);
  });

  it('exposes setPace as window.__twdSetPace', () => {
    expect(window.__twdSetPace).toBe(setPace);
    expect(window.__twdSetPace!(300)).toBe(300);
  });
});

describe('public API surface', () => {
  it('does not leak setPace out of the package entry point', async () => {
    const publicApi = await import('../index');
    expect(Object.keys(publicApi)).not.toContain('setPace');
    expect(Object.keys(publicApi)).not.toContain('pace');
  });

  it('does not put setPace on the twd object', async () => {
    const { twd } = await import('../twd');
    expect('setPace' in twd).toBe(false);
  });
});
