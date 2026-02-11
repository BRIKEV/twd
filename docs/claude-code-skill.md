# Claude Code Skill

Create a custom Claude Code **skill** (slash command) that writes TWD tests, runs them via `twd-relay`, and iterates until they pass — all while you develop.

::: tip How this fits with other AI features
- **[AI Context](/agents)** — Prompts so your AI writes correct TWD tests
- **[MCP Integration](/mcp-integration)** — Generate test code from browser automation
- **[AI Remote Testing](/ai-remote-testing)** — Run tests and get results via WebSocket
- **Claude Code Skill (this page)** — Autonomous test agent for Claude Code
:::

## What Is a Claude Code Skill?

A **skill** is a reusable prompt file that extends Claude Code with project-specific capabilities. Skills appear as slash commands (e.g., `/twd-tester`) and can also be auto-invoked by Claude when it detects the task is relevant.

Key features:
- **`context: fork`** — runs as an isolated sub-agent (separate conversation), keeping your main session clean
- **`allowed-tools`** — controls what the agent can do (read files, write tests, run commands)
- **`$ARGUMENTS`** — receives input from you (e.g., `/twd-tester order detail page`)

## How It Works

When you're developing a feature and need tests, the flow looks like this:

```
You: "Add a delete button to the user profile page"
  │
  ├─ Claude: implements the feature
  │
  ├─ Claude sees testing is needed → spawns twd-tester agent
  │    ├─ Reads your component to understand the UI
  │    ├─ Reads existing tests for patterns
  │    ├─ Writes new test + mock data
  │    ├─ Runs: npx twd-relay run
  │    ├─ Reads failures → fixes → re-runs
  │    └─ Returns: "Tests written and passing"
  │
  └─ Claude: continues with your task
```

The agent works autonomously in a forked context — your main conversation isn't cluttered with test-writing steps.

### Manual invocation

You can also trigger it directly:

```
/twd-tester write tests for the login page
```

## Prerequisites

Before setting up the skill, make sure you have:

1. **twd-relay** installed and configured ([AI Remote Testing guide](/ai-remote-testing))
2. **Dev server running** with tests enabled (e.g., `VITE_ENABLE_TESTS=true`)
3. **Claude Code** installed ([claude.ai/code](https://claude.ai/code))

## Setup

### 1. Create the skill directory

```bash
mkdir -p .claude/skills/twd-tester
```

### 2. Create the SKILL.md file

Copy the template below into `.claude/skills/twd-tester/SKILL.md` and customize the **"Project-Specific Patterns"** section for your app.

::: details Full SKILL.md template (click to expand)

```yaml
---
name: twd-tester
description: TWD test agent — writes, runs, and validates E2E tests while you develop. Automatically invoked when writing or modifying tests, or when verifying features work correctly.
argument-hint: [what-to-test]
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash(npx twd-relay run:*), Bash(npx twd-relay run), Task]
context: fork
agent: general-purpose
---
```

````markdown
# TWD Test Agent

You are a testing agent. Your job is to write TWD E2E tests, run them via twd-relay, read failures, fix issues, and re-run until they pass.

The user wants to: $ARGUMENTS

## Workflow

1. **Understand the feature** — Read the page component, its loader/service, and API layer to understand what the UI renders and what API calls are made.
2. **Check existing tests** — Read `src/twd-tests/` for patterns and conventions already in use.
3. **Write or modify the test** — Follow the patterns below. Place tests in `src/twd-tests/<feature-name>/<feature-name>.twd.test.ts` with mock JSON in `src/twd-tests/<feature-name>/mocks/`.
4. **Run the tests** — Execute `npx twd-relay run` to trigger the browser test run.
5. **Read failures and fix** — If tests fail, analyze the error, fix the test or code, and re-run. Repeat until green.

---

## TWD-JS API Reference

### Required Imports

```typescript
import { twd, userEvent, screenDom } from "twd-js";
import { describe, it, beforeEach, afterEach, expect } from "twd-js/runner";
```

NEVER import `describe`, `it`, `beforeEach`, `expect` from other libraries. They MUST come from `twd-js/runner`.

### File Naming

`*.twd.test.ts` (or `.tsx`). Place in `src/twd-tests/<feature-name>/`.

### Async/Await

`twd.get()`, `twd.getAll()`, `userEvent.*`, `screenDom.findBy*`, `twd.visit()`, `twd.waitForRequest()` are ALL async. Always await them.

### Element Selection (prefer accessible queries)

```typescript
// By role (RECOMMENDED)
screenDom.getByRole("button", { name: /submit/i });
screenDom.getByRole("heading", { level: 2, name: "Title" });

// By label (form inputs)
screenDom.getByLabelText(/email/i);

// By text
screenDom.getByText(/no items/i);

// Async variants (wait for element to appear)
await screenDom.findByRole("heading", { name: "Title" }, { timeout: 3000 });
await screenDom.findAllByRole("row");

// CSS selector fallback (returns twd element)
const el = await twd.get(".custom-container");
const els = await twd.getAll(".item");
```

### User Interactions

```typescript
await userEvent.type(input, "text value");
await userEvent.clear(input);
await userEvent.click(button);
await userEvent.selectOptions(select, "value");
await userEvent.keyboard("{enter}");
```

### Navigation

```typescript
await twd.visit("/some-page");
await twd.wait(100); // ms delay
```

### Assertions

```typescript
// Element assertions (function style — use with screenDom elements)
twd.should(element, "be.visible");
twd.should(element, "not.be.visible");
twd.should(element, "contain.text", "Expected");
twd.should(element, "have.text", "Exact Text");
twd.should(element, "have.attr", "aria-selected", "true");
twd.should(element, "have.value", "test@example.com");
twd.should(element, "be.disabled");
twd.should(element, "be.enabled");
twd.should(element, "be.checked");

// Element assertions (method style — use with twd.get() elements)
const el = await twd.get(".item");
el.should("have.text", "Hello");

// URL assertions
await twd.url().should("contain.url", "/dashboard");

// Chai expect (non-element assertions)
expect(array).to.have.length(3);
expect(request.request).to.deep.equal({ key: "value" });
```

### API Mocking

CRITICAL: Always mock BEFORE `twd.visit()` or the action that triggers the request.

```typescript
await twd.mockRequest("uniqueLabel", {
  url: "/api/some-endpoint",
  method: "GET",
  response: mockData,
  status: 200,
});

// With regex URL matching
await twd.mockRequest("search", {
  url: "/api/users\\?.*",
  method: "GET",
  response: results,
  status: 200,
  urlRegex: true,
});

// Wait for request and verify payload
const req = await twd.waitForRequest("createItem");
expect(req.request).to.deep.equal({ field: "value" });

// Clear all mocks (in beforeEach)
twd.clearRequestMockRules();
```

### Sinon Stubs (for module mocking)

Tests run in the browser. ESM named exports are IMMUTABLE and cannot be stubbed.
Solution: wrap hooks/services in objects with default export.

```typescript
import Sinon from "sinon";
import authModule from "../hooks/useAuth";

Sinon.stub(authModule, "useAuth").returns({ isAuthenticated: true });
// Cleanup: Sinon.restore() in beforeEach
```

---

## Project-Specific Patterns

> **CUSTOMIZE THIS SECTION** for your app. Replace the examples below with your actual auth setup, route patterns, and shared test utilities.

### Standard Test Structure

```typescript
import { screenDom, twd, userEvent } from "twd-js";
import { beforeEach, describe, it } from "twd-js/runner";
// Import your project's shared test utilities:
// import { mockAuth } from "../utils/authMock";
// import { setupFeatureFlags } from "../utils/flagsMock";
import mockData from "./mocks/someData.json";

describe("Feature name", () => {
  beforeEach(async () => {
    twd.clearRequestMockRules();
    // Call your project's shared setup here:
    // mockAuth();
    // setupFeatureFlags();
  });

  it("should display the page correctly", async () => {
    await twd.mockRequest("getData", {
      method: "GET",
      url: "/api/your-endpoint",
      response: mockData,
      status: 200,
    });

    await twd.visit("/your-route");

    const heading = await screenDom.findByRole(
      "heading",
      { name: "Page Title" },
      { timeout: 3000 },
    );
    twd.should(heading, "be.visible");
  });
});
```

### Mock Data

- Store as JSON files in `src/twd-tests/<feature-name>/mocks/`
- Shape should match your API response format

---

## Running Tests

```bash
npx twd-relay run
```

Exit code 0 = all passed, 1 = failures.

---

## Common Mistakes to AVOID

1. **Forgetting `await`** on async methods
2. **Mocking AFTER visit** — always mock before `twd.visit()`
3. **Not clearing mocks** — always `twd.clearRequestMockRules()` in `beforeEach`
4. **Using Node.js APIs** — tests run in browser, no `fs`, `path`, etc.
5. **Importing from wrong package** — `describe/it/beforeEach` from `twd-js/runner`, NOT Jest/Mocha
6. **Stubbing named exports** — ESM makes them immutable. Use the default-export object pattern.

---

## Instructions

1. **Read the page component first** to understand what UI elements and roles exist
2. **Read the service/API layer** to understand URL patterns
3. **Read existing tests** for project conventions
4. **Create mock data** matching the API response shape
5. **Write tests** following the standard structure above
6. **Run with `npx twd-relay run`** and iterate until green
7. **Cover**: page rendering, user interactions, CRUD operations, empty states, error states
````

:::

### 3. Customize for your project

The template has a **"Project-Specific Patterns"** section with placeholder comments. Replace those with your actual:

- **Auth setup** — how tests authenticate (mock user cookie, stub auth hook, etc.)
- **Feature flag mocking** — if you use feature flags, show how tests stub them
- **Route patterns** — your app's base path and route structure
- **API URL patterns** — the URL conventions your backend uses
- **Shared utilities** — any `beforeEach` helpers your tests share

## SKILL.md Frontmatter Reference

| Field | Value | Purpose |
|-------|-------|---------|
| `name` | `twd-tester` | Appears as `/twd-tester` in the command palette |
| `description` | (text) | When Claude auto-invokes the skill (intent matching) |
| `argument-hint` | `[what-to-test]` | Shown in autocomplete: `/twd-tester [what-to-test]` |
| `allowed-tools` | `[Read, Write, ...]` | What the agent can do without asking permission |
| `context` | `fork` | Runs as isolated sub-agent (keeps main conversation clean) |
| `agent` | `general-purpose` | Sub-agent type (has access to all tools) |
| `disable-model-invocation` | `true` (optional) | Set this if you only want manual `/twd-tester` invocation |
| `user-invocable` | `false` (optional) | Set this to hide from `/` menu (only Claude can invoke) |

## How Auto-Invocation Works

When `disable-model-invocation` is **not set** (the default), Claude reads the skill's `description` and decides whether to invoke it based on your current task. For example:

- You ask: _"Add a search filter to the orders page"_
- Claude implements the feature
- Claude sees the `twd-tester` description mentions "verifying features work correctly"
- Claude automatically spawns the agent to write and run tests

If you prefer full control, set `disable-model-invocation: true` — then only explicit `/twd-tester` invocations will trigger it.

## Tips

- **Keep the dev server running** with tests enabled. The agent needs `npx twd-relay run` to work.
- **Start with manual invocation** (`/twd-tester`) to get comfortable before relying on auto-invocation.
- **Add project patterns incrementally** — start with the template, then add more project-specific patterns as you discover what the agent needs.
- The agent reads your actual source code each time, so it adapts to changes automatically. The SKILL.md just provides the TWD API reference and project conventions.
