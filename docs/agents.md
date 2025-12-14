# TWD (Test While Developing) Context for AI Agents

This document provides context, rules, and patterns for AI agents (like GitHub Copilot, Cursor, etc.) to generate high-quality tests using TWD.

## Overview

TWD is an in-browser test runner that allows developers to write and run tests alongside their application code. It uses a syntax similar to Jest/Cypress but runs in the browser environment.

## Core Rules

1.  **Environment**: Tests run in the browser, not Node.js. You have access to `window`, `document`, etc.
2.  **Imports**:
    *   Import `twd`, `userEvent`, `screenDom` from `"twd-js"`.
    *   Import `describe`, `it`, `beforeEach`, `afterEach`, `expect` from `"twd-js/runner"`.
3.  **Async/Await**:
    *   `twd.get()` and `twd.getAll()` are **asynchronous**. Always `await` them.
    *   `userEvent` methods (like `click`, `type`) are **asynchronous**. Always `await` them.
    *   Test functions passed to `it()` should be `async`.
4.  **Assertions**:
    *   Use the `.should(assertion, value)` method on elements returned by `twd.get()`.
    *   Common assertions: `"have.text"`, `"contain.text"`, `"be.visible"`, `"have.value"`, `"have.class"`.
    *   You can also use Chai's `expect` for non-element assertions.

## Common Patterns

### 1. Basic Test Structure

```typescript
import { twd, userEvent, screenDom } from "twd-js";
import { describe, it, beforeEach, expect } from "twd-js/runner";

describe("Feature Name", () => {
  beforeEach(() => {
    // Good practice: Clear mocks before each test
    twd.clearRequestMockRules();
  });

  it("should perform an action", async () => {
    // Test logic
  });
});
```

### 2. Selecting Elements

**Preferred Method: `screenDom` (Testing Library)**
TWD fully supports and encourages using Testing Library queries via `screenDom`. This ensures your tests resemble how users interact with your app.

```typescript
// Best Practice: Use screenDom for semantic queries
const heading = screenDom.getByRole("heading", { name: "Welcome" });
const submitBtn = screenDom.getByRole("button", { name: "Submit" });
const emailInput = screenDom.getByLabelText("Email Address");
```

**Alternative: `twd.get()` (CSS Selectors)**
Use `twd.get()` when you need to select by CSS class or ID, or when semantic queries are difficult.

```typescript
// Fallback: Use CSS selectors
const container = await twd.get(".custom-container");
```

### 3. Interactions

TWD uses `@testing-library/user-event` under the hood.

```typescript
// With screenDom (Recommended)
const btn = screenDom.getByRole("button", { name: "Save" });
await userEvent.click(btn);

const input = screenDom.getByLabelText("Username");
await userEvent.type(input, "myuser");

// With twd.get()
const rawBtn = await twd.get(".save-btn");
await userEvent.click(rawBtn.el); // Must access .el property
```

**Important**: `twd.get()` returns a wrapper. Access the raw DOM element via `.el` when passing to `userEvent`.

### 4. Assertions

```typescript
const message = await twd.get(".message");

// Text content
message.should("have.text", "Success");
message.should("contain.text", "saved");

// Visibility
message.should("be.visible");
message.should("not.be.visible");

// Form values
const input = await twd.get("input");
input.should("have.value", "test@example.com");

// Classes
message.should("have.class", "success-alert");
```

### 5. Mocking Requests

Use `twd.mockRequest` to intercept network requests.

**Important Rule**: Always define your mocks **before** performing the action that triggers the request (e.g., clicking a button).

**Best Practice**: Use `twd.clearRequestMockRules()` in `beforeEach` to ensure a clean state for every test.

**Syntax**: `twd.mockRequest(alias, options)`

```typescript
import { twd } from "twd-js";

it("should load user data", async () => {
  // 1. Define the mock BEFORE the action
  twd.mockRequest("getUser", {
    method: "GET",
    url: "/api/user",
    response: { id: 1, name: "John Doe" },
    status: 200
  });

  // 2. Trigger the request
  const btn = screenDom.getByRole("button", { name: "Load User" });
  await userEvent.click(btn);

  // 3. (Optional) Wait for the request to happen using the alias
  await twd.waitForRequest("getUser");

  // 4. Verify result
  const name = await twd.get(".user-name");
  name.should("have.text", "John Doe");
});
```

## Do's and Don'ts

*   **DO** use `await` for `twd.get()`.
*   **DO** use `await` for `userEvent` actions.
*   **DO** access `.el` on the result of `twd.get()` when you need the raw DOM element (e.g., for `userEvent`).
*   **DON'T** use `cy.get` or `cy.visit`. This is not Cypress.
*   **DON'T** use global `describe`/`it`. Always import them from `"twd-js/runner"`.
*   **DON'T** assume Node.js modules (like `fs` or `path`) are available.

## Full Example

```typescript
import { twd, userEvent, screenDom } from "twd-js";
import { describe, it, beforeEach } from "twd-js/runner";

describe("Login Flow", () => {
  beforeEach(() => {
    // Reset mocks
    twd.clearRequestMockRules();
  });

  it("should show error on invalid login", async () => {
    // 1. Mock API error
    twd.mockRequest("loginError", {
      method: "POST",
      url: "/api/login",
      status: 401,
      response: { message: "Invalid credentials" }
    });

    // 2. Fill form using screenDom (Testing Library)
    const emailInput = screenDom.getByLabelText("Email");
    const passInput = screenDom.getByLabelText("Password");
    const submitBtn = screenDom.getByRole("button", { name: "Sign In" });

    await userEvent.type(emailInput, "wrong@test.com");
    await userEvent.type(passInput, "wrongpass");
    await userEvent.click(submitBtn);

    // 3. Assert error message
    const error = await twd.get(".error-alert");
    error.should("be.visible");
    error.should("have.text", "Invalid credentials");
  });
});
```
