# TWD Commands

Core commands for element selection, navigation, and API mocking in TWD tests.

## Element Selection

### twd.get(selector)

Selects a single DOM element using a CSS selector.

#### Syntax

```ts
twd.get(selector: string): Promise<TWDElemAPI>
```

#### Parameters

- **selector** (`string`) - CSS selector to find the element

#### Returns

`Promise<TWDElemAPI>` - Element API with assertion methods

#### Examples

```ts
// Basic selectors
const button = await twd.get("button");
const emailInput = await twd.get("#email");
const errorMessage = await twd.get(".error-message");

// Complex selectors
const submitButton = await twd.get("form button[type='submit']");
const firstItem = await twd.get("ul > li:first-child");
const dataAttribute = await twd.get("[data-testid='user-card']");

// Use the returned element
button.should("be.visible");
emailInput.should("have.value", "test@example.com");
```

---

### twd.getAll(selector)

Selects multiple DOM elements using a CSS selector.

#### Syntax

```ts
twd.getAll(selector: string): Promise<TWDElemAPI[]>
```

#### Parameters

- **selector** (`string`) - CSS selector to find elements

#### Returns

`Promise<TWDElemAPI[]>` - Array of element APIs

#### Examples

```ts
// Get all matching elements
const buttons = await twd.getAll("button");
const listItems = await twd.getAll("li");
const productCards = await twd.getAll(".product-card");

// Access specific elements
buttons[0].should("be.visible");
buttons[buttons.length - 1].should("be.enabled");

// Check array length
expect(productCards).to.have.length(10);

// Iterate through elements
for (let i = 0; i < listItems.length; i++) {
  listItems[i].should("be.visible");
}
```

---

## Navigation

### twd.visit(url, reload?)

Navigates to a specific URL in your single-page application.

#### Syntax

```ts
twd.visit(url: string, reload?: boolean): Promise<void>
```

#### Parameters

- **url** (`string`) - The URL path to navigate to
- **reload** (`boolean`, optional) - If `true`, forces a reload even if already on the target URL. Defaults to `false`.

#### Returns

`Promise<void>` - Resolves when navigation is complete

#### Examples

```ts
// Basic navigation
await twd.visit("/");
await twd.visit("/products");
await twd.visit("/user/profile");

// With query parameters
await twd.visit("/search?q=laptop&category=electronics");

// With hash fragments
await twd.visit("/docs#getting-started");

// Force reload even if already on the page
await twd.visit("/dashboard", true);
```

#### Use Cases

```ts
describe("Navigation Tests", () => {
  it("should navigate between pages", async () => {
    await twd.visit("/");
    
    const homeHeading = await twd.get("h1");
    homeHeading.should("contain.text", "Home");
    
    await twd.visit("/about");
    
    const aboutHeading = await twd.get("h1");
    aboutHeading.should("contain.text", "About");
  });
});
```

---

### twd.url()

Returns the URL command API for making assertions about the current URL.

#### Syntax

```ts
twd.url(): URLCommandAPI
```

#### Returns

`URLCommandAPI` - Object with URL assertion methods

#### Methods

- `should(assertion, value, retries?)` - Make URL assertions (async, retries with 100ms delay between attempts, default: 5 retries)

#### Examples

```ts
// Exact URL matching
await twd.url().should("eq", "http://localhost:3000/products");

// URL contains substring
await twd.url().should("contain.url", "/products");
await twd.url().should("contain.url", "localhost");

// Negated assertions
await twd.url().should("not.contain.url", "/admin");

// After navigation
twd.visit("/login");
await twd.url().should("contain.url", "/login");

const loginButton = await twd.get("button[type='submit']");
await userEvent.click(loginButton.el);
await twd.url().should("contain.url", "/dashboard");
```

---

## Input Handling

### userEvent (Recommended)

The primary and recommended way to interact with form inputs. `userEvent` simulates realistic user interactions and should be used for most input scenarios.

#### Import and Setup

```ts
import { userEvent } from 'twd-js';

// In your test
const user = userEvent.setup();
```

#### Text Inputs

