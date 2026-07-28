# Command pacing for recorded runs - Design

Date: 2026-07-28
Status: Ready to plan
Repos: `twd` (twd-js, the pacing hook) and `twd-cli` (one config key and one call)

## Problem

`twd-cli` can now record a video of a test run. See
`twd-cli/docs/superpowers/specs/2026-07-27-cli-video-recording-design.md`.

The recording is correct but too fast to watch. Measured on `twd-vue-example`:
two tests produced a 1.17 second clip. That is the honest execution time, and no
amount of work inside twd-cli can change it.

`record.speed` exists as a stopgap, but it is an ffmpeg `setpts` filter applied
after the fact. It stretches the timeline uniformly without adding frames, so the
effective frame rate falls in proportion. Measured: identical page activity at
`speed: 1` gives 1.00s at 30fps, at `0.5` gives 1.90s at 15.3fps, at `0.25` gives
3.90s at 7.7fps. It slows the dead air exactly as much as the interesting
moments, and it costs frame rate to do it.

TWD's commands execute as JavaScript inside the page, so TWD owns its own command
loop. It can space commands deliberately at full frame rate, which is what makes
this different from Cypress and Playwright, where the video is a byproduct of a
driver running at machine speed.

## Primary use case

A watchable clip of a single flow, produced by twd-cli:

```
npx twd-cli run --record --record-pace 500 --test "checkout flow"
```

## Scope

In scope: a pacing hook in twd-js, and the twd-cli change that drives it. Neither
half is useful alone, so they share this spec and ship as two pull requests.

Out of scope: in-page overlays. See "Overlays, considered and dropped".

## Hard constraints

These are the shape of the design, not preferences.

1. **A normal test run must be unaffected.** Not "barely affected". No timers, no
   promise allocations, no behavior change when pacing is off.
2. **No public API may become asynchronous.** Several TWD APIs are synchronous
   today and making them async to fit pacing would be a breaking change.
3. **Pacing must be impossible to enable by accident.** A stray call left in a
   spec file must not be able to slow CI.

## Design

### The pace module

One new file, `src/pace.ts`:

```ts
const MAX_PACE_MS = 5000;

let paceMs = 0;
let keyDelayMs = 0;

/** Tooling hook. Deliberately not exported from src/index.ts. */
export const setPace = (ms: unknown): number => {
  const valid = typeof ms === 'number' && Number.isFinite(ms) && ms > 0;
  paceMs = valid ? Math.min(ms as number, MAX_PACE_MS) : 0;
  keyDelayMs = paceMs ? Math.min(60, Math.round(paceMs / 10)) : 0;
  return paceMs;
};

export const getKeyDelay = (): number => keyDelayMs;

/** Returns undefined synchronously when pacing is off. */
export const pace = (): void | Promise<void> => {
  if (!paceMs) return;
  return wait(paceMs);
};

if (typeof window !== 'undefined') {
  window.__twdSetPace = setPace;
}
```

`wait` is the existing helper in `src/utils/wait.ts`. The window registration
mirrors `window.__testRunner = TestRunner` at `src/runner.ts:386`, so it follows
a pattern twd-cli already consumes rather than inventing one. `__twdSetPace` is
declared in `src/global.d.ts` beside the other globals.

`setPace` returns the value actually applied, so twd-cli can report what took
effect after clamping.

### One number, two scales

The caller passes a single number. The typing delay is derived from it, clamped
at 60ms so a long pace does not make typing crawl.

| `setPace(ms)` | between actions | per keystroke |
|---|---|---|
| `200` | 200ms | 20ms |
| `500` | 500ms | 50ms |
| `2000` | 2000ms | 60ms (clamped) |

Two scales are unavoidable. The library's `delay` is uniform, so a 500ms value
would put 500ms between every keystroke and a ten character field would take five
seconds to fill.

### What gets paced

`await pace()` is added only where the code is **already** asynchronous:

- `src/proxies/userEvent.ts`, at the end of the generic wrapper and of the three
  special-cased wrappers (`type`, `clear`, `keyboard`), after the existing `log`
  call. Not on `setup`, which returns an instance rather than performing an
  action.
- `src/commands/visit.ts`.

The delay goes **after** the action, so the viewer sees its result. A delay
before an action shows a still frame of nothing happening.

