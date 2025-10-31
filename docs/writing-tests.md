# Writing Tests

Learn how to write effective tests with TWD's intuitive API and powerful features.

## Test Structure

TWD uses a familiar testing structure similar to Jest, Mocha, and other popular testing frameworks:

```ts
import { describe, it, beforeEach, twd, userEvent } from "twd-js";

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

TWD provides two main methods for selecting DOM elements:

### Single Element Selection

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

### Multiple Element Selection

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

TWD provides a comprehensive set of assertions for testing element states and content.

### Text Content Assertions

```ts
const element = await twd.get("h1");

// Exact text match
element.should("have.text", "Welcome to TWD");

// Partial text match
element.should("contain.text", "Welcome");

// Empty content
element.should("be.empty");

// Negated assertions
element.should("not.have.text", "Goodbye");
element.should("not.be.empty");
```

### Attribute Assertions

```ts
const input = await twd.get("input#email");

// Check attribute value
input.should("have.attr", "type", "email");
input.should("have.attr", "placeholder", "Enter your email");

// Check input value
input.should("have.value", "user@example.com");

// Check CSS classes
input.should("have.class", "form-control");
input.should("not.have.class", "error");
```

### Element State Assertions

```ts
const button = await twd.get("button");
const checkbox = await twd.get("input[type='checkbox']");

// Disabled/enabled state
button.should("be.disabled");
button.should("not.be.enabled");

// Checked state (checkboxes/radios)
checkbox.should("be.checked");
checkbox.should("not.be.checked");

// Selected state (select options)
const option = await twd.get("option[value='admin']");
option.should("be.selected");

// Focus state
const input = await twd.get("input#username");
input.should("be.focused");

// Visibility
button.should("be.visible");
button.should("not.be.visible");
```

### URL Assertions

```ts
// Exact URL match
twd.url().should("eq", "http://localhost:3000/dashboard");

// URL contains substring
twd.url().should("contain.url", "/dashboard");
twd.url().should("contain.url", "localhost");

// Negated URL assertions
twd.url().should("not.contain.url", "/login");
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

TWD integrates with `@testing-library/user-event` for realistic user interactions:

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

### 1. Use Data Attributes

Use `data-testid` attributes for reliable element selection:

```tsx
// In your component
<button data-testid="submit-button">Submit</button>

// In your test
const submitButton = await twd.get("[data-testid='submit-button']");
```

### 2. Group Related Tests

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

### 3. Clean Up After Tests

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

### 4. Write Descriptive Test Names

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

### 5. Test User Workflows

Test complete user workflows rather than isolated functions:

```ts
describe("User Registration Flow", () => {
  it("should register new user and redirect to dashboard", async () => {
    await twd.visit("/register");
    
    const user = userEvent.setup();
    
    // Fill registration form
    await user.type(await twd.get("#email"), "user@example.com");
    await user.type(await twd.get("#password"), "securePassword123");
    await user.type(await twd.get("#confirmPassword"), "securePassword123");
    
    // Submit form
    await user.click(await twd.get("button[type='submit']"));
    
    // Verify redirect and welcome message
    twd.url().should("contain.url", "/dashboard");
    const welcome = await twd.get("h1");
    welcome.should("contain.text", "Welcome");
  });
});
```

## Common Patterns

### Testing Form Validation

**IMAGE HERE** - *Screenshot showing form with validation errors highlighted*

```ts
it("should show validation errors for empty required fields", async () => {
  await twd.visit("/contact");
  
  const user = userEvent.setup();
  const submitButton = await twd.get("button[type='submit']");
  
  // Try to submit empty form
  await user.click(submitButton.el);
  
  // Check for validation errors
  const emailError = await twd.get(".error-email");
  emailError.should("contain.text", "Email is required");
  
  const messageError = await twd.get(".error-message");
  messageError.should("contain.text", "Message is required");
});
```

### Testing Conditional Rendering

```ts
it("should show admin panel for admin users", async () => {
  // Set up admin user state
  localStorage.setItem("userRole", "admin");
  
  await twd.visit("/dashboard");
  
  const adminPanel = await twd.get(".admin-panel");
  adminPanel.should("be.visible");
  
  const adminButton = await twd.get("button[data-testid='admin-settings']");
  adminButton.should("be.visible");
});
```

## Next Steps

- Learn about [API Mocking](/api-mocking) for testing with external APIs
- Explore [Examples](/examples/) for more complex testing scenarios
- Check the [API Reference](/api/) for complete method documentation
