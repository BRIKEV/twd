---
title: Writing Tests
description: Learn TWD test structure, element selection, assertions, user interactions, and navigation
---

# Writing Tests

Learn how to write effective tests with TWD's intuitive API and powerful features.

## Test Structure

TWD uses a familiar testing structure similar to Jest, Mocha, and other popular testing frameworks:

```ts
import { twd, userEvent } from "twd-js";
import { describe, it, beforeEach } from "twd-js/runner";

describe("User Authentication", () => {
  beforeEach(() => {
    // Reset state before each test
    console.log("Setting up test environment");
  });

  it("should login with valid credentials", async () => {
    // Your test logic here
  });

  it("should show error with invalid credentials", async () => {
    // Your test logic here
  });
});
```

### Test Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `describe(name, fn)` | Groups related tests | `describe("Login Form", () => {...})` |
| `it(name, fn)` | Defines a test case | `it("should submit form", async () => {...})` |
| `describe.only(name, fn)` | Runs only this suite (and its children) — helpful when debugging a group of tests | `describe.only("Only this suite", () => {...})` |
| `describe.skip(name, fn)` | Skips this suite and all its descendant tests | `describe.skip("Skipped suite", () => {...})` |
| `it.only(name, fn)` | Runs only this test | `it.only("debug this test", () => {...})` |
| `it.skip(name, fn)` | Skips this test | `it.skip("broken test", () => {...})` |
| `beforeEach(fn)` | Runs before each test | `beforeEach(() => {...})` |
| `afterEach(fn)` | Runs after each test | `afterEach(() => {...})` |

### Nested Describes

You can nest `describe` blocks for better organization:

```ts
describe("User Management", () => {
  describe("Registration", () => {
    it("should create new user", async () => {
      // Registration tests
    });
  });

  describe("Login", () => {
    it("should authenticate user", async () => {
      // Login tests  
    });
  });
});
```

## Element Selection

TWD provides multiple ways to select DOM elements. **Prefer Testing Library's async `findBy*` queries.** They are the recommended way to select elements in TWD, ahead of `getBy*`/`queryBy*` and ahead of TWD's native `twd.get()`.