```ts
describe("Form Input Tests", () => {
  it("should handle text input realistically", async () => {
    await twd.visit("/contact");
    
    const user = userEvent.setup();
    const nameInput = await twd.get("input[name='name']");
    const emailInput = await twd.get("input[name='email']");
    const messageTextarea = await twd.get("textarea[name='message']");
    
    // Type text naturally (with timing and events)
    await user.type(nameInput.el, "John Doe");
    await user.type(emailInput.el, "john@example.com");
    await user.type(messageTextarea.el, "Hello, this is my message!");
    
    // Verify values
    nameInput.should("have.value", "John Doe");
    emailInput.should("have.value", "john@example.com");
    messageTextarea.should("have.value", "Hello, this is my message!");
  });
});
```

#### Form Interactions

```ts
describe("Complete Form Workflow", () => {
  it("should handle full form interaction", async () => {
    await twd.visit("/registration");
    
    const user = userEvent.setup();
    
    // Fill text inputs
    const usernameInput = await twd.get("input[name='username']");
    const passwordInput = await twd.get("input[name='password']");
    await user.type(usernameInput.el, "johndoe");
    await user.type(passwordInput.el, "securepassword123");
    
    // Handle checkboxes
    const termsCheckbox = await twd.get("input[name='terms']");
    await user.click(termsCheckbox.el);
    termsCheckbox.should("be.checked");
    
    // Handle select dropdowns
    const countrySelect = await twd.get("select[name='country']");
    await user.selectOptions(countrySelect.el, "US");
    countrySelect.should("have.value", "US");
    
    // Submit form
    const submitButton = await twd.get("button[type='submit']");
    await user.click(submitButton.el);
    
    // Verify submission
    const successMessage = await twd.get(".success-message");
    successMessage.should("contain.text", "Registration successful");
  });
});
```

#### Advanced User Interactions

```ts
describe("Advanced Input Interactions", () => {
  it("should handle complex user behaviors", async () => {
    const user = userEvent.setup();
    const searchInput = await twd.get("input[name='search']");
    
    // Type and then clear
    await user.type(searchInput.el, "initial search");
    await user.clear(searchInput.el);
    searchInput.should("have.value", "");
    
    // Type with special keys
    await user.type(searchInput.el, "Hello{backspace}{backspace}lo World");
    searchInput.should("have.value", "Hello World");
    
    // Tab navigation
    await user.tab();
    const nextInput = await twd.get("input[name='email']");
    nextInput.should("be.focused");
  });
});
```

#### Why Use userEvent?

- **Realistic interactions** - Simulates actual user behavior
- **Proper event firing** - Triggers all necessary DOM events
- **Timing simulation** - Includes natural typing delays
- **Focus management** - Handles focus/blur correctly
- **Accessibility testing** - Works with screen readers and keyboard navigation
- **Framework compatibility** - Works with React, Vue, and other frameworks

---

### twd.setInputValue(element, value) - Special Cases Only

⚠️ **Use sparingly** - Only for specific input types where `userEvent` doesn't work well.

Sets the value of an input element directly and dispatches an input event. **Only recommended for range, color, time, and date inputs** where user event simulation is complex or unreliable.

#### Syntax

```ts
twd.setInputValue(element: Element, value: string): void
```

#### When to Use setInputValue

Use `setInputValue` **only** for these specific input types:

```ts
describe("Special Input Types", () => {
  it("should handle inputs that userEvent struggles with", async () => {
    await twd.visit("/settings");
    
    // ✅ Range inputs - dragging simulation is complex
    const volumeSlider = await twd.get("input[type='range']");
    twd.setInputValue(volumeSlider.el, "75");
    volumeSlider.should("have.value", "75");
    
    // ✅ Color inputs - color picker doesn't respond to typing
    const colorPicker = await twd.get("input[type='color']");
    twd.setInputValue(colorPicker.el, "#ff0000");
    colorPicker.should("have.value", "#ff0000");
    
    // ✅ Time inputs - complex time format requirements
    const timeInput = await twd.get("input[type='time']");
    twd.setInputValue(timeInput.el, "13:30");
    timeInput.should("have.value", "13:30");
    
    // ✅ Date inputs - date picker complexity
    const dateInput = await twd.get("input[type='date']");
    twd.setInputValue(dateInput.el, "2024-12-25");
    dateInput.should("have.value", "2024-12-25");
  });
});
```

#### ❌ Don't Use setInputValue For

```ts
// ❌ BAD - Use userEvent instead for text inputs
const nameInput = await twd.get("input[type='text']");
twd.setInputValue(nameInput.el, "John Doe"); // Don't do this

// ✅ GOOD - Use userEvent for realistic interaction
const user = userEvent.setup();
await user.type(nameInput.el, "John Doe"); // Do this instead

// ❌ BAD - Use userEvent for checkboxes
const checkbox = await twd.get("input[type='checkbox']");
twd.setInputValue(checkbox.el, "true"); // Don't do this

// ✅ GOOD - Use userEvent for checkboxes
await user.click(checkbox.el); // Do this instead
```

