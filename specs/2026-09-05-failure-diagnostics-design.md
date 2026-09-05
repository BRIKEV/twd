# Failure diagnostics: say what TWD already knows

**Date:** 2026-09-05
**Status:** proposal / design
**Relates to:** `specs/2026-07-23-waitforrequest-event-driven-design.md` (shares `mockBridge` state; that work made `executed` event-driven, this one reads the resulting counts)

## Problem

When a test fails because the page did not render what was expected, TWD reports only the
Testing Library query error plus a dump of every accessible role on the page. It says nothing
about what TWD itself observed during the test — even though it holds that information.

Real case, from a production SPA. A test fixture was typed as the wrong DTO: the catalog endpoint
returns a nested shape (an id plus a discriminated `options[]` array), the fixture supplied the
_flat_ shape used elsewhere in the same feature for the same concept. The app's mapper does
`dto.options.reduce(...)`, `options` was `undefined`, and it threw.

What the author saw:

```
× Catalog > should list the catalog once the items load
  Unable to find an accessible element with the role "button" and name `/Widget One/`

    Name "":
    <div class="flex h-auto cursor-text items-center justify-center gap-2 py-1.5 …
    --------------------------------------------------
    searchbox:
    Name "Search":
    <input class="w-full min-w-0 border-input transition-[color,box-shadow] …
    --------------------------------------------------
    … (~40 more entries)
```

Three iterations to reach the cause.

## Root cause

Two separate gaps, and only the second is TWD's to fix.

**1. The thrown error was never observable.** The mapper threw inside a TanStack Query
`queryFn`; React Query caught the rejected promise and stored it as query state. The component
rendered `items ?? []`, turning the crash into an empty list.

This matters for the design: the error never reached `console.error`, and it was never an
`unhandledrejection` — the library handled it. Verified in the field: the Vite dev server _does_
forward browser console errors to the terminal (the same session's log contains several other
`[vite] (client) [console.error]` lines), and the `TypeError` is absent from it. **Console scraping
and global error hooks would both have missed this**, on top of console output being noisy in real
browsers (extensions, third-party scripts).

**2. TWD stayed silent about what it did know.** During that test, TWD served three mocked
responses and knew the app's route. `state.counts` in `src/commands/mockBridge.ts` already tracked
`catalog: 1`. Had the failure said so, the author would have known on the first attempt that the
response _was_ delivered and the defect lay downstream of it — which is exactly the deduction the
three iterations were spent on.

The inverse case is more common still: a mock whose URL does not match what the app requests fails
with the same generic "element not found", when `catalog: 0` would name the problem outright.

## Proposed change

Attach a diagnostics snapshot to a failing test, collected from state TWD already owns. No console
reading, no global error hooks, no framework-specific integration.

### New module: `src/utils/diagnostics.ts`

```ts
export interface TestDiagnostics {
  location: string;
  mockRules?: {
    registered: number;
    triggered: number;
    untriggered: string[];
  };
}

export const collectDiagnostics = (): TestDiagnostics => {
  /* reads location + mock state */
};
export const formatDiagnostics = (diagnostics: TestDiagnostics): string[] => {
  /* render lines */
};
```

Two pure functions, shared by both renderers today — but that guarantee is narrower than it
sounds. `executeTests()` (`src/runner-ci.ts`) reads `window.__testRunner`, so it only runs from
**inside** a page context; it is not itself a headless CLI entry point. Every documented headless
path builds its own `onFail` instead of calling `executeTests()`: `twd-cli`'s own inlined `onFail`,
and the Puppeteer scripts in `docs/tutorial/ci-integration.md`, each construct a fresh `TestRunner`
with an `onFail: (test, err) => { ... error: err.message ... }` that never reads `test.diagnostics`.
A `page.evaluate(...)` callback runs as a stringified function inside the browser — it cannot
`import` `formatDiagnostics` from the package. So today the block reaches only a consumer that calls
`executeTests()` directly from in-page code. Closing that gap needs `twd-js` to expose the formatter
to in-page code first — a decision for the maintainer, out of scope here, written up as
`NEXT-DIAGNOSTICS.md` in the `twd-cli` and `twd-relay` repos.

### `src/runner.ts`

`Handler` gains a field beside the existing `logs`:

```ts
export interface Handler {
  // …
  logs: string[];
  diagnostics?: TestDiagnostics;
}
```

Collected in the existing catch:

```ts
} catch (err) {
  lastError = err as Error;
  test.diagnostics = collectDiagnostics();   // <-- before the `after` hooks run
} finally {
  for (const hook of hooks.after) await hook();
}
```

**Ordering is load-bearing.** Collection must happen inside `catch`, before `finally`. TWD's own
docs prescribe clearing mocks in `beforeEach` (`CLAUDE.md`; `docs/api-mocking.md`'s Best Practices
section) — there is no `afterEach`-clearing template. But `docs/api-mocking.md` also shows
`afterEach(() => twd.clearRequestMockRules())` as an equally valid alternative, and any project that
picks it registers exactly the hook this ordering guards against: `hooks.after` runs inside
`finally`, so collecting after the hooks — instead of inside `catch`, before they run — would read
zeroed counts on every failure for a project on that convention.

`onFail(test, error)` keeps its signature — the data rides on the handler, exactly as `logs` does
today, so no consumer breaks.

**Retries: last write wins, on purpose.** `test.diagnostics = undefined` sits beside
`test.logs = []`, inside the per-attempt `try`, right before `test.handler()` runs — not once at the
top of the run method. That placement is what makes a retry-then-pass leave `diagnostics`
`undefined` (the passing attempt's reset is the last write) while a genuine failure keeps its final
attempt's snapshot (the failing attempt's `catch` is the last write). The reset and the collect
therefore live in different branches of the same `try` — success resets it, failure collects it —
and each attempt overwrites whatever the previous attempt left, exactly like `lastError` a few lines
above it: the reported diagnostics always belong to the same attempt as the reported error. Pinned by
`should clear diagnostics from a prior failed attempt once a retry passes`
(`src/tests/runner/diagnostics.spec.ts`).

### `src/commands/mockBridge.ts` — untouched

No new export here. `getRequestMockRules()` and `getRequestCounts()` already existed (from the
`waitForRequest` work this design relates to) and are sufficient: `collectDiagnostics` composes them
directly — deduplicating `getRequestMockRules().map(rule => rule.alias)` into a `Set`, then filtering
those aliases against `getRequestCounts()` for a zero (or missing) count. No `getRuleAliases()`
helper was needed, and none was added.

### Renderers

`src/runner-ci.ts` (`onFail`) calls `formatDiagnostics(test.diagnostics)` and emits the block
**above** the error message — see the Non-goals section below for why that ordering matters.

The sidebar deliberately does **not** render it. The block assumes the reader holds TWD's mocking
model in their head; in a terminal that reader is a CI log or an agent, but in the sidebar it pushes
the one line a human is actually looking for — the assertion message — below a wall of plumbing.
This is a machine-facing diagnostic, so it goes to the machine-facing surfaces only.

## Output rules

The block reports the **signal**, not the data. A page with 15 mocks must not produce 15 lines.

| Condition               | Output                                                                   |
| ----------------------- | ------------------------------------------------------------------------ |
| No rules registered     | `mock rules` row omitted entirely — never `0/0`                          |
| All triggered           | summary only: `3/3 triggered`                                            |
| Exactly one untriggered | inline: `6/7 triggered — catalog never requested`                        |
| Two or more untriggered | list, capped at 5, then `+N more`                                        |
| Always                  | `location` — one line, and it exposes an unexpected redirect immediately |

Per-rule hit counts are deliberately **not** in the default output. They only matter when hunting a
refetch loop, and `twd.getRequestCounts()` is already available inside a test for that.

The block is emitted on **every** failure, including assertion mismatches where mocks are not the
cause. Two lines is cheap, and conditional presence would leave readers unsure whether the block
was missing or merely empty.

### Rendered

All rules fired — the case above:

```
  × Catalog > should list the catalog once the items load

    Unable to find an accessible element with the role "button" and name `/Widget One/`

    ── TWD diagnostics ──────────────────────────────────────
    location    /t-1/settings/catalog
    mock rules  3/3 triggered
    ─────────────────────────────────────────────────────────
```

Reads as: the route is right, every mocked response was delivered, so the defect is downstream of
the response.

One rule never requested, on a page with seven mocks:

