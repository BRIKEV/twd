---
title: Testing Library
description: Use Testing Library query methods and user event utilities inside TWD tests
---

# Testing Library Support

TWD fully supports Testing Library's query methods and user event utilities, giving you access to the same powerful APIs used in traditional testing frameworks.

## Overview

TWD provides two ways to select elements:

1. **Testing Library** (`screenDom`, `userEvent`) - Accessible, semantic queries that follow testing best practices. **This is the default.**
2. **TWD's native selectors** (`twd.get()`, `twd.getAll()`) - CSS selector-based queries, the last resort when no Testing Library query reaches the element

Both work together in the same test, but they are not equal choices. TWD tests run against a real app that renders asynchronously, so the query you pick decides whether a test is stable or flaky. Default to `await screenDom.findBy*(...)` for every lookup. See [When to Use Each Approach](#when-to-use-each-approach) for the full priority order.

## Rendering components directly

Everything on this page assumes you are querying your running app. You can also
call Testing Library's `render()` inside a TWD test to mount a single component in
isolation, in the same real browser.

One important difference: `render()` mounts into a fresh `div` on `document.body`,
which is outside the app root, so **`screenDom` will not find it**. Use Testing
Library's own `screen` or TWD's `screenDomGlobal` for rendered components.

See [Component Testing](/component-testing) for the full setup.

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

1. **Configured selector** — if you pass `rootSelector` (to the `twd()` Vite plugin or to `initTWD`), that selector is tried first.
2. **Known framework roots** — `#root` (Vite / CRA / Solid), `#app` (Vue), then `app-root` (Angular). Most apps fall into this bucket and need no configuration.
3. **Heuristic fallback** — the first direct child of `<body>` that isn't the TWD sidebar, isn't an excluded tag, and isn't empty.
4. **Last resort** — `document.body`.

If resolution reaches step 3 or 4 without a configured `rootSelector`, `screenDom` logs a one-time console warning pointing you to the `rootSelector` option.

**Excluded elements:** The following tags are ignored during the heuristic fallback (they're never app content):

- `script`, `style`, `svg`, `path`, `noscript`, `link`, `iframe`, `template`, `meta`

### Configuring a custom root

If your app mounts into a non-standard element, pass `rootSelector` to the `twd()` plugin (Vite projects) or to `initTWD` (manual setup):

```ts
// vite.config.ts (Vite projects)
import { twd } from 'twd-js/vite-plugin';
export default defineConfig({
  plugins: [twd({ rootSelector: '#my-app' })],
});
```

```ts
// Manual setup (Angular / Webpack / non-Vite)
initTWD(tests, {
  rootSelector: '#my-app',
});
```

This is the simplest way to handle apps whose root isn't `#root`, `#app`, or `app-root`.

### Troubleshooting: When screenDom Can't Find Your Container

If `screenDom` queries fail unexpectedly:

1. **Your app uses a non-standard root selector.** Pass it via `twd({ rootSelector: '#your-root' })` (Vite plugin) or `initTWD({ rootSelector: '#your-root' })` (manual setup).
2. **Your app root exists but hasn't mounted yet.** `screenDom` queries inside a `twd.visit()` flow should run after the route mounts — make sure you `await twd.visit(...)` before querying.
3. **You need portal-rendered elements (modals, tooltips).** Use `screenDomGlobal` for those; `screenDom` only searches inside the resolved root container.

**When to use `screenDomGlobal` instead:**
- You need to query portal-rendered elements (modals, dialogs)

⚠️ **Remember:** When using `screenDomGlobal`, make your queries specific (e.g., `findByRole('button', { name: 'Submit' })`) to avoid accidentally matching elements in the TWD sidebar.

### screenDomGlobal (Global Queries)

`screenDomGlobal` searches all elements in `document.body`, including portal-rendered elements (modals, dialogs, tooltips, etc.).

**Use `screenDomGlobal` when:**
- Querying portal-rendered elements (modals, dialogs, tooltips)
- You need to search outside the root container
- Working with elements rendered via React portals or similar mechanisms

⚠️ **WARNING:** `screenDomGlobal` may also match elements inside the TWD sidebar if your selectors are not specific enough. Always use specific queries (e.g., `findByRole` with `name` option) to avoid matching sidebar elements.

**Example:**
```ts
// ✅ Good - Specific query that won't match sidebar
const modal = await screenDomGlobal.findByRole('dialog', { name: 'Confirm Action' });
const modalTitle = await screenDomGlobal.findByText('Are you sure?');

// ❌ Avoid - Too generic, might match sidebar elements
const button = await screenDomGlobal.findByRole('button'); // Could match sidebar buttons!
const text = await screenDomGlobal.findByText('Submit'); // Could match sidebar text!
```

### Query Methods

All Testing Library query methods are available for both `screenDom` and `screenDomGlobal`. They come in three families, listed here **in the order you should reach for them**.

#### findBy* Methods (Default: async, waits for the element)

`findBy*` returns a promise that resolves once the element is in the DOM. TWD configures the async utility timeout at **3000ms** (instead of RTL's default 1000ms) to accommodate CI rendering delays after network requests.

When the element is already rendered, `findBy*` resolves on its first check, so it costs nothing to use it everywhere. Use it for **every lookup**, not only the first one after `twd.visit()`.

```ts
// By role (recommended)
const button = await screenDom.findByRole("button", { name: /submit/i });
const heading = await screenDom.findByRole("heading", { name: "Welcome", level: 1 });

// By label
const emailInput = await screenDom.findByLabelText("Email Address:");

// By text
const title = await screenDom.findByText("Welcome to TWD");
const partialText = await screenDom.findByText(/welcome/i);

// By placeholder
const input = await screenDom.findByPlaceholderText("Enter your email");

// By alt text
const logo = await screenDom.findByAltText("Company Logo");

// By test ID
const card = await screenDom.findByTestId("user-card");

// Multiple elements: waits until at least one matches
const items = await screenDom.findAllByRole("listitem");
expect(items).to.have.length(3);
```

#### queryBy* Methods (Only to assert absence)

`queryBy*` returns `null` (or `[]` for `queryAllBy*`) instead of throwing. Its only job is to assert that something is **not** on the page.

```ts
// Check for absence
const modal = screenDom.queryByRole("dialog");
expect(modal).to.be.null;

const errors = screenDom.queryAllByRole("alert");
expect(errors).to.have.length(0);
```

::: tip Waiting for something to disappear
`queryBy*` checks once. If the element is still on its way out (a closing modal, a loading spinner), wrap the check in `twd.waitFor`:

```ts
await twd.waitFor(() => {
  expect(screenDom.queryByRole("progressbar")).to.be.null;
});
```
:::

#### getBy* Methods (Only inside `twd.waitFor`)

`getBy*` is synchronous and throws **immediately** if the element is not in the DOM yet. In a real app the element is often still rendering after a navigation, a mocked request or a click, so a bare `getBy*` passes on your machine and fails in CI. Use it only inside a `twd.waitFor` callback, where the retry loop makes up for it:

```ts
// ✅ getBy inside waitFor: retried until the state matches
await twd.waitFor(() => {
  expect(screenDom.getByRole("button", { name: /save/i }).getAttribute("aria-busy")).to.equal("false");
});

// ❌ Flaky: throws if the heading has not rendered yet
const heading = screenDom.getByRole("heading", { name: "Welcome" });

// ✅ Same lookup, stable
const heading = await screenDom.findByRole("heading", { name: "Welcome" });
```

If all you want is to wait for an element to appear, `findBy*` already does that. `twd.waitFor(() => screenDom.getByRole(...))` is just a hand-written `findByRole`.

### Complete Example

```ts
import { screenDom, screenDomGlobal, userEvent, twd, expect } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("User Profile", () => {
  it("should display user information", async () => {
    await twd.visit("/profile");

    // Query by role (most accessible) - using screenDom for regular content
    const heading = await screenDom.findByRole("heading", { name: "User Profile" });
    twd.should(heading, "be.visible");

    // Query by label
    const emailInput = await screenDom.findByLabelText("Email:");
    twd.should(emailInput, "have.value", "user@example.com");

    // Interact with userEvent
    const saveButton = await screenDom.findByRole("button", { name: /save/i });
    const user = userEvent.setup();
    await user.click(saveButton);
  });

  it("should hide the admin panel for regular users", async () => {
    await twd.visit("/dashboard");

    // Wait for the page to render first, then assert absence
    await screenDom.findByRole("heading", { name: "Dashboard" });
    expect(screenDom.queryByTestId("admin-panel")).to.be.null;
  });

  it("should wait for async content", async () => {
    await twd.visit("/posts");

    // findAllBy waits for the posts to load
    const posts = await screenDom.findAllByTestId(/^post-/);
    expect(posts.length).to.be.greaterThan(0);
    twd.should(posts[0], "be.visible");
  });

  it("should interact with modal dialog", async () => {
    await twd.visit("/settings");

    // Open modal using screenDom (regular button in app)
    const deleteButton = await screenDom.findByRole("button", { name: /delete account/i });
    const user = userEvent.setup();
    await user.click(deleteButton);

    // Query modal using screenDomGlobal (modal is rendered via portal)
    const confirmModal = await screenDomGlobal.findByRole("dialog", { name: "Confirm Deletion" });
    twd.should(confirmModal, "be.visible");

    // Use specific queries to avoid matching sidebar
    const confirmButton = await screenDomGlobal.findByRole("button", { name: "Yes, Delete" });
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
    const emailInput = await screenDom.findByLabelText("Email:");
    const passwordInput = await screenDom.findByLabelText("Password:");
    const submitButton = await screenDom.findByRole("button", { name: /submit/i });

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

    const countrySelect = await screenDom.findByLabelText("Country:");
    await user.selectOptions(countrySelect, "US");

    const selectedOption = await screenDom.findByRole("option", { name: "United States", selected: true });
    twd.should(selectedOption, "be.selected");
  });

  it("should handle keyboard navigation", async () => {
    const user = userEvent.setup();

    const firstInput = await screenDom.findByLabelText("First Name:");
    await user.type(firstInput, "John");
    
    // Tab to next input
    await user.tab();
    
    const secondInput = await screenDom.findByLabelText("Last Name:");
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

You can mix TWD's native selectors with Testing Library queries in the same test. Keep `twd.get()` for the elements no query can reach:

```ts
import { twd, screenDom, userEvent, expect } from "twd-js";

describe("Mixed Approach", () => {
  it("should use both selector types", async () => {
    await twd.visit("/dashboard");

    // Testing Library first: semantic queries for anything a user can see or name
    const heading = await screenDom.findByRole("heading", { name: "Dashboard" });
    twd.should(heading, "be.visible");

    const user = userEvent.setup();
    const searchInput = await screenDom.findByLabelText("Search:");
    await user.type(searchInput, "query");

    const results = await screenDom.findAllByRole("listitem");
    expect(results.length).to.be.greaterThan(0);

    // twd.get as a last resort: a third-party chart with no accessible markup
    const chart = await twd.get(".vendor-chart canvas");
    chart.should("be.visible");
  });
});
```

## When to Use Each Approach

TWD follows [Testing Library's query priority](https://testing-library.com/docs/queries/about#priority) for *which* query to use: role first, then label, placeholder, text, display value, alt text, title, and test ID last. On top of that, TWD has a rule for *which variant* to use, because tests run against a real app where rendering is asynchronous. In order:

| Priority | Use | For |
|---|---|---|
| 1 | `await screenDom.findBy*()` / `findAllBy*()` | **Every lookup.** Waits for the element, resolves at once if it is already there |
| 2 | `screenDom.queryBy*()` / `queryAllBy*()` | Only to assert an element is **absent** |
| 3 | `screenDom.getBy*()` / `getAllBy*()` | Only **inside `twd.waitFor(() => ...)`**, which retries it |
| 4 | `await twd.get()` / `twd.getAll()` | **Last resort**, when no Testing Library query reaches the element |

Swap `screenDom` for `screenDomGlobal` when the element lives in a portal (modals, dialogs, tooltips).

### Why `findBy*` and not `getBy*`

A TWD test drives your real app: `twd.visit()` mounts a route, mocked requests resolve, state updates and components re-render. The DOM keeps changing after each step, and how long it takes depends on the machine. A `getBy*` right after a visit or a click reads the DOM once, so it passes when your laptop is fast and fails in CI when it is not.

`findBy*` removes that race. It retries until the element appears (up to 3000ms), and when the element is already there it returns on the first check. You don't need to decide whether something "has rendered yet", so the safe default is to use it for every lookup.

```ts
// ✅ Stable: waits for each element
const button = await screenDom.findByRole("button", { name: /submit/i });
const email = await screenDom.findByLabelText("Email:");
const modal = await screenDomGlobal.findByRole("dialog", { name: "Confirm" });

// ❌ Flaky: each line throws if the element has not rendered yet
const button = screenDom.getByRole("button", { name: /submit/i });
const email = screenDom.getByLabelText("Email:");
const modal = screenDomGlobal.getByRole("dialog", { name: "Confirm" });
```

### When `twd.get()` is the right call

Only when no Testing Library query reaches the element: a third-party widget that renders bare `<div>`s or a `<canvas>`, or markup you don't own and can't add a role, label or `data-testid` to. If you are reaching for `twd.get()` on your own components, that usually means they are missing an accessible name, which is worth fixing in the component.

```ts
// Last resort: no role, label or text to query by
const chart = await twd.get(".vendor-chart canvas");
const cells = await twd.getAll(".vendor-grid .cell");
```

## Best Practices

### 1. Prefer Role-Based Queries

```ts
// ✅ Good - Accessible and semantic
const button = await screenDom.findByRole("button", { name: "Submit" });

// ❌ Avoid - Less accessible
const button = await screenDom.findByText("Submit");
```

### 2. Use `findBy*` for Every Lookup

```ts
// ✅ Element must exist: findBy waits for it
const heading = await screenDom.findByRole("heading", { name: "Orders" });

// ✅ Element must NOT exist: queryBy returns null
expect(screenDom.queryByText("Error")).to.be.null;

// ❌ Avoid: getBy outside waitFor throws if the element is still rendering
const heading = screenDom.getByRole("heading", { name: "Orders" });
```

### 3. Combine with TWD Assertions

```ts
// Use screenDom for queries
const input = await screenDom.findByLabelText("Email:");

// Use TWD's should() function for assertions (not method on element)
twd.should(input, "have.value", "user@example.com");
twd.should(input, "be.visible");
```

## Logging

All Testing Library queries and user events are automatically logged in the TWD sidebar, making it easy to see what your tests are doing:

- Query operations show as `query: findByRole("button")`
- User events show as `Event fired: Clicked element`
- All operations are visible in the test sidebar

## Next Steps

- Read [Component Testing](/component-testing) to render components in isolation with `render()`
- Learn about [TWD Commands](/api/twd-commands) for native selectors
- Explore [User Interactions](/writing-tests#user-interactions) in detail
- Check the [Testing Library docs](https://testing-library.com/docs/testing-library/intro/) for more query options