#### Best Practice Pattern

```ts
describe("Mixed Input Form", () => {
  it("should use appropriate method for each input type", async () => {
    const user = userEvent.setup();
    
    // Use userEvent for standard inputs (RECOMMENDED)
    const nameInput = await twd.get("input[name='name']");
    const emailInput = await twd.get("input[name='email']");
    await user.type(nameInput.el, "John Doe");
    await user.type(emailInput.el, "john@example.com");
    
    // Use setInputValue ONLY for special input types
    const birthDate = await twd.get("input[type='date']");
    const favoriteColor = await twd.get("input[type='color']");
    const volume = await twd.get("input[type='range']");
    
    twd.setInputValue(birthDate.el, "1990-05-15");
    twd.setInputValue(favoriteColor.el, "#3366cc");
    twd.setInputValue(volume.el, "80");
    
    // Back to userEvent for form submission
    const submitButton = await twd.get("button[type='submit']");
    await user.click(submitButton.el);
  });
});
```

---

## Utility Functions

### twd.wait(ms)

Waits for a specified amount of time.

#### Syntax

```ts
twd.wait(time: number): Promise<void>
```

#### Parameters

- **time** (`number`) - Time in milliseconds to wait

#### Returns

`Promise<void>` - Resolves after the specified time

#### Examples

```ts
// Wait for animations
await twd.wait(500);

// Wait for API calls
const loadButton = await twd.get("button[data-action='load']");
await userEvent.click(loadButton.el);
await twd.wait(2000); // Wait for loading

// Wait for state changes
const modal = await twd.get(".modal");
modal.should("not.be.visible");

const showModalButton = await twd.get("button[data-action='show-modal']");
await userEvent.click(showModalButton.el);
await twd.wait(300); // Wait for modal animation

modal.should("be.visible");
```

#### Best Practices

```ts
// ✅ Good - Wait for specific conditions
const spinner = await twd.get(".loading-spinner");
spinner.should("be.visible");
await twd.wait(1000);
spinner.should("not.be.visible");

// ❌ Avoid - Arbitrary waits without context
await twd.wait(5000); // Why 5 seconds?
```

---

### twd.notExists(selector)

Asserts that an element matching the provided selector does not exist in the DOM. Resolves when no matching element is found and rejects if the element exists.

#### Syntax

```ts
twd.notExists(selector: string): Promise<void>
```

#### Parameters

- **selector** (`string`) - CSS selector of the element to check

#### Returns

`Promise<void>` - Resolves if the element is not present, rejects with an Error if it is found

#### Examples

```ts
// Assert that a specific element is not present
await twd.notExists('.non-existent');

// Will reject when an element exists
const el = document.createElement('div');
el.className = 'maybe';
document.body.appendChild(el);
await expect(twd.notExists('.maybe')).rejects.toThrow();
```

### twd.should(element, assertion, ...args)

Makes assertions on any DOM element. This is the standalone function version of assertions, useful for elements from Testing Library queries (`screenDom`) or any raw DOM element.

#### Syntax

```ts
twd.should(element: Element, assertion: string, ...args: any[]): void
```

#### Parameters

- **element** (`Element`) - The DOM element to assert on
- **assertion** (`string`) - The assertion name (e.g., `"be.visible"`, `"have.text"`)
- **args** (`any[]`) - Additional arguments for the assertion (e.g., expected text value)

#### Returns

`void` - This function doesn't return a value (unlike the `.should()` method on TWD elements)

#### When to Use

- **Use `twd.should()`** for elements from Testing Library queries (`screenDom`)
- **Use `element.should()`** for elements returned from `twd.get()` or `twd.getAll()`

#### Examples

