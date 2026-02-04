# TWD (Test While Developing) - AI Agent Prompt

> Copy this entire file into your AI coding assistant (Claude, Cursor, Copilot, Windsurf, etc.) to give it full TWD context.

## What is TWD?

TWD is an **in-browser testing library** that runs tests directly in the browser with a sidebar UI for instant visual feedback. Tests run in the browser environment (not Node.js), so you have access to `window`, `document`, DOM APIs, etc.

**Key characteristics:**
- Syntax similar to Jest/Mocha/Cypress
- Designed for SPAs (React, Vue, Angular, Solid, etc.)
- Not suitable for SSR-first architectures (Next.js App Router, server-side features)
- Uses Mock Service Worker (MSW) for API mocking

## Required Imports

Every TWD test file needs these imports:

```typescript
import { twd, userEvent, screenDom } from "twd-js";
import { describe, it, beforeEach, afterEach, expect } from "twd-js/runner";
```

**Package exports:**
- `twd-js` - Main API (`twd`, `userEvent`, `screenDom`, `screenDomGlobal`)
- `twd-js/runner` - Test functions (`describe`, `it`, `beforeEach`, `afterEach`, `expect`)
- `twd-js/bundled` - Framework-agnostic setup (`initTWD`)
- `twd-js/ui` - UI components (`MockedComponent`)

## File Naming Convention

Test files must follow this pattern:
- `*.twd.test.ts`
- `*.twd.test.tsx`
- `*.twd.test.js`
- `*.twd.test.jsx`

## Core Rules

### 1. Async/Await is Required

```typescript
// twd.get() and twd.getAll() are async - ALWAYS await
const button = await twd.get("button");
const items = await twd.getAll(".item");

// userEvent methods are async - ALWAYS await
await userEvent.click(button.el);
await userEvent.type(input, "text");

// Test functions should be async
it("should do something", async () => {
  // test logic
});
```

### 2. Element Selection

**Preferred: Testing Library queries via `screenDom`**

```typescript
// By role (most accessible - RECOMMENDED)
const button = screenDom.getByRole("button", { name: "Submit" });
const heading = screenDom.getByRole("heading", { name: "Welcome", level: 1 });
const checkbox = screenDom.getByRole("checkbox", { name: /terms/i });

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

// screenDomGlobal queries the entire document (including portals)
const modal = screenDomGlobal.getByRole("dialog");
```

**Fallback: CSS selectors via `twd.get()`**

```typescript
const button = await twd.get("button");
const byId = await twd.get("#email");
const byClass = await twd.get(".error-message");
const byAttr = await twd.get("[data-testid='card']");
const multiple = await twd.getAll(".item");
```

### 3. User Interactions

```typescript
const user = userEvent.setup();

// With screenDom elements (direct)
const button = screenDom.getByRole("button", { name: "Save" });
await user.click(button);
await user.type(input, "hello@example.com");

// With twd.get() elements (use .el for raw DOM)
const twdButton = await twd.get(".save-btn");
await user.click(twdButton.el);

// Other interactions
await user.dblClick(element);
await user.clear(input);
await user.selectOptions(select, "option-value");
await user.selectOptions(multiSelect, ["opt1", "opt2"]);
await user.upload(fileInput, file);
await user.keyboard("{Enter}");
```

### 4. Assertions

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
const button = screenDom.getByRole("button");
twd.should(button, "be.visible");
twd.should(button, "have.text", "Submit");
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

### 5. Navigation

```typescript
await twd.visit("/");
await twd.visit("/login");
await twd.visit("/users?page=2");
```

### 6. Waiting

```typescript
// Wait for time
await twd.wait(1000); // 1 second

// Wait for element to appear (Testing Library)
const element = await screenDom.findByText("Success!");

// Wait for element to NOT exist
await twd.notExists(".loading-spinner");
```

## API Mocking

TWD uses Mock Service Worker for API mocking. **Always mock BEFORE the request fires.**

### Basic Mocking

```typescript
// Mock GET request
await twd.mockRequest("getUser", {
  method: "GET",
  url: "/api/user/123",
  response: { id: 123, name: "John Doe" },
  status: 200
});

// Mock POST request
await twd.mockRequest("createUser", {
  method: "POST",
  url: "/api/users",
  response: { id: 456, created: true },
  status: 201
});

// Wait for request to complete
await twd.waitForRequest("getUser");

// Wait for multiple requests
await twd.waitForRequests(["getUser", "getPosts"]);
```

### Advanced Mocking

```typescript
// URL patterns with regex
await twd.mockRequest("getUserById", {
  method: "GET",
  url: /\/api\/users\/\d+/,
  response: { id: 999, name: "Dynamic User" },
  urlRegex: true
});

// Error responses
await twd.mockRequest("serverError", {
  method: "GET",
  url: "/api/data",
  response: { error: "Server error" },
  status: 500
});

// Custom headers
await twd.mockRequest("withHeaders", {
  method: "GET",
  url: "/api/data",
  response: { data: "value" },
  responseHeaders: { "X-Custom-Header": "value" }
});
```

