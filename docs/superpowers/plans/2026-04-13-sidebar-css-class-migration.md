# Sidebar CSS Class Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all TWD sidebar inline `style={{...}}` objects to CSS classes injected via a `<style>` tag, enabling CSS pseudo-selectors (`:hover`, `:active`, `:focus-visible`, `:disabled`) without React state hacks.

**Architecture:** Create `src/ui/utils/styles.ts` with `injectStyles()` (parallel to the existing `injectTheme()` pattern in `src/ui/utils/theme.ts`). Call it once from `src/initializers/initSidebar.tsx`. Each sidebar component replaces inline styles with `className` strings; only dynamic/runtime values stay as inline `style`.

**Tech Stack:** TypeScript, Preact/React (both must work — verified via React test app + bundled Preact build), Vitest + jsdom for unit tests.

---

## File Map

| Action | File |
|--------|------|
| **Create** | `src/ui/utils/styles.ts` |
| **Create** | `src/tests/ui/utils/styles.spec.ts` |
| **Modify** | `src/initializers/initSidebar.tsx` |
| **Modify** | `src/ui/Icons/Loader.tsx` |
| **Modify** | `src/ui/TWDSidebar.tsx` |
| **Modify** | `src/ui/ClosedSidebar.tsx` |
| **Modify** | `src/ui/MockRulesButton.tsx` |
| **Modify** | `src/ui/TestList.tsx` |
| **Modify** | `src/ui/TestListItem.tsx` |
| **Modify** | `src/ui/SearchInput.tsx` |

---

### Task 1: Create `styles.ts` with `injectStyles()` and the full CSS string

**Files:**
- Create: `src/ui/utils/styles.ts`

The CSS string must include: keyframes (moved from `Loader.tsx`), shared button base, button variants, sidebar layout, test list, status classes, search input, and loader.

- [ ] **Step 1: Create the file**

```typescript
// src/ui/utils/styles.ts

export const CSS_STYLES = `
/* ========================
   Animation keyframes
   ======================== */
@keyframes twd-spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ========================
   Buttons — shared base
   ======================== */
.twd-btn {
  cursor: pointer;
  border-radius: var(--twd-border-radius);
  transition: all var(--twd-animation-duration) ease;
}
.twd-btn:hover { filter: brightness(1.15); }
.twd-btn:active { filter: brightness(0.9); }
.twd-btn:focus-visible {
  outline: 2px solid var(--twd-primary);
  outline-offset: 2px;
}
.twd-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.twd-btn:disabled:hover { filter: none; }

/* ========================
   Button variants
   ======================== */
.twd-btn-primary {
  background: var(--twd-button-primary);
  color: var(--twd-button-primary-text);
  padding: var(--twd-spacing-xs) var(--twd-spacing-md);
  border: none;
}
.twd-btn-secondary {
  background: var(--twd-button-secondary);
  color: var(--twd-button-secondary-text);
  padding: var(--twd-spacing-xs) var(--twd-spacing-md);
  border: 1px solid var(--twd-button-border);
}
.twd-btn-icon {
  background: transparent;
  border: 1px solid var(--twd-border-light);
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  font-size: var(--twd-font-size-sm);
}
.twd-btn-mock-rules {
  background: var(--twd-button-secondary);
  border: 1px solid var(--twd-button-border);
  border-radius: var(--twd-border-radius-lg);
  padding: var(--twd-spacing-md) var(--twd-spacing-lg);
  font-size: var(--twd-font-size-sm);
  color: var(--twd-button-secondary-text);
  display: flex;
  align-items: center;
  gap: var(--twd-spacing-md);
  margin-bottom: 10px;
  width: 100%;
  text-align: left;
  transition: all var(--twd-animation-duration) ease;
  box-shadow: var(--twd-shadow-sm);
}

/* ========================
   Sidebar layout
   ======================== */