```ts
import { twd, screenDom } from "twd-js";

// With Testing Library queries
const button = screenDom.getByRole("button", { name: /submit/i });
twd.should(button, "be.visible");
twd.should(button, "have.text", "Submit");

// With raw DOM elements
const element = document.querySelector(".my-element");
twd.should(element, "be.visible");
twd.should(element, "contain.text", "Hello");

// With TWD elements (alternative to .should() method)
const input = await twd.get("input#email");
twd.should(input.el, "have.value", "user@example.com");
// Or use the method: input.should("have.value", "user@example.com");

// All assertion types are supported
const heading = screenDom.getByRole("heading");
twd.should(heading, "have.text", "Welcome");
twd.should(heading, "be.visible");
twd.should(heading, "have.class", "main-title");

const checkbox = screenDom.getByRole("checkbox");
twd.should(checkbox, "be.checked");

const select = screenDom.getByRole("combobox");
const option = screenDom.getByRole("option", { selected: true });
twd.should(option, "be.selected");
```

#### Comparison: Method vs Function

```ts
// Method style (for twd.get() elements)
const button = await twd.get("button");
button.should("be.visible").should("have.text", "Click me");

// Function style (for any element, especially screenDom)
const button = screenDom.getByRole("button");
twd.should(button, "be.visible");
twd.should(button, "have.text", "Click me");
```

#### Available Assertions

All assertions available on `.should()` method are also available with `twd.should()`:

- `"have.text"` - Exact text match
- `"contain.text"` - Partial text match
- `"be.empty"` - Element has no text
- `"have.attr"` - Has attribute with value
- `"have.value"` - Input/textarea value
- `"have.class"` - Has CSS class
- `"be.disabled"` / `"be.enabled"` - Form element state
- `"be.checked"` - Checkbox/radio state
- `"be.selected"` - Option element state
- `"be.focused"` - Element has focus
- `"be.visible"` - Element is visible

All assertions can be negated with `"not."` prefix (e.g., `"not.be.visible"`).

---

## API Mocking

### twd.mockRequest(alias, options)

Mocks an HTTP request with specified response.

#### Syntax

```ts
await twd.mockRequest(alias: string, options: Options): void
```

#### Parameters

- **alias** (`string`) - Unique identifier for the mock
- **options** (`Options`) - Mock configuration

#### Options Interface

```ts
interface Options {
  method: string;           // HTTP method (GET, POST, etc.)
  url: string | RegExp;     // URL to match
  response: unknown;        // Response body
  status?: number;          // HTTP status code (default: 200)
  headers?: Record<string, string>; // Response headers
}
```

#### URL Matching Behavior

When `url` is a **string**, TWD uses boundary-aware matching: the mock triggers when the request URL contains the mock URL followed by `?`, `#`, `&`, or end of string. This prevents `/api/orders` from accidentally matching `/api/orders-summary` and `/api/travelers/123` from matching `/api/travelers/123/billing-details`. Boundary checking only applies to the path portion — query string matching uses substring, so a rule like `/search?q=` will match `/search?q=anything`.

When `url` is a **RegExp**, standard regex matching applies.

#### Examples

```ts
// Basic GET request
await twd.mockRequest("getUser", {
  method: "GET",
  url: "/api/user/123",
  response: {
    id: 123,
    name: "John Doe",
    email: "john@example.com"
  }
});

// POST request with custom status
await twd.mockRequest("createUser", {
  method: "POST",
  url: "/api/users",
  response: { id: 456, created: true },
  status: 201,
  headers: {
    "Content-Type": "application/json",
    "Location": "/api/users/456"
  }
});

// Using RegExp for dynamic URLs
await twd.mockRequest("getUserById", {
  method: "GET",
  url: /\/api\/users\/\d+/,
  response: { id: 123, name: "Dynamic User" }
});

// Error response
await twd.mockRequest("serverError", {
  method: "GET",
  url: "/api/data",
  response: { error: "Internal server error" },
  status: 500
});
```

---

### twd.waitForRequest(alias)

Waits for a mocked request to be made.

#### Syntax

```ts
twd.waitForRequest(alias: string, retries?: number, retryDelay?: number): Promise<Rule>
```

#### Parameters

- **alias** (`string`) - The alias of the mock to wait for
- **retries** (`number`, optional) - Maximum number of retry attempts (default: `10`)
- **retryDelay** (`number`, optional) - Delay between retries in milliseconds (default: `100`)

#### Returns

`Promise<Rule>` - The matched rule with request data

#### Examples

```ts
// Wait for single request
await twd.mockRequest("getProfile", {
  method: "GET",
  url: "/api/profile",
  response: { name: "John Doe" }
});

const loadButton = await twd.get("button[data-action='load-profile']");
await userEvent.click(loadButton.el);

const rule = await twd.waitForRequest("getProfile");
console.log("Request completed:", rule);

// Verify request body for POST requests
await twd.mockRequest("submitForm", {
  method: "POST",
  url: "/api/contact",
  response: { success: true }
});

const submitButton = await twd.get("button[type='submit']");
await userEvent.click(submitButton.el);

const submitRule = await twd.waitForRequest("submitForm");
const requestBody = JSON.parse(submitRule.request as string);
expect(requestBody).to.deep.equal({
  name: "John Doe",
  email: "john@example.com"
});
```

