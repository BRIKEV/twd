# twd-js Command Pacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a recorded twd-cli run space out its commands so the video is watchable, without touching normal test runs.

**Architecture:** One new module (`src/pace.ts`) holds a single number and exposes it through a `window.__twdSetPace` tooling global. Two existing files gain an `await pace()` after actions they already perform asynchronously. The user-event proxy additionally routes through a cached `setup({ delay })` instance when paced, so keystrokes are spaced too.

**Tech Stack:** TypeScript, Vitest with jsdom, `@testing-library/user-event` 14.6.1.

Spec: `specs/2026-07-28-twd-js-command-pacing-design.md`

## Global Constraints

- Repo is `/Users/kevinccbsg/brikev/twd`. This plan does NOT touch `twd-cli`; that is a separate plan.
- **A normal test run must be unaffected.** No timers, no promise allocations, no behavior change when pacing is off.
- **No public API may become asynchronous.** `should()`, `twd.setInputValue()` and the `screenDom` proxy are synchronous today and must stay that way.
- **`setPace` must NOT be exported from `src/index.ts`** and must not appear on the public `twd` object. A documented API method could be left in a spec file and would silently slow every future CI run.
- Exact values from the spec: `MAX_PACE_MS = 5000`, key delay is `Math.min(60, Math.round(paceMs / 10))`, and invalid input (non-number, `NaN`, negative, zero) means a pace of `0`.
- Tests live in `src/tests/` mirroring the source tree, named `*.spec.ts`, using Vitest.
- Conventional Commits.
- **Commit messages must NOT contain any `Co-Authored-By` trailer or Claude Code attribution.** End the message at its last content line.
- Do not use em-dashes in code, comments, prose, or commit messages.
- Do not add public documentation for `__twdSetPace`. It is deliberately not public API; documenting it would undercut the design.

## File Structure

| File | Responsibility |
|---|---|
| `src/pace.ts` (new) | Owns the pace value, derives the key delay, exposes the window hook. |
| `src/global.d.ts` (modify) | Declares `__twdSetPace` beside the other globals. |
| `src/proxies/userEvent.ts` (modify) | Pauses after interactions; routes through a paced setup instance. |
| `src/commands/visit.ts` (modify) | Pauses after navigation. |
| `src/tests/pace.spec.ts` (new) | The module's behavior and the zero-cost invariant. |
| `src/tests/proxies/userEventPacing.spec.ts` (new) | Proxy wiring, against a mocked user-event library. |

---

### Task 1: The pace module

**Files:**
- Create: `src/pace.ts`
- Modify: `src/global.d.ts`
- Test: `src/tests/pace.spec.ts`

**Interfaces:**
- Consumes: `wait` from `src/utils/wait.ts` (existing: `wait(time: number): Promise<void>`).
- Produces:
  - `setPace(ms: unknown): number` returns the value actually applied after validation and clamping
  - `getKeyDelay(): number`
  - `getPaceGeneration(): number` increments on every `setPace` call, so consumers can invalidate cached state
  - `pace(): void | Promise<void>` returns `undefined` synchronously when disabled
  - `window.__twdSetPace` bound to `setPace`

- [ ] **Step 1: Write the failing test**

Create `src/tests/pace.spec.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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
    const pending = Promise.resolve(pace()).then(() => { resolved = true; });

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

  // Task 3 caches a user-event instance built from the key delay. Keying that
  // cache on the delay alone is not enough, because setting the same value
  // twice must still invalidate. The generation makes invalidation exact.
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest --run src/tests/pace.spec.ts`
Expected: FAIL, cannot resolve `../pace`.

- [ ] **Step 3: Implement the module**

Create `src/pace.ts`:

```ts
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
  paceMs =
    typeof ms === 'number' && Number.isFinite(ms) && ms > 0
      ? Math.min(ms, MAX_PACE_MS)
      : 0;
  keyDelayMs = paceMs ? Math.min(MAX_KEY_DELAY_MS, Math.round(paceMs / 10)) : 0;
  generation += 1;
  return paceMs;
};

/**
 * Bumped by every setPace call, so consumers holding derived state can tell it
 * is stale. Keying such a cache on the delay alone is not enough: setting the
 * same value twice must still invalidate.
 */
export const getPaceGeneration = (): number => generation;

/**
 * The per-keystroke delay derived from the pace.
 *
 * A separate, much smaller scale is unavoidable: user-event applies `delay`
 * uniformly, so reusing the pace itself would put half a second between every
 * character.
 */
export const getKeyDelay = (): number => keyDelayMs;

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
```

