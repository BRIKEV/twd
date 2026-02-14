---
name: twd-test-writer
description: TWD test writing context — teaches AI agents how to write correct TWD (Test While Developing) in-browser tests. Use this when writing, reviewing, or modifying TWD test files (*.twd.test.ts).
---

# TWD Test Writing Guide

You are writing tests for **TWD (Test While Developing)**, an in-browser testing library. Tests run in the browser (not Node.js) with a sidebar UI for instant visual feedback. Syntax is similar to Jest/Cypress but with key differences.

**Key characteristics:**
- Designed for SPAs (React, Vue, Angular, Solid.js)
- Not suitable for SSR-first architectures (Next.js App Router)
- Uses Mock Service Worker (MSW) for API mocking
- Uses `@testing-library/dom` for element queries

## Required Imports

Every TWD test file needs these exact imports:

```typescript
import { twd, userEvent, screenDom } from "twd-js";
import { describe, it, beforeEach, afterEach, expect } from "twd-js/runner";
```

**Package exports:**
- `twd-js` — Main API (`twd`, `userEvent`, `screenDom`, `screenDomGlobal`)
- `twd-js/runner` — Test functions (`describe`, `it`, `beforeEach`, `afterEach`, `expect`)
- `twd-js/ui` — UI components (`MockedComponent`)

NEVER import `describe`, `it`, `beforeEach`, `expect` from Jest, Mocha, or other libraries. They MUST come from `twd-js/runner`.

## File Naming

Test files must follow: `*.twd.test.ts` or `*.twd.test.tsx`

## Core Rules

### Async/Await is Required

```typescript
// twd.get() and twd.getAll() are async — ALWAYS await
const button = await twd.get("button");
const items = await twd.getAll(".item");

// userEvent methods are async — ALWAYS await
await userEvent.click(button.el);
await userEvent.type(input, "text");

// Test functions should be async
it("should do something", async () => { /* ... */ });
```

### Element Selection

**Preferred: Testing Library queries via `screenDom`**

```typescript
// By role (most accessible — RECOMMENDED)
const button = screenDom.getByRole("button", { name: "Submit" });
const heading = screenDom.getByRole("heading", { name: "Welcome", level: 1 });

// By label (for form inputs)
const emailInput = screenDom.getByLabelText("Email Address");

// By text content
const message = screenDom.getByText("Success!");
const partial = screenDom.getByText(/welcome/i);

// By test ID
const card = screenDom.getByTestId("user-card");

// Query variants
screenDom.getByRole("button");        // Throws if not found
screenDom.queryByRole("button");      // Returns null if not found
await screenDom.findByRole("button"); // Waits for element (async)
screenDom.getAllByRole("button");     // Returns array
```

**For modals/portals use `screenDomGlobal`:**

```typescript
import { screenDomGlobal } from "twd-js";
const modal = screenDomGlobal.getByRole("dialog");
```

**Fallback: CSS selectors via `twd.get()`**

```typescript
const button = await twd.get("button");
const byId = await twd.get("#email");
const byClass = await twd.get(".error-message");
const multiple = await twd.getAll(".item");
```

### User Interactions

```typescript
const user = userEvent.setup();

// With screenDom elements (direct)
await user.click(screenDom.getByRole("button", { name: "Save" }));
await user.type(screenDom.getByLabelText("Email"), "hello@example.com");

// With twd.get() elements (use .el for raw DOM)
const twdButton = await twd.get(".save-btn");
await user.click(twdButton.el);

// Other interactions
await user.dblClick(element);
await user.clear(input);
await user.selectOptions(select, "option-value");
await user.keyboard("{Enter}");
```

### Assertions

**Method style (on twd elements):**

```typescript
const element = await twd.get("h1");
element.should("have.text", "Welcome");
element.should("contain.text", "come");
element.should("be.visible");
element.should("not.be.visible");
element.should("have.class", "header");
element.should("have.value", "test@example.com");
element.should("have.attr", "type", "submit");
element.should("be.disabled");
element.should("be.enabled");
element.should("be.checked");
element.should("be.focused");
element.should("be.empty");
```

**Function style (any element):**

```typescript
twd.should(screenDom.getByRole("button"), "be.visible");
twd.should(screenDom.getByRole("button"), "have.text", "Submit");
```

**URL assertions:**

```typescript
await twd.url().should("eq", "http://localhost:3000/dashboard");
await twd.url().should("contain.url", "/dashboard");
```

**Chai expect (for non-element assertions):**