.twd-sidebar {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  position: fixed;
  top: 0;
  bottom: 0;
  width: var(--twd-sidebar-width);
  background: var(--twd-background);
  font-size: var(--twd-font-size-md);
  overflow-y: auto;
  box-shadow: var(--twd-shadow);
  text-align: left;
  z-index: var(--twd-z-index-sidebar);
  pointer-events: all;
  isolation: isolate;
}
.twd-sidebar-header {
  padding: var(--twd-spacing-md);
  background: var(--twd-background);
  position: sticky;
  top: 0;
  z-index: var(--twd-z-index-sticky);
  border-bottom: 1px solid var(--twd-border);
}
.twd-sidebar-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--twd-spacing-xl);
}
.twd-sidebar-header-buttons {
  display: flex;
  gap: var(--twd-spacing-xs);
}
.twd-sidebar-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--twd-font-size-md);
  color: var(--twd-text-secondary);
  margin-bottom: 10px;
}
.twd-sidebar-stats-counts {
  display: flex;
  gap: var(--twd-spacing-xs);
}
.twd-sidebar-content {
  padding: var(--twd-spacing-md);
}
.twd-sidebar-closed {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  z-index: var(--twd-z-index-sidebar);
  background: var(--twd-button-primary);
  color: var(--twd-button-primary-text);
  padding: var(--twd-spacing-sm) 10px;
  font-size: var(--twd-font-size-sm);
}
.twd-sidebar-version {
  color: var(--twd-text-secondary);
  font-size: var(--twd-font-size-sm);
  align-self: center;
}

/* ========================
   Test list
   ======================== */