- [ ] **Step 4: Declare the global**

In `src/global.d.ts`, add to the `Window` interface alongside the existing entries:

```ts
    __twdSetPace?: (ms: unknown) => number;
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest --run src/tests/pace.spec.ts`
Expected: PASS.

- [ ] **Step 6: Run the full suite**

Run: `npx vitest --run`
Expected: PASS, no previously passing test broken.

- [ ] **Step 7: Commit**

```bash
git add src/pace.ts src/global.d.ts src/tests/pace.spec.ts
git commit -m "feat(pace): add the command pacing module and window hook"
```

---

### Task 2: Pause after actions

Adds the between-action beat. This is the part that makes a recorded run watchable.

**Files:**
- Modify: `src/proxies/userEvent.ts`
- Modify: `src/commands/visit.ts`
- Test: `src/tests/proxies/userEventPacing.spec.ts`

**Interfaces:**
- Consumes: `pace` from `src/pace.ts` (Task 1), `setPace` in tests.
- Produces: nothing new. Both files keep their existing exports and signatures.

- [ ] **Step 1: Write the failing test**

Create `src/tests/proxies/userEventPacing.spec.ts`. The user-event library is mocked so the test asserts wiring rather than real event timing, which is already covered by the existing `userEvent.spec.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const instanceApi = {
  click: vi.fn().mockResolvedValue(undefined),
  type: vi.fn().mockResolvedValue(undefined),
  clear: vi.fn().mockResolvedValue(undefined),
  keyboard: vi.fn().mockResolvedValue(undefined),
};

const directApi = {
  click: vi.fn().mockResolvedValue(undefined),
  type: vi.fn().mockResolvedValue(undefined),
  clear: vi.fn().mockResolvedValue(undefined),
  keyboard: vi.fn().mockResolvedValue(undefined),
};

const setupMock = vi.fn(() => instanceApi);

vi.mock('@testing-library/user-event', () => ({
  default: { ...directApi, setup: setupMock },
}));

vi.mock('../../pace', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../pace')>();
  return { ...actual, pace: vi.fn() };
});

import { userEvent } from '../../proxies/userEvent';
import { setPace, pace } from '../../pace';

describe('userEvent pacing', () => {
  let input: HTMLInputElement;

  beforeEach(() => {
    vi.clearAllMocks();
    setPace(0);
    input = document.createElement('input');
    document.body.appendChild(input);
  });

  afterEach(() => {
    setPace(0);
    input.remove();
  });

  it('paces after an interaction', async () => {
    await userEvent.click(input);
    expect(pace).toHaveBeenCalledTimes(1);
  });

  it('paces after typing', async () => {
    await userEvent.type(input, 'hello');
    expect(pace).toHaveBeenCalledTimes(1);
  });

  it('paces after clearing', async () => {
    await userEvent.clear(input);
    expect(pace).toHaveBeenCalledTimes(1);
  });

  it('paces after keyboard input', async () => {
    input.focus();
    await userEvent.keyboard('abc');
    expect(pace).toHaveBeenCalledTimes(1);
  });

  it('does not pace on setup, which performs no action', () => {
    userEvent.setup();
    expect(pace).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest --run src/tests/proxies/userEventPacing.spec.ts`
Expected: FAIL, `pace` is never called.

- [ ] **Step 3: Add the shared helper to the userEvent proxy**

In `src/proxies/userEvent.ts`, add the import and a helper above `createLoggedProxy`:

```ts
import { pace } from '../pace';
```

```ts
/**
 * Logs the command and then holds, so a recorded run shows the result of the
 * action before moving on. `pace()` is a no-op when pacing is off.
 */
async function logAndPace(prefix: string, prop: string | symbol, args: any[]) {
  log(eventsMessage(prefix, prop, args));
  await pace();
}
```

- [ ] **Step 4: Route every action path through the helper**

In `src/proxies/userEvent.ts`, replace each `log(eventsMessage(prefix, prop, args));` with `await logAndPace(prefix, prop, args);` in these seven places:

1. the `type` fallback path
2. the `type` normal path
3. the `clear` fallback path
4. the `clear` normal path
5. the `keyboard` fallback path (the one after `flushText()`, not the early return)
6. the `keyboard` normal path
7. the generic wrapper at the bottom

Leave the `keyboard` early return that fires when there is no active element as a plain `log(...)` call. It performed no action, so there is nothing to hold on.

Do not touch the `setup` branch.

- [ ] **Step 5: Pace after navigation**

In `src/commands/visit.ts`, add the import and a hold at the very end of `visit`:

```ts
import { pace } from '../pace';
```

```ts
  window.history.pushState({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
  await wait(DELAY);
  await pace();
};
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest --run src/tests/proxies/userEventPacing.spec.ts`
Expected: PASS.

- [ ] **Step 7: Run the full suite**

Run: `npx vitest --run`
Expected: PASS. The existing `src/tests/proxies/userEvent.spec.ts` must be unchanged and still green, since pacing defaults to off.

- [ ] **Step 8: Commit**

```bash
git add src/proxies/userEvent.ts src/commands/visit.ts src/tests/proxies/userEventPacing.spec.ts
git commit -m "feat(pace): hold after interactions and navigation when paced"
```

---

### Task 3: Space out keystrokes

Adds the within-action delay. user-event applies its `delay` option at config level, in `wrapAndBindImpl` (`setup/setup.js:86`) after every API method, plus between keystrokes, pointer actions and option selections. So the delay is applied by routing through a setup instance rather than by merging options into each call, which also sidesteps `clear(element)` being the one direct API method that accepts no options.

**Files:**
- Modify: `src/proxies/userEvent.ts`
- Test: `src/tests/proxies/userEventPacing.spec.ts`

**Interfaces:**
- Consumes: `getKeyDelay` from `src/pace.ts` (Task 1).
- Produces: nothing new. The `userEvent` export keeps its type and shape.

- [ ] **Step 1: Write the failing test**

Append to `src/tests/proxies/userEventPacing.spec.ts`, inside the existing file (the mocks at the top already cover this):

```ts
describe('userEvent key delay', () => {
  let input: HTMLInputElement;

  beforeEach(() => {
    vi.clearAllMocks();
    setPace(0);
    input = document.createElement('input');
    document.body.appendChild(input);
  });

  afterEach(() => {
    setPace(0);
    input.remove();
  });

  it('uses the direct API and creates no instance when pacing is off', async () => {
    await userEvent.click(input);

    expect(setupMock).not.toHaveBeenCalled();
    expect(directApi.click).toHaveBeenCalledTimes(1);
    expect(instanceApi.click).not.toHaveBeenCalled();
  });

  it('routes through a setup instance carrying the derived delay when paced', async () => {
    setPace(500);

    await userEvent.click(input);

    expect(setupMock).toHaveBeenCalledWith({ delay: 50 });
    expect(instanceApi.click).toHaveBeenCalledTimes(1);
    expect(directApi.click).not.toHaveBeenCalled();
  });

  it('reuses the cached instance across calls at the same pace', async () => {
    setPace(500);

    await userEvent.click(input);
    await userEvent.click(input);

    expect(setupMock).toHaveBeenCalledTimes(1);
  });

  // A plain `instance ??= setup(...)` would keep the stale 50ms delay here.
  it('rebuilds the instance when the pace changes', async () => {
    setPace(500);
    await userEvent.click(input);

    setPace(200);
    await userEvent.click(input);

    expect(setupMock).toHaveBeenCalledTimes(2);
    expect(setupMock).toHaveBeenNthCalledWith(1, { delay: 50 });
    expect(setupMock).toHaveBeenNthCalledWith(2, { delay: 20 });
  });

  it('merges the derived delay into an explicit setup() call', () => {
    setPace(500);

    userEvent.setup();

    expect(setupMock).toHaveBeenCalledWith({ delay: 50 });
  });

  it('lets a caller-supplied delay win over the derived one', () => {
    setPace(500);

    userEvent.setup({ delay: 5 });

    expect(setupMock).toHaveBeenCalledWith(expect.objectContaining({ delay: 5 }));
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest --run src/tests/proxies/userEventPacing.spec.ts -t "key delay"`
Expected: FAIL, `setupMock` is never called with a delay.

