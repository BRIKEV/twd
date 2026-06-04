# Sidebar CSS Class Migration

**Date:** 2026-04-13
**Branch:** `feature/sidebar-css-classes` (new, from `main`)
**Status:** Design approved

## Problem

All TWD sidebar UI components use inline `style={{...}}` objects. This makes it impossible to use CSS pseudo-selectors (`:hover`, `:active`, `:focus-visible`) without adding React event handlers and state management to every interactive element. As a result:

- Buttons have no hover, active, or focus-visible feedback
- The search input has `outline: "none"` with no replacement focus indicator
- The disabled play button looks identical to the enabled one
- Contributors can't add interactive states without understanding React event patterns

## Solution

Migrate all sidebar inline styles to CSS classes injected via a `<style>` tag at runtime. This follows the existing pattern used by `injectTheme()` in `theme.ts` and the `@keyframes` injection in `Loader.tsx`.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | Full migration (all styles, not just interactive) | Consistency; do it once |
| Class naming | Flat `twd-` prefix (`twd-btn-primary`, `twd-sidebar`) | Simple, collision-safe via prefix |
| Injection | Separate `injectStyles()` function in new file | Theme variables are user-customizable; class rules are internal |
| CSS format | Well-formatted string with comment sections | Readability; contributors add rules easily |
| Interactive states | Derived via `filter: brightness()` | No new theme variables; works automatically with user theme overrides |
| Dynamic values | Stay as inline `style` | Position left/right, nesting depth, sr-only — can't be static classes |
| Loader keyframes | Consolidated into the new style tag | Single injection point for all sidebar CSS |

## New File: `src/ui/utils/styles.ts`

### `injectStyles()`

Creates a `<style id="twd-styles">` element and appends it to `document.head`. Guards against double-injection (same pattern as `injectTheme()`). Called from `initSidebar.tsx` right after `injectTheme(theme)`.

### `CSS_STYLES` constant

A formatted template literal string containing all class rules. Organized with comment sections:

```css
/* ========================
   Animation keyframes
   ======================== */
@keyframes twd-spin { ... }

/* ========================
   Buttons — shared base
   ======================== */
.twd-btn { ... }
.twd-btn:hover { filter: brightness(1.15); }
.twd-btn:active { filter: brightness(0.9); }
.twd-btn:focus-visible { outline: 2px solid var(--twd-primary); outline-offset: 2px; }
.twd-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.twd-btn:disabled:hover { filter: none; }

/* ========================
   Button variants
   ======================== */
.twd-btn-primary { ... }
.twd-btn-secondary { ... }
.twd-btn-icon { ... }
.twd-btn-mock-rules { ... }

/* ========================
   Sidebar layout
   ======================== */
.twd-sidebar { ... }
.twd-sidebar-header { ... }
/* ... etc ... */
```

## CSS Class Inventory

### Shared base

- `.twd-btn` — cursor, border-radius, transition, focus-visible outline, hover/active brightness filters
- `.twd-btn:disabled` — reduced opacity, `cursor: not-allowed`, no hover/active effects

### Button variants

- `.twd-btn-primary` — background, color, border, padding (Run All / Run Filtered)
- `.twd-btn-secondary` — background, color, border, padding (Clear mocks)
- `.twd-btn-icon` — transparent background, border, fixed size, flex centering (play button, close button)
- `.twd-btn-mock-rules` — full-width secondary style with shadow, gap, text alignment (MockRulesButton)

### Sidebar layout

- `.twd-sidebar` — fixed position, background, font-family, overflow, shadow, z-index, isolation
- `.twd-sidebar-header` — padding, background, sticky, border-bottom
- `.twd-sidebar-header-row` — flex row for buttons + close
- `.twd-sidebar-stats` — flex row for total/pass/fail counts
- `.twd-sidebar-content` — padding wrapper for test list
- `.twd-sidebar-closed` — the collapsed "TWD" button (fixed, z-index, positioned)
- `.twd-sidebar-version` — version label styling

### Test list

- `.twd-test-list` — reset list styles (no bullet, no padding, no margin)
- `.twd-test-group` — describe block container with left border, background, padding
- `.twd-test-group-toggle` — the clickable toggle (flex, uppercase, cursor, letter-spacing)
- `.twd-test-item` — flex row, padding, border-radius
- `.twd-test-item-name` — font weight, size, color, max-width
- `.twd-test-item-logs` — logs container with max-height, overflow, background

### Status (applied conditionally alongside `.twd-test-item`)

- `.twd-status-pass` — success background
- `.twd-status-fail` — error background
- `.twd-status-skip` — skip background

### Search

- `.twd-search-input` — full width, padding, background, color, border, border-radius, font-size, box-sizing, `:focus-visible` outline

### Animation

- `@keyframes twd-spin` — moved from Loader.tsx
- `.twd-loader` — spin animation applied to the SVG