.twd-test-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.twd-test-group {
  background: var(--twd-describe-bg);
  border-left: 3px solid var(--twd-describe-border);
  border-radius: var(--twd-border-radius);
  padding: var(--twd-spacing-xs) var(--twd-spacing-sm);
  margin-bottom: var(--twd-spacing-sm);
}
.twd-test-group-toggle {
  font-weight: var(--twd-font-weight-medium);
  font-size: var(--twd-font-size-sm);
  cursor: pointer;
  color: var(--twd-describe-text);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--twd-spacing-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.twd-test-item {
  display: flex;
  align-items: left;
  justify-content: space-between;
  padding: var(--twd-spacing-sm) var(--twd-spacing-sm);
  border-radius: var(--twd-border-radius);
}
.twd-test-item-name {
  font-weight: var(--twd-font-weight-medium);
  font-size: var(--twd-font-size-md);
  color: var(--twd-text);
  max-width: 220px;
}
.twd-test-item-logs {
  border-radius: var(--twd-border-radius);
  max-height: 260px;
  overflow-y: auto;
  padding: 0;
  background: var(--twd-background-secondary);
  list-style: none;
  margin-top: var(--twd-spacing-xs);
  text-align: left;
}

/* ========================
   Status variants
   ======================== */
.twd-status-pass  { background: var(--twd-success-bg); }
.twd-status-fail  { background: var(--twd-error-bg); }
.twd-status-skip  { background: var(--twd-skip-bg); }
.twd-status-running { background: var(--twd-warning-bg); }

/* ========================
   Search
   ======================== */
.twd-search-wrapper {
  position: relative;
  margin-bottom: var(--twd-spacing-md);
}
.twd-search-input {
  width: 100%;
  padding: var(--twd-spacing-md);
  background: var(--twd-background);
  color: var(--twd-text);
  border: 1px solid var(--twd-border);
  border-radius: var(--twd-border-radius);
  font-size: var(--twd-font-size-md);
  box-sizing: border-box;
}
.twd-search-input:focus-visible {
  outline: 2px solid var(--twd-primary);
  outline-offset: 2px;
}

/* ========================
   Loader
   ======================== */
.twd-loader {
  animation: twd-spin 1s linear infinite;
}
`;

/**
 * Injects all sidebar CSS classes into the document.
 * Guards against double-injection (same pattern as injectTheme).
 * Called once from initSidebar.tsx after injectTheme().
 */
export function injectStyles(): void {
  const styleId = 'twd-styles';
  if (document.getElementById(styleId)) return;

  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = CSS_STYLES;
  document.head.appendChild(styleElement);
}
```

- [ ] **Step 2: Verify the file was created**

```bash
ls /path/to/twd/src/ui/utils/styles.ts
```

Expected: file exists.

---

### Task 2: Write and pass tests for `injectStyles()`

**Files:**
- Create: `src/tests/ui/utils/styles.spec.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// src/tests/ui/utils/styles.spec.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { injectStyles, CSS_STYLES } from "../../../ui/utils/styles";

describe("injectStyles", () => {
  beforeEach(() => {
    // Clean up any injected style tag before each test
    document.getElementById("twd-styles")?.remove();
  });

  afterEach(() => {
    document.getElementById("twd-styles")?.remove();
  });

  it("injects a <style> tag with id='twd-styles'", () => {
    injectStyles();
    const el = document.getElementById("twd-styles");
    expect(el).not.toBeNull();
    expect(el?.tagName.toLowerCase()).toBe("style");
  });

  it("does not double-inject on repeated calls", () => {
    injectStyles();
    injectStyles();
    const all = document.querySelectorAll("#twd-styles");
    expect(all.length).toBe(1);
  });

  it("contains twd-btn class rule", () => {
    injectStyles();
    const el = document.getElementById("twd-styles");
    expect(el?.textContent).toContain(".twd-btn");
  });

  it("contains twd-sidebar class rule", () => {
    injectStyles();
    const el = document.getElementById("twd-styles");
    expect(el?.textContent).toContain(".twd-sidebar");
  });

  it("contains twd-spin keyframe", () => {
    injectStyles();
    const el = document.getElementById("twd-styles");
    expect(el?.textContent).toContain("twd-spin");
  });

  it("contains status class rules", () => {
    injectStyles();
    const el = document.getElementById("twd-styles");
    expect(el?.textContent).toContain(".twd-status-pass");
    expect(el?.textContent).toContain(".twd-status-fail");
    expect(el?.textContent).toContain(".twd-status-skip");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail (styles.ts not yet discovered — they should pass immediately since styles.ts was created in Task 1; if they fail for another reason, fix the imports)**

```bash
cd /path/to/twd && npm test src/tests/ui/utils/styles.spec.ts -- --run
```

Expected: All 6 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/ui/utils/styles.ts src/tests/ui/utils/styles.spec.ts
git commit -m "feat: add injectStyles() with full CSS_STYLES constant"
```

---

### Task 3: Wire `injectStyles()` into `initSidebar.tsx` and update `Loader.tsx`

**Files:**
- Modify: `src/initializers/initSidebar.tsx`
- Modify: `src/ui/Icons/Loader.tsx`

#### Part A — `initSidebar.tsx`

Current file (lines 1-3):
```typescript
import { injectTheme, TWDTheme } from "../ui/utils/theme";
```

- [ ] **Step 1: Add the import and call in `initSidebar.tsx`**

Replace lines 1-3 with:
```typescript
import { injectTheme, TWDTheme } from "../ui/utils/theme";
import { injectStyles } from "../ui/utils/styles";
```

Then in the `initSidebar` function body, after `injectTheme(theme)` (line 32), add:
```typescript
  injectStyles();
```

Full updated function body:
```typescript
export const initSidebar = (options: Options) => {
  const { Component, createRoot, theme } = options;
  
  // Inject theme CSS variables
  injectTheme(theme);
  
  // Inject sidebar class rules
  injectStyles();
  
  const el = document.createElement('div');
  el.setAttribute('id', 'twd-sidebar-root');
  document.body.appendChild(el);
  const root = createRoot(el);
  root.render(Component);
};
```

#### Part B — `Loader.tsx`

Current `Loader.tsx` (lines 1-39): uses inline `spinStyle` and injects its own `@keyframes spin` `<style>` tag with id `loader-spin-keyframes`.

- [ ] **Step 2: Update `Loader.tsx` to use `twd-loader` class and remove its own style injection**

Replace the entire file:
```typescript
const Loader = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--twd-icon-color-secondary)"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-loader-circle-icon lucide-loader-circle twd-loader"
    data-testid="loader-icon"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default Loader;
```

- [ ] **Step 3: Run existing icon tests to confirm Loader still renders**

```bash
cd /path/to/twd && npm test src/tests/ui/icons.spec.tsx -- --run
```

Expected: All tests PASS (the test only checks `data-testid="loader-icon"` is present).

- [ ] **Step 4: Commit**

```bash
git add src/initializers/initSidebar.tsx src/ui/Icons/Loader.tsx
git commit -m "feat: wire injectStyles into initSidebar, migrate Loader keyframes to styles.ts"
```

---

### Task 4: Migrate `SearchInput.tsx`

**Files:**
- Modify: `src/ui/SearchInput.tsx`

Current file has a single `<input>` with inline styles and `outline: "none"`. Replace with `twd-search-input` class.

- [ ] **Step 1: Rewrite `SearchInput.tsx`**

```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput = ({ value, onChange }: SearchInputProps) => {
  return (
    <div className="twd-search-wrapper">
      <input
        type="search"
        id="twd-search-input"
        aria-label="Filter tests"
        placeholder="Filter tests..."
        value={value}
        onInput={(e) => onChange((e.target as HTMLInputElement).value)}
        className="twd-search-input"
      />
    </div>
  );
};
```

- [ ] **Step 2: Run search input tests**

```bash
cd /path/to/twd && npm test src/tests/ui/searchInput.spec.tsx -- --run
```

Expected: All tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/ui/SearchInput.tsx
git commit -m "feat: migrate SearchInput inline styles to twd-search-input class"
```

---

### Task 5: Migrate `ClosedSidebar.tsx`

**Files:**
- Modify: `src/ui/ClosedSidebar.tsx`

Dynamic: `left: 0` vs `right: 0` and border-radius sides. These stay as inline style because they depend on the `position` prop. All other styles move to `.twd-btn.twd-sidebar-closed`.

- [ ] **Step 1: Rewrite `ClosedSidebar.tsx`**

```typescript
interface ClosedSidebarProps {
  setOpen: (open: boolean) => void;
  position: "left" | "right";
}

const positionStyles = {
  left: {
    left: 0,
    borderTopRightRadius: "var(--twd-border-radius-lg)",
    borderBottomRightRadius: "var(--twd-border-radius-lg)",
    borderTopLeftRadius: "0",
    borderBottomLeftRadius: "0",
  },
  right: {
    right: 0,
    borderTopLeftRadius: "var(--twd-border-radius-lg)",
    borderBottomLeftRadius: "var(--twd-border-radius-lg)",
    borderTopRightRadius: "0",
    borderBottomRightRadius: "0",
  },
};

export const ClosedSidebar = ({ setOpen, position }: ClosedSidebarProps) => {
  return (
    <button
      aria-label="Open TWD sidebar"
      className="twd-btn twd-sidebar-closed"
      style={positionStyles[position]}
      onClick={() => setOpen(true)}
    >
      TWD
    </button>
  );
};
```

- [ ] **Step 2: Run closed sidebar tests**

```bash
cd /path/to/twd && npm test src/tests/ui/closedSidebar.spec.tsx -- --run
```

Expected: All tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/ui/ClosedSidebar.tsx
git commit -m "feat: migrate ClosedSidebar inline styles to twd-btn twd-sidebar-closed classes"
```

---

### Task 6: Migrate `MockRulesButton.tsx`

**Files:**
- Modify: `src/ui/MockRulesButton.tsx`

The outer button moves to `.twd-btn.twd-btn-mock-rules`. The two inner `<span>` elements keep their inline styles (specific text-level overrides within the button — these are not interactive and are fine as-is per the spec).

- [ ] **Step 1: Rewrite `MockRulesButton.tsx`**

```typescript
import { getRequestMockRules } from "../commands/mockBridge";
import MockRequestIcon from "./Icons/MockRequestIcon";

export const MockRulesButton = () => {
  const rules = getRequestMockRules();
  const triggeredRules = rules.filter(rule => rule.executed);
  
  const handleShowRules = () => {
    console.group('🌐 TWD Mock Rules');
    console.log('Total rules:', rules.length);
    console.log('Triggered rules:', triggeredRules.length);
    console.log('Rules details:');
    console.log(rules);
    console.groupEnd();
  };

  return (
    <button
      onClick={handleShowRules}
      aria-label="View mock rules details in console"
      className="twd-btn twd-btn-mock-rules"
    >
      <MockRequestIcon />
      <span style={{ flex: 1 }}>
        Rules: {triggeredRules.length}/{rules.length} triggered
      </span>
      <span style={{ 
        fontSize: "var(--twd-font-size-xs)", 
        color: "var(--twd-text)",
        fontWeight: "var(--twd-font-weight-medium)"
      }}>
        View rules in console
      </span>
    </button>
  );
};
```

- [ ] **Step 2: Run mock rules button tests**

```bash
cd /path/to/twd && npm test src/tests/ui/mockRulesButton.spec.tsx -- --run
```

Expected: All tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/ui/MockRulesButton.tsx
git commit -m "feat: migrate MockRulesButton inline styles to twd-btn-mock-rules class"
```

---

### Task 7: Migrate `TestListItem.tsx`

**Files:**
- Modify: `src/ui/TestListItem.tsx`

Remove `STATIC_STYLES` entirely. The status-based background moves to `.twd-status-{pass|fail|skip|running}` CSS classes. The `statusStyles()` export is used in tests — it will be removed, and tests that import it must be updated.

The container `<li>` has a dynamic `marginLeft` (depth-based) — stays as inline `style`. The `isPreviouslyRunTest` dashed border also stays as inline `style` since it's a runtime condition.

- [ ] **Step 1: Check what the test file imports from `TestListItem`**

```bash
grep -n "statusStyles\|STATIC_STYLES" /path/to/twd/src/tests/ui/testListItem.spec.tsx
```

- [ ] **Step 2: Read the full `testListItem.spec.tsx` to understand what needs updating**

```bash
cat /path/to/twd/src/tests/ui/testListItem.spec.tsx
```

- [ ] **Step 3: Rewrite `TestListItem.tsx`**

```typescript
import { useRef, useEffect } from "react";
import Loader from "./Icons/Loader";
import Play from "./Icons/Play";
import SkipOnlyName from "./SkipOnlyName";
import { LogItem } from "./LogItem";

interface Test {
  name: string;
  depth: number;
  status?: "idle" | "pass" | "fail" | "skip" | "running";
  logs?: string[];
  id: string;
  parent?: string;
  type: "test" | "suite";
  only?: boolean;
  skip?: boolean;
}

interface TestListItemProps {
  node: Test;
  depth: number;
  id: string;
  runTest: (i: string) => void;
}

const statusClass = (status?: Test["status"]): string => {
  switch (status) {
    case "pass":    return "twd-status-pass";
    case "fail":    return "twd-status-fail";
    case "skip":    return "twd-status-skip";
    case "running": return "twd-status-running";
    default:        return "";
  }
};

export const TestListItem = ({
  node,
  depth,
  id,
  runTest,
}: TestListItemProps) => {
  const logsContainerRef = useRef<HTMLUListElement>(null);
  const previousStatusRef = useRef<typeof node.status>(node.status);
  const previousLogsLengthRef = useRef<number>(node.logs?.length || 0);

  const isPreviouslyRunTest =
    typeof window !== "undefined" &&
    sessionStorage.getItem("twd-last-run-test-name") === node.name;

  // Auto-scroll to bottom when test finishes (pass/fail) or when new logs are added
  useEffect(() => {
    const logsContainer = logsContainerRef.current;
    if (!logsContainer || !node.logs || node.logs.length === 0) return;

    const testJustFinished = 
      previousStatusRef.current === "running" && 
      (node.status === "pass" || node.status === "fail");
    
    const newLogsAdded = node.logs.length > previousLogsLengthRef.current;

    if (testJustFinished || newLogsAdded) {
      setTimeout(() => {
        logsContainer.scrollTop = logsContainer.scrollHeight;
      }, 0);
    }

    previousStatusRef.current = node.status;
    previousLogsLengthRef.current = node.logs.length;
  }, [node.status, node.logs]);

  const getStatusLabel = () => {
    switch (node.status) {
      case "pass":    return "passed";
      case "fail":    return "failed";
      case "running": return "running";
      case "skip":    return "skipped";
      default:        return "not run";
    }
  };

  return (
    <li
      key={node.name}
      style={{
        marginBottom: "var(--twd-spacing-xs)",
        marginLeft: `calc(${depth} * var(--twd-spacing-sm))`,
      }}
      data-testid={`test-list-item-${id}`}
      data-test-name={node.name}
      role="listitem"
      aria-label={`Test ${node.name}, status: ${getStatusLabel()}`}
    >
      <div
        className={`twd-test-item ${statusClass(node.status)}`}
        style={isPreviouslyRunTest ? { border: "1px dashed var(--twd-border)" } : undefined}
      >
        <span className="twd-test-item-name">
          <SkipOnlyName
            id={id}
            name={node.name}
            skip={node.skip}
            only={node.only}
          />
        </span>
        <button
          onClick={() => runTest(id)}
          aria-label={`Run ${node.name} test`}
          className="twd-btn twd-btn-icon"
          disabled={node.status === "running"}
          data-testid={`run-test-button-${id}`}
        >
          {node.status === "running" ? <Loader /> : <Play />}
        </button>
      </div>
      {node.logs && node.logs.length > 0 && (
        <ul ref={logsContainerRef} className="twd-test-item-logs">
          {node.logs.map((log, idx) => (
            <LogItem key={idx} log={log} index={idx} />
          ))}
        </ul>
      )}
    </li>
  );
};
```

- [ ] **Step 4: Update `testListItem.spec.tsx` to remove `statusStyles` import**

The existing test file imports `statusStyles` from `TestListItem`. Since that export is removed, replace any `statusStyles` assertions with class-name checks or delete the assertions if they test computed style values (the behavior tests — click, render, aria — should still pass unchanged).

Open `src/tests/ui/testListItem.spec.tsx` and:
1. Remove the `import { ..., statusStyles }` import (keep only `TestListItem` if needed, or the full import minus `statusStyles`).
2. Remove or rewrite any test that calls `statusStyles(...)` directly.

If a test was checking `statusStyles(node).item.background === "var(--twd-success-bg)"`, replace it with a render + className check:
```typescript
it("applies twd-status-pass class when status is pass", () => {
  const node = { name: 'Test', depth: 0, status: 'pass' as const, logs: [], id: 'x', type: 'test' as const };
  render(<TestListItem node={node} depth={0} id="x" runTest={vi.fn()} />);
  const item = document.querySelector('.twd-test-item');
  expect(item?.classList.contains('twd-status-pass')).toBe(true);
});
```

- [ ] **Step 5: Run `testListItem` tests**

```bash
cd /path/to/twd && npm test src/tests/ui/testListItem.spec.tsx -- --run
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/ui/TestListItem.tsx src/tests/ui/testListItem.spec.tsx
git commit -m "feat: migrate TestListItem inline styles to CSS classes, remove statusStyles export"
```

---

### Task 8: Migrate `TestList.tsx`

**Files:**
- Modify: `src/ui/TestList.tsx`

Dynamic: `marginLeft` on the describe block `<li>` depends on `depth` — stays as inline `style`. Everything else moves to classes.

- [ ] **Step 1: Rewrite `TestList.tsx`**

Replace all inline `style` props on structural elements with `className`. Keep only the dynamic `marginLeft` on the describe block `<li>`:

```typescript
import { useState, useEffect, useRef } from "react";
import { Node } from "./utils/buildTreeFromHandlers";
import { TestListItem } from "./TestListItem";
import ChevronDown from "./Icons/ChevronDown";
import ChevronRight from "./Icons/ChevronRight";
import SkipOnlyName from "./SkipOnlyName";

interface TestListProps {
  roots: Node[];
  runTest: (id: string) => Promise<void>;
  searchQuery?: string;
}

export const TestList = ({ roots, runTest, searchQuery = "" }: TestListProps) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const listContainerRef = useRef<HTMLUListElement>(null);
  const hasScrolledRef = useRef(false);
  
  const toggle = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  // Scroll to the last run test on first render
  useEffect(() => {
    if (hasScrolledRef.current) return;
    
    const lastRunTestName = sessionStorage.getItem('twd-last-run-test-name');
    if (!lastRunTestName) return;

    const scrollTimeout = setTimeout(() => {
      const testElement = document.querySelector(`[data-test-name="${lastRunTestName}"]`);
      if (testElement) {
        const sidebar = listContainerRef.current?.closest('[data-testid="twd-sidebar"]') as HTMLElement;
        if (sidebar) {
          const elementRect = testElement.getBoundingClientRect();
          const sidebarRect = sidebar.getBoundingClientRect();
          const scrollTop = sidebar.scrollTop;
          const elementTop = elementRect.top - sidebarRect.top + scrollTop;

          const stickyHeader = sidebar.querySelector<HTMLElement>('[data-testid="twd-sidebar-header"]');
          const headerOffset = stickyHeader ? stickyHeader.getBoundingClientRect().height + 16 : 150;

          sidebar.scrollTo({
            top: elementTop - headerOffset,
            behavior: 'smooth'
          });
        }
        hasScrolledRef.current = true;
      }
    }, 100);

    return () => clearTimeout(scrollTimeout);
  }, []);

  const renderNode = (node: Node, depth = 0) => {
    if (node.type === "test") {
      return (
        <TestListItem
          key={node.id}
          node={node}
          depth={depth}
          id={node.id}
          runTest={() => runTest(node.id)}
        />
      );
    }

    const isCollapsed = collapsed[node.id];
    
    return (
      <li key={node.id} style={{ marginLeft: `calc(${depth} * var(--twd-spacing-lg))` }}>
        <div className="twd-test-group">
          <span
            className="twd-test-group-toggle"
            data-testid={`test-group-${node.name}`}
            tabIndex={0}
            role="button"
            aria-expanded={!isCollapsed}
            aria-label={`${isCollapsed ? "Expand" : "Collapse"} test suite ${node.name}`}
            onClick={() => toggle(node.id)}
          >
            <SkipOnlyName id={node.id} name={node.name} skip={node.skip} only={node.only} />
            {isCollapsed ? <ChevronRight /> : <ChevronDown />}
          </span>
        </div>

        {!isCollapsed && node.childrenNodes && node.childrenNodes.length > 0 && (
          <ul className="twd-test-list">
            {node.childrenNodes.map((child) => renderNode(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <ul
      ref={listContainerRef}
      className="twd-test-list"
      role="list"
      aria-label="Test list"
    >
      {roots.length === 0 && searchQuery ? (
        <li style={{
          padding: "var(--twd-spacing-md)",
          color: "var(--twd-text-secondary)",
          fontSize: "var(--twd-font-size-sm)",
          textAlign: "center",
        }}>
          No tests match "{searchQuery}"
        </li>
      ) : (
        roots.map((n) => renderNode(n))
      )}
    </ul>
  );
};
```

Note: The "No tests match" `<li>` keeps its inline style — it's a one-off text element, not an interactive component.

- [ ] **Step 2: Run test list tests**

```bash
cd /path/to/twd && npm test src/tests/ui/testList.spec.tsx -- --run
```

Expected: All tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/ui/TestList.tsx
git commit -m "feat: migrate TestList inline styles to twd-test-group / twd-test-list classes"
```

---

### Task 9: Migrate `TWDSidebar.tsx`

**Files:**
- Modify: `src/ui/TWDSidebar.tsx`

Dynamic: `positionStyles[position]` (left/right border) stays as inline `style` on the outer div. The sr-only `aria-live` div also keeps its inline style. Everything else moves to classes.

- [ ] **Step 1: Rewrite the JSX in `TWDSidebar.tsx`**

The `fontFamily` constant and `positionStyles` constant stay (they provide the dynamic inline styles). Only the JSX `style={...}` props change.

Replace the return value JSX (starting at line 197) with:

```tsx
  if (!isOpen) {
    return <ClosedSidebar position={position} setOpen={handleSetIsOpen} />;
  }

  const totalTests = displayTests.length;

  return (
    <div
      className="twd-sidebar"
      style={positionStyles[position]}
      data-testid="twd-sidebar"
      role="complementary"
      aria-label="Test While Developing sidebar"
    >
      <div aria-live="polite" aria-atomic="true" style={{ position: "absolute", width: "1px", height: "1px", margin: "-1px", border: "0", padding: "0", overflow: "hidden", clip: "rect(0 0 0 0)" }}>{message}</div>
      <div
        data-testid="twd-sidebar-header"
        className="twd-sidebar-header"
      >
        <div className="twd-sidebar-header-row">
          <div className="twd-sidebar-header-buttons">
            <button
              onClick={runAll}
              className="twd-btn twd-btn-primary"
            >
              <span aria-live="polite">{searchQuery ? "Run Filtered" : "Run All"}</span>
            </button>
            <button
              onClick={() => {
                clearRequestMockRules();
                clearComponentMocks();
              }}
              aria-label="Clear all mocks"
              className="twd-btn twd-btn-secondary"
            >
              Clear mocks
            </button>
            <span className="twd-sidebar-version">v{TWD_VERSION}</span>
          </div>
          <button
            aria-label="Close sidebar"
            className="twd-btn twd-btn-icon"
            onClick={() => handleSetIsOpen(false)}
          >
            ✖
          </button>
        </div>
        <div className="twd-sidebar-stats">
          <span style={{ color: "var(--twd-text)" }}>Total: {totalTests}</span>
          <div className="twd-sidebar-stats-counts">
            <span style={{ color: "var(--twd-success)" }}>&#10003; {displayTests.filter(test => test.status === "pass").length}</span>
            <span style={{ color: "var(--twd-error)" }}>&#10007; {displayTests.filter(test => test.status === "fail").length}</span>
          </div>
        </div>
        <MockRulesButton />
        {search && (
          <SearchInput value={searchQuery} onChange={handleSearchChange} />
        )}
      </div>
      <div className="twd-sidebar-content">
        <TestList
          roots={filteredRoots}
          runTest={runTest}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
```

Also remove the unused `fontFamily` constant (lines 41-42 in original) since it moves to `.twd-sidebar` in CSS.

- [ ] **Step 2: Run sidebar tests**

```bash
cd /path/to/twd && npm test src/tests/ui/twdSidebar.spec.tsx -- --run
```

Expected: All tests PASS.

- [ ] **Step 3: Run the full test suite**

```bash
cd /path/to/twd && npm test -- --run
```

Expected: All tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/ui/TWDSidebar.tsx
git commit -m "feat: migrate TWDSidebar inline styles to twd-sidebar / twd-btn CSS classes"
```

---

### Task 10: Full run of test suite + manual verification

**Files:** None (verification only)

- [ ] **Step 1: Run the complete test suite**

```bash
cd /path/to/twd && npm test -- --run
```

Expected: All tests PASS (no regressions).

- [ ] **Step 2: Build and check for TypeScript errors**

```bash
cd /path/to/twd && npm run build
```

Expected: Build succeeds with no type errors.

- [ ] **Step 3: Start the React test app and do manual verification**

```bash
cd /path/to/twd/examples/twd-test-app && npm install && npm run dev
```

Open the browser. Work through this checklist:
- [ ] All buttons show hover state (visible brightness change)
- [ ] All buttons show active/pressed state (darker on click)
- [ ] Tab through all buttons — each shows focus-visible ring (mouse click does NOT show it)
- [ ] Disabled play button (while a test runs) is dimmed with `not-allowed` cursor
- [ ] Search input shows focus ring when focused by keyboard
- [ ] Sidebar opens/closes correctly in both `left` and `right` positions
- [ ] Describe blocks expand/collapse correctly
- [ ] Test status colors (pass=green, fail=red, skip=gray) display correctly
- [ ] Mock rules button is styled and interactive
- [ ] Loader spinner animation works (run a test)
- [ ] No visual regressions from the pre-migration state

- [ ] **Step 4: Build bundled version and verify in a Vue example (optional but recommended per spec)**

```bash
# From twd/ root
npm run build
npm run copy:dist:examples
cd examples/vue-twd-example
npm install
npm run dev
```

Repeat the checklist above in the Vue app.

- [ ] **Step 5: Final commit if any fixups were needed during manual testing**

```bash
git add -p  # stage only fixup changes
git commit -m "fix: address visual regressions found during manual sidebar CSS class verification"
```
