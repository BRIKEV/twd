# Sidebar Search/Filter Feature — Design Spec

**Date**: 2026-03-13
**Status**: Approved

## Overview

Add an optional search/filter feature to the TWD sidebar that allows users to filter tests by name. The feature preserves the describe block hierarchy when filtering, so users never lose context about where a test lives in the test tree.

## Configuration

New optional `search` boolean prop on `TWDSidebarProps`:

```typescript
interface TWDSidebarProps {
  open: boolean;
  position?: "left" | "right";
  search?: boolean; // default: false
}
```

When `search` is `true`, a search input appears below the sticky header, above the test list. When `false` or omitted, the sidebar behaves exactly as it does today.

## Search Input UI

- Text input placed below the sticky header in a non-scrolling area
- Placeholder text: `"Filter tests..."`
- The input uses `<input type="search">` for native searchbox semantics and `aria-label="Filter tests"`
- **Revised**: No custom clear button. `<input type="search">` provides native clear semantics; adding a custom button creates duplicate a11y affordances. Escape key clears the input as a keyboard alternative. Native clear button appearance varies by browser (Firefox has none) — accepted tradeoff for a dev-tool context.
- Instant filtering on every keystroke, case-insensitive
- Search value persisted to `sessionStorage` (key: `twd-search-filter`) so it survives HMR and page reloads
- On mount, the input restores the persisted value and applies the filter immediately
- When `search` prop is `false` or removed, the sessionStorage key is cleared to avoid stale filter state

## Filtering Logic

When the search input has a value:

1. **Match check**: A node (test or describe) matches if its `name` contains the search string (case-insensitive)
2. **Tree pruning**: Walk the tree built by `buildTreeFromHandlers`. A node is **visible** if:
   - It matches the search string directly, OR
   - Any of its descendants match (so ancestor describe blocks are preserved)
3. **Result**: The tree retains full hierarchy for matching paths. Entire branches with no matches are hidden.
4. **Empty state**: When no tests match the query, show a "No tests match \"{query}\"" message in the test list area.

### Example

Searching `"error"`:

```
describe('Auth')              <- visible (has matching descendant)
  describe('Login')           <- visible (has matching descendant)
    it('shows error on...')   <- visible (matches)
    it('redirects on success') <- hidden
  describe('Signup')          <- hidden (no matches in subtree)
    it('validates email')     <- hidden
```

## Interaction with `.only` and `.skip`

The search filter operates as a visual/execution filter **on top of** existing `.only`/`.skip` semantics:

- The search filter determines which nodes are **visible** in the tree
- Within the visible set, `.only` and `.skip` still apply as normal
- A `.skip` test that matches the search appears in the filtered list but remains skipped when run
- If `.only` tests exist, the filter narrows further within the `.only` set (both conditions must be satisfied)

## "Run All" with Active Filter

When a search filter is active:

- "Run All" runs only the **visible tests** (tests that match or are within matching branches)
- The button label changes to `"Run Filtered"` to make the scoped behavior clear
- The label has `aria-live="polite"` so screen readers announce the change
- When the search is cleared, the button reverts to `"Run All"`

## Header Counters

When a search filter is active, the header counters (Total, Passed, Failed) reflect only the **visible/filtered tests**, consistent with the "Run Filtered" behavior. When the search is cleared, counters revert to showing all tests.

## Impact on Existing Components

### `TWDSidebar.tsx`

- New `search` prop
- New state: `searchQuery` initialized from sessionStorage
- Passes `searchQuery` down to `TestList`
- Passes filtered test IDs to the runner when filter is active

### `TestList.tsx`

- Receives `searchQuery` prop
- After `buildTreeFromHandlers`, applies tree pruning to filter visible nodes
- Rendering logic unchanged — same recursive `renderNode`, just on a pruned tree

### New utility: `src/ui/utils/filterTree.ts`

- Pure function: takes the tree and search string, returns a pruned copy
- Does not mutate the original tree
- Logic: recursively mark nodes as visible if they match or have matching descendants, then prune invisible branches

### `bundled.tsx`

- Add `search?: boolean` to `InitTWDOptions` interface
- Forward the `search` prop to `TWDSidebar` in the `initTWD` function

### `runner.ts`

- Add a `runByIds(ids: string[])` method that accepts a set of test IDs to run
- Implementation: perform a filtered tree walk (same as `runAll`), but skip tests whose IDs are not in the provided set
- This preserves the existing suite-level hook execution semantics (`beforeEach`/`afterEach` run per suite scope, not per individual test)

### `buildTreeFromHandlers.ts`

- No changes needed. Filtering happens as a separate step after tree building.

## Accessibility

- Search input: `<input type="search">` with `aria-label="Filter tests"`
- Clear: handled natively by `<input type="search">` (browser-dependent) and Escape key — no custom button needed
- "Run Filtered" label change announced via `aria-live="polite"`
- All interactive elements keyboard-accessible

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Search placement | Below sticky header, above test list | Most discoverable, keeps header clean |
| Match targets | Test names + describe names | Covers most useful scenarios |
| Hierarchy display | Full ancestor chain preserved, non-matching branches hidden | Maintains familiar tree structure and context |
| Case sensitivity | Case-insensitive always | Simpler, test filtering rarely needs case-sensitivity |
| "Run All" behavior | Runs only filtered tests, label changes to "Run Filtered" | Most intuitive — run what you see |
| Config option | `search: boolean` prop (default `false`) | Simple; expandable to object later if needed |
| Debounce | None — instant filtering | In-memory string match is fast enough for typical test counts. Revisit if performance issues are reported with very large suites (500+) |
| Match scope | Node name only, not full ancestor path | Simpler; full-path matching (e.g., "auth error" matching Auth > Login > shows error) could be added later as an enhancement |
| Persistence | sessionStorage (`twd-search-filter`) | Survives HMR and page reloads during development |

## Testing & Documentation

To be detailed in the implementation plan:

- **Unit tests**: Tests for `filterTree.ts` utility, updated tests for `TestList` and `TWDSidebar` with search behavior, sessionStorage persistence, and a11y
- **Documentation**: Update VitePress docs to cover the `search` prop, usage examples, and behavior description
