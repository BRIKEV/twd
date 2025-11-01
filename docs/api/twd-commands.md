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

### twd.visit(url)

Navigates to a specific URL in your single-page application.

#### Syntax

```ts
twd.visit(url: string): void
```

#### Parameters

- **url** (`string`) - The URL path to navigate to

#### Examples

```ts
// Basic navigation
twd.visit("/");
twd.visit("/products");
twd.visit("/user/profile");

// With query parameters
twd.visit("/search?q=laptop&category=electronics");

// With hash fragments
twd.visit("/docs#getting-started");

// Absolute URLs (if needed)
twd.visit("https://example.com/page");
```

#### Use Cases

```ts
describe("Navigation Tests", () => {
  it("should navigate between pages", async () => {
    twd.visit("/");
    
    const homeHeading = await twd.get("h1");
    homeHeading.should("contain.text", "Home");
    
    twd.visit("/about");
    
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

- `should(assertion, value)` - Make URL assertions

#### Examples

```ts
// Exact URL matching
twd.url().should("eq", "http://localhost:3000/products");

// URL contains substring
twd.url().should("contain.url", "/products");
twd.url().should("contain.url", "localhost");

// Negated assertions
twd.url().should("not.contain.url", "/admin");

// After navigation
twd.visit("/login");
twd.url().should("contain.url", "/login");

const loginButton = await twd.get("button[type='submit']");
await userEvent.click(loginButton.el);
twd.url().should("contain.url", "/dashboard");
```

---

## Input Handling

### twd.setInputValue(element, value)

Sets the value of an input element and dispatches an input event. Recommended for range, color, time, and other special input types where user events might not work as expected.

#### Syntax

```ts
twd.setInputValue(element: Element, value: string): void
```

#### Parameters

- **element** (`Element`) - The input element to set the value on
- **value** (`string`) - The value to set

#### Examples

```ts
// Range input
const rangeInput = await twd.get("input[type='range']");
twd.setInputValue(rangeInput.el, "75");
rangeInput.should("have.value", "75");

// Color input
const colorInput = await twd.get("input[type='color']");
twd.setInputValue(colorInput.el, "#ff0000");
colorInput.should("have.value", "#ff0000");

// Time input
const timeInput = await twd.get("input[type='time']");
twd.setInputValue(timeInput.el, "13:30");
timeInput.should("have.value", "13:30");

// Date input
const dateInput = await twd.get("input[type='date']");
twd.setInputValue(dateInput.el, "2024-12-25");
dateInput.should("have.value", "2024-12-25");
```

#### Use Cases

```ts
describe("Form Input Tests", () => {
  it("should handle range slider", async () => {
    twd.visit("/settings");
    
    const volumeSlider = await twd.get("input[name='volume']");
    twd.setInputValue(volumeSlider.el, "80");
    
    volumeSlider.should("have.value", "80");
    
    const submitButton = await twd.get("button[type='submit']");
    await userEvent.click(submitButton.el);
    
    // Verify the form submission worked
    const confirmation = await twd.get(".success-message");
    confirmation.should("be.visible");
  });

  it("should handle color picker", async () => {
    const colorPicker = await twd.get("input[type='color']");
    twd.setInputValue(colorPicker.el, "#00ff00");
    
    colorPicker.should("have.value", "#00ff00");
    
    // Verify color change is reflected in UI
    const preview = await twd.get(".color-preview");
    preview.should("have.attr", "style", "background-color: rgb(0, 255, 0);");
  });
});
```

#### Why Use setInputValue?

For most text inputs, use `userEvent.type()` for realistic user interaction. Use `setInputValue` for:

- **Range inputs** - Sliders where dragging simulation is complex
- **Color inputs** - Color pickers that don't respond to typing
- **Time/Date inputs** - Inputs with complex formatting requirements
- **Number inputs** - When you need precise values without typing simulation

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
twd.waitForRequest(alias: string): Promise<Rule>
```

#### Parameters

- **alias** (`string`) - The alias of the mock to wait for

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
twd.initRequestMocking(): Promise<void>
```

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

// In individual test (if needed)
describe("API Tests", () => {
  beforeEach(async () => {
    await twd.initRequestMocking();
  });

  it("should mock API calls", async () => {
    // Mocking is now available
  });
});
```

---

### twd.clearRequestMockRules()

Clears all active mock rules.

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
describe("API Tests", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
  });

  it("should handle requests", async () => {
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

### Service Worker Issues

```ts
try {
  await twd.initRequestMocking();
} catch (error) {
  console.error("Service worker failed:", error.message);
  // Check if mock-sw.js exists in public directory
}
```

## Next Steps

- Learn about [Assertions](/api/assertions) for testing element states
- Check [Test Functions](/api/test-functions) for organizing tests
