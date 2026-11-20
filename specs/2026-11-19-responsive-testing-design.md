# Responsive testing - Design

Date: 2026-11-19
Status: Implemented (twd-js). twd-cli loop pending.
Issue: https://github.com/BRIKEV/twd/issues/444
Affected repos: `twd` (twd-js core + sidebar UI). `twd-cli` is out of scope for
this round; section 9 only defines the hook it will use.

## 1. Problem

TWD tests run inside the real browser window, next to the app. Today that
effectively means desktop only:

- **The layout breaks at small widths.** The sidebar makes room by setting a
  margin on `<html>` (`src/ui/hooks/useLayout.ts`). Media queries ignore that
  margin and keep measuring the full window, so in a 400px window the app gets
  ~80px of real space while its CSS believes it has 400px.
- **There is no way to say which width a test is for.** Resize to mobile and
  "Run All" runs every desktop test against the mobile layout.
- **We cannot change the viewport from a test.** The test shares the window
  with the developer. A `viewport` command was tried and does not fit the model.

Goal: build desktop and mobile in the same dev loop, with each test running
where it belongs, and the same metadata later driving real viewports in
`twd-cli`.

## 2. Principles

1. **The browser window is the selector.** We never pretend a different width.
   Resizing the window (or DevTools device mode) is how you switch viewport.
2. **Match what CSS sees.** A test matches when `window.matchMedia` says so,
   the same rule the app's own media queries follow.
3. **Breakpoints live in one place.** Tests reference names, never numbers.
4. **No breaking change.** A project that declares nothing behaves as today.
5. **Never move the page during a run.** Anything the sidebar does mid-run must
   not reflow the app under test.

## 3. Declaring viewports

Viewports are registered once, in a registry kept on
`window.__TWD_VIEWPORTS__` (the same pattern as pacing), so every copy of
twd-js in the page (the bundled sidebar, the runner the test files import,
`runner-ci`, `twd-relay`) sees the same one.

```ts
// Bundled setup
initTWD(tests, {
  viewports: {
    mobile:  { maxWidth: 767 },
    tablet:  { minWidth: 768, maxWidth: 1023 },
    desktop: { minWidth: 1024 },
  },
  defaultViewport: 'desktop', // optional
});

// Standard (React) setup, before initTests
import { defineViewports } from 'twd-js/runner';
defineViewports(
  { mobile: { maxWidth: 767 }, desktop: { minWidth: 1024 } },
  { default: 'desktop' },
);
```

`initTWD` simply forwards to `defineViewports`, and the `twd()` Vite plugin
serializes both options into its `initTWD` call. `initTests` keeps its current
positional signature untouched.

### Types

```ts
interface ViewportDefinition {
  minWidth?: number; // px, inclusive
  maxWidth?: number; // px, inclusive
}
type Viewports = Record<string, ViewportDefinition>;
```

- At least one of `minWidth` / `maxWidth` is required. Numbers only, in CSS px.
  No units, no free media query strings: `twd-cli` needs something it can turn
  into a real size, and inclusive px bounds map 1:1 to `min-width` /
  `max-width` media features.
- Names follow `[a-z][a-z0-9-]*` so they are safe in labels, storage keys and
  CLI flags.
- Ranges may overlap. A test tagged `['tablet', 'desktop']` is legitimate.
- Calling `defineViewports` again replaces the registry (HMR friendly).
- An invalid definition (no bounds, `minWidth > maxWidth`, bad name) throws at
  registration, so it fails loudly at startup instead of silently at run time.

## 4. Tagging tests

Options go in the **second argument**, the Playwright / Vitest convention. It
reads right next to the name instead of after the test body.

```ts
describe('Header', { viewport: 'mobile' }, () => {
  it('opens burger menu', async () => { ... });
});

it('shows summary as cards', { viewport: ['mobile', 'tablet'] }, async () => { ... });
```

- `viewport: string | string[]`.
- The current two-argument form keeps working. The runner tells the forms apart
  by `typeof arg2 === 'function'`.