```
    ── TWD diagnostics ──────────────────────────────────────
    location    /t-1/settings/catalog
    mock rules  6/7 triggered — catalog never requested
    ─────────────────────────────────────────────────────────
```

Several:

```
    mock rules  4/7 triggered — 3 never requested
                ✗ catalog
                ✗ products
                ✗ connections
```

## Caveat: `mockBridge` state is run-scoped, not test-scoped

`collectDiagnostics` reads `getRequestMockRules()` and `getRequestCounts()` as they stand at the
moment of failure — it does not know where one test ends and the next begins. `mockRequest`
replacing a same-alias rule does not reset `state.counts[alias]`; only `clearRequestMockRules()`
zeroes the counters (see `src/commands/mockBridge.ts`). A project that does not clear mocks between
tests can therefore see a count carried over from an earlier test in the same run — e.g. `3/3
triggered` reported for a test that itself triggered nothing, because an earlier test already hit
that alias and nothing has zeroed it since. That is exactly the wrong deduction this feature exists
to prevent.

This is a caveat of reading `mockBridge`'s existing state, not a bug in this feature: TWD's docs
already prescribe clearing per test (`beforeEach`, primarily — see the ordering note above), and a
project that follows that gets accurate counts. A project that skips it should read the block
skeptically.

## Files touched

| File                       | Change                                                |
| -------------------------- | ----------------------------------------------------- |
| `src/utils/diagnostics.ts` | new — collector + formatter                           |
| `src/runner.ts`            | `Handler.diagnostics`; collect in the `catch`         |
| `src/runner-ci.ts`         | render the diagnostics block, above the error message |

`src/commands/mockBridge.ts` is **not** touched — see above.

Six source files touched across the branch's commits (one of them, `screenReaderMessages.ts`, nets
to no diff after a follow-up revert). And "no public API change" overstates it: `Handler` is
exported from `src/runner.ts` and reaches consumers by design (`onFail(test, err)` hands a `Handler`
to every renderer, including ones outside this package — see `docs/tutorial/ci-integration.md`), so
adding `diagnostics?: TestDiagnostics` to it **is** a change to an exported interface. It is
additive and optional, so no existing consumer breaks — but it is not accurate to say there is no
public API change at all. No new configuration either way.

## Testing

Vitest, mirroring the source layout under `src/tests/`.

`src/tests/utils/diagnostics.spec.ts`

- `collectDiagnostics` against a stubbed `window.__TWD_MOCK_STATE__` and `location`: no rules, all
  triggered, some untriggered
- `formatDiagnostics`: one case per row of the Output rules table

`src/tests/runner/`

- diagnostics are collected when a test fails, and are **not** clobbered by an `afterEach` that
  calls `clearRequestMockRules()` — the ordering guarantee above

`src/tests/runner/ci/executeTests.spec.ts`

- drives the real `onFail` wiring end-to-end — a thrown error inside a `describe`/`it` pair, through
  the runner, through `executeTests()` — and pins the composed shape: the diagnostics block, a
  blank-line separator, then the raw error message. No `src/tests/e2e/` case shipped; this is where
  the coverage promised there actually landed.

## Non-goals

- **Requests that matched no rule.** The highest-value future signal (it would name the exact URL
  the app asked for versus the one that was mocked), but it needs new plumbing in the service
  worker and the bridge. Deliberately out of scope; `collectDiagnostics` is the seam it will slot
  into, and it can be added without touching `runner.ts`.
- **Console capture.** Ruled out above: incomplete for the motivating case, and noisy in real
  browsers.
- **Global error hooks** (`window.onerror`, `unhandledrejection`). Worth doing on their own merits
  — TWD registers neither today — but they would not have caught the case that motivated this, so
  they belong in a separate proposal rather than riding along here.
- **Truncating the accessible-roles dump.** Considered and dropped. The dump is _noise_, not
  misinformation: it never leads to a wrong conclusion, it only costs scrolling. And the
  diagnostics block renders **above** it, so once this ships the reader takes three lines off the
  top and never reaches the dump — which is most of the value a truncation would have delivered,
  for none of the code. The dump also earns its keep occasionally: when an accessible name is
  subtly off (a stray prefix from an `alt`, a trailing space), the full role listing is exactly
  what reveals it, and a cap could hide the one line that matters. Revisit only if the dump is
  still in the way after the block is in.
