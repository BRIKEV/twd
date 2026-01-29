---
title: TWD Context for AI Agents
---

# TWD (Test While Developing) Context for AI Agents

Copy the **entire block below** and paste it into your AI agent (Cursor, Copilot, Claude, etc.) to give it TWD context. One copy gives you all the rules, patterns, and examples.

```text
# TWD (Test While Developing) Context for AI Agents

## Overview
TWD is an in-browser test runner. Tests run in the browser (not Node.js). Syntax is similar to Jest/Cypress. Use window, document, etc.

## Core Rules

1. Imports — use in every TWD test file:
   import { twd, userEvent, screenDom } from "twd-js";
   import { describe, it, beforeEach, afterEach, expect } from "twd-js/runner";

2. Async/Await:
   - twd.get() and twd.getAll() are asynchronous. Always await them.
   - userEvent methods (click, type) are asynchronous. Always await them.
   - Test functions passed to it() should be async.

3. Assertions:
   - Use .should(assertion, value) on elements from twd.get().
   - Common: "have.text", "contain.text", "be.visible", "have.value", "have.class".
   - Use Chai expect for non-element assertions.

## Common Patterns

### Basic test structure
   import { twd, userEvent, screenDom } from "twd-js";
   import { describe, it, beforeEach, expect } from "twd-js/runner";

   describe("Feature Name", () => {
     beforeEach(() => { twd.clearRequestMockRules(); });
     it("should perform an action", async () => { /* test logic */ });
   });

### Selecting elements
   Preferred: screenDom (Testing Library)
     const heading = screenDom.getByRole("heading", { name: "Welcome" });
     const submitBtn = screenDom.getByRole("button", { name: "Submit" });
     const emailInput = screenDom.getByLabelText("Email Address");

   Fallback: twd.get() with CSS selectors
     const container = await twd.get(".custom-container");

### Interactions (userEvent)
   With screenDom: await userEvent.click(btn); await userEvent.type(input, "text");
   With twd.get(): use .el for raw DOM — await userEvent.click(rawBtn.el);

### Assertions
   message.should("have.text", "Success");
   message.should("contain.text", "saved");
   message.should("be.visible"); message.should("not.be.visible");
   input.should("have.value", "test@example.com");
   message.should("have.class", "success-alert");

### Mocking requests
   Define mocks BEFORE the action that triggers the request. Use twd.clearRequestMockRules() in beforeEach.
   await twd.mockRequest("getUser", { method: "GET", url: "/api/user", response: { id: 1, name: "John" }, status: 200 });
   await twd.waitForRequest("getUser");

## Do's and Don'ts
   DO: await twd.get(); await userEvent actions; use .el when passing twd.get() result to userEvent.
   DON'T: use cy.get or cy.visit (not Cypress); use global describe/it — always import from "twd-js/runner"; assume Node (fs, path) is available.

## Full example (copy-paste ready)
   import { twd, userEvent, screenDom } from "twd-js";
   import { describe, it, beforeEach } from "twd-js/runner";

   describe("Login Flow", () => {
     beforeEach(() => { twd.clearRequestMockRules(); });
     it("should show error on invalid login", async () => {
       await twd.mockRequest("loginError", { method: "POST", url: "/api/login", status: 401, response: { message: "Invalid credentials" } });
       const emailInput = screenDom.getByLabelText("Email");
       const passInput = screenDom.getByLabelText("Password");
       const submitBtn = screenDom.getByRole("button", { name: "Sign In" });
       await userEvent.type(emailInput, "wrong@test.com");
       await userEvent.type(passInput, "wrongpass");
       await userEvent.click(submitBtn);
       const error = await twd.get(".error-alert");
       error.should("be.visible");
       error.should("have.text", "Invalid credentials");
     });
   });
```

Below is the same content in a readable, section-by-section format.

---

## Overview

TWD is an in-browser test runner that allows developers to write and run tests alongside their application code. It uses a syntax similar to Jest/Cypress but runs in the browser environment.

## Core Rules

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
    *   Common assertions: `"have.text"`, `"contain.text"`, `"be.visible"`, `"have.value"`, `"have.class"`.
    *   You can also use Chai's `expect` for non-element assertions.

## Common Patterns

### 1. Basic Test Structure

```ts
import { twd, userEvent, screenDom } from "twd-js";
import { describe, it, beforeEach, expect } from "twd-js/runner";

describe("Feature Name", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
  });

  it("should perform an action", async () => {
    // Test logic
  });
});
```

### 2. Selecting Elements

**Preferred: `screenDom` (Testing Library)**

```ts
const heading = screenDom.getByRole("heading", { name: "Welcome" });
const submitBtn = screenDom.getByRole("button", { name: "Submit" });
const emailInput = screenDom.getByLabelText("Email Address");
```

**Fallback: `twd.get()` (CSS selectors)**

```ts
const container = await twd.get(".custom-container");
```

### 3. Interactions

```ts
const btn = screenDom.getByRole("button", { name: "Save" });
await userEvent.click(btn);

const input = screenDom.getByLabelText("Username");
await userEvent.type(input, "myuser");

// With twd.get() — use .el for the raw DOM element
const rawBtn = await twd.get(".save-btn");
await userEvent.click(rawBtn.el);
```

### 4. Assertions

```ts
const message = await twd.get(".message");
message.should("have.text", "Success");
message.should("contain.text", "saved");
message.should("be.visible");
message.should("not.be.visible");

const input = await twd.get("input");
input.should("have.value", "test@example.com");
message.should("have.class", "success-alert");
```

### 5. Mocking Requests

Define mocks **before** the action that triggers the request. Use `twd.clearRequestMockRules()` in `beforeEach`.

```ts
import { twd, userEvent, screenDom } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("User", () => {
  it("should load user data", async () => {
    await twd.mockRequest("getUser", {
      method: "GET",
      url: "/api/user",
      response: { id: 1, name: "John Doe" },
      status: 200,
    });

    const btn = screenDom.getByRole("button", { name: "Load User" });
    await userEvent.click(btn);

    await twd.waitForRequest("getUser");

    const name = await twd.get(".user-name");
    name.should("have.text", "John Doe");
  });
});
```

## Do's and Don'ts

*   **DO** use `await` for `twd.get()` and for `userEvent` actions.
*   **DO** use `.el` on the result of `twd.get()` when passing to `userEvent`.
*   **DON'T** use `cy.get` or `cy.visit`. This is not Cypress.
*   **DON'T** use global `describe`/`it`. Always import from `"twd-js/runner"`.
*   **DON'T** assume Node.js modules (`fs`, `path`) are available.

## Full Example

```ts
import { twd, userEvent, screenDom } from "twd-js";
import { describe, it, beforeEach } from "twd-js/runner";

describe("Login Flow", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
  });

  it("should show error on invalid login", async () => {
    await twd.mockRequest("loginError", {
      method: "POST",
      url: "/api/login",
      status: 401,
      response: { message: "Invalid credentials" },
    });

    const emailInput = screenDom.getByLabelText("Email");
    const passInput = screenDom.getByLabelText("Password");
    const submitBtn = screenDom.getByRole("button", { name: "Sign In" });

    await userEvent.type(emailInput, "wrong@test.com");
    await userEvent.type(passInput, "wrongpass");
    await userEvent.click(submitBtn);

    const error = await twd.get(".error-alert");
    error.should("be.visible");
    error.should("have.text", "Invalid credentials");
  });
});
```