### Inspecting Requests

```typescript
const rule = await twd.waitForRequest("submitForm");

// Check request body
expect(rule.request).to.deep.equal({
  email: "test@example.com",
  message: "Hello"
});
```

## Component Mocking

For mocking React/Preact components.

### Setup (in your component)

```tsx
import { MockedComponent } from "twd-js/ui";

export default function MyPage() {
  return (
    <div>
      <MockedComponent name="ExpensiveChart">
        <ExpensiveChart data={data} />
      </MockedComponent>
    </div>
  );
}
```

### Mocking in Tests

```typescript
import { twd } from "twd-js";
import { describe, it, beforeEach } from "twd-js/runner";

describe("Component Mocking", () => {
  beforeEach(() => {
    twd.clearComponentMocks();
  });

  it("should mock the chart", async () => {
    twd.mockComponent("ExpensiveChart", () => (
      <div data-testid="mock-chart">Mocked Chart</div>
    ));

    await twd.visit("/dashboard");
    const mockChart = screenDom.getByTestId("mock-chart");
    twd.should(mockChart, "be.visible");
  });
});
```

## Test Structure Template

```typescript
import { twd, userEvent, screenDom } from "twd-js";
import { describe, it, beforeEach, afterEach, expect } from "twd-js/runner";

describe("Feature Name", () => {
  beforeEach(() => {
    // ALWAYS clear mocks for test isolation
    twd.clearRequestMockRules();
    twd.clearComponentMocks();
  });

  afterEach(() => {
    // Optional cleanup
  });

  describe("Sub-feature", () => {
    it("should do something", async () => {
      // 1. Setup mocks BEFORE visiting
      await twd.mockRequest("getData", {
        method: "GET",
        url: "/api/data",
        response: { items: [] }
      });

      // 2. Navigate
      await twd.visit("/page");

      // 3. Interact
      const user = userEvent.setup();
      const button = screenDom.getByRole("button", { name: "Load" });
      await user.click(button);

      // 4. Wait for async operations
      await twd.waitForRequest("getData");

      // 5. Assert
      const message = await twd.get(".message");
      message.should("have.text", "No items found");
    });
  });

  // Focus on single test during debugging
  it.only("debug this test", async () => {
    // Only this test runs
  });

  // Skip a test
  it.skip("skip this test", async () => {
    // This test won't run
  });
});
```

## Common Mistakes to Avoid

### DON'T: Forget to await async operations
```typescript
// BAD
const button = twd.get("button"); // Missing await!
userEvent.click(button.el);       // Missing await!

// GOOD
const button = await twd.get("button");
await userEvent.click(button.el);
```

### DON'T: Use Cypress syntax
```typescript
// BAD - This is NOT Cypress
cy.get("button").click();
cy.visit("/page");

// GOOD - TWD syntax
const button = await twd.get("button");
await userEvent.click(button.el);
await twd.visit("/page");
```

### DON'T: Use Node.js modules
```typescript
// BAD - Tests run in browser, not Node.js
import fs from "fs";
import path from "path";

// GOOD - Use browser APIs
localStorage.setItem("key", "value");
```

### DON'T: Forget to clear mocks
```typescript
// BAD - Mocks leak between tests
it("test 1", async () => {
  await twd.mockRequest("api", { ... });
});

// GOOD - Clear in beforeEach
beforeEach(() => {
  twd.clearRequestMockRules();
  twd.clearComponentMocks();
});
```

### DON'T: Mock after visiting
```typescript
// BAD - Request fires before mock is set
await twd.visit("/dashboard");
await twd.mockRequest("getData", { ... }); // Too late!

// GOOD - Mock first, then visit
await twd.mockRequest("getData", { ... });
await twd.visit("/dashboard");
```

### DON'T: Use global describe/it
```typescript
// BAD - Using global functions
describe("Test", () => { ... });

// GOOD - Import from twd-js/runner
import { describe, it } from "twd-js/runner";
describe("Test", () => { ... });
```

## Quick Reference

| Action | Code |
|--------|------|
| Select by role | `screenDom.getByRole("button", { name: "Submit" })` |
| Select by CSS | `await twd.get(".class")` |
| Click | `await userEvent.click(element)` |
| Type | `await userEvent.type(input, "text")` |
| Navigate | `await twd.visit("/path")` |
| Assert text | `element.should("have.text", "Expected")` |
| Assert visible | `element.should("be.visible")` |
| Mock request | `await twd.mockRequest("alias", { method, url, response })` |
| Wait for request | `await twd.waitForRequest("alias")` |
| Clear mocks | `twd.clearRequestMockRules()` |

## Setup (for reference)

**Bundled setup (recommended for all frameworks):**

```typescript
// src/main.ts
if (import.meta.env.DEV) {
  const { initTWD } = await import("twd-js/bundled");
  const tests = import.meta.glob("./**/*.twd.test.ts");
  initTWD(tests, {
    open: true,
    position: "left",
    serviceWorker: true,
    serviceWorkerUrl: "/mock-sw.js"
  });
}
```

**Install service worker:**
```bash
npx twd-js init public
```