## Component Changes

### `TWDSidebar.tsx`

- Outer `<div>` → `className="twd-sidebar"` + inline `style` only for left/right position variant (`positionStyles[position]`)
- Header `<div>` → `className="twd-sidebar-header"`
- Button row `<div>` → `className="twd-sidebar-header-row"`
- Run All `<button>` → `className="twd-btn twd-btn-primary"`
- Clear mocks `<button>` → `className="twd-btn twd-btn-secondary"`
- Version `<span>` → `className="twd-sidebar-version"`
- Close `<button>` → `className="twd-btn twd-btn-icon"`
- Stats row `<div>` → `className="twd-sidebar-stats"`
- Content wrapper `<div>` → `className="twd-sidebar-content"`
- sr-only `aria-live` div — keeps inline style (one-off accessibility pattern)

### `ClosedSidebar.tsx`

- `<button>` → `className="twd-btn twd-sidebar-closed"` + inline `style` only for left/right position variant

### `MockRulesButton.tsx`

- `<button>` → `className="twd-btn twd-btn-mock-rules"`
- Inner text spans keep inline styles (specific text styling within the button)

### `TestList.tsx`

- `<ul>` root → `className="twd-test-list"`
- Describe block `<div>` → `className="twd-test-group"`
- Toggle `<span>` → `className="twd-test-group-toggle"`
- Nested `<ul>` → `className="twd-test-list"` (reuse)
- Depth-based `marginLeft` stays as inline `style`

### `TestListItem.tsx`

- Remove the `STATIC_STYLES` object entirely
- Container `<li>` → `className="twd-test-item twd-status-${node.status}"`
- Name `<span>` → `className="twd-test-item-name"`
- Play `<button>` → `className="twd-btn twd-btn-icon"`
- Logs `<ul>` → `className="twd-test-item-logs"`

### `SearchInput.tsx`

- `<input>` → `className="twd-search-input"` (gains proper `:focus-visible` for free)
- Remove `outline: "none"` — handled by the class

### `Loader.tsx`

- SVG → `className="twd-loader"`, remove inline `spinStyle` object
- Remove the `document.createElement('style')` block at bottom — keyframes move to `styles.ts`

### `Icons/BaseIcon.tsx` and other icon files

- No changes. SVGs with inline `width`, `height`, `stroke` are fine as-is.

### `initSidebar.tsx`

- Add `import { injectStyles } from '../ui/utils/styles'`
- Call `injectStyles()` after `injectTheme(theme)`

## What Stays as Inline `style`

These values are dynamic (depend on props/state at runtime) and cannot be static CSS classes:

| Component | Property | Reason |
|-----------|----------|--------|
| `TWDSidebar` | `left: 0` / `right: 0`, border side | Depends on `position` prop |
| `ClosedSidebar` | `left: 0` / `right: 0`, border-radius sides | Depends on `position` prop |
| `TestList` | `marginLeft: calc(depth * spacing)` | Depends on nesting depth |
| `TWDSidebar` | sr-only clip styles | One-off a11y pattern |

## Testing

### Unit tests (Vitest + jsdom)

- Existing component tests in `src/tests/ui/` should continue to pass — they test behavior (clicks, renders, aria attributes), not specific style values.
- **New test:** `src/tests/ui/utils/styles.spec.ts` for `injectStyles()`:
  - Creates a `<style>` tag with `id="twd-styles"`
  - Does not double-inject on repeated calls
  - Contains expected class names (spot-check a few)
- **Update:** Loader tests if they assert on the separate `loader-spin-keyframes` style tag

### Manual verification (both builds required)

**React build (twd-test-app):**
```bash
cd examples/twd-test-app
npm install
npm run dev
```
Changes reflect immediately via HMR (imports from source).

**Preact bundled build (vue-twd-example):**
```bash
# From repo root
npm run build
npm run copy:dist:examples
cd examples/vue-twd-example
npm install
npm run dev
```

**Checklist for both builds:**
- [ ] All buttons show hover state (visible background/brightness change)
- [ ] All buttons show active/pressed state
- [ ] Tab through all buttons — each shows focus-visible ring (mouse click does NOT show it)
- [ ] Disabled play button (while test is running) is dimmed with `not-allowed` cursor
- [ ] Search input shows focus ring when focused
- [ ] Sidebar opens/closes correctly in both `left` and `right` positions
- [ ] Describe blocks expand/collapse
- [ ] Test status colors (pass/fail/skip) display correctly
- [ ] Mock rules button is styled and interactive
- [ ] Loader spinner animation works
- [ ] No visual regressions compared to current state (aside from the new interactive states)

### What could break

- Preact compat layer handles `className` correctly, but must be verified in the bundled build
- Any existing test that snapshots or asserts on `style` attributes will need updating
- The `Loader.tsx` keyframes removal must be verified — ensure the animation still works when the keyframes come from the shared style tag instead
