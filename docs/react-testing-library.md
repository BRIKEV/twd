# Testing Library Support

TWD fully supports Testing Library's query methods and user event utilities, giving you access to the same powerful APIs used in traditional testing frameworks.

## Overview

TWD provides two ways to select elements:

1. **TWD's native selectors** (`twd.get()`, `twd.getAll()`) - Simple CSS selector-based queries
2. **Testing Library** (`screenDom`, `userEvent`) - Accessible, semantic queries that follow testing best practices

Both approaches work seamlessly together, and you can choose the one that best fits your needs.

## Screen Queries (screenDom)

TWD exports `screenDom` which provides all the query methods from `@testing-library/dom`. This gives you access to semantic, accessible queries that follow Testing Library best practices.

### Import

```ts
import { screenDom } from "twd-js";
```

### Query Methods

All Testing Library query methods are available:

#### getBy* Methods (Throws if not found)

```ts
// Get by role (recommended)
const button = screenDom.getByRole("button", { name: /submit/i });
const heading = screenDom.getByRole("heading", { name: "Welcome", level: 1 });

// Get by text
const title = screenDom.getByText("Welcome to TWD");
const partialText = screenDom.getByText(/welcome/i);

// Get by label
const emailInput = screenDom.getByLabelText("Email Address:");
const searchInput = screenDom.getByLabelText(/search/i);

// Get by placeholder
const input = screenDom.getByPlaceholderText("Enter your email");

// Get by test ID
const card = screenDom.getByTestId("user-card");

// Get by alt text
const logo = screenDom.getByAltText("Company Logo");
```

#### queryBy* Methods (Returns null if not found)

```ts
// Use queryBy when element might not exist
const errorMessage = screenDom.queryByText("Error occurred");
if (errorMessage) {
  // Handle error message
}

// Check for absence
const modal = screenDom.queryByRole("dialog");
expect(modal).toBeNull(); // Modal should not be present
```

#### findBy* Methods (Async, waits for element)

```ts
// Wait for element to appear
const successMessage = await screenDom.findByText("Success!");
const loadingSpinner = await screenDom.findByRole("status");
```

#### getAllBy* / queryAllBy* / findAllBy* Methods

```ts
// Get multiple elements
const buttons = screenDom.getAllByRole("button");
const links = screenDom.queryAllByRole("link");
const items = await screenDom.findAllByTestId("list-item");

// Check count
expect(buttons).to.have.length(3);
twd.should(buttons[0], "be.visible");
```

### Complete Example

```ts
import { screenDom, userEvent, twd } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("User Profile", () => {
  it("should display user information", async () => {
    await twd.visit("/profile");

    // Query by role (most accessible)
    const heading = screenDom.getByRole("heading", { name: "User Profile" });
    expect(heading).to.exist;

    // Query by label
    const emailInput = screenDom.getByLabelText("Email:");
    twd.should(emailInput, "have.value", "user@example.com");

    // Query by text
    const saveButton = screenDom.getByRole("button", { name: /save/i });
    
    // Interact with userEvent
    const user = userEvent.setup();
    await user.click(saveButton);
  });

  it("should handle conditional elements", async () => {
    await twd.visit("/dashboard");

    // Use queryBy for optional elements
    const adminPanel = screenDom.queryByTestId("admin-panel");
    
    // Check if element exists
    if (adminPanel) {
      twd.should(adminPanel, "be.visible");
    } else {
      // User is not admin
      expect(adminPanel).toBeNull();
    }
  });

  it("should wait for async content", async () => {
    await twd.visit("/posts");
    
    // Wait for content to load
    const firstPost = await screenDom.findByTestId("post-1");
    twd.should(firstPost, "be.visible");
    
    // Get all posts once loaded
    const posts = screenDom.getAllByTestId(/^post-/);
    expect(posts.length).to.be.greaterThan(0);
  });
});
```

## User Event (userEvent)

TWD integrates with `@testing-library/user-event` for realistic user interactions. All user event methods are available and logged in the TWD sidebar.

### Import

```ts
import { userEvent } from "twd-js";
```

### Setup

```ts
const user = userEvent.setup();
```

### Common Interactions

