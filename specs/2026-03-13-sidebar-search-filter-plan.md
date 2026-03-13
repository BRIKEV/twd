# Sidebar Search/Filter Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional search/filter input to the TWD sidebar that filters tests by name while preserving describe block hierarchy.

**Architecture:** A new `filterTree` pure utility filters the existing tree structure from `buildTreeFromHandlers`. The sidebar manages search state (persisted to sessionStorage) and passes it to `TestList` for filtering. The runner gets a `runByIds` method for executing only filtered tests.

**Tech Stack:** React, Vitest, TypeScript, sessionStorage

**Spec:** `specs/2026-03-13-sidebar-search-filter-design.md`

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/ui/utils/filterTree.ts` | Pure function to prune tree by search query |
| Create | `src/tests/ui/utils/filterTree.spec.ts` | Unit tests for filterTree |
| Create | `src/ui/SearchInput.tsx` | Search input component with clear button |
| Create | `src/tests/ui/searchInput.spec.tsx` | Unit tests for SearchInput |
| Modify | `src/runner.ts:253-269` | Add `runByIds` method to TestRunner |
| Modify | `src/tests/runner/twd-runner.spec.ts` | Add tests for `runByIds` |
| Modify | `src/ui/TestList.tsx` | Accept `searchQuery` prop, apply filterTree |
| Modify | `src/tests/ui/testList.spec.tsx` | Add tests for filtered rendering |
| Modify | `src/ui/TWDSidebar.tsx:14-27,43-255` | Add `search` prop, search state, filtered counters, Run Filtered |
| Modify | `src/tests/ui/twdSidebar.spec.tsx` | Add tests for search integration |
| Modify | `src/bundled.tsx:11-17,45-47` | Add `search` to InitTWDOptions, forward to sidebar |
| Modify | `src/tests/bundled/bundled.spec.ts` | Add test for search prop forwarding |
| Modify | `docs/getting-started.md` | Add `search` option to initTWD examples |
| Modify | `docs/frameworks.md:37-45` | Add `search` to initTWD Options list |

---

## Chunk 1: filterTree utility

### Task 1: filterTree utility

**Files:**
- Create: `src/ui/utils/filterTree.ts`
- Test: `src/tests/ui/utils/filterTree.spec.ts`

- [ ] **Step 1: Write failing tests for filterTree**

```typescript
// src/tests/ui/utils/filterTree.spec.ts
import { describe, it, expect } from "vitest";
import { filterTree } from "../../../ui/utils/filterTree";
import type { Node } from "../../../ui/utils/buildTreeFromHandlers";

const buildNode = (overrides: Partial<Node> & { name: string; id: string; type: "test" | "suite" }): Node => ({
  depth: 0,
  ...overrides,
});

