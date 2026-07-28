import { wait } from './utils/wait';

const MAX_PACE_MS = 5000;
const MAX_KEY_DELAY_MS = 60;

let paceMs = 0;
let keyDelayMs = 0;
let generation = 0;

/**
 * Sets the delay inserted after each paced command, in milliseconds.
 *
 * This is a tooling hook for twd-cli, deliberately not exported from
 * src/index.ts. Pacing is only ever wanted inside a recorded run, and a public
 * API method could be left behind in a spec file, silently slowing every future
 * CI run with no obvious cause.
 *
 * Invalid input disables pacing rather than throwing, and large values are
 * clamped, so a typo cannot hang a run.
 *
 * @returns the pace actually applied
 */
export const setPace = (ms: unknown): number => {
  paceMs = typeof ms === 'number' && Number.isFinite(ms) && ms > 0 ? Math.min(ms, MAX_PACE_MS) : 0;
  keyDelayMs = paceMs ? Math.min(MAX_KEY_DELAY_MS, Math.round(paceMs / 10)) : 0;
  generation += 1;
  return paceMs;
};

/**
 * The per-keystroke delay derived from the pace.
 *
 * A separate, much smaller scale is unavoidable: user-event applies `delay`
 * uniformly, so reusing the pace itself would put half a second between every
 * character.
 */
export const getKeyDelay = (): number => keyDelayMs;

/**
 * Bumped by every setPace call, so consumers holding derived state can tell it
 * is stale. Keying such a cache on the delay alone is not enough: setting the
 * same value twice must still invalidate.
 */
export const getPaceGeneration = (): number => generation;

/**
 * Returns undefined synchronously when pacing is off, so a normal run allocates
 * no promise and schedules no timer. Do not make this an async function.
 */
export const pace = (): void | Promise<void> => {
  if (!paceMs) return;
  return wait(paceMs);
};

if (typeof window !== 'undefined') {
  window.__twdSetPace = setPace;
}