```ts
import { screenDom, userEvent } from "twd-js";

describe("Form Interactions", () => {
  it("should handle form submission", async () => {
    const user = userEvent.setup();

    // Find elements using screenDom
    const emailInput = screenDom.getByLabelText("Email:");
    const passwordInput = screenDom.getByLabelText("Password:");
    const submitButton = screenDom.getByRole("button", { name: /submit/i });

    // Type into inputs
    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "password123");

    // Click button
    await user.click(submitButton);

    // Wait for success message
    const successMessage = await screenDom.findByText("Login successful!");
    twd.should(successMessage, "be.visible");
  });

  it("should handle dropdown selection", async () => {
    const user = userEvent.setup();

    const countrySelect = screenDom.getByLabelText("Country:");
    await user.selectOptions(countrySelect, "US");

    const selectedOption = screenDom.getByRole("option", { name: "United States", selected: true });
    expect(selectedOption).to.exist;
  });

  it("should handle keyboard navigation", async () => {
    const user = userEvent.setup();

    const firstInput = screenDom.getByLabelText("First Name:");
    await user.type(firstInput, "John");
    
    // Tab to next input
    await user.tab();
    
    const secondInput = screenDom.getByLabelText("Last Name:");
    twd.should(secondInput, "be.focused");
    await user.type(secondInput, "Doe");
  });
});
```

### Available User Event Methods

All `@testing-library/user-event` methods are supported:

- `click()` - Click an element
- `dblClick()` - Double click
- `type()` - Type text into an input
- `clear()` - Clear input value
- `selectOptions()` - Select dropdown options
- `upload()` - Upload files
- `tab()` - Navigate with Tab key
- `keyboard()` - Send keyboard events
- `hover()` - Hover over element
- `unhover()` - Remove hover
- And more...

## Combining TWD and Testing Library

You can mix and match TWD's native selectors with Testing Library queries:

```ts
import { twd, screenDom, userEvent } from "twd-js";

describe("Mixed Approach", () => {
  it("should use both selector types", async () => {
    await twd.visit("/dashboard");

    // Use TWD for simple CSS selectors
    const container = await twd.get(".dashboard-container");
    container.should("be.visible");

    // Use screenDom for semantic queries
    const heading = screenDom.getByRole("heading", { name: "Dashboard" });
    expect(heading).to.exist;

    // Use screenDom for form elements
    const user = userEvent.setup();
    const searchInput = screenDom.getByLabelText("Search:");
    await user.type(searchInput, "query");

    // Use TWD for complex selectors
    const results = await twd.getAll(".search-result");
    expect(results.length).to.be.greaterThan(0);
  });
});
```

## When to Use Each Approach

### Use TWD Selectors (`twd.get`, `twd.getAll`) When:

- You need complex CSS selectors
- You're selecting by data attributes
- You want simple, direct element access
- You prefer CSS selector syntax

```ts
// Complex selectors
const item = await twd.get("ul > li:nth-child(3) button");
const cards = await twd.getAll("[data-testid='product-card']");
```

### Use Testing Library (`screenDom`) When:

- You want accessible, semantic queries
- You're following Testing Library best practices
- You want queries that match how users interact with your app
- You need role-based queries (recommended for accessibility)

```ts
// Semantic, accessible queries
const button = screenDom.getByRole("button", { name: /submit/i });
const form = screenDom.getByLabelText("Email:");
```

## Best Practices

### 1. Prefer Role-Based Queries

```ts
// ✅ Good - Accessible and semantic
const button = screenDom.getByRole("button", { name: "Submit" });

// ❌ Avoid - Less accessible
const button = screenDom.getByText("Submit");
```

### 2. Use Appropriate Query Types

```ts
// Use getBy when element must exist
const heading = screenDom.getByRole("heading");

// Use queryBy when element might not exist
const error = screenDom.queryByText("Error");
if (error) {
  // Handle error
}

// Use findBy when waiting for async content
const data = await screenDom.findByTestId("async-data");
```

### 3. Combine with TWD Assertions

```ts
// Use screenDom for queries
const input = screenDom.getByLabelText("Email:");

// Use TWD's should() function for assertions (not method on element)
twd.should(input, "have.value", "user@example.com");
twd.should(input, "be.visible");
```

## Logging

All Testing Library queries and user events are automatically logged in the TWD sidebar, making it easy to see what your tests are doing:

- Query operations show as `query: getByRole("button")`
- User events show as `Event fired: Clicked element`
- All operations are visible in the test sidebar

## Next Steps

- Learn about [TWD Commands](/api/twd-commands) for native selectors
- Explore [User Interactions](/writing-tests#user-interactions) in detail
- Check the [Testing Library docs](https://testing-library.com/docs/react-testing-library/intro/) for more query options