describe("filterTree", () => {
  it("returns the full tree when query is empty", () => {
    const roots: Node[] = [
      buildNode({
        id: "s1", name: "Auth", type: "suite", childrenNodes: [
          buildNode({ id: "t1", name: "login test", type: "test" }),
        ],
      }),
    ];
    const result = filterTree(roots, "");
    expect(result).toEqual(roots);
  });

  it("returns empty array when no nodes match", () => {
    const roots: Node[] = [
      buildNode({
        id: "s1", name: "Auth", type: "suite", childrenNodes: [
          buildNode({ id: "t1", name: "login test", type: "test" }),
        ],
      }),
    ];
    const result = filterTree(roots, "zzzzz");
    expect(result).toEqual([]);
  });

  it("preserves ancestor chain when a test matches", () => {
    const roots: Node[] = [
      buildNode({
        id: "s1", name: "Auth", type: "suite", childrenNodes: [
          buildNode({
            id: "s2", name: "Login", type: "suite", childrenNodes: [
              buildNode({ id: "t1", name: "shows error on invalid password", type: "test" }),
              buildNode({ id: "t2", name: "redirects on success", type: "test" }),
            ],
          }),
          buildNode({
            id: "s3", name: "Signup", type: "suite", childrenNodes: [
              buildNode({ id: "t3", name: "validates email format", type: "test" }),
            ],
          }),
        ],
      }),
    ];
    const result = filterTree(roots, "error");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Auth");
    expect(result[0].childrenNodes).toHaveLength(1);
    expect(result[0].childrenNodes![0].name).toBe("Login");
    expect(result[0].childrenNodes![0].childrenNodes).toHaveLength(1);
    expect(result[0].childrenNodes![0].childrenNodes![0].name).toBe("shows error on invalid password");
  });

  it("matches describe block names", () => {
    const roots: Node[] = [
      buildNode({
        id: "s1", name: "Auth", type: "suite", childrenNodes: [
          buildNode({ id: "t1", name: "test 1", type: "test" }),
        ],
      }),
      buildNode({
        id: "s2", name: "Dashboard", type: "suite", childrenNodes: [
          buildNode({ id: "t2", name: "test 2", type: "test" }),
        ],
      }),
    ];
    const result = filterTree(roots, "auth");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Auth");
    expect(result[0].childrenNodes).toHaveLength(1);
  });

  it("is case-insensitive", () => {
    const roots: Node[] = [
      buildNode({
        id: "s1", name: "Auth", type: "suite", childrenNodes: [
          buildNode({ id: "t1", name: "Login Test", type: "test" }),
        ],
      }),
    ];
    const result = filterTree(roots, "LOGIN");
    expect(result).toHaveLength(1);
    expect(result[0].childrenNodes).toHaveLength(1);
  });

  it("does not mutate the original tree", () => {
    const child = buildNode({ id: "t1", name: "matching test", type: "test" });
    const other = buildNode({ id: "t2", name: "other test", type: "test" });
    const roots: Node[] = [
      buildNode({
        id: "s1", name: "Suite", type: "suite", childrenNodes: [child, other],
      }),
    ];
    filterTree(roots, "matching");
    expect(roots[0].childrenNodes).toHaveLength(2);
  });

  it("returns matching tests from multiple root suites", () => {
    const roots: Node[] = [
      buildNode({
        id: "s1", name: "Auth", type: "suite", childrenNodes: [
          buildNode({ id: "t1", name: "auth error", type: "test" }),
        ],
      }),
      buildNode({
        id: "s2", name: "API", type: "suite", childrenNodes: [
          buildNode({ id: "t2", name: "api error", type: "test" }),
          buildNode({ id: "t3", name: "api success", type: "test" }),
        ],
      }),
    ];
    const result = filterTree(roots, "error");
    expect(result).toHaveLength(2);
    expect(result[1].childrenNodes).toHaveLength(1);
    expect(result[1].childrenNodes![0].name).toBe("api error");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test src/tests/ui/utils/filterTree.spec.ts`
Expected: FAIL — module `filterTree` does not exist

- [ ] **Step 3: Implement filterTree**

```typescript
// src/ui/utils/filterTree.ts
import type { Node } from "./buildTreeFromHandlers";

export const filterTree = (roots: Node[], query: string): Node[] => {
  if (!query.trim()) return roots;

  const lowerQuery = query.toLowerCase();

  const filterNode = (node: Node): Node | null => {
    const nameMatches = node.name.toLowerCase().includes(lowerQuery);

    if (node.type === "test") {
      return nameMatches ? node : null;
    }

    // Suite: check if name matches or any children match
    const filteredChildren = (node.childrenNodes || [])
      .map(filterNode)
      .filter((n): n is Node => n !== null);

    if (nameMatches || filteredChildren.length > 0) {
      return {
        ...node,
        childrenNodes: nameMatches ? node.childrenNodes : filteredChildren,
      };
    }

    return null;
  };

  return roots.map(filterNode).filter((n): n is Node => n !== null);
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/tests/ui/utils/filterTree.spec.ts`
Expected: All 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/ui/utils/filterTree.ts src/tests/ui/utils/filterTree.spec.ts
git commit -m "feat: add filterTree utility for sidebar search"
```

---

### Task 2: runByIds method on TestRunner

**Files:**
- Modify: `src/runner.ts:253-269`
- Modify: `src/tests/runner/twd-runner.spec.ts`

- [ ] **Step 1: Write failing tests for runByIds**

Add to the end of `src/tests/runner/twd-runner.spec.ts`:

```typescript
it('should run only tests matching provided IDs with runByIds', async () => {
  const testFn1 = vi.fn();
  const testFn2 = vi.fn();
  const testFn3 = vi.fn();
  twd.describe('Suite A', () => {
    twd.it('test 1', testFn1);
    twd.it('test 2', testFn2);
  });
  twd.describe('Suite B', () => {
    twd.it('test 3', testFn3);
  });

  const tests = Array.from(twd.handlers.values());
  const test1 = tests.find(t => t.name === 'test 1')!;
  const test3 = tests.find(t => t.name === 'test 3')!;

  const mockEvents = {
    onStart: vi.fn(),
    onPass: vi.fn(),
    onFail: vi.fn(),
    onSkip: vi.fn(),
    onSuiteStart: vi.fn(),
    onSuiteEnd: vi.fn(),
  };

  const runner = new twd.TestRunner(mockEvents);
  await runner.runByIds([test1.id, test3.id]);

  expect(testFn1).toHaveBeenCalledTimes(1);
  expect(testFn2).not.toHaveBeenCalled();
  expect(testFn3).toHaveBeenCalledTimes(1);
});

it('should respect beforeEach/afterEach hooks in runByIds', async () => {
  const beforeFn = vi.fn();
  const afterFn = vi.fn();
  const testFn1 = vi.fn();
  const testFn2 = vi.fn();
  twd.describe('Suite with hooks', () => {
    twd.beforeEach(beforeFn);
    twd.afterEach(afterFn);
    twd.it('included test', testFn1);
    twd.it('excluded test', testFn2);
  });

  const tests = Array.from(twd.handlers.values());
  const test1 = tests.find(t => t.name === 'included test')!;

  const mockEvents = {
    onStart: vi.fn(),
    onPass: vi.fn(),
    onFail: vi.fn(),
    onSkip: vi.fn(),
    onSuiteStart: vi.fn(),
    onSuiteEnd: vi.fn(),
  };

  const runner = new twd.TestRunner(mockEvents);
  await runner.runByIds([test1.id]);

  expect(beforeFn).toHaveBeenCalledTimes(1);
  expect(afterFn).toHaveBeenCalledTimes(1);
  expect(testFn1).toHaveBeenCalledTimes(1);
  expect(testFn2).not.toHaveBeenCalled();
});

it('should respect .only and .skip within runByIds', async () => {
  const testFn1 = vi.fn();
  const testFn2 = vi.fn();
  const testFn3 = vi.fn();
  twd.describe('Suite', () => {
    twd.it('normal test', testFn1);
    twd.it.only('only test', testFn2);
    twd.it.skip('skip test', testFn3);
  });

  const tests = Array.from(twd.handlers.values());
  const allTestIds = tests.filter(t => t.type === 'test').map(t => t.id);

  const mockEvents = {
    onStart: vi.fn(),
    onPass: vi.fn(),
    onFail: vi.fn(),
    onSkip: vi.fn(),
    onSuiteStart: vi.fn(),
    onSuiteEnd: vi.fn(),
  };

  const runner = new twd.TestRunner(mockEvents);
  await runner.runByIds(allTestIds);

  // .only and .skip still apply within the filtered set
  expect(testFn1).not.toHaveBeenCalled();
  expect(testFn2).toHaveBeenCalledTimes(1);
  expect(testFn3).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test src/tests/runner/twd-runner.spec.ts`
Expected: FAIL — `runner.runByIds is not a function`

- [ ] **Step 3: Implement runByIds**

Add to the `TestRunner` class in `src/runner.ts`, after the `runSingle` method (after line 276):

```typescript
async runByIds(ids: string[]) {
  const idSet = new Set(ids);
  const rootSuites = Array.from(handlers.values()).filter(
    (h) => !h.parent && h.type === "suite"
  );
  const hasOnly = Array.from(handlers.values()).some((h) => h.only);
  for (const suite of rootSuites) {
    await this.runSuiteByIds(suite, idSet, hasOnly);
  }
  return handlers;
}

private async runSuiteByIds(suite: Handler, idSet: Set<string>, hasOnly: boolean) {
  // Check if this suite has any matching descendants
  const hasMatchingDescendant = this.hasDescendantInSet(suite, idSet);
  if (!hasMatchingDescendant) return;

  const suiteIsSkipped = isSuiteSkipped(suite.id);
  if (suiteIsSkipped && !hasOnlyInTree(suite.id)) {
    this.events.onSkip?.(suite);
    return;
  }

  if (hasOnly && !hasOnlyInTree(suite.id)) return;

  this.events.onSuiteStart?.(suite);
  const children = (suite.children || []).map((id) => handlers.get(id)!);

  for (const child of children) {
    if (child.type === "suite") {
      await this.runSuiteByIds(child, idSet, hasOnly);
    } else if (child.type === "test" && idSet.has(child.id)) {
      await this.runTest(child, hasOnly);
    }
  }
  this.events.onSuiteEnd?.(suite);
}

private hasDescendantInSet(handler: Handler, idSet: Set<string>): boolean {
  if (idSet.has(handler.id)) return true;
  if (!handler.children) return false;
  return handler.children.some((childId) => {
    const child = handlers.get(childId);
    return child ? this.hasDescendantInSet(child, idSet) : false;
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/tests/runner/twd-runner.spec.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/runner.ts src/tests/runner/twd-runner.spec.ts
git commit -m "feat: add runByIds method to TestRunner"
```

---

## Chunk 2: UI Components

### Task 3: SearchInput component

**Files:**
- Create: `src/ui/SearchInput.tsx`
- Create: `src/tests/ui/searchInput.spec.tsx`

- [ ] **Step 1: Write failing tests for SearchInput**

```typescript
// src/tests/ui/searchInput.spec.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { SearchInput } from "../../ui/SearchInput";

describe("SearchInput", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("renders search input with correct attributes", () => {
    render(<SearchInput value="" onChange={vi.fn()} />);
    const input = screen.getByLabelText("Filter tests");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "search");
    expect(input).toHaveAttribute("placeholder", "Filter tests...");
  });

  it("calls onChange when typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);
    const input = screen.getByLabelText("Filter tests");
    await user.type(input, "auth");
    expect(onChange).toHaveBeenCalled();
  });

  it("shows clear button when value is not empty", () => {
    render(<SearchInput value="auth" onChange={vi.fn()} />);
    const clearButton = screen.getByLabelText("Clear search filter");
    expect(clearButton).toBeInTheDocument();
  });

  it("does not show clear button when value is empty", () => {
    render(<SearchInput value="" onChange={vi.fn()} />);
    expect(screen.queryByLabelText("Clear search filter")).not.toBeInTheDocument();
  });

  it("calls onChange with empty string and focuses input when clear is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="auth" onChange={onChange} />);
    const clearButton = screen.getByLabelText("Clear search filter");
    await user.click(clearButton);
    expect(onChange).toHaveBeenCalledWith("");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test src/tests/ui/searchInput.spec.tsx`
Expected: FAIL — cannot find `SearchInput`

- [ ] **Step 3: Implement SearchInput**

```tsx
// src/ui/SearchInput.tsx
import { useRef } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput = ({ value, onChange }: SearchInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div style={{ position: "relative", marginBottom: "var(--twd-spacing-md)" }}>
      <input
        ref={inputRef}
        type="search"
        aria-label="Filter tests"
        placeholder="Filter tests..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "var(--twd-spacing-xs) var(--twd-spacing-md)",
          paddingRight: value ? "28px" : "var(--twd-spacing-md)",
          background: "var(--twd-background)",
          color: "var(--twd-text)",
          border: "1px solid var(--twd-border)",
          borderRadius: "var(--twd-border-radius)",
          fontSize: "var(--twd-font-size-sm)",
          boxSizing: "border-box",
          outline: "none",
        }}
      />
      {value && (
        <button
          aria-label="Clear search filter"
          onClick={handleClear}
          style={{
            position: "absolute",
            right: "4px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--twd-text-secondary)",
            fontSize: "var(--twd-font-size-sm)",
            padding: "2px 4px",
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/tests/ui/searchInput.spec.tsx`
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/ui/SearchInput.tsx src/tests/ui/searchInput.spec.tsx
git commit -m "feat: add SearchInput component for sidebar filtering"
```

---

### Task 4: TestList filtering integration

**Files:**
- Modify: `src/ui/TestList.tsx`
- Modify: `src/tests/ui/testList.spec.tsx`

- [ ] **Step 1: Write failing tests for TestList with search**

Add to `src/tests/ui/testList.spec.tsx`:

```typescript
it("should filter tests by search query preserving hierarchy", () => {
  twd.describe("Auth", () => {
    twd.describe("Login", () => {
      twd.it("shows error on invalid password", () => {});
      twd.it("redirects on success", () => {});
    });
    twd.describe("Signup", () => {
      twd.it("validates email format", () => {});
    });
  });
  const mockRunTest = vi.fn();
  const tests = Array.from(twd.handlers.values());

  render(<TestList tests={tests} runTest={mockRunTest} searchQuery="error" />);

  // Auth and Login describe blocks should be visible
  expect(screen.getByTestId("test-group-Auth")).toBeInTheDocument();
  expect(screen.getByTestId("test-group-Login")).toBeInTheDocument();
  // Matching test visible
  expect(screen.getByText("shows error on invalid password")).toBeInTheDocument();
  // Non-matching test hidden
  expect(screen.queryByText("redirects on success")).not.toBeInTheDocument();
  // Non-matching branch hidden
  expect(screen.queryByTestId("test-group-Signup")).not.toBeInTheDocument();
});

it("should show empty state when no tests match search query", () => {
  twd.describe("Auth", () => {
    twd.it("login test", () => {});
  });
  const mockRunTest = vi.fn();
  const tests = Array.from(twd.handlers.values());

  render(<TestList tests={tests} runTest={mockRunTest} searchQuery="zzzzz" />);

  expect(screen.getByText(/No tests match "zzzzz"/)).toBeInTheDocument();
});

it("should show all tests when searchQuery is empty", () => {
  twd.describe("Auth", () => {
    twd.it("test 1", () => {});
    twd.it("test 2", () => {});
  });
  const mockRunTest = vi.fn();
  const tests = Array.from(twd.handlers.values());

  render(<TestList tests={tests} runTest={mockRunTest} searchQuery="" />);

  expect(screen.getByText("test 1")).toBeInTheDocument();
  expect(screen.getByText("test 2")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test src/tests/ui/testList.spec.tsx`
Expected: FAIL — `searchQuery` prop not accepted

- [ ] **Step 3: Update TestList to accept searchQuery and filter**

In `src/ui/TestList.tsx`, make these changes:

1. Add import for `filterTree`:
```typescript
import { filterTree } from "./utils/filterTree";
```

2. Add `searchQuery` to `TestListProps`:
```typescript
interface TestListProps {
  runTest: (id: string) => Promise<void>;
  tests: Test[];
  searchQuery?: string;
}
```

3. Update the component to destructure and use it:
```typescript
export const TestList = ({ tests, runTest, searchQuery = "" }: TestListProps) => {
```

4. After `const roots = buildTreeFromHandlers(tests);`, add:
```typescript
const filteredRoots = filterTree(roots, searchQuery);
```

5. In the return, replace `roots.map` with `filteredRoots.map` and add the empty state:
```tsx
return (
  <ul
    ref={listContainerRef}
    style={{ listStyle: "none", padding: 0, margin: 0 }}
    role="list"
    aria-label="Test list"
  >
    {filteredRoots.length === 0 && searchQuery ? (
      <li style={{
        padding: "var(--twd-spacing-md)",
        color: "var(--twd-text-secondary)",
        fontSize: "var(--twd-font-size-sm)",
        textAlign: "center",
      }}>
        No tests match "{searchQuery}"
      </li>
    ) : (
      filteredRoots.map((n) => renderNode(n))
    )}
  </ul>
);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/tests/ui/testList.spec.tsx`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/ui/TestList.tsx src/tests/ui/testList.spec.tsx
git commit -m "feat: add search filtering to TestList with empty state"
```

---

## Chunk 3: Sidebar integration and bundled support

### Task 5: TWDSidebar search integration

**Files:**
- Modify: `src/ui/TWDSidebar.tsx`
- Modify: `src/tests/ui/twdSidebar.spec.tsx`

- [ ] **Step 1: Write failing tests for search in TWDSidebar**

Add a new `describe("search feature", ...)` block to `src/tests/ui/twdSidebar.spec.tsx`:

```typescript
describe("search feature", () => {
  it("should not render search input when search prop is false", () => {
    render(<TWDSidebar open={true} />);
    expect(screen.queryByLabelText("Filter tests")).not.toBeInTheDocument();
  });

  it("should render search input when search prop is true", () => {
    render(<TWDSidebar open={true} search={true} />);
    expect(screen.getByLabelText("Filter tests")).toBeInTheDocument();
  });

  it("should filter tests when typing in search input", async () => {
    const user = userEvent.setup();
    twd.describe("Auth", () => {
      twd.it("login test", () => {});
      twd.it("error test", () => {});
    });
    render(<TWDSidebar open={true} search={true} />);
    const input = screen.getByLabelText("Filter tests");
    await user.type(input, "error");
    expect(screen.getByText("error test")).toBeInTheDocument();
    expect(screen.queryByText("login test")).not.toBeInTheDocument();
  });

  it("should persist search query to sessionStorage", async () => {
    const user = userEvent.setup();
    twd.describe("Group", () => {
      twd.it("test 1", () => {});
    });
    render(<TWDSidebar open={true} search={true} />);
    const input = screen.getByLabelText("Filter tests");
    await user.type(input, "test");
    expect(sessionStorage.getItem("twd-search-filter")).toBe("test");
  });

  it("should restore search query from sessionStorage on mount", () => {
    sessionStorage.setItem("twd-search-filter", "error");
    twd.describe("Auth", () => {
      twd.it("error test", () => {});
      twd.it("login test", () => {});
    });
    render(<TWDSidebar open={true} search={true} />);
    expect(screen.getByLabelText("Filter tests")).toHaveValue("error");
    expect(screen.getByText("error test")).toBeInTheDocument();
    expect(screen.queryByText("login test")).not.toBeInTheDocument();
  });

  it("should clear sessionStorage when search prop is false", () => {
    sessionStorage.setItem("twd-search-filter", "old-query");
    render(<TWDSidebar open={true} search={false} />);
    expect(sessionStorage.getItem("twd-search-filter")).toBeNull();
  });

  it("should show 'Run Filtered' button when search is active", async () => {
    const user = userEvent.setup();
    twd.describe("Group", () => {
      twd.it("test 1", () => {});
    });
    render(<TWDSidebar open={true} search={true} />);
    const input = screen.getByLabelText("Filter tests");
    await user.type(input, "test");
    expect(screen.getByText("Run Filtered")).toBeInTheDocument();
    expect(screen.queryByText("Run All")).not.toBeInTheDocument();
  });

  it("should show 'Run All' when search is cleared", async () => {
    const user = userEvent.setup();
    twd.describe("Group", () => {
      twd.it("test 1", () => {});
    });
    render(<TWDSidebar open={true} search={true} />);
    // Type then clear
    const input = screen.getByLabelText("Filter tests");
    await user.type(input, "test");
    expect(screen.getByText("Run Filtered")).toBeInTheDocument();
    const clearButton = screen.getByLabelText("Clear search filter");
    await user.click(clearButton);
    expect(screen.getByText("Run All")).toBeInTheDocument();
  });

  it("should show filtered counters when search is active", async () => {
    const user = userEvent.setup();
    twd.describe("Auth", () => {
      twd.it("error test", () => {});
      twd.it("login test", () => {});
      twd.it("another error", () => {});
    });
    render(<TWDSidebar open={true} search={true} />);
    const input = screen.getByLabelText("Filter tests");
    await user.type(input, "error");
    // Should show 2 total (only filtered tests)
    expect(screen.getByText(/Total:\s*2/)).toBeInTheDocument();
  });

  it("should run only filtered tests when clicking Run Filtered", async () => {
    const user = userEvent.setup();
    const errorFn = vi.fn();
    const loginFn = vi.fn();
    twd.describe("Auth", () => {
      twd.it("error test", errorFn);
      twd.it("login test", loginFn);
    });
    render(<TWDSidebar open={true} search={true} />);
    const input = screen.getByLabelText("Filter tests");
    await user.type(input, "error");
    const runButton = screen.getByText("Run Filtered");
    await user.click(runButton);
    expect(errorFn).toHaveBeenCalled();
    expect(loginFn).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test src/tests/ui/twdSidebar.spec.tsx`
Expected: FAIL — `search` prop not accepted

- [ ] **Step 3: Implement search in TWDSidebar**

Changes to `src/ui/TWDSidebar.tsx`:

1. Add imports:
```typescript
import { SearchInput } from "./SearchInput";
import { filterTree } from "./utils/filterTree";
import { buildTreeFromHandlers } from "./utils/buildTreeFromHandlers";
```

2. Update `TWDSidebarProps`:
```typescript
interface TWDSidebarProps {
  open: boolean;
  position?: "left" | "right";
  search?: boolean;
}
```

3. Inside the component, add search state and sessionStorage logic:
```typescript
const getSearchQuery = (search?: boolean) => {
  if (!search) {
    sessionStorage.removeItem('twd-search-filter');
    return '';
  }
  return sessionStorage.getItem('twd-search-filter') || '';
};
```

4. Add state inside the component:
```typescript
const [searchQuery, setSearchQuery] = useState(getSearchQuery(search));
```

5. Add handler:
```typescript
const handleSearchChange = (value: string) => {
  setSearchQuery(value);
  if (value) {
    sessionStorage.setItem('twd-search-filter', value);
  } else {
    sessionStorage.removeItem('twd-search-filter');
  }
};
```

6. Compute filtered test IDs for counters and run:
```typescript
const roots = buildTreeFromHandlers(tests.map(test => ({
  name: test.name, depth: test.depth, status: test.status,
  logs: test.logs, id: test.id, parent: test.parent,
  type: test.type, only: test.only, skip: test.skip,
})));
const filteredRoots = filterTree(roots, searchQuery);

const collectTestIds = (nodes: typeof filteredRoots): string[] => {
  const ids: string[] = [];
  for (const node of nodes) {
    if (node.type === 'test') ids.push(node.id);
    if (node.childrenNodes) ids.push(...collectTestIds(node.childrenNodes));
  }
  return ids;
};
const filteredTestIds = searchQuery ? collectTestIds(filteredRoots) : null;
const filteredTestSet = filteredTestIds ? new Set(filteredTestIds) : null;

const displayTests = filteredTestSet
  ? tests.filter(t => t.type === 'test' && filteredTestSet.has(t.id))
  : tests.filter(t => t.type === 'test');
const totalTests = displayTests.length;
```

7. Update `runAll`:
```typescript
const runAll = async () => {
  setMessage('');
  sessionStorage.removeItem('twd-last-run-test-name');
  if (filteredTestIds) {
    await runner.runByIds(filteredTestIds);
  } else {
    await runner.runAll();
  }
  const srMessage = displaySRMessageAllTests(tests);
  setMessage(srMessage);
};
```

8. Update the "Run All" button text with `aria-live="polite"` for screen reader announcements:
```tsx
<span aria-live="polite">{searchQuery ? "Run Filtered" : "Run All"}</span>
```

9. Add SearchInput below the sticky header (inside the sticky div, after MockRulesButton):
```tsx
{search && (
  <SearchInput value={searchQuery} onChange={handleSearchChange} />
)}
```

10. Update counters to use `displayTests`:
```tsx
<span style={{ color: "var(--twd-text)" }}>Total: {totalTests}</span>
<div style={{ display: "flex", gap: "var(--twd-spacing-xs)" }}>
  <span style={{ color: "var(--twd-success)" }}>&#10003; {displayTests.filter(test => test.status === "pass").length}</span>
  <span style={{ color: "var(--twd-error)" }}>&#10007; {displayTests.filter(test => test.status === "fail").length}</span>
</div>
```

11. Pass `searchQuery` to `TestList`:
```tsx
<TestList
  tests={tests.map(test => ({ ... }))}
  runTest={runTest}
  searchQuery={searchQuery}
/>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/tests/ui/twdSidebar.spec.tsx`
Expected: All tests PASS

- [ ] **Step 5: Run all existing tests to check for regressions**

Run: `npm run test:ci`
Expected: All existing tests still PASS

- [ ] **Step 6: Commit**

```bash
git add src/ui/TWDSidebar.tsx src/tests/ui/twdSidebar.spec.tsx
git commit -m "feat: integrate search filter into TWDSidebar"
```

---

### Task 6: Bundled setup support

**Files:**
- Modify: `src/bundled.tsx`
- Modify: `src/tests/bundled/bundled.spec.ts`

- [ ] **Step 1: Write failing test for search prop in bundled**

Add to `src/tests/bundled/bundled.spec.ts`:

```typescript
it('should forward search option to TWDSidebar', () => {
  const files = {};
  initTWD(files, { search: true });

  expect(initTests).toHaveBeenCalled();
  const callArgs = (initTests as any).mock.calls[0];
  expect(callArgs[1].props).toEqual({ open: true, position: 'left', search: true });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/tests/bundled/bundled.spec.ts`
Expected: FAIL — `search` not in props

- [ ] **Step 3: Implement search in bundled.tsx**

1. Add `search` to `InitTWDOptions`:
```typescript
interface InitTWDOptions {
  open?: boolean;
  position?: "left" | "right";
  serviceWorker?: boolean;
  serviceWorkerUrl?: string;
  theme?: Partial<TWDTheme>;
  search?: boolean;
}
```

2. Destructure and forward in `initTWD`:
```typescript
export const initTWD = (files: TestModule, options?: InitTWDOptions) => {
  const { open = true, position = "left", serviceWorker = true, serviceWorkerUrl = '/mock-sw.js', theme, search } = options || {};
  initTests(files, <TWDSidebar open={open} position={position} {...(search !== undefined && { search })} />, createRoot, theme);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/tests/bundled/bundled.spec.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/bundled.tsx src/tests/bundled/bundled.spec.ts
git commit -m "feat: add search option to initTWD bundled setup"
```

---

## Chunk 4: Documentation

### Task 7: Update documentation

**Files:**
- Modify: `docs/frameworks.md`
- Modify: `docs/getting-started.md`

- [ ] **Step 1: Update frameworks.md initTWD Options**

In `docs/frameworks.md`, add to the options list (after the `theme` bullet, around line 45):

```markdown
- **`search`** (`boolean`, optional) - Whether to show the search/filter input in the sidebar. Default: `false`
```

Add a search example to the examples section:

```tsx
// Enable test filtering in the sidebar
initTWD(tests, { search: true });
```

- [ ] **Step 2: Update getting-started.md**

In `docs/getting-started.md`, add `search` to the initTWD example (around line 50-55):

```tsx
initTWD(tests, {
  open: true,
  position: 'left',
  search: true,                   // Enable search/filter in the sidebar (default: false)
  serviceWorker: true,
  serviceWorkerUrl: '/mock-sw.js'
});
```

- [ ] **Step 3: Commit**

```bash
git add docs/frameworks.md docs/getting-started.md
git commit -m "docs: add search option to sidebar documentation"
```

---

### Task 8: Final verification

- [ ] **Step 1: Run full test suite**

Run: `npm run test:ci`
Expected: All tests PASS, no regressions

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Verify docs build**

Run: `npm run docs:build`
Expected: Docs build succeeds