---

### twd.waitForRequests(aliases)

Waits for multiple mocked requests to be made.

#### Syntax

```ts
twd.waitForRequests(aliases: string[]): Promise<Rule[]>
```

#### Parameters

- **aliases** (`string[]`) - Array of mock aliases to wait for

#### Returns

`Promise<Rule[]>` - Array of matched rules

#### Examples

```ts
// Wait for multiple requests
await twd.mockRequest("getUser", {
  method: "GET",
  url: "/api/user",
  response: { id: 1, name: "John" }
});

await twd.mockRequest("getUserPosts", {
  method: "GET",
  url: "/api/user/posts",
  response: [{ id: 1, title: "First Post" }]
});

const loadButton = await twd.get("button[data-action='load-all']");
await userEvent.click(loadButton.el);

const rules = await twd.waitForRequests(["getUser", "getUserPosts"]);
expect(rules).to.have.length(2);

// Process each rule
rules.forEach((rule, index) => {
  console.log(`Request ${index + 1}:`, rule.alias);
});
```

---

### twd.initRequestMocking()

Initializes the mock service worker for request interception.

#### Syntax

```ts
twd.initRequestMocking(path?: string): Promise<void>
```

#### Parameters

- **path** (`string`, optional) - Service worker absolute path

#### Returns

`Promise<void>` - Resolves when mocking is initialized

#### Examples

```ts
// In test loader (src/loadTests.ts)
import { twd } from "twd-js";

twd.initRequestMocking()
  .then(() => {
    console.log("Request mocking initialized");
  })
  .catch((err) => {
    console.error("Error initializing request mocking:", err);
  });

// init with custom service worker path
twd.initRequestMocking('/test-path/mock-sw.js')
  .then(() => {
    console.log("Request mocking initialized with custom path");
  })
  .catch((err) => {
    console.error("Error initializing request mocking with custom path:", err);
  });
```

---

### twd.clearRequestMockRules()

Clears all active mock rules.

::: tip
This can also be triggered from the sidebar via the **Clear mocks** button, which clears both request mock rules and component mocks.
:::

#### Syntax

```ts
twd.clearRequestMockRules(): void
```

#### Examples

```ts
describe("API Integration", () => {
  beforeEach(() => {
    // Clear mocks before each test
    twd.clearRequestMockRules();
  });

  it("should handle user creation", async () => {
    await twd.mockRequest("createUser", {
      method: "POST",
      url: "/api/users",
      response: { id: 1, created: true }
    });
    
    // Test implementation...
  });

  // Mocks are automatically cleared before next test
});

// Or clear manually when needed
describe("Complex API Test", () => {
  it("should handle multiple scenarios", async () => {
    // First scenario
    await twd.mockRequest("scenario1", { /* ... */ });
    // Test scenario 1...
    
    // Clear and set up second scenario
    twd.clearRequestMockRules();
    await twd.mockRequest("scenario2", { /* ... */ });
    // Test scenario 2...
  });
});
```

---

### twd.getRequestMockRules()

Gets all currently active mock rules.

#### Syntax

```ts
twd.getRequestMockRules(): Rule[]
```

#### Returns

`Rule[]` - Array of active mock rules

#### Examples

```ts
// Debug active mocks
await twd.mockRequest("getUser", {
  method: "GET",
  url: "/api/user",
  response: { id: 1 }
});

await twd.mockRequest("getPosts", {
  method: "GET", 
  url: "/api/posts",
  response: []
});

const activeMocks = twd.getRequestMockRules();
console.log(`Active mocks: ${activeMocks.length}`);

activeMocks.forEach(mock => {
  console.log(`Mock: ${mock.alias} - ${mock.method} ${mock.url}`);
});

// Verify specific mock exists
const userMock = activeMocks.find(mock => mock.alias === "getUser");
expect(userMock).to.exist;
expect(userMock?.method).to.equal("GET");
```

---

## Component Mocking

### twd.mockComponent(name, component)

Mocks a React component with a custom implementation.

#### Syntax