- `describe.only`, `describe.skip`, `it.only`, `it.skip` accept the same
  options in the same position.
- The options object is typed as `TestOptions` so it can grow later (it is the
  natural home for other per-test metadata), but `viewport` is the only key in
  this design.

### Resolving a test's viewport

The **effective viewport** of a test is the first of:

1. its own `viewport` option,
2. the `viewport` of the nearest ancestor `describe` that has one,
3. `defaultViewport`, if set,
4. none: the test runs at every width.

An `it`-level value **replaces** the inherited one, it does not intersect with
it. Intersection is more "correct" but hard to predict when reading a file;
replacement is what people expect from nested config.

Resolution happens when deciding what to run and what to render, not at
registration, so the registry can be defined after test files load and an HMR
change to breakpoints takes effect without reloading tests.

### Unknown names

Referencing a name that is not in the registry logs one `console.warn` per name
and the test is treated as **never matching**. It stays in place, greyed,
with the badge `unknown: <name>`, so the typo is visible in the sidebar without
breaking the whole suite.

## 5. Matching rule

A test **matches** the current window when its effective viewport is none, or
when `matchMedia` matches any of its viewport names, using the query built from
the definition:

```
{ minWidth: 768, maxWidth: 1023 }  ->  (min-width: 768px) and (max-width: 1023px)
{ maxWidth: 767 }                  ->  (max-width: 767px)
```

- The runner keeps one `MediaQueryList` per viewport and listens for `change`,
  so the sidebar updates live as the window is resized.
- The set of tests a run executes is **frozen at run start**. Resizing during a
  run does not add or remove tests mid-run.
- Because `matchMedia` reports the window width and not the area left by a
  pushing sidebar, this is the same width the app's CSS uses. That is why the
  sidebar must stop pushing at small widths (section 7).

## 6. What runs

| Action | Runs |
|---|---|
| Run All | Matching tests only. The label stays `Run All`: the viewport chip already names the active viewport(s). |
| Run Filtered (search active) | Matching tests that also pass the search filter. |
| Play on a matching test | The test, as today. |
| Play on a non-matching test | The test, plus a warning log prepended to its logs (section 8.4). |
| `.only` | Applies inside the matching set. A non-matching `.only` test does not run in Run All and does not suppress the matching tests. |
| `.skip` | Unchanged. |

When several viewports match at once (overlapping ranges), the chip lists them
in registry order: `tablet, desktop · 900px`.

> Revised during review. The first version also named the viewport on the
> button (`Run All · mobile`). It repeated the chip right below it and made the
> button wrap on narrow sidebars, so the label went back to `Run All`.

## 7. Sidebar layout modes

The sidebar picks its mode automatically from the window width. There is no
toggle.

| Mode | When | Behavior |
|---|---|---|
| **Push** | `innerWidth - sidebarWidth >= 768` (1088px with the default 320px) | As today: `<html>` margin on the sidebar side. |
| **Overlay** | Otherwise | No margin. The sidebar is `position: fixed` on top of the app, width `min(var(--twd-sidebar-width), 100vw - 56px)`. |

- The 56px strip keeps the app visible next to the sidebar at every width, so it
  reads as a panel over the app and not a replacement of it.
- Overlay has a right (or left) border plus a stronger shadow than push mode to
  make the stacking obvious. No backdrop dimming: it is a panel, not a modal.
  No focus trap either, for the same reason.
- The mode is re-evaluated on `resize` (throttled). Switching modes never
  happens during a run (section 8.3 handles that).
- The 768px threshold is a constant for now. Open question in section 11.

## 8. Sidebar UI

Reference mockups (five boards, desktop and mobile states):
https://claude.ai/artifact/1JpTV6xnicdocgXyyjCRsK

### 8.1 Viewport chip

A chip on its own row, between the run buttons and the totals: icon +
`mobile · 390px`. The row also holds the TWD version, aligned right, which
frees room in the run-buttons row on narrow sidebars.

- Updates live on resize. Shows the matching viewport name(s) and the current
  `innerWidth`. With no matching named viewport: `no viewport · 1100px`.
