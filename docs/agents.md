---
title: TWD Context for AI Agents
---

# TWD (Test While Developing) Context for AI Agents

TWD provides AI agent prompts to help coding assistants (Claude, Cursor, Copilot, Windsurf, etc.) generate correct TWD test code.

::: tip Claude Code users
If you use Claude Code, check out the **[Claude Code Skill](/claude-code-skill)** guide — it creates an autonomous agent that writes tests, runs them via twd-relay, and iterates until they pass.
:::

## Quick Start

The easiest way to give your AI assistant TWD context is to copy the comprehensive prompt from:

**[`ai-guides/TWD_PROMPT.md`](https://github.com/brikev/twd/blob/main/ai-guides/TWD_PROMPT.md)**

This file contains everything your AI needs to write TWD tests correctly.

### How to Use

| Tool | Instructions |
|------|-------------|
| **Claude Code** | Add to your project's `CLAUDE.md` file |
| **Cursor** | Paste into Settings > Rules for AI or `.cursorrules` |
| **GitHub Copilot** | Add to `.github/copilot-instructions.md` |
| **Windsurf** | Add to your AI context configuration |

---

## Compact Prompt

For quick copy-paste, here's a condensed version with the essentials:

```text
# TWD (Test While Developing) Context

## Overview
TWD is an in-browser test runner. Tests run in the browser (not Node.js). Syntax is similar to Jest/Cypress.

## Core Rules

1. Imports — use in every TWD test file:
   import { twd, userEvent, screenDom } from "twd-js";
   import { describe, it, beforeEach, afterEach, expect } from "twd-js/runner";

2. File naming: *.twd.test.ts or *.twd.test.tsx

3. Async/Await:
   - twd.get() and twd.getAll() are async. Always await them.
   - userEvent methods (click, type) are async. Always await them.
   - Test functions passed to it() should be async.

4. Assertions:
   - Use .should(assertion, value) on elements from twd.get().
   - Common: "have.text", "contain.text", "be.visible", "have.value", "have.class", "be.disabled", "have.attr".
   - Use Chai expect for non-element assertions.

## Common Patterns

### Basic test structure
   import { twd, userEvent, screenDom } from "twd-js";
   import { describe, it, beforeEach, expect } from "twd-js/runner";

   describe("Feature Name", () => {
     beforeEach(() => {
       twd.clearRequestMockRules();
       twd.clearComponentMocks();
     });
     it("should perform an action", async () => { /* test logic */ });
   });

### Selecting elements
   Preferred: screenDom (Testing Library)
     const heading = screenDom.getByRole("heading", { name: "Welcome" });
     const submitBtn = screenDom.getByRole("button", { name: "Submit" });
     const emailInput = screenDom.getByLabelText("Email Address");
     // For modals/portals: use screenDomGlobal instead

   Fallback: twd.get() with CSS selectors
     const container = await twd.get(".custom-container");

### Interactions (userEvent)
   const user = userEvent.setup();
   await user.click(btn);
   await user.type(input, "text");
   // With twd.get(): use .el for raw DOM — await user.click(rawBtn.el);

### Navigation
   await twd.visit("/path");

### Assertions
   message.should("have.text", "Success");
   message.should("contain.text", "saved");
   message.should("be.visible"); message.should("not.be.visible");
   input.should("have.value", "test@example.com");
   message.should("have.class", "success-alert");
   button.should("be.disabled"); button.should("be.enabled");
   checkbox.should("be.checked");
   element.should("have.attr", "type", "submit");
   await twd.url().should("contain.url", "/dashboard");

### Mocking requests
   Define mocks BEFORE the action that triggers the request.
   await twd.mockRequest("getUser", { method: "GET", url: "/api/user", response: { id: 1, name: "John" }, status: 200 });
   await twd.waitForRequest("getUser");

### Component mocking
   // In component: wrap with <MockedComponent name="Chart"><Chart /></MockedComponent>
   // In test:
   twd.mockComponent("Chart", () => <div>Mocked</div>);

### Module stubbing (Sinon)
   Tests run in the browser, so use Sinon for stubs/spies.
   ESM constraint: named exports (export const foo = ...) are IMMUTABLE and CANNOT be stubbed.
   Solution: wrap in an object and export as default.

   // hooks/useAuth.ts — CORRECT (stubbable)
   import { useAuth0 } from "@auth0/auth0-react";
   const useAuth = () => useAuth0();
   export default { useAuth };

   // hooks/useAuth.ts — WRONG (not stubbable)
   export const useAuth = () => useAuth0();

   // In test:
   import authSession from '../hooks/useAuth';
   import Sinon from 'sinon';
   Sinon.stub(authSession, 'useAuth').returns({ isAuthenticated: true, ... });
   // Clean up in beforeEach: Sinon.restore();

## Do's and Don'ts
   DO: await twd.get(); await userEvent actions; use .el when passing twd.get() result to userEvent.
   DO: Clear mocks in beforeEach: twd.clearRequestMockRules(); twd.clearComponentMocks();
   DO: Mock requests BEFORE twd.visit() or triggering the request.
   DON'T: use cy.get or cy.visit (not Cypress); use global describe/it — always import from "twd-js/runner".
   DON'T: assume Node.js (fs, path) is available — tests run in browser.
   DON'T: try to stub named exports (export const fn = ...) — ESM makes them immutable. Wrap in an object and export default.
   DO: use Sinon for module stubs/spies. Always call Sinon.restore() in beforeEach.
```

---

## Full Reference

Below is an expanded, readable reference for all TWD features.

### Overview

TWD is an in-browser test runner that allows developers to write and run tests alongside their application code. It uses a syntax similar to Jest/Cypress but runs in the browser environment.

### Core Rules

1.  **Environment**: Tests run in the browser, not Node.js. You have access to `window`, `document`, etc.
2.  **Imports**: Use these exact imports in every TWD test file:

```ts
import { twd, userEvent, screenDom } from "twd-js";
import { describe, it, beforeEach, afterEach, expect } from "twd-js/runner";
```

3.  **Async/Await**:
    *   `twd.get()` and `twd.getAll()` are **asynchronous**. Always `await` them.
    *   `userEvent` methods (like `click`, `type`) are **asynchronous**. Always `await` them.
    *   Test functions passed to `it()` should be `async`.
4.  **Assertions**:
    *   Use the `.should(assertion, value)` method on elements returned by `twd.get()`.
    *   Common assertions: `"have.text"`, `"contain.text"`, `"be.visible"`, `"have.value"`, `"have.class"`, `"be.disabled"`, `"have.attr"`.
    *   You can also use Chai's `expect` for non-element assertions.

### Common Patterns

#### 1. Basic Test Structure

```ts
import { twd, userEvent, screenDom } from "twd-js";
import { describe, it, beforeEach, expect } from "twd-js/runner";

describe("Feature Name", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
    twd.clearComponentMocks();
  });

  it("should perform an action", async () => {
    // Test logic
  });
});
```

#### 2. Selecting Elements

**Preferred: `screenDom` (Testing Library)**

```ts
const heading = screenDom.getByRole("heading", { name: "Welcome" });
const submitBtn = screenDom.getByRole("button", { name: "Submit" });
const emailInput = screenDom.getByLabelText("Email Address");

// For modals/portals that render outside the main app
import { screenDomGlobal } from "twd-js";
const modal = screenDomGlobal.getByRole("dialog");
```

**Fallback: `twd.get()` (CSS selectors)**

```ts
const container = await twd.get(".custom-container");
const byId = await twd.get("#email");
const multiple = await twd.getAll(".item");
```

#### 3. Navigation

```ts
await twd.visit("/");
await twd.visit("/login");
await twd.visit("/users?page=2");
```

#### 4. Interactions

```ts
const user = userEvent.setup();

const btn = screenDom.getByRole("button", { name: "Save" });
await user.click(btn);

const input = screenDom.getByLabelText("Username");
await user.type(input, "myuser");

// With twd.get() — use .el for the raw DOM element
const rawBtn = await twd.get(".save-btn");
await user.click(rawBtn.el);
```

#### 5. Assertions

```ts
const message = await twd.get(".message");
message.should("have.text", "Success");
message.should("contain.text", "saved");
message.should("be.visible");
message.should("not.be.visible");

const input = await twd.get("input");
input.should("have.value", "test@example.com");
input.should("be.disabled");
input.should("be.enabled");

const checkbox = await twd.get("input[type='checkbox']");
checkbox.should("be.checked");

const button = await twd.get("button");
button.should("have.attr", "type", "submit");
button.should("have.class", "primary");

// URL assertions
await twd.url().should("eq", "http://localhost:3000/dashboard");
await twd.url().should("contain.url", "/dashboard");

// Function style (works with any element)
twd.should(screenDom.getByRole("button"), "be.visible");
```

#### 6. Mocking Requests

Define mocks **before** the action that triggers the request. Use `twd.clearRequestMockRules()` in `beforeEach`.

```ts
describe("User", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
  });

  it("should load user data", async () => {
    await twd.mockRequest("getUser", {
      method: "GET",
      url: "/api/user",
      response: { id: 1, name: "John Doe" },
      status: 200,
    });

    await twd.visit("/profile");

    const btn = screenDom.getByRole("button", { name: "Load User" });
    await userEvent.click(btn);

    await twd.waitForRequest("getUser");

    const name = await twd.get(".user-name");
    name.should("have.text", "John Doe");
  });
});
```

**Advanced mocking:**

```ts
// Regex URL patterns
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

// Inspect request body
const rule = await twd.waitForRequest("submitForm");
expect(rule.request).to.deep.equal({ email: "test@example.com" });
```

#### 7. Component Mocking

```tsx
// In your component - wrap with MockedComponent
import { MockedComponent } from "twd-js/ui";

function Dashboard() {
  return (
    <MockedComponent name="ExpensiveChart">
      <ExpensiveChart data={data} />
    </MockedComponent>
  );
}
```

```ts
// In your test
describe("Dashboard", () => {
  beforeEach(() => {
    twd.clearComponentMocks();
  });

  it("should mock the chart", async () => {
    twd.mockComponent("ExpensiveChart", () => (
      <div data-testid="mock-chart">Mocked</div>
    ));

    await twd.visit("/dashboard");
    const mock = screenDom.getByTestId("mock-chart");
    twd.should(mock, "be.visible");
  });
});
```

#### 8. Module Stubbing with Sinon

TWD tests run in the browser, so use [Sinon](https://sinonjs.org/) for spies, stubs, and mocks.

**Critical ESM constraint:** ES Module named exports (`export const foo = ...`) are **immutable at runtime** and **cannot be stubbed**. To make a module stubbable, wrap the function in an object and use a default export.

**Step 1: Create a stubbable wrapper**

```ts
// hooks/useAuth.ts — CORRECT: default export as object
import { useAuth0 } from "@auth0/auth0-react";

const useAuth = () => useAuth0();

export default { useAuth };
```

```ts
// hooks/useAuth.ts — WRONG: named export cannot be stubbed
export const useAuth = () => useAuth0();
```

**Step 2: Use the wrapper in your application code**

```tsx
// components/Profile.tsx
import authSession from '../hooks/useAuth';

function Profile() {
  const { user, isAuthenticated } = authSession.useAuth();
  if (!isAuthenticated) return <p>Please log in</p>;
  return <h1>Welcome, {user.name}</h1>;
}
```

**Step 3: Stub in your tests**

```ts
import { beforeEach, describe, it } from 'twd-js/runner';
import { twd, screenDom } from 'twd-js';
import authSession from '../hooks/useAuth';
import Sinon from 'sinon';

describe('Profile', () => {
  beforeEach(() => {
    Sinon.restore(); // Always restore stubs for test isolation
    twd.clearRequestMockRules();
  });

  it('should show welcome for authenticated user', async () => {
    Sinon.stub(authSession, 'useAuth').returns({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'John Doe' },
    });

    await twd.visit('/profile');
    const heading = await screenDom.findByRole('heading', { name: 'Welcome, John Doe' });
    twd.should(heading, 'be.visible');
  });

  it('should show login prompt for unauthenticated user', async () => {
    Sinon.stub(authSession, 'useAuth').returns({
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
    });

    await twd.visit('/profile');
    const message = await screenDom.findByText('Please log in');
    twd.should(message, 'be.visible');
  });
});
```

**Why this pattern works:** `Sinon.stub(object, 'property')` replaces a property on an object. Since ES modules freeze named exports, you need a mutable object (the default export) to swap out the function at runtime.

This pattern applies to **any module** you need to control in tests — not just Auth0. Any hook, service, or utility can be wrapped the same way.

For a complete authentication example, see the [Module Mocking guide](/module-mocking).

#### 9. Waiting

```ts
// Wait for time
await twd.wait(1000);

// Wait for element to appear (Testing Library)
const element = await screenDom.findByText("Success!");

// Wait for element to NOT exist
await twd.notExists(".loading-spinner");
```

### Do's and Don'ts

*   **DO** use `await` for `twd.get()` and for `userEvent` actions.
*   **DO** use `.el` on the result of `twd.get()` when passing to `userEvent`.
*   **DO** clear mocks in `beforeEach`: `twd.clearRequestMockRules()` and `twd.clearComponentMocks()`.
*   **DO** mock requests/components **before** `twd.visit()` or triggering the request.
*   **DO** use Sinon for module stubs/spies. Always call `Sinon.restore()` in `beforeEach` for test isolation.
*   **DON'T** try to stub named exports (`export const fn = ...`). ESM makes them immutable at runtime. Wrap in an object and use `export default { fn }` instead.
*   **DON'T** use `cy.get` or `cy.visit`. This is not Cypress.
*   **DON'T** use global `describe`/`it`. Always import from `"twd-js/runner"`.
*   **DON'T** assume Node.js modules (`fs`, `path`) are available.

### Full Example

```ts
import { twd, userEvent, screenDom } from "twd-js";
import { describe, it, beforeEach } from "twd-js/runner";

describe("Login Flow", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
    twd.clearComponentMocks();
  });

  it("should show error on invalid login", async () => {
    await twd.mockRequest("loginError", {
      method: "POST",
      url: "/api/login",
      status: 401,
      response: { message: "Invalid credentials" },
    });

    await twd.visit("/login");

    const user = userEvent.setup();
    const emailInput = screenDom.getByLabelText("Email");
    const passInput = screenDom.getByLabelText("Password");
    const submitBtn = screenDom.getByRole("button", { name: "Sign In" });

    await user.type(emailInput, "wrong@test.com");
    await user.type(passInput, "wrongpass");
    await user.click(submitBtn);

    await twd.waitForRequest("loginError");

    const error = await twd.get(".error-alert");
    error.should("be.visible");
    error.should("have.text", "Invalid credentials");
  });
});
```