```ts
twd.mockComponent(name: string, component: React.ComponentType<any>): void
```

#### Parameters

- **name** (`string`) - Unique identifier matching the `name` prop in `MockedComponent`
- **component** (`React.ComponentType<any>`) - The mock component implementation

#### Examples

```ts
interface ButtonProps {
  onClick: (count: number) => void;
  count: number;
}

const Button = ({ onClick, count }: ButtonProps) => {
  return <button onClick={() => onClick(count + 1)}>Click me {count}</button>;
};

// Mock the component to change its behavior
twd.mockComponent("Button", ({ onClick, count }: ButtonProps) => (
  <Button onClick={() => onClick(count + 2)} count={count} />
));

await twd.visit("/counter");

let button = await twd.get("button");
button.should("have.text", "Click me 0");

await userEvent.click(button.el);
button = await twd.get("button");
button.should("have.text", "Click me 2");
```

```ts
// Mock with completely different rendering
twd.mockComponent("ComplexChart", () => (
  <div data-testid="mock-chart">
    <p>Chart data would be displayed here</p>
  </div>
));

await twd.visit("/dashboard");
const mockChart = await twd.get("[data-testid='mock-chart']");
mockChart.should("be.visible");
```

```ts
// Conditional mocking based on props
twd.mockComponent("UserCard", ({ user }: UserCardProps) => {
  if (user.role === "admin") {
    return <div data-testid="admin-card">{user.name} (Admin)</div>;
  }
  return <div data-testid="user-card">{user.name}</div>;
});
```

---

### twd.clearComponentMocks()

Clears all active component mocks.

::: tip
This can also be triggered from the sidebar via the **Clear mocks** button, which clears both component mocks and request mock rules.
:::

#### Syntax

```ts
twd.clearComponentMocks(): void
```

#### Examples

```ts
describe("Component Tests", () => {
  beforeEach(() => {
    // Clear component mocks before each test
    twd.clearComponentMocks();
  });

  it("should test with mock", async () => {
    twd.mockComponent("Button", () => <button>Mocked</button>);
    // Test implementation...
  });

  it("should test without mock", async () => {
    // This test runs with clean state - no mocks active
    // Test implementation...
  });
});
```

```ts
// Clear mocks manually when needed
describe("Component Behavior", () => {
  it("should handle changing mock behavior", async () => {
    // First mock
    twd.mockComponent("StatusIndicator", () => (
      <div data-status="loading">Loading...</div>
    ));
    // Test with first mock...
    
    // Clear and set up second mock
    twd.clearComponentMocks();
    twd.mockComponent("StatusIndicator", () => (
      <div data-status="success">Success!</div>
    ));
    // Test with second mock...
  });
});
```

---

## Best Practices

### 1. Use Descriptive Selectors

```ts
// ✅ Good - Semantic and stable
const submitButton = await twd.get("button[type='submit']");
const userCard = await twd.get("[data-testid='user-card']");

// ❌ Avoid - Fragile and non-semantic
const button = await twd.get("div > div:nth-child(3) button");
```

### 2. Clean Up Mocks

```ts
// Clean up API mocks
describe("API Tests", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
  });

  it("should handle requests", async () => {
    // Clean state guaranteed
  });
});

// Clean up component mocks
describe("Component Tests", () => {
  beforeEach(() => {
    twd.clearComponentMocks();
  });

  it("should test components", async () => {
    // Clean state guaranteed
  });
});
```

### 3. Wait Appropriately

```ts
// ✅ Good - Wait for specific conditions
const spinner = await twd.get(".loading");
spinner.should("be.visible");
await twd.waitForRequest("getData");
spinner.should("not.be.visible");

// ❌ Avoid - Arbitrary waits
await twd.wait(3000); // Why 3 seconds?
```

### 4. Use Realistic Mock Data

```ts
// ✅ Good - Realistic data structure
await twd.mockRequest("getUser", {
  method: "GET",
  url: "/api/user/123",
  response: {
    id: 123,
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://example.com/avatar.jpg",
    createdAt: "2024-01-15T10:30:00Z",
    preferences: {
      theme: "dark",
      notifications: true
    }
  }
});

// ❌ Too minimal
await twd.mockRequest("getUser", {
  method: "GET",
  url: "/api/user/123", 
  response: { name: "test" }
});
```

## Next Steps

- Learn about [Assertions](/api/assertions) for testing element states
- Check [Test Functions](/api/test-functions) for organizing tests
