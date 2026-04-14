import { describe, it, expect, vi } from 'vitest';
import { waitFor } from '../../utils/waitFor';

describe('waitFor', () => {
  it('resolves immediately when callback passes on first call', async () => {
    const callback = vi.fn();
    await waitFor(callback);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('retries and resolves when callback passes after a few ticks', async () => {
    let count = 0;
    const callback = () => {
      count++;
      if (count < 3) throw new Error('not yet');
    };
    await waitFor(callback, { interval: 10 });
    expect(count).toBe(3);
  });

  it('times out with wrapped error after timeout expires', async () => {
    const callback = () => {
      throw new Error('still failing');
    };
    await expect(
      waitFor(callback, { timeout: 100, interval: 10 })
    ).rejects.toThrow('waitFor timed out after 100ms.');
    await expect(
      waitFor(callback, { timeout: 100, interval: 10 })
    ).rejects.toThrow('Last error: still failing');
  });

  it('includes custom message in timeout error', async () => {
    const callback = () => {
      throw new Error('nope');
    };
    await expect(
      waitFor(callback, { timeout: 100, interval: 10, message: 'button to be enabled' })
    ).rejects.toThrow('waitFor timed out after 100ms waiting for: button to be enabled.');
  });

  it('works with async callbacks', async () => {
    let count = 0;
    const callback = async () => {
      count++;
      if (count < 2) throw new Error('not yet');
    };
    await waitFor(callback, { interval: 10 });
    expect(count).toBe(2);
  });

  it('handles non-Error throws by wrapping them', async () => {
    const callback = () => {
      throw 'string error';
    };
    await expect(
      waitFor(callback, { timeout: 100, interval: 10 })
    ).rejects.toThrow('Last error: string error');
  });

  it('respects custom timeout and interval options', async () => {
    const start = Date.now();
    const callback = () => {
      throw new Error('fail');
    };
    try {
      await waitFor(callback, { timeout: 200, interval: 50 });
    } catch {
      // expected
    }
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(180); // allow some leeway
    expect(elapsed).toBeLessThan(400);
  });

  it('calls callback immediately with no initial delay', async () => {
    const timestamps: number[] = [];
    const start = Date.now();
    let count = 0;
    const callback = () => {
      timestamps.push(Date.now() - start);
      count++;
      if (count < 2) throw new Error('not yet');
    };
    await waitFor(callback, { interval: 50 });
    // First call should happen immediately (within a few ms of start)
    expect(timestamps[0]).toBeLessThan(20);
  });

  it('uses default timeout of 2000ms and interval of 50ms', async () => {
    const start = Date.now();
    const callback = () => {
      throw new Error('fail');
    };
    try {
      await waitFor(callback);
    } catch {
      // expected
    }
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(1800);
    expect(elapsed).toBeLessThan(3000);
  });
});
