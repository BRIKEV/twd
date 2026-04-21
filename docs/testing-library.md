---
title: Testing Library
description: Use Testing Library query methods and user event utilities inside TWD tests
---

# Testing Library Support

TWD fully supports Testing Library's query methods and user event utilities, giving you access to the same powerful APIs used in traditional testing frameworks.

## Overview

TWD provides two ways to select elements:

1. **TWD's native selectors** (`twd.get()`, `twd.getAll()`) - Simple CSS selector-based queries
2. **Testing Library** (`screenDom`, `userEvent`) - Accessible, semantic queries that follow testing best practices

Both approaches work seamlessly together, and you can choose the one that best fits your needs.

## Screen Queries

TWD provides two screen query APIs that give you access to all query methods from `@testing-library/dom`:

1. **`screenDom`** - Scoped queries that exclude the TWD sidebar (recommended for most use cases)
2. **`screenDomGlobal`** - Global queries that search the entire document.body (for portals/modals)

### Import

```ts
import { screenDom, screenDomGlobal } from "twd-js";
```

## screenDom (Scoped Queries)

`screenDom` searches only within the main app container (typically `#root`), automatically excluding the TWD sidebar. This is the recommended option for most queries.

**Use `screenDom` when:**
- Querying elements within your main application
- You want to avoid accidentally matching sidebar elements
- Working with regular page content

**Note:** `screenDom` will NOT find portal-rendered elements (modals, dialogs) that are rendered outside the root container. For portals, use `screenDomGlobal` instead.

### How screenDom Works

`screenDom` resolves the app's root container in this priority order:

1. **Configured selector** — if you pass `rootSelector` to `initTWD` (e.g. `initTWD(tests, { rootSelector: '#my-app' })`), that selector is tried first.
2. **Known framework roots** — `#root` (Vite / CRA / Solid), `#app` (Vue), then `app-root` (Angular). Most apps fall into this bucket and need no configuration.
3. **Heuristic fallback** — the first direct child of `<body>` that isn't the TWD sidebar, isn't an excluded tag, and isn't empty.
4. **Last resort** — `document.body`.

If resolution reaches step 3 or 4 without a configured `rootSelector`, `screenDom` logs a one-time console warning pointing you to the `rootSelector` option.

**Excluded elements:** The following tags are ignored during the heuristic fallback (they're never app content):

- `script`, `style`, `svg`, `path`, `noscript`, `link`, `iframe`, `template`, `meta`

### Configuring a custom root

If your app mounts into a non-standard element, pass `rootSelector` to `initTWD`:

```ts
initTWD(tests, {
  rootSelector: '#my-app',
});
```

This is the simplest way to handle apps whose root isn't `#root`, `#app`, or `app-root`.

### Troubleshooting: When screenDom Can't Find Your Container

If `screenDom` queries fail unexpectedly:

1. **Your app uses a non-standard root selector.** Pass it via `initTWD({ rootSelector: '#your-root' })`.
2. **Your app root exists but hasn't mounted yet.** `screenDom` queries inside a `twd.visit()` flow should run after the route mounts — make sure you `await twd.visit(...)` before querying.
3. **You need portal-rendered elements (modals, tooltips).** Use `screenDomGlobal` for those; `screenDom` only searches inside the resolved root container.

**When to use `screenDomGlobal` instead:**
- You need to query portal-rendered elements (modals, dialogs)

⚠️ **Remember:** When using `screenDomGlobal`, make your queries specific (e.g., `getByRole('button', { name: 'Submit' })`) to avoid accidentally matching elements in the TWD sidebar.

### screenDomGlobal (Global Queries)

`screenDomGlobal` searches all elements in `document.body`, including portal-rendered elements (modals, dialogs, tooltips, etc.).

**Use `screenDomGlobal` when:**
- Querying portal-rendered elements (modals, dialogs, tooltips)
- You need to search outside the root container
- Working with elements rendered via React portals or similar mechanisms

⚠️ **WARNING:** `screenDomGlobal` may also match elements inside the TWD sidebar if your selectors are not specific enough. Always use specific queries (e.g., `getByRole` with `name` option) to avoid matching sidebar elements.

**Example:**
```ts
// ✅ Good - Specific query that won't match sidebar
const modal = screenDomGlobal.getByRole('dialog', { name: 'Confirm Action' });
const modalTitle = screenDomGlobal.getByText('Are you sure?');

// ❌ Avoid - Too generic, might match sidebar elements
const button = screenDomGlobal.getByRole('button'); // Could match sidebar buttons!
const text = screenDomGlobal.getByText('Submit'); // Could match sidebar text!
```

### Query Methods

All Testing Library query methods are available for both `screenDom` and `screenDomGlobal`:

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

TWD configures the async utility timeout at **3000ms** (instead of RTL's default 1000ms) to accommodate CI rendering delays after network requests.

```ts
// Wait for element to appear (waits up to 3s)
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
import { screenDom, screenDomGlobal, userEvent, twd } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("User Profile", () => {
  it("should display user information", async () => {
    await twd.visit("/profile");

    // Query by role (most accessible) - using screenDom for regular content
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

  it("should interact with modal dialog", async () => {
    await twd.visit("/settings");
    
    // Open modal using screenDom (regular button in app)
    const deleteButton = screenDom.getByRole("button", { name: /delete account/i });
    const user = userEvent.setup();
    await user.click(deleteButton);
    
    // Query modal using screenDomGlobal (modal is rendered via portal)
    const confirmModal = await screenDomGlobal.findByRole("dialog", { name: "Confirm Deletion" });
    twd.should(confirmModal, "be.visible");
    
    // Use specific queries to avoid matching sidebar
    const confirmButton = screenDomGlobal.getByRole("button", { name: "Yes, Delete" });
    await user.click(confirmButton);
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

### Use Testing Library (`screenDom` or `screenDomGlobal`) When:

- You want accessible, semantic queries
- You're following Testing Library best practices
- You want queries that match how users interact with your app
- You need role-based queries (recommended for accessibility)

```ts
// Semantic, accessible queries - use screenDom for regular content
const button = screenDom.getByRole("button", { name: /submit/i });
const form = screenDom.getByLabelText("Email:");

// Use screenDomGlobal for portal-rendered elements (modals, dialogs)
const modal = screenDomGlobal.getByRole("dialog", { name: "Confirm" });
const tooltip = screenDomGlobal.getByRole("tooltip");
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
- Check the [Testing Library docs](https://testing-library.com/docs/testing-library/intro/) for more query options