::: tip Testing a single component instead of a page?
If you render a component in isolation with Testing Library's `render()`, use
`screen` rather than `screenDom`. See [Component Testing](/component-testing#queries).
:::

### Recommended: `findBy*` queries

> **Always reach for `findBy*` first, for every lookup.**
>
> UI in a real app renders asynchronously (after navigation, data fetches, state updates, or re-renders). TWD runs in that real app, so an element that is "there" on your machine may still be rendering in CI. Pick queries in this order:
>
> 1. **`findBy*` / `findAllBy*`**: returns a promise and **waits** for the element (up to 3000 ms). When the element is already there it resolves on the first check, so there is no cost to using it everywhere, not just for the first query in a test.
> 2. **`queryBy*`**: synchronous; returns `null` if not found. Use it **only** to assert that an element is *absent*.
> 3. **`getBy*`**: synchronous; throws immediately if the element isn't in the DOM yet. Use it only inside a `twd.waitFor(() => ...)` callback, where the retry loop makes up for it.
> 4. **`twd.get()`**: CSS selectors. Last resort, only when no Testing Library query reaches the element.
>
> See [Choosing a Query](/testing-library#when-to-use-each-approach) for the full reasoning.

```ts
// ✅ 1. Waits for the element to appear
const successMessage = await screenDom.findByText("Login successful!");
const submitButton = await screenDom.findByRole("button", { name: /sign in/i });

// ✅ 2. Only to assert absence
const error = screenDom.queryByText("Error");
expect(error).to.equal(null);

// ⚠️ 3. getBy only inside waitFor, which retries it
await twd.waitFor(() => {
  expect(screenDom.getByRole("status").getAttribute("data-state")).to.equal("done");
});

// ❌ Flaky: throws if the element has not rendered yet
const heading = screenDom.getByRole("heading", { name: "Welcome" });
```

### Testing Library Queries

TWD supports Testing Library's query methods through two APIs:

1. **`screenDom`** - Scoped queries that exclude the TWD sidebar (recommended for most cases)
2. **`screenDomGlobal`** - Global queries for portal-rendered elements (modals, dialogs)

#### Import

```ts
import { screenDom, screenDomGlobal } from "twd-js";
```

#### When to Use screenDom vs screenDomGlobal

**Use `screenDom` (default):**
- For regular page content within your app
- Automatically excludes sidebar elements
- Recommended for most queries

**Use `screenDomGlobal`:**
- For portal-rendered elements (modals, dialogs, tooltips)
- When you need to search outside the root container
- ⚠️ **Important:** Use specific selectors (e.g., `findByRole` with `name`) to avoid matching sidebar elements

#### Query by Role (Recommended)

```ts
// Find button by role and accessible name (waits for it to appear)
const submitButton = await screenDom.findByRole("button", { name: /submit/i });
const heading = await screenDom.findByRole("heading", { name: "Welcome", level: 1 });

// Find form elements
const emailInput = await screenDom.findByRole("textbox", { name: /email/i });
const checkbox = await screenDom.findByRole("checkbox", { name: /terms/i });
```

#### Query by Label

```ts
// Find inputs by their labels (most accessible)
const emailInput = await screenDom.findByLabelText("Email Address:");
const searchInput = await screenDom.findByLabelText(/search/i);
```

#### Query by Text

```ts
// Find elements by text content
const title = await screenDom.findByText("Welcome to TWD");
const partialMatch = await screenDom.findByText(/welcome/i);
```

#### Query by Test ID

```ts
// Find elements by data-testid
const userCard = await screenDom.findByTestId("user-card");
```

#### Query Methods

In priority order:

- **findBy*** / **findAllBy*** *(default)* - Return a promise and **wait** for the element(s) to appear. Use these for every lookup.
- **queryBy*** / **queryAllBy*** - Return `null` (or `[]`) if not found. Use only to assert an element is absent.
- **getBy*** / **getAllBy*** - Throw immediately if not found. Use only inside `twd.waitFor(() => ...)`.

```ts
// ✅ findBy waits for the element to appear
const successMessage = await screenDom.findByText("Success!");

// ✅ findAllBy waits and returns an array
const buttons = await screenDom.findAllByRole("button");
expect(buttons).to.have.length(3);

// ✅ queryBy returns null if the element doesn't exist (use to assert absence)
const error = screenDom.queryByText("Error");
expect(error).to.equal(null);

// ⚠️ getBy throws at once, so only use it inside waitFor
await twd.waitFor(() => {
  expect(screenDom.getAllByRole("listitem")).to.have.length(3);
});
```

#### Complete Example with screenDom

```ts
import { screenDom, screenDomGlobal, userEvent, twd } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("Login Form", () => {
  it("should submit login form", async () => {
    await twd.visit("/login");

    // Use screenDom findBy* for semantic queries (regular page content)
    const emailInput = await screenDom.findByLabelText("Email:");
    const passwordInput = await screenDom.findByLabelText("Password:");
    const submitButton = await screenDom.findByRole("button", { name: /sign in/i });

    // Use userEvent for interactions
    const user = userEvent.setup();
    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    // Wait for success message
    const successMessage = await screenDom.findByText("Login successful!");
    twd.should(successMessage, "be.visible");
  });

  it("should handle modal confirmation", async () => {
    await twd.visit("/settings");
    
    // Use screenDom findBy* for regular button
    const deleteButton = await screenDom.findByRole("button", { name: /delete/i });
    const user = userEvent.setup();
    await user.click(deleteButton);
    
    // Use screenDomGlobal for modal (rendered via portal)
    // ⚠️ Use specific queries to avoid matching sidebar elements
    const confirmModal = await screenDomGlobal.findByRole("dialog", { 
      name: "Confirm Deletion" 
    });
    const confirmButton = await screenDomGlobal.findByRole("button", { 
      name: "Yes, Delete Account" 
    });
    
    await user.click(confirmButton);
  });
});
```

> **Note:** For complete Testing Library documentation, see the [Testing Library API reference](/testing-library).

### TWD Native Selectors

TWD's native selectors use CSS selectors for direct element access. They are the **last resort**: prefer Testing Library's `findBy*` queries above, and reach for `twd.get()` only when no role, label, text or test ID query reaches the element (for example, a third-party widget that renders only non-semantic markup).

#### Single Element Selection

Use `twd.get()` to select a single element:

```ts
// By tag
const button = await twd.get("button");

// By ID
const emailInput = await twd.get("#email");

// By class
const errorMessage = await twd.get(".error-message");

// By attribute
const submitButton = await twd.get("button[type='submit']");

// By data attribute
const userCard = await twd.get("[data-testid='user-card']");

// Complex selectors
const firstListItem = await twd.get("ul > li:first-child");
```

#### Multiple Element Selection

Use `twd.getAll()` to select multiple elements:

```ts
// Get all buttons
const buttons = await twd.getAll("button");

// Get all list items
const listItems = await twd.getAll("li");

// Access specific elements
buttons[0].should("be.visible");
listItems[2].should("contain.text", "Third item");
```

## Assertions

TWD provides a comprehensive set of assertions for testing element states and content. There are two ways to make assertions:

1. **Method style** (`element.should()`) - For elements from `twd.get()` or `twd.getAll()`
2. **Function style** (`twd.should(element, ...)`) - For any element, especially from Testing Library queries

### Using Assertions

#### Method Style (TWD Elements)

Elements returned from `twd.get()` and `twd.getAll()` have a `.should()` method:

```ts
const element = await twd.get("h1");
element.should("have.text", "Welcome");
element.should("be.visible");
```

#### Function Style (Any Element)

Use `twd.should()` for elements from Testing Library queries or any raw DOM element:

```ts
import { twd, screenDom } from "twd-js";

// With Testing Library queries
const button = await screenDom.findByRole("button");
twd.should(button, "be.visible");
twd.should(button, "have.text", "Submit");

// With raw DOM elements
const element = document.querySelector(".my-element");
twd.should(element, "contain.text", "Hello");
```

### Text Content Assertions

```ts
// Method style (TWD elements)
const element = await twd.get("h1");
element.should("have.text", "Welcome to TWD");
element.should("contain.text", "Welcome");
element.should("be.empty");

// Function style (Testing Library or raw elements)
const heading = await screenDom.findByRole("heading");
twd.should(heading, "have.text", "Welcome to TWD");
twd.should(heading, "contain.text", "Welcome");

// Negated assertions
element.should("not.have.text", "Goodbye");
twd.should(heading, "not.be.empty");
```

### Attribute Assertions

```ts
// Method style
const input = await twd.get("input#email");
input.should("have.attr", "type", "email");
input.should("have.value", "user@example.com");
input.should("have.class", "form-control");

// Function style
const emailInput = await screenDom.findByLabelText("Email:");
twd.should(emailInput, "have.attr", "type", "email");
twd.should(emailInput, "have.value", "user@example.com");
twd.should(emailInput, "have.class", "form-control");
```

### Element State Assertions

```ts
// Method style
const button = await twd.get("button");
button.should("be.disabled");
button.should("be.visible");

// Function style
const submitButton = await screenDom.findByRole("button", { name: /submit/i });
twd.should(submitButton, "be.enabled");
twd.should(submitButton, "be.visible");

// Checked state
const checkbox = await screenDom.findByRole("checkbox");
twd.should(checkbox, "be.checked");

// Selected state
const option = await screenDom.findByRole("option", { selected: true });
twd.should(option, "be.selected");

// Focus state
const input = await screenDom.findByLabelText("Username:");
input.focus();
twd.should(input, "be.focused");
```

### URL Assertions

```ts
// Exact URL match
await twd.url().should("eq", "http://localhost:3000/dashboard");

// URL contains substring
await twd.url().should("contain.url", "/dashboard");
await twd.url().should("contain.url", "localhost");

// Negated URL assertions
await twd.url().should("not.contain.url", "/login");
```

### chai expect assertions

You can use the `expect` function from the `chai` library to make assertions:

```ts
import { expect, twd } from "twd-js";

// Get all list items
const listItems = await twd.getAll("li");

// Assert array length. These assertions are not displayed in the sidebar logs.
expect(listItems).to.have.length(3);
```

## User Interactions

TWD integrates with `@testing-library/user-event` for realistic user interactions. All user event methods are available and automatically logged in the TWD sidebar:

### Click Events

```ts
import { userEvent } from "twd-js";

const user = userEvent.setup();
const button = await twd.get("button");

// Single click
await user.click(button.el);

// Double click
await user.dblClick(button.el);

// Right click
await user.pointer({ target: button.el, keys: '[MouseRight]' });
```

### Typing and Input

```ts
const user = userEvent.setup();
const input = await twd.get("input#username");

// Type text
await user.type(input.el, "john_doe");

// Clear and type
await user.clear(input.el);
await user.type(input.el, "new_username");

// Type special characters (keyboard types into the focused element)
await user.click(input.el);
await user.keyboard("Hello{Enter}World{Tab}");
```

### Form Interactions

```ts
const user = userEvent.setup();

// Select dropdown options
const select = await twd.get("select#country");
await user.selectOptions(select.el, "US");

// Multiple selections
await user.selectOptions(select.el, ["US", "CA", "MX"]);

// Checkbox interactions
const checkbox = await twd.get("input[type='checkbox']");
await user.click(checkbox.el); // Toggle

// Radio button selection
const radio = await twd.get("input[value='premium']");
await user.click(radio.el);
```

### File Upload

```ts
const user = userEvent.setup();
const fileInput = await twd.get("input[type='file']");

// Create a mock file
const file = new File(['hello'], 'hello.png', { type: 'image/png' });

// Upload file
await user.upload(fileInput.el, file);

// Multiple files
const files = [
  new File(['file1'], 'file1.txt', { type: 'text/plain' }),
  new File(['file2'], 'file2.txt', { type: 'text/plain' })
];
await user.upload(fileInput.el, files);
```

## Navigation

### Page Navigation

```ts
// Navigate to different routes
await twd.visit("/");
await twd.visit("/login");
await twd.visit("/dashboard");

// Navigate with query parameters
await twd.visit("/search?q=testing");

// Navigate with hash
await twd.visit("/docs#getting-started");
```

### Waiting

```ts
// Wait for a specific time
await twd.wait(1000); // Wait 1 second

// Wait for element to appear
const element = await twd.get(".loading-spinner");
element.should("be.visible");

// Wait for element to disappear
await twd.wait(500);
const spinner = await twd.get(".loading-spinner");
spinner.should("not.be.visible");
```

## State Management & Test Isolation

TWD runs tests directly in the browser **without page reloads**. The `twd.visit()` command simulates SPA navigation using the History API, which means your SPA router re-renders but **in-memory application state is preserved** between tests.

This is a deliberate trade-off: it keeps tests fast and deterministic, but it means state from tools like Zustand, Redux, Jotai, or plain module-level variables will **leak between tests** unless you explicitly reset it.

### What TWD resets for you

TWD provides built-in reset methods for its own managed state:

```ts
beforeEach(() => {
  twd.clearRequestMockRules();  // Clears API mock rules
  twd.clearComponentMocks();    // Clears component mocks
});
```

### What you need to reset manually

Any state that lives in your application's JavaScript memory persists across tests:

| State type | Example | How to reset |
|---|---|---|
| State managers | Zustand, Redux, Jotai, Pinia | Call your store's reset method |
| Browser storage | localStorage, sessionStorage | `localStorage.clear()` |
| Module singletons | Caches, counters, flags | Re-assign to initial value |
| Global event listeners | `window.addEventListener(...)` | Remove in `afterEach` |
| Timers | `setInterval`, `setTimeout` | Clear in `afterEach` |

Most state management libraries provide a way to reset stores to their initial state. Expose a reset method on your stores and call it in `beforeEach`:

```ts
import { resetMyStore } from "../../store";

describe("My feature", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
    twd.clearComponentMocks();
    resetMyStore();
    localStorage.clear();
  });

  it("should start with clean state", async () => {
    await twd.visit("/my-page");
    // State is fresh for every test
  });
});
```

### Why not just reload the page?

TWD's test runner, sidebar UI, mock service worker, and all test definitions live in the same browser page as your app. A full page reload (`window.location.reload()`) would destroy the test runner itself, losing all test results and state. This is the fundamental constraint of in-browser testing — and the same trade-off other in-browser tools face.

## Best Practices

### 1. Group Related Tests

Organize tests logically with nested describes:

```ts
describe("Shopping Cart", () => {
  describe("Adding Items", () => {
    it("should add item to cart", async () => {
      // Test adding items
    });
  });

  describe("Removing Items", () => {
    it("should remove item from cart", async () => {
      // Test removing items
    });
  });
});
```

### 2. Clean Up After Tests

Use `beforeEach` to ensure clean state. See [State Management & Test Isolation](#state-management-test-isolation) above for full details.

```ts
beforeEach(() => {
  twd.clearRequestMockRules();
  twd.clearComponentMocks();
  localStorage.clear();
  // Reset your app's state managers too (Zustand, Redux, etc.)
});
```

### 3. Write Descriptive Test Names

```ts
// Good ✅
it("should show validation error when email is invalid", async () => {
  // Test implementation
});

// Bad ❌
it("should validate email", async () => {
  // Test implementation
});
```

### 4. Test User Workflows

Test complete user workflows rather than isolated functions:

```ts
describe("User Registration Flow", () => {
  it("should register new user and redirect to dashboard", async () => {
    await twd.visit("/register");
    
    const user = userEvent.setup();
    
    // Fill registration form
    const emailInput = await twd.get("#email");
    const passwordInput = await twd.get("#password");
    const confirmPasswordInput = await twd.get("#confirmPassword");
    await user.type(emailInput.el, "user@example.com");
    await user.type(passwordInput.el, "securePassword123");
    await user.type(confirmPasswordInput.el, "securePassword123");

    // Submit form
    const submitButton = await twd.get("button[type='submit']");
    await user.click(submitButton.el);

    // Verify redirect and welcome message
    await twd.url().should("contain.url", "/dashboard");
    const welcome = await twd.get("h1");
    welcome.should("contain.text", "Welcome");
  });
});
```

## Next Steps

- Learn about [API Mocking](/api-mocking) for testing with external APIs
- Follow the [Tutorial](/tutorial/) for comprehensive testing scenarios
- Check the [API Reference](/api/) for complete method documentation
