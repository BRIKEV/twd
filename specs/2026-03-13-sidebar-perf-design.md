# Sidebar Performance Optimizations — Design Spec

## Problem

The sidebar search feature (PR #160) introduced performance inefficiencies:

1. **Double `buildTreeFromHandlers` call** — tree is built in `TWDSidebar.tsx` (lines 131-135, for counters/run logic) and again inside `TestList.tsx` (line 128, for rendering).
2. **Missing `useMemo` for per-render derivations** — filtered tree, filtered test IDs, and display counters are recomputed on every render. This matters most for large test suites (500+ tests) where re-renders during search input typing could cause jank.

## Approach

**Memoize & deduplicate** — no new abstractions, no new files, no API changes.

## Changes

### 1. Remove duplicate tree building in TestList

**Current:** `TWDSidebar.tsx` already builds the full tree + filter pipeline (lines 131-151) for run logic and counters. `TestList` receives raw `tests: Test[]` + `searchQuery` and rebuilds the same tree internally.

**After:** `TestList` receives pre-built `roots: Node[]` and only handles rendering + collapse state. Remove `buildTreeFromHandlers` and `filterTree` imports from `TestList.tsx`. Also remove the `.map()` shallow-clone on TWDSidebar line 293 that currently creates the `tests` prop — it becomes unnecessary.

Props change:
```ts
// Before
interface TestListProps {
  tests: Test[];
  runTest: (id: string) => Promise<void>;
  searchQuery?: string;
}

// After
interface TestListProps {
  roots: Node[];
  runTest: (id: string) => Promise<void>;
  searchQuery?: string; // kept only for "No tests match" message
}
```

### 2. Rename refresh counter for clarity

Rename `[_, setRefresh]` to `[refreshKey, setRefresh]`. The `_` convention means "unused" and could be stripped by linters or confused by maintainers. Since it's now an explicit memoization dependency, it needs an intentional name.

### 3. Memoize derived values in TWDSidebar

Wrap computations with `useMemo` in `TWDSidebar.tsx`:

**Memoized block 1** — tree only (keyed on `refreshKey`):
- `buildTreeFromHandlers(tests)` → `roots`

**Memoized block 2** — filtered tree (keyed on `roots` + `searchQuery`):
- `filterTree(roots, searchQuery)` → `filteredRoots`

This split is critical: when the user types in the search input, only `searchQuery` changes. Block 1 reuses the cached tree, and only `filterTree` re-runs. Without the split, `buildTreeFromHandlers` would re-run on every keystroke.

**Memoized block 3** — test IDs + display tests (keyed on `filteredRoots` + `searchQuery` + `refreshKey`):
- `collectTestIds(filteredRoots)` → `filteredTestIds`
- `filteredTestSet` (Set from IDs)
- `displayTests` (filtered test array)

**Note on `tests` array reference:** `Array.from(handlers.values())` creates a new array every render. The `tests` variable must NOT appear in `useMemo` dependency arrays — use `refreshKey` as the cache-busting key instead, since it's what actually signals that handler contents changed.

Move `collectTestIds` outside the component as a module-level utility (similar to `buildTreeFromHandlers` and `filterTree`).

Counter memoization (pass/fail counts) is not included — two `.filter().length` calls on an already-filtered array are sub-microsecond even at 500+ tests, and `useMemo` overhead would likely exceed the computation cost.

### 4. What stays the same

- `new TestRunner(...)` remains in render body — constructor is trivial (`this.events = events`), not worth ref complexity
- sessionStorage patterns unchanged
- No new files or abstractions
- `searchQuery` prop kept in TestList for the "No tests match" empty state message

## Reactivity scenarios

| Trigger | What happens | Memoization behavior |
|---|---|---|
| **Search input typing** | `searchQuery` state changes | Block 1 cached (tree unchanged), blocks 2-3 recompute |
| **Test run completes** | `twd:state-change` event → `refreshKey` bumps | All blocks recompute (correct — test statuses changed) |
| **HMR on app code** | Component re-renders, `handlers` Map persists on `window.__TWD_STATE__` | `refreshKey` preserved by HMR, memoized values reused |
| **Page reload** | Fresh mount | Everything initializes from scratch, no stale state |

## Files modified

- `src/ui/TWDSidebar.tsx` — rename `_` to `refreshKey`, add `useMemo` blocks, pass `filteredRoots` to TestList, remove `.map()` shallow-clone, extract `collectTestIds` to module level
- `src/ui/TestList.tsx` — simplify props to receive `roots: Node[]`, remove tree building logic and related imports

## Testing

Existing Vitest tests in `src/tests/ui/twdSidebar.spec.tsx` cover sidebar rendering, search filtering, and state-change re-renders. All existing tests exercise `TestList` through `TWDSidebar`, so the prop change is covered transitively. No new tests needed — this is a pure internal refactor with no behavior changes.
