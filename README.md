# TWD

[![CI](https://github.com/BRIKEV/twd/actions/workflows/ci.yml/badge.svg)](https://github.com/BRIKEV/twd/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/twd-js.svg)](https://www.npmjs.com/package/twd-js)
[![license](https://img.shields.io/github/license/brikev/twd.svg)](./LICENSE)
[![Maintainability](https://qlty.sh/gh/BRIKEV/projects/twd/maintainability.svg)](https://qlty.sh/gh/BRIKEV/projects/twd)
[![Code Coverage](https://qlty.sh/gh/BRIKEV/projects/twd/coverage.svg)](https://qlty.sh/gh/BRIKEV/projects/twd)

> ⚠️ This is a **beta release** – expect frequent updates and possible breaking changes.

TWD (Testing Web Development) is a library designed to seamlessly integrate testing into your web development workflow. It streamlines the process of writing, running, and managing tests directly in your application, with a modern UI and powerful mocking capabilities.

Currently, TWD supports React, with plans to add more frameworks soon.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Writing Tests](#writing-tests)
  - [Test Structure](#test-structure)
  - [Element Selection](#element-selection)
  - [Assertions](#assertions)
  - [User Interactions](#user-interactions)
- [API Mocking](#api-mocking)
  - [Setup](#setup)
  - [Mock Requests](#mock-requests)
  - [Wait for Requests](#wait-for-requests)
- [API Reference](#api-reference)
  - [Test Functions](#test-functions)
  - [TWD Commands](#twd-commands)
  - [Assertions](#assertions-1)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🧪 **In-browser test runner** with a beautiful sidebar UI
- ⚡ **Instant feedback** as you develop
- 🔥 **Mock Service Worker** integration for API/request mocking
- 📝 **Simple, readable test syntax** (inspired by popular test frameworks)
- 🧩 **Automatic test discovery** with Vite support
- 🛠️ **Works with React** (support for more frameworks coming)

## Installation

You can install TWD via npm:

```bash
# with npm
npm install twd-js

# with yarn
yarn add twd-js

# with pnpm
pnpm add twd-js
```

## Quick Start

1. **Add the TWD Sidebar to your React app:**

   ```tsx
   import { StrictMode } from "react";
   import { createRoot } from "react-dom/client";
   import App from "./App";
   import "./index.css";
   import { TWDSidebar } from "twd-js";

   createRoot(document.getElementById("root")!).render(
     <StrictMode>
       <App />
       <TWDSidebar open={false} />
     </StrictMode>
   );
   ```

   **TWDSidebar Props**

    | Prop      | Type                | Default | Description                                 |
    |-----------|---------------------|---------|---------------------------------------------|
    | open      | boolean             | true    | Whether the sidebar is open by default       |
    | position  | "left" \| "right"   | "left" | Sidebar position (left or right side)

2. **Write your tests:**

   Create files ending with `.twd.test.ts` (or any extension you prefer):

   ```ts
   // src/app.twd.test.ts
   import { describe, it, twd } from "twd-js";

   beforeEach(() => {
     // Reset state before each test
   });

   describe("App interactions", () => {
     it("clicks the button", async () => {
       twd.visit("/");
       const btn = await twd.get("button");
       btn.click();
       const message = await twd.get("#message");
       message.should("have.text", "Hello");
     });
   });
   ```

3. **Auto-load your tests:**

   - With Vite:

     ```ts
     import { twd } from "twd-js";
     // src/loadTests.ts
     import.meta.glob("./**/*.twd.test.ts", { eager: true });
     // Initialize request mocking once
     twd
       .initRequestMocking()
       .then(() => {
         console.log("Request mocking initialized");
       })
       .catch((err) => {
         console.error("Error initializing request mocking:", err);
       });
     // No need to export anything
     ```

   - Or manually:

     ```ts
     // src/loadTests.ts
     import "./app.twd.test";
     import "./another-test-file.twd.test";
     ```

   Import `loadTests.ts` in your main entry (e.g., `main.tsx`):

   ```tsx
   import "./loadTests";
   ```

4. **Run your app and open the TWD sidebar** to see and run your tests in the browser.

## Writing Tests

### Test Structure

TWD uses a familiar testing structure with `describe`, `it`, `beforeEach`, and other common testing functions:

```ts
import { describe, it, itSkip, itOnly, beforeEach, twd, userEvent } from "twd-js";


describe("User authentication", () => {
  beforeEach(() => {
    // Reset state before each test
  });
  it("should login successfully", async () => {
    twd.visit("/login");
    // Your test logic here
  });
  
  itSkip("skipped test", () => {
    // This test will be skipped
  });
  
  itOnly("only this test runs", () => {
    // Only this test will run when .only is present
  });
});
```

### Element Selection

TWD provides two main methods for selecting elements:

```ts
// Select a single element
const button = await twd.get("button");
const input = await twd.get("input#email");

// Select multiple elements
const items = await twd.getAll(".item");
items[0].should("be.visible");
```

### Assertions

TWD includes a comprehensive set of assertions for testing element states:

```ts
// Text content
element.should("have.text", "exact text");
element.should("contain.text", "partial text");
element.should("be.empty");

// Attributes and values
element.should("have.attr", "placeholder", "Type here");
element.should("have.value", "input value");
element.should("have.class", "active");

// Element state
element.should("be.disabled");
element.should("be.enabled");
element.should("be.checked");
element.should("be.selected");
element.should("be.focused");
element.should("be.visible");

// Negated assertions
element.should("not.be.disabled");
element.should("not.have.text", "wrong text");

// URL assertions
twd.url().should("eq", "http://localhost:3000/contact");
twd.url().should("contain.url", "/contact");
```

### User Interactions

TWD integrates with `@testing-library/user-event` for realistic user interactions:

```ts
import { userEvent } from "twd-js";

const user = userEvent.setup();
const button = await twd.get("button");
const input = await twd.get("input");

// Click interactions
await user.click(button.el);
await user.dblClick(button.el);

// Typing
await user.type(input.el, "Hello World");

// Form interactions
await user.selectOptions(selectElement.el, "option-value");
```

## API Mocking

### Setup

TWD provides a CLI to easily set up a mock service worker for API/request mocking in your app. You do **not** need to manually register the service worker in your app—TWD handles this automatically when you use `twd.initRequestMocking()` in your tests.

Run the following command in your project root:

```bash
npx twd-js init <public-dir> [--save]
```

- Replace `<public-dir>` with the path to your app's public/static directory (e.g., `public/` or `dist/`).
- Use `--save` to print a registration snippet for your app.

This will copy `mock-sw.js` to your public directory.

### Mock Requests

Use `twd.mockRequest()` to define API mocks in your tests:

```ts
import { twd } from "twd-js";

// Initialize mocking when loading tests
// await twd.initRequestMocking();

it("fetches user data", async () => {
  // Mock the API request
  twd.mockRequest("getUser", {
    method: "GET",
    url: "https://api.example.com/user/123",
    response: {
      id: 123,
      name: "John Doe",
      email: "john@example.com"
    },
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
  
  // Trigger the request in your app
  const button = await twd.get("button[data-testid='load-user']");
  await userEvent.click(button.el);
  
  // Wait for the mock to be called
  const rule = await twd.waitForRequest("getUser");
  console.log("Request body:", rule.request);
  
  // Clean up mocks after test
  twd.clearRequestMockRules();
});
```

### Wait for Requests

TWD provides utilities to wait for mocked requests:

```ts
// Wait for a single request
const rule = await twd.waitForRequest("getUserData");

// Wait for multiple requests
const rules = await twd.waitForRequests(["getUser", "getPosts"]);

// Access request data
console.log("Request body:", rule.request);
console.log("Response:", rule.response);
```

## API Reference

### Test Functions

| Function | Description | Example |
|----------|-------------|---------|
| `describe(name, fn)` | Groups related tests | `describe("User login", () => {...})` |
| `it(name, fn)` | Defines a test case | `it("should login", async () => {...})` |
| `itOnly(name, fn)` | Runs only this test | `itOnly("focused test", () => {...})` |
| `itSkip(name, fn)` | Skips this test | `itSkip("broken test", () => {...})` |
| `beforeEach(fn)` | Runs before each test | `beforeEach(() => {...})` |

### TWD Commands

| Command | Description | Example |
|---------|-------------|---------|
| `twd.get(selector)` | Select single element | `await twd.get("button")` |
| `twd.getAll(selector)` | Select multiple elements | `await twd.getAll(".item")` |
| `twd.visit(url)` | Navigate to URL | `twd.visit("/contact")` |
| `twd.wait(ms)` | Wait for specified time | `await twd.wait(500)` |
| `twd.url()` | Get URL API for assertions | `twd.url().should("contain.url", "/home")` |

### Assertions

#### Element Content
- `have.text` - Exact text match
- `contain.text` - Partial text match  
- `be.empty` - Element has no text content

#### Element Attributes
- `have.attr` - Has specific attribute value
- `have.value` - Input/textarea value
- `have.class` - Has CSS class

#### Element State
- `be.disabled` / `be.enabled` - Form element state
- `be.checked` - Checkbox/radio state
- `be.selected` - Option element state
- `be.focused` - Element has focus
- `be.visible` - Element is visible

#### URL Assertions
- `eq` - Exact URL match
- `contain.url` - URL contains substring

All assertions can be negated with `not.` prefix (e.g., `not.be.disabled`).

## Examples

### Basic Form Testing

```ts
import { describe, it, twd, userEvent } from "twd-js";

describe("Contact form", () => {
  it("submits form data", async () => {
    twd.visit("/contact");
    
    const user = userEvent.setup();
    const emailInput = await twd.get("input#email");
    const messageInput = await twd.get("textarea#message");
    const submitBtn = await twd.get("button[type='submit']");
    
    await user.type(emailInput.el, "test@example.com");
    await user.type(messageInput.el, "Hello world");
    
    emailInput.should("have.value", "test@example.com");
    messageInput.should("have.value", "Hello world");
    
    await user.click(submitBtn.el);
  });
});
```

### API Mocking with Authentication

```ts
import { describe, it, twd, userEvent } from "twd-js";

describe("Protected routes", () => {
  it("redirects to login when unauthorized", async () => {
    twd.visit("/dashboard");
    await twd.wait(100);
    twd.url().should("contain.url", "/login");
  });
  
  it("loads dashboard with valid session", async () => {
    // Mock authentication check
    twd.mockRequest("authCheck", {
      method: "GET", 
      url: "/api/auth/me",
      response: { id: 1, name: "John Doe" }
    });
    
    twd.visit("/dashboard");
    await twd.waitForRequest("authCheck");
    
    const welcome = await twd.get("h1");
    welcome.should("contain.text", "Welcome, John");
    
    twd.clearRequestMockRules();
  });
});
```

For more comprehensive examples, see the [examples](https://github.com/BRIKEV/twd/tree/main/examples) directory in the repository.

## Contributing

Contributions are welcome! Please open issues or pull requests on [GitHub](https://github.com/BRIKEV/twd).

## License

This project is licensed under the [MIT License](./LICENSE).
