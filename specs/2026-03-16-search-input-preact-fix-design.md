# Search Input Preact Compatibility Fix

**Date:** 2026-03-16
**Status:** Approved

## Problem

The search/filter feature in the TWD sidebar works correctly in dev mode (React) but breaks in the bundled build (Preact). When typing in the search input, the filter does not update until the user blurs the input or presses Enter.

**Root cause:** `SearchInput` uses `onChange` on a controlled `<input type="search">`. In React, `onChange` is internally mapped to the native `input` event (fires on every keystroke). In the bundled build, `@preact/preset-vite` aliases `react` → `preact/compat`, and aggressive tree-shaking (`moduleSideEffects: false`, `propertyReadSideEffects: false`) strips the compat layer's event aliasing. Specifically, `moduleSideEffects: false` tells Rollup that importing a module has no side effects — but `preact/compat` registers its `onChange` → `onInput` aliasing via module-level side effects, so those registrations get stripped. This causes `onChange` to map to the native `change` event, which only fires on blur or Enter.

## Solution

Replace `onChange` with `onInput` in `SearchInput.tsx`. The `onInput` event maps to the native `input` event in both React and Preact — no compat layer needed.

## Changes

### `src/ui/SearchInput.tsx`

Change the input's event handler from `onChange` to `onInput`:

```tsx
// Before
onChange={(e) => onChange(e.target.value)}

// After
onInput={(e) => onChange((e.target as HTMLInputElement).value)}
```

Note: `onInput` in React/Preact passes a generic event target, so we need a type assertion to `HTMLInputElement` to access `.value`.

### `src/tests/ui/searchInput.spec.tsx`

Add a regression test that fires only the native `input` event (via `fireEvent.input`) and asserts the callback is called. This test would fail with `onChange` and pass with `onInput`, directly validating the fix.

### Edge case: native search clear button

Clicking the "x" clear button on `<input type="search">` fires the native `input` event in Chrome, Firefox, and Safari. Since `onInput` maps directly to this event, the filter reset will work correctly. Verify manually in the bundled build.

## Testing

1. `npm test` — unit tests pass (including new `fireEvent.input` regression test)
2. Manual: Vue example app (bundled build) — typing filters in real-time
3. Manual: Vue example app — clicking native search clear button resets filter
4. Manual: twd-test-app (React dev build) — no regression

## Files

- `src/ui/SearchInput.tsx`
- `src/tests/ui/searchInput.spec.tsx`
