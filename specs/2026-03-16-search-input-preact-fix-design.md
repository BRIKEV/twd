# Search Input Preact Compatibility Fix

**Date:** 2026-03-16
**Status:** Approved

## Problem

The search/filter feature in the TWD sidebar works correctly in dev mode (React) but breaks in the bundled build (Preact). When typing in the search input, the filter does not update until the user blurs the input or presses Enter.

**Root cause:** `SearchInput` uses `onChange` on a controlled `<input type="search">`. In React, `onChange` is internally mapped to the native `input` event (fires on every keystroke). In the bundled build, `@preact/preset-vite` aliases `react` → `preact/compat`, and aggressive tree-shaking (`moduleSideEffects: false`, `propertyReadSideEffects: false`) strips the compat layer's event aliasing. This causes `onChange` to map to the native `change` event, which only fires on blur or Enter.

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

Update test description from "calls onChange when typing" to "calls onChange callback when typing" (the prop name remains `onChange` — only the DOM event binding changes). No functional test changes needed since `userEvent.type` triggers both `input` and `change` events.

## Testing

1. `npm test` — unit tests pass
2. Manual: Vue example app (bundled build) — typing filters in real-time
3. Manual: twd-test-app (React dev build) — no regression

## Files

- `src/ui/SearchInput.tsx`
- `src/tests/ui/searchInput.spec.tsx`
