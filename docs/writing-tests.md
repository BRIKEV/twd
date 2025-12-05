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

TWD provides multiple ways to select DOM elements. You can use TWD's native selectors or Testing Library's semantic queries.

### TWD Native Selectors

TWD's native selectors use CSS selectors for simple, direct element access.

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

### Testing Library Queries

TWD also supports Testing Library's query methods through `screenDom`, providing semantic, accessible queries that follow testing best practices.

#### Import screenDom

```ts
import { screenDom } from "twd-js";
```

#### Query by Role (Recommended)

```ts
// Get button by role and accessible name
const submitButton = screenDom.getByRole("button", { name: /submit/i });
const heading = screenDom.getByRole("heading", { name: "Welcome", level: 1 });

// Get form elements
const emailInput = screenDom.getByRole("textbox", { name: /email/i });
const checkbox = screenDom.getByRole("checkbox", { name: /terms/i });
```

#### Query by Label

```ts
// Get inputs by their labels (most accessible)
const emailInput = screenDom.getByLabelText("Email Address:");
const searchInput = screenDom.getByLabelText(/search/i);
```

#### Query by Text

```ts
// Get elements by text content
const title = screenDom.getByText("Welcome to TWD");
const partialMatch = screenDom.getByText(/welcome/i);
```

#### Query by Test ID

```ts
// Get elements by data-testid
const userCard = screenDom.getByTestId("user-card");
```

#### Query Methods

- **getBy*** - Returns element or throws if not found
- **queryBy*** - Returns element or null if not found
- **findBy*** - Returns promise, waits for element to appear
- **getAllBy*** / **queryAllBy*** / **findAllBy*** - Returns array of elements

```ts
// getBy throws if element doesn't exist
const button = screenDom.getByRole("button");

// queryBy returns null if element doesn't exist
const error = screenDom.queryByText("Error");
if (error) {
  // Handle error
}

// findBy waits for element to appear
const successMessage = await screenDom.findByText("Success!");

// getAllBy returns array
const buttons = screenDom.getAllByRole("button");
expect(buttons).to.have.length(3);
```

#### Complete Example with screenDom

```ts
import { screenDom, userEvent, twd } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("Login Form", () => {
  it("should submit login form", async () => {
    await twd.visit("/login");

    // Use screenDom for semantic queries
    const emailInput = screenDom.getByLabelText("Email:");
    const passwordInput = screenDom.getByLabelText("Password:");
    const submitButton = screenDom.getByRole("button", { name: /sign in/i });

    // Use userEvent for interactions
    const user = userEvent.setup();
    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    // Wait for success message
    const successMessage = await screenDom.findByText("Login successful!");
    twd.should(successMessage, "be.visible");
  });
});
```

> **Note:** For complete Testing Library documentation, see the [Testing Library API reference](/react-testing-library).

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
const button = screenDom.getByRole("button");
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
const heading = screenDom.getByRole("heading");
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
const emailInput = screenDom.getByLabelText("Email:");
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
const submitButton = screenDom.getByRole("button", { name: /submit/i });
twd.should(submitButton, "be.enabled");
twd.should(submitButton, "be.visible");

// Checked state
const checkbox = screenDom.getByRole("checkbox");
twd.should(checkbox, "be.checked");

// Selected state
const option = screenDom.getByRole("option", { selected: true });
twd.should(option, "be.selected");

// Focus state
const input = screenDom.getByLabelText("Username:");
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

// Type special characters
await user.keyboard(input.el, "Hello{Enter}World{Tab}");
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

Use `beforeEach` to ensure clean state:

```ts
beforeEach(() => {
  // Clear local storage
  localStorage.clear();
  
  // Reset any global state
  // Clear any mocks from previous tests
  twd.clearRequestMockRules();
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