- [ ] **Step 3: Add the cached paced instance**

In `src/proxies/userEvent.ts`, add the import and the cache above `createLoggedProxy`:

```ts
import { pace, getKeyDelay, getPaceGeneration } from '../pace';
```

```ts
// Keyed on the pace generation, not on the delay. A plain `cached ??= ...`
// would keep a stale delay forever, and keying on the delay alone would miss
// the case where the same value is set twice.
let cachedPaced: { generation: number; user: any } | null = null;

/**
 * The implementation to call for `prop`.
 *
 * When paced, this is a user-event setup instance carrying the derived delay.
 * user-event applies `delay` at config level, so one instance covers every
 * method uniformly, including `clear`, which takes no options via the direct
 * API. Returns null when pacing is off so the direct API is used untouched.
 */
function pacedImpl(prop: string | symbol): ((...args: any[]) => any) | null {
  const delay = getKeyDelay();
  if (!delay) {
    cachedPaced = null;
    return null;
  }

  const generation = getPaceGeneration();
  if (!cachedPaced || cachedPaced.generation !== generation) {
    cachedPaced = { generation, user: userEventLib.setup({ delay }) };
  }

  const fn = cachedPaced.user[prop];
  return typeof fn === 'function' ? fn.bind(cachedPaced.user) : null;
}
```

- [ ] **Step 4: Use it in the action paths**

In `src/proxies/userEvent.ts`, only in the **root** proxy (`prefix === 'userEvent'`), pick the implementation at call time. In the `type`, `clear`, `keyboard` and generic wrappers, replace the non-fallback `orig(...args)` call with:

```ts
        const impl = prefix === 'userEvent' ? pacedImpl(prop) ?? orig : orig;
        const result = await impl(...args);
```

Do not route the fallback paths. They bypass user-event entirely and write the value with a native setter, so there is no delay to apply.

Do not route instance proxies (`prefix === 'userEvent.instance'`). Those already carry their own config from the `setup()` call that created them, and re-routing would discard it.

- [ ] **Step 5: Merge the delay into explicit setup() calls**

In the `setup` branch of `createLoggedProxy`, spread the caller's options last so an explicit `delay` wins:

```ts
      if (prop === 'setup') {
        return (...args: any[]) => {
          const delay = getKeyDelay();
          const instance = delay
            ? orig({ delay, ...(args[0] || {}) })
            : orig(...args);
          return createLoggedProxy(instance, `${prefix}.instance`);
        };
      }
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest --run src/tests/proxies/userEventPacing.spec.ts`
Expected: PASS, all tests in the file.

- [ ] **Step 7: Run the full suite**

Run: `npx vitest --run`
Expected: PASS. `src/tests/proxies/userEvent.spec.ts` uses the real library with pacing off, so it must be untouched and green.

- [ ] **Step 8: Commit**

```bash
git add src/proxies/userEvent.ts src/tests/proxies/userEventPacing.spec.ts
git commit -m "feat(pace): space keystrokes via a cached user-event instance"
```

---

## Manual verification

The automated tests mock the user-event library, so one real check is worth doing in `examples/twd-test-app`, which imports directly from source:

```bash
cd examples/twd-test-app
npm run dev
```

In the browser console:

```js
window.__twdSetPace(600)
```

Then run a test from the sidebar. Expected: visible pauses after each click, and text appearing character by character rather than all at once. Then `window.__twdSetPace(0)` and re-run: the test should run at full speed again with no pauses.

## Behavior to accept, not work around

The direct API builds a fresh `System` per call, while a setup instance shares pointer and keyboard state across calls, so the pointer stays where the previous action left it. That is the library's own recommended usage and arguably more realistic. It applies only when pacing is on, which only happens inside a recorded run, and recorded runs are already documented as not a substitute for a CI run.

## Not in this plan

The twd-cli side (a `record.pace` config key, a `--record-pace` flag, and the `page.evaluate` call that drives `window.__twdSetPace`) is a separate plan in that repo. This plan is independently testable via the browser console, as described above.

Overlays are out of scope. See the "Overlays, considered and dropped" section of the spec for the constraints found, should they ever be revisited.