```typescript
expect(array).to.have.length(3);
expect(value).to.equal("expected");
expect(obj).to.deep.equal({ key: "value" });
```

### Navigation and Waiting

```typescript
await twd.visit("/");
await twd.visit("/login");
await twd.wait(1000); // Wait for time (ms)
await screenDom.findByText("Success!"); // Wait for element
await twd.notExists(".loading-spinner"); // Wait for element to NOT exist
```

## API Mocking

TWD uses Mock Service Worker. **Always mock BEFORE the request fires.**

```typescript
// Mock GET request
await twd.mockRequest("getUser", {
  method: "GET",
  url: "/api/user/123",
  response: { id: 123, name: "John Doe" },
  status: 200,
});

// Mock POST request
await twd.mockRequest("createUser", {
  method: "POST",
  url: "/api/users",
  response: { id: 456, created: true },
  status: 201,
});

// URL patterns with regex
await twd.mockRequest("getUserById", {
  method: "GET",
  url: /\/api\/users\/\d+/,
  response: { id: 999, name: "Dynamic User" },
  urlRegex: true,
});

// Error responses
await twd.mockRequest("serverError", {
  method: "GET",
  url: "/api/data",
  response: { error: "Server error" },
  status: 500,
});

// Wait for request and inspect body
const rule = await twd.waitForRequest("submitForm");
expect(rule.request).to.deep.equal({ email: "test@example.com" });

// Wait for multiple requests
await twd.waitForRequests(["getUser", "getPosts"]);
```

## Component Mocking

```tsx
// In your component — wrap with MockedComponent
import { MockedComponent } from "twd-js/ui";

function Dashboard() {
  return (
    <MockedComponent name="ExpensiveChart">
      <ExpensiveChart data={data} />
    </MockedComponent>
  );
}
```

```typescript
// In your test
twd.mockComponent("ExpensiveChart", () => (
  <div data-testid="mock-chart">Mocked Chart</div>
));
```

## Module Stubbing with Sinon

Tests run in the browser. ESM named exports are **IMMUTABLE** and **cannot be stubbed**.

**Solution:** wrap hooks/services in objects with default export.

```typescript
// hooks/useAuth.ts — CORRECT: stubbable
const useAuth = () => useAuth0();
export default { useAuth };

// hooks/useAuth.ts — WRONG: cannot be stubbed
export const useAuth = () => useAuth0();
```

```typescript
// In test:
import Sinon from "sinon";
import authModule from "../hooks/useAuth";

Sinon.stub(authModule, "useAuth").returns({
  isAuthenticated: true,
  user: { name: "John" },
});
// Always Sinon.restore() in beforeEach
```

## Standard Test Template

```typescript
import { twd, userEvent, screenDom } from "twd-js";
import { describe, it, beforeEach, expect } from "twd-js/runner";

describe("Feature Name", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
    twd.clearComponentMocks();
  });

  it("should display the page correctly", async () => {
    // 1. Setup mocks BEFORE visiting
    await twd.mockRequest("getData", {
      method: "GET",
      url: "/api/data",
      response: { items: [] },
      status: 200,
    });

    // 2. Navigate
    await twd.visit("/page");

    // 3. Wait for async operations
    await twd.waitForRequest("getData");

    // 4. Interact
    const user = userEvent.setup();
    const button = screenDom.getByRole("button", { name: "Load" });
    await user.click(button);

    // 5. Assert
    const message = await twd.get(".message");
    message.should("have.text", "No items found");
  });

  it.only("debug this test", async () => { /* Only this test runs */ });
  it.skip("skip this test", async () => { /* This test won't run */ });
});
```

## Common Mistakes to AVOID

1. **Forgetting `await`** on `twd.get()`, `userEvent.*`, `twd.visit()`, `screenDom.findBy*`
2. **Mocking AFTER visit** — always mock before `twd.visit()` or the action triggering the request
3. **Not clearing mocks** — always `twd.clearRequestMockRules()` and `twd.clearComponentMocks()` in `beforeEach`
4. **Using Node.js APIs** — tests run in the browser, no `fs`, `path`, etc.
5. **Importing from wrong package** — `describe`/`it`/`beforeEach` from `twd-js/runner`, NOT Jest/Mocha
6. **Using Cypress syntax** — no `cy.get()`, `cy.visit()`. Use `twd.get()`, `twd.visit()`
7. **Stubbing named exports** — ESM makes them immutable. Use the default-export object pattern
8. **Using global describe/it** — always import from `twd-js/runner`
