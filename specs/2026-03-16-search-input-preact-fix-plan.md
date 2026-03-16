# Search Input Preact Compatibility Fix — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix search input not updating on keystrokes in the Preact bundled build by replacing `onChange` with `onInput`.

**Architecture:** Single-component fix — swap the DOM event binding from `onChange` to `onInput` in `SearchInput.tsx`, add a regression test that validates the native `input` event fires the callback.

**Tech Stack:** React, Preact, Vitest, @testing-library/react

---

### Task 1: Fix SearchInput and add regression test

**Files:**
- Modify: `src/ui/SearchInput.tsx:15` — change `onChange` to `onInput`
- Modify: `src/tests/ui/searchInput.spec.tsx` — add `fireEvent.input` regression test

- [ ] **Step 1: Fix SearchInput to use onInput**

In `src/ui/SearchInput.tsx`, change line 15 from:

```tsx
onChange={(e) => onChange(e.target.value)}
```

to:

```tsx
onInput={(e) => onChange((e.target as HTMLInputElement).value)}
```

- [ ] **Step 2: Add regression test for native input event**

Add `fireEvent` to the existing `@testing-library/react` import in `src/tests/ui/searchInput.spec.tsx`, then add a test that fires only the native `input` event. This documents the fix intent and guards against reverting to `onChange`:

```tsx
it("responds to native input event (Preact compat regression)", () => {
  const onChange = vi.fn();
  render(<SearchInput value="" onChange={onChange} />);
  const input = screen.getByLabelText("Filter tests");
  fireEvent.input(input, { target: { value: "auth" } });
  expect(onChange).toHaveBeenCalledWith("auth");
});
```

> **Note:** This test passes in jsdom+React even with `onChange` because React internally maps `onChange` to the native `input` event. The real bug only manifests in the Preact bundled build where tree-shaking strips this aliasing. This test serves as documentation and a regression guard.

- [ ] **Step 3: Run the tests to verify they pass**

Run: `npm test src/tests/ui/searchInput.spec.tsx`
Expected: ALL PASS (both the new regression test and the existing tests)

- [ ] **Step 4: Run the full test suite**

Run: `npm run test:ci`
Expected: ALL PASS — no regressions in TWDSidebar or other UI tests.

- [ ] **Step 5: Commit**

```bash
git add src/ui/SearchInput.tsx src/tests/ui/searchInput.spec.tsx
git commit -m "fix: use onInput instead of onChange for Preact compat in SearchInput"
```