- Hidden when no viewports are defined. The row stays, with only the
  version.
- Accessible name: `Current viewport: mobile, 390 pixels wide`.
- It is a display, not a control. There is no manual selector: picking
  "mobile" in a 1400px window would only produce false failures.

### 8.2 Test list

- **Nothing moves.** Every test keeps its place in its `describe`, in the
  order it was written. A test for another viewport is greyed and carries a
  text badge with its viewport name(s): `desktop`, `tablet, desktop`, or
  `unknown: deskop`. Its play button works as usual.
- A `describe` whose tests are **all** for another viewport is greyed as a
  whole, carries the union of their badges on its header, and starts
  **collapsed**. On a phone with `defaultViewport: 'desktop'`, a large desktop
  suite is one grey line instead of a column of greyed tests. Expanding it is
  not persisted.
- Search filters the tree as usual. The totals in the header count
  **matching tests only**; together with the chip, they explain why a greyed
  test is not run.
- With no viewports defined, nothing is greyed.

> Revised during review. The first version moved non-matching tests to an
> "Other viewports (n)" group at the bottom of the list, keeping their
> `describe` tree. In use it was confusing: a test written in the middle of a
> suite showed up far from its siblings, and the suite's name appeared twice.
> Greying in place keeps the author's structure, and collapsing all-other
> suites keeps the noise down.

### 8.3 Running in overlay mode: the pill

The runner announces every run on `window`, whoever started it:
`twd:run-start` (`{ total }`), `twd:test-end` (`{ status }`) and `twd:run-end`
(always fired, even when a listener throws). The sidebar drives the pill, the
auto-hide and the layout lock from these events, which is how runs started by
`twd-relay` get the same behavior without any relay change.

When a run starts from the sidebar (Run All, Run Filtered or a play button)
**in overlay mode**, the sidebar hides so the person can watch the app, and a
status pill appears:

```
(spinner) TWD 2/3  ✓1 ✗0  [Show]
```

- Bottom corner, on the same side as the sidebar `position`.
- `role="status"`, `aria-live="polite"`. Updates on each test end.
- **Show** reopens the sidebar without stopping the run.
- When the run ends, the sidebar comes back automatically and scrolls to the
  first failure (or stays at the top when everything passed). The pill goes
  away.
- Runs triggered through `twd-relay` follow the same rule: hide only if the
  sidebar is open and in overlay mode. If it was closed, it stays closed and
  no pill appears.
- **Never in push mode.** Hiding a pushing sidebar removes the `<html>`
  margin and reflows the page mid-test, which changes geometry and breaks
  `matchLayout` and any position based assertion.
- While a run is in progress, the layout mode is locked. A resize that crosses
  the threshold is applied after the run ends.

### 8.4 Running a non-matching test

The play button stays enabled. The test runs, and the first log entry is a
warning (new `LogType.VIEWPORT_WARNING`, rendered in the warning color):

```
Written for desktop (min 1024px). Ran at 390px, so layout differences are expected.
```

- The result colors the row as usual, but does not change the header totals,
  which describe the matching set only.
- The button's accessible name includes the viewport:
  `Run shows nav links test, written for desktop`.

### 8.5 Accessibility of greyed tests

"Greyed" is a style, not a reduced-opacity layer:

- Greyed test names and suite headers use `--twd-text-muted` (`#94a3b8` on `#1e293b`,
  about 5.6:1), above the 4.5:1 AA minimum. **No `opacity`**: it would drag
  text, badges and buttons under the minimum and is not themeable.
  On the suite header background (`#0f172a`) it is about 6.9:1. The muted
  color only applies to a test with no pass, fail or skip background.
- The state is never conveyed by color alone: a text badge names the viewport,
  and the play button's accessible name says it (`written for desktop`), as
  does the toggle of a greyed suite (`Expand test suite Header, written for
  desktop`).
- Theme authors get two new tokens, `--twd-viewport-other-text` and
  `--twd-viewport-badge-bg`, defaulting to the values above. The theme docs
  must state the contrast requirement.

