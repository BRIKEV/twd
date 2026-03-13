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
- The input has `aria-label="Filter tests"` and `role="searchbox"`
- A clear button (x) appears when there's text, with `aria-label="Clear search filter"` and proper focus management (focus returns to the search input after clearing)
- Instant filtering on every keystroke, case-insensitive
- Search value persisted to `sessionStorage` (key: `twd-search-filter`) so it survives HMR and page reloads
- On mount, the input restores the persisted value and applies the filter immediately

## Filtering Logic

When the search input has a value:

1. **Match check**: A node (test or describe) matches if its `name` contains the search string (case-insensitive)
2. **Tree pruning**: Walk the tree built by `buildTreeFromHandlers`. A node is **visible** if:
   - It matches the search string directly, OR
   - Any of its descendants match (so ancestor describe blocks are preserved)
3. **Result**: The tree retains full hierarchy for matching paths. Entire branches with no matches are hidden.

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

## "Run All" with Active Filter

When a search filter is active:

- "Run All" runs only the **visible tests** (tests that match or are within matching branches)
- The button label changes to `"Run Filtered"` to make the scoped behavior clear
- The label has `aria-live="polite"` so screen readers announce the change
- When the search is cleared, the button reverts to `"Run All"`

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

### `runner.ts`

- Add a `runByIds(ids: string[])` method that accepts a list of test IDs to run, or the sidebar calls `runSingle()` on each matching test

### `buildTreeFromHandlers.ts`

- No changes needed. Filtering happens as a separate step after tree building.

## Accessibility

- Search input: `role="searchbox"`, `aria-label="Filter tests"`
- Clear button: `aria-label="Clear search filter"`, returns focus to search input on click
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
| Debounce | None — instant filtering | In-memory string match is fast enough for typical test counts |
| Persistence | sessionStorage (`twd-search-filter`) | Survives HMR and page reloads during development |

## Testing & Documentation

To be detailed in the implementation plan:

- **Unit tests**: Tests for `filterTree.ts` utility, updated tests for `TestList` and `TWDSidebar` with search behavior, sessionStorage persistence, and a11y
- **Documentation**: Update VitePress docs to cover the `search` prop, usage examples, and behavior description
