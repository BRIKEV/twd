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
*flat* shape used elsewhere in the same feature for the same concept. The app's mapper does
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
`unhandledrejection` — the library handled it. Verified in the field: the Vite dev server *does*
forward browser console errors to the terminal (the same session's log contains several other
`[vite] (client) [console.error]` lines), and the `TypeError` is absent from it. **Console scraping
and global error hooks would both have missed this**, on top of console output being noisy in real
browsers (extensions, third-party scripts).

**2. TWD stayed silent about what it did know.** During that test, TWD served three mocked
responses and knew the app's route. `state.counts` in `src/commands/mockBridge.ts` already tracked
`catalog: 1`. Had the failure said so, the author would have known on the first attempt that the
response *was* delivered and the defect lay downstream of it — which is exactly the deduction the
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

export const collectDiagnostics = (): TestDiagnostics => { /* reads location + mock state */ };
export const formatDiagnostics = (diagnostics: TestDiagnostics): string[] => { /* render lines */ };
```

Two pure functions. `formatDiagnostics` is shared by both renderers so the sidebar and the CLI
cannot drift apart.

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

**Ordering is load-bearing.** Collection must happen inside `catch`, before `finally`. The
`afterEach` in TWD's own setup template calls `twd.clearRequestMockRules()`, which resets
`state.counts`; collecting after the hooks would read zeroes on every failure for those projects.

`onFail(test, error)` keeps its signature — the data rides on the handler, exactly as `logs` does
today, so no consumer breaks.

### `src/commands/mockBridge.ts`

`state` already holds `rules` and `counts`; `getRequestCounts()` is already exported. Add the one
missing read:

```ts
export const getRuleAliases = (): string[] => rules.map((rule) => rule.alias);
```

Untriggered aliases are `getRuleAliases()` minus the keys of `getRequestCounts()` with a count > 0.

### Renderers

`src/runner-ci.ts` (`onFail`, line ~66) and `src/ui/TWDSidebar.tsx` (`onFail`, line ~90) both call
`formatDiagnostics(test.diagnostics)` and emit the block under the error message.

## Output rules

The block reports the **signal**, not the data. A page with 15 mocks must not produce 15 lines.

| Condition | Output |
|---|---|
| No rules registered | `mock rules` row omitted entirely — never `0/0` |
| All triggered | summary only: `3/3 triggered` |
| Exactly one untriggered | inline: `6/7 triggered — catalog never requested` |
| Two or more untriggered | list, capped at 5, then `+N more` |
| Always | `location` — one line, and it exposes an unexpected redirect immediately |

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

## Files touched

| File | Change |
|---|---|
| `src/utils/diagnostics.ts` | new — collector + formatter |
| `src/runner.ts` | `Handler.diagnostics`; collect in the `catch` |
| `src/commands/mockBridge.ts` | export `getRuleAliases()` |
| `src/runner-ci.ts` | render the diagnostics block |
| `src/ui/TWDSidebar.tsx` | render the diagnostics block |

Five files, no public API change, no new configuration.

## Testing

Vitest, mirroring the source layout under `src/tests/`.

`src/tests/utils/diagnostics.spec.ts`
- `collectDiagnostics` against a stubbed `window.__TWD_MOCK_STATE__` and `location`: no rules, all
  triggered, some untriggered
- `formatDiagnostics`: one case per row of the Output rules table

`src/tests/runner/`
- diagnostics are collected when a test fails, and are **not** clobbered by an `afterEach` that
  calls `clearRequestMockRules()` — the ordering guarantee above

`src/tests/ui/`
- the sidebar renders the block under the error message

`src/tests/e2e/`
- a real failing test carries the block through to the CI report

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
- **Truncating the accessible-roles dump.** Considered and dropped. The dump is *noise*, not
  misinformation: it never leads to a wrong conclusion, it only costs scrolling. And the
  diagnostics block renders **above** it, so once this ships the reader takes three lines off the
  top and never reaches the dump — which is most of the value a truncation would have delivered,
  for none of the code. The dump also earns its keep occasionally: when an accessible name is
  subtly off (a stray prefix from an `alt`, a trailing space), the full role listing is exactly
  what reveals it, and a cap could hide the one line that matters. Revisit only if the dump is
  still in the way after the block is in.