### 8.6 A lighter header

Added during review: the header stacked run buttons, chip, totals, speed,
mock rules and search, which was a lot on a 320px overlay.

- The version moved from the run-buttons row to the chip row (8.1).
- The mock rules button (`Rules: 0/0 triggered`) is hidden by default behind a
  new `mockRules` option on `initTWD`, the `twd()` plugin and `TWDSidebar`,
  like `search` and `pace`. Most test writing now happens through an AI agent,
  which reads mocks from code and logs rather than from that button. This is a
  visible change for current users, accepted on purpose: `mockRules: true`
  brings it back.

## 9. Hook for `twd-cli`

`twd` exposes what the CLI needs; the CLI loop itself is a later design.

- `window.__TWD_VIEWPORTS__` holds the registry and `defaultViewport`.
- `Handler` gets an optional `viewport?: string[]` (as declared, not resolved).
  A helper `getEffectiveViewport(handler)` is exported for tools.
- `executeTests()` in `runner-ci` accepts `{ viewport?: string }`:
  - omitted: today's behavior, runs everything that matches the current
    window (so an unchanged CLI against a desktop-sized Puppeteer page keeps
    running desktop and untagged tests);
  - set: runs the tests whose effective viewport includes that name, plus
    untagged tests when no `defaultViewport` is set.

- `TestRunner#viewportScope(options?)` is public: the ids of the tests in
  scope at the current width, or for `{ viewport: name }` without resizing;
  `null` when no viewports are declared. Reachable from the page as
  `new window.__testRunner(events).viewportScope()`.

The CLI flow, as refined for twd-cli: one page load, no reload (a reload mints
new test ids). Run the tests in scope at the configured size, then for each
remaining viewport resize with Puppeteer's `setViewport` and run the tests for
that viewport that have not run yet. **Each test runs once**, so the report
keeps one row per test. `viewportScope()` gives the plan up front and checks,
after each resize, that the width really matches. Because `setViewport`
changes what `matchMedia` reports, the matching rule is identical in both
places. The details live in twd-cli's own design doc.

Known gap: `twd-relay` reports `testCount` in `run:start` from all registered
tests, so with viewports declared it can announce more tests than the run
executes. Fixing it belongs to the relay.

## 10. Out of scope

- The `twd-cli` viewport loop and its config.
- `twd-relay` protocol changes (a `run` message with a viewport). The relay
  keeps working, and runs respect the matching rule.
- Height constraints, orientation, `prefers-*` media features.
- Resizing the window from TWD. Docs will point to DevTools device mode.

## 11. Open questions

1. **Overlay threshold.** Fixed 768px of remaining space, or a theme / init
   option? Starting fixed keeps the surface small.
2. ~~**Header row at ~334px.**~~ Resolved: at 390px the overlay is
   `min(320px, 334px)` = 320px, and "Run All", "Clear mocks" and
   the close button fit on one line (checked in Chrome). The version has
   since moved to the chip row (8.6).
3. **Pill and the last-run marker.** After a single-test run in overlay mode,
   should the sidebar scroll to that test even when it passed? Probably yes, it
   matches the current `twd-last-run-test-name` behavior.

## 12. Testing plan

Tests first, per the repo rule. Vitest + jsdom, mocking `matchMedia`.

- Runner: option parsing in both signatures and all `.only` / `.skip`
  variants; inheritance and replacement; `defaultViewport`; unknown names;
  invalid definitions throw; run set frozen at start.
- Matching: query building from each definition shape; overlapping ranges.
- Sidebar: chip text and hiding; greying in place, suite collapse, counts;
  the set Run All runs; non-matching play adds the warning log
  and leaves totals unchanged; push vs overlay selection by width; pill shown
  only in overlay mode, restores the sidebar at the end; mode locked during a
  run.
- `runner-ci`: `executeTests()` unchanged without options; `{ viewport }`
  selection.
- Manual: `examples/twd-test-app` with a mobile and a desktop test, resizing in
  DevTools device mode.