### What is deliberately not paced

Recorded here so nobody "completes" it later.

| Not paced | Why |
|---|---|
| `should()` (`twd.ts:319`, `twd.ts:346`) | A synchronous chainable. Pacing it means making it async, a breaking change. |
| `twd.setInputValue()` | Synchronous, same reason. |
| `screenDom.*` (`screenDom.ts:110-113`) | A pass-through proxy: synchronous for `getBy*`, a promise for `findBy*`. No uniform hook, and it is a query. |
| `twd.get` / `getAll` / `waitFor` | Queries do not change the page. Without highlighting, a pause after one is dead air. |
| `twd.wait` / `twd.waitFor` | Already delays. |

### The user-event `delay` option

`@testing-library/user-event` (14.6.1) takes a `delay` config option, and it is
applied in four places, not one:

| Location | Effect |
|---|---|
| `setup/setup.js:86`, inside `wrapAndBindImpl` | a trailing wait after **every** API method |
| `keyboard/index.js:10,24` | between keystrokes |
| `pointer/index.js:26` | between pointer actions |
| `utility/selectOptions.js:77,99` | between option selections |

Because it is config-level, the clean way to apply it is a cached setup instance
rather than merging options into each call. The cache is keyed on the delay so a
second `setPace` call cannot leave a stale instance behind, which a plain
`instance ??= ...` would:

```ts
// module scope in src/proxies/userEvent.ts
let cached: { delay: number; user: UserEvent } | null = null;

const pacedUser = (delay: number): UserEvent => {
  if (!cached || cached.delay !== delay) {
    cached = { delay, user: userEventLib.setup({ delay }) };
  }
  return cached.user;
};
```

Each wrapper then picks its target once:

```ts
const delay = getKeyDelay();
const target = delay ? pacedUser(delay) : userEventLib;
```

That covers every method uniformly, needs no knowledge of per-method argument
positions, and avoids the fact that `clear(element)` is the one direct API method
that accepts no options at all.

For the user-facing `setup()` branch of the proxy, the delay is merged so an
explicit caller option still wins:

```ts
orig({ delay: getKeyDelay(), ...(args[0] || {}) })
```

When pacing is off, the proxy uses the direct API exactly as it does today and
no instance is created.

### Behavior change to accept, not work around

The direct API builds a fresh `System` per call. A setup instance shares pointer
and keyboard state across calls, so the pointer stays where the previous action
left it. That is the library's own recommended usage and arguably more realistic,
but it is a difference.

It applies only when pacing is on, which only happens inside a recorded run, and
recorded runs are already documented as not a substitute for a CI run. Accept it
and document it.

### The zero-cost guarantee

`pace()` returns `undefined` synchronously when disabled: no promise allocated,
no timer scheduled, no `setup()` instance created. The only residue is that
`await undefined` costs one microtask per call site, which is sub-microsecond; a
ten thousand command suite pays single digit milliseconds in total.

This is pinned by test rather than asserted in prose. See Testing.

## Enablement

`window.__twdSetPace(ms)` is the only way in. It is not exported from
`src/index.ts`, so it never appears in the public `twd` object or its published
types.

This was chosen over a public `twd.setPace()` specifically because of constraint
3: a documented API method can be left in a spec file, and every future CI run
would then be slower with no obvious cause. Anyone who wants it interactively can
still call it from the devtools console.

Invalid input (non-numeric, `NaN`, negative, zero) sets the pace to 0 rather than
throwing, and values above `MAX_PACE_MS` are clamped, so a typo cannot hang a run.

## The twd-cli side

A `record.pace` key defaulting to `0`, a `--record-pace <ms>` flag, and one call
placed after `startRecording` and before `holdOpeningFrame`:

```js
if (record.pace) {
  const applied = await page.evaluate((ms) => window.__twdSetPace(ms), record.pace);
  if (applied !== record.pace) {
    console.warn(`Pace clamped to ${applied}ms.`);
  }
}
```

Gated on `record.enabled`, so pacing can only ever happen inside a recorded run.

`record.pace` follows the existing nested-`record` merge in `src/config.js`, and
`--record-pace` joins the existing three flags in `src/parseArgs.js`.

## Risks

**Pacing can hide flakiness.** Half a second between every action makes race
conditions vanish. A paced run is even less representative of CI than a recorded
run already is. This belongs next to the existing non-determinism warning in the
twd-cli README, not buried.

**Pacing can exceed `protocolTimeout`.** A chunk is `chunkSize` tests (default 10)
inside a single `page.evaluate`, bounded by `protocolTimeout` (default 300000ms).
Ten tests at twenty actions each with a 500ms pace is 100 seconds of pure pacing
in one chunk, before the tests do any work of their own. The guidance is to pace
with a `--test` filter. For a paced full-suite run, raise `protocolTimeout` or
lower `chunkSize`.

**The focus fallback bypasses the key delay.** `src/proxies/userEvent.ts` falls
back to a native-setter path when `document.visibilityState === 'hidden'` or
`document.hasFocus()` is false, which writes the whole value in one shot. Those
paths still get the between-action `pace()`, but `keyDelay` cannot apply.
Measured: Puppeteer reports `visibilityState: 'visible'` and `hasFocus: true` in
both headless and headed mode, so this does not affect recordings. It would
affect the twd-relay workflow, where nothing is being recorded.

## Overlays, considered and dropped

The earlier draft proposed in-page overlays: highlight the element being acted
on, flash the assertion target, render the current step as a caption.

Dropped for v1, because overlays and query-pacing stand or fall together. The
only reason to pause after `twd.get()` is to show the viewer what was found, and
without a highlight that pause is a still frame of nothing. Dropping overlays
therefore also removes query pacing, which is most of the surface area.

Constraints found while investigating, preserved in case overlays are revisited:

- Overlays cannot be plain `<body>` children. `twd.get` scopes queries with
  `body > div:not(#twd-sidebar-root) ${selector}` (`twd.ts:313`), so an overlay
  div becomes a candidate ancestor and can pollute `getAll` results. They would
  need a shadow root.
- Overlays interact with twd-cli's framing, which hides `#twd-sidebar-root` and
  zeroes the html margins during capture. Rendering overlays inside the sidebar
  root would hide them too. The two must be designed together.
- Overlay text is already available: the strings passed to `log()` are
  human-readable command descriptions.

## Testing

In `twd` (Vitest, `src/tests/` mirroring the source):

- `setPace` validation: a positive number is stored, values above the ceiling are
  clamped, and `0`, negatives, `NaN`, `undefined` and non-numbers all disable it.
  The return value reports what was applied.
- The derived key delay across the table above, including the 60ms clamp.
- **`pace()` returns `undefined`, not a Promise, when disabled.** This is the
  zero-cost invariant. It fails loudly if someone later makes `pace` an `async`
  function, which would silently allocate a promise on every command.
- `window.__twdSetPace` is registered, and `setPace` is NOT exported from
  `src/index.ts`. The second half is the guard on constraint 3.
- The userEvent proxy delays after an action when paced and does not when not,
  using fake timers rather than real waits.
- The proxy uses the direct API when pacing is off and a setup instance when it
  is on, and a caller-supplied `delay` in `setup()` wins over the derived one.
- Changing the pace mid-session produces an instance with the new delay rather
  than reusing the previous one. This pins the cache-invalidation bug that a
  plain `instance ??= ...` would introduce.

In `twd-cli`, following its one-test-file-per-module convention:

- `config.test.js`: `record.pace` default and partial merge.
- `parseArgs.test.js`: `--record-pace` in both flag forms, and rejection of
  non-numeric values.
- `runTests.test.js`: `__twdSetPace` is called when recording with a pace set,
  not called when the pace is 0, and not called when recording is disabled.

## Open questions

- Whether a good default pace exists, or whether `--record-pace` should stay
  opt-in with no default. Leaning opt-in, since the right value depends on the
  app.
- Whether `twd.viewport()` deserves pacing. It changes layout visibly, but it is
  rare in tests and the wiring is not free.
- Whether pacing should eventually serve an in-browser capture path, which would
  argue for a different enablement surface than a window global.

## Value

The differentiator the recording feature was built for. Cypress and Playwright
can only stretch a video after the fact, losing frame rate as they go. TWD owns
the in-page command loop, so it can space the execution itself and produce a
watchable clip at full frame rate, from tests the user already has.
