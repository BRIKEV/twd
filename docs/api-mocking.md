# API Mocking

TWD provides powerful API mocking capabilities through our own mock service worker integration, allowing you to test your application with realistic network requests and responses.

## Setup

### 1. Install Mock Service Worker

First, set up the mock service worker in your project:

```bash
npx twd-js init public
```

This command copies the required `mock-sw.js` file to your public directory.

### 2. Remove Service Worker from Production Builds

The service worker file (`mock-sw.js`) is only needed during development for API mocking. To automatically remove it from production builds, add the `removeMockServiceWorker` Vite plugin to your configuration:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { removeMockServiceWorker } from 'twd-js';

export default defineConfig({
  plugins: [
    // ... other plugins
    removeMockServiceWorker()
  ]
});
```

This plugin will automatically remove `mock-sw.js` from your `dist` folder during production builds.

::: tip
The plugin only runs during build time (`apply: 'build'`) and will not affect your development workflow.
:::

### 3. Initialize Mocking

Initialize request mocking in your main entry file using the standard TWD setup:

```ts
// src/main.tsx (or your main entry file)
if (import.meta.env.DEV) {
  const testModules = import.meta.glob("./**/*.twd.test.{ts,tsx}");
  const { initTests, twd, TWDSidebar } = await import('twd-js');
  initTests(testModules, <TWDSidebar open={true} position="left" />, createRoot);
  twd.initRequestMocking()
    .then(() => {
      console.log("Request mocking initialized");
    })
    .catch((err) => {
      console.error("Error initializing request mocking:", err);
    });
}
```

::: tip
You only need to call `initRequestMocking()` once in your main entry file, not in individual tests.
:::

## Basic Mocking

### Simple GET Request

```ts
import { twd, userEvent } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("User Profile", () => {
  it("should load user data", async () => {
    // Mock the API request
    await twd.mockRequest("getUser", {
      method: "GET",
      url: "https://api.example.com/user/123",
      response: {
        id: 123,
        name: "John Doe",
        email: "john@example.com"
      }
    });

    await twd.visit("/profile");

    // Trigger the request
    const loadButton = await twd.get("button[data-testid='load-profile']");
    await userEvent.click(loadButton.el);

    // Wait for the mock to be called
    await twd.waitForRequest("getUser");

    // Verify the UI updated
    const userName = await twd.get("[data-testid='user-name']");
    userName.should("have.text", "John Doe");
  });
});
```

### POST Request with Body

```ts
it("should create new user", async () => {
  await twd.mockRequest("createUser", {
    method: "POST",
    url: "https://api.example.com/users",
    response: {
      id: 456,
      name: "Jane Smith",
      email: "jane@example.com",
      created: true
    },
    status: 201
  });

  await twd.visit("/users/new");

  const user = userEvent.setup();
  
  // Fill form
  await user.type(await twd.get("#name"), "Jane Smith");
  await user.type(await twd.get("#email"), "jane@example.com");
  
  // Submit form
  await user.click(await twd.get("button[type='submit']"));

  // Wait for request and verify
  const rule = await twd.waitForRequest("createUser");
  
  // Check the request body
  expect(rule.request).to.deep.equal({
    name: "Jane Smith",
    email: "jane@example.com"
  });
});
```

## Advanced Mocking

### URL Patterns with RegExp

```ts
it("should handle dynamic user IDs", async () => {
  // Mock any user ID
  await twd.mockRequest("getUserById", {
    method: "GET",
    url: /\/api\/users\/\d+/, // Matches /api/users/123, /api/users/456, etc.
    response: {
      id: 123,
      name: "Dynamic User"
    }
  });

  // This will match the pattern
  await twd.visit("/users/123");
  
  // Trigger request and verify
  const loadButton = await twd.get("button[data-testid='load-user']");
  await userEvent.click(loadButton.el);
  
  await twd.waitForRequest("getUserById");
});
```

### URL Matching with Strings

When you provide a string URL (not a RegExp), TWD uses **boundary-aware matching**. The mock triggers when the request URL contains the mock URL followed by a valid boundary character: `?`, `#`, `&`, or end of string.

This prevents similar URLs from accidentally matching each other:

```ts
await twd.mockRequest("getUsers", {
  method: "GET",
  url: "/api/users",
  response: [{ id: 1, name: "John" }],
});

// ✅ Matches: /api/users
// ✅ Matches: /api/users?page=1&limit=10
// ❌ Does NOT match: /api/users/123 (different resource)
// ❌ Does NOT match: /api/users-settings
// ❌ Does NOT match: /api/username
```

This means you can safely mock similar endpoints and nested resources without conflicts:

```ts
// Similar endpoint names
await twd.mockRequest("getOrders", {
  method: "GET",
  url: "/api/orders",
  response: [{ id: 1 }],
});

await twd.mockRequest("getOrdersSummary", {
  method: "GET",
  url: "/api/orders-summary",
  response: { total: 100 },
});

// Nested resources
await twd.mockRequest("travelerDetail", {
  method: "GET",
  url: `v1/travelers/${travelerId}`,
  response: mockTravelerDetail,
});

await twd.mockRequest("billingDetails", {
  method: "GET",
  url: `v1/travelers/${travelerId}/billing-details`,
  response: mockBillingDetails,
});

// Each request matches only its intended mock
```

::: tip Query String Matching
Boundary checking only applies to the **path** portion of the URL. Once the match extends into the query string, substring matching is used. This lets you provide partial query strings to match any value:

```ts
// Matches any search query
await twd.mockRequest("search", {
  method: "GET",
  url: "https://api.example.com/search?q=",
  response: [{ id: 1, title: "Result" }],
});

// ✅ Matches: /search?q=laptops
// ✅ Matches: /search?q=phones&category=electronics
```
:::

If you need more flexible matching, use RegExp patterns instead.

### Custom Status Codes and Headers

```ts
it("should handle API errors", async () => {
  await twd.mockRequest("getUserError", {
    method: "GET",
    url: "https://api.example.com/user/999",
    response: {
      error: "User not found",
      code: "USER_NOT_FOUND"
    },
    status: 404,
    responseHeaders: {
      "Content-Type": "application/json",
      "X-Error-Code": "USER_NOT_FOUND"
    }
  });

  await twd.visit("/user/999");

  const loadButton = await twd.get("button[data-testid='load-user']");
  await userEvent.click(loadButton.el);

  await twd.waitForRequest("getUserError");

  // Verify error handling
  const errorMessage = await twd.get(".error-message");
  errorMessage.should("contain.text", "User not found");
});
```

### Multiple Requests

```ts
it("should handle multiple API calls", async () => {
  // Mock multiple endpoints
  await twd.mockRequest("getUser", {
    method: "GET",
    url: "/api/user/123",
    response: { id: 123, name: "John Doe" }
  });

  await twd.mockRequest("getUserPosts", {
    method: "GET", 
    url: "/api/user/123/posts",
    response: [
      { id: 1, title: "First Post" },
      { id: 2, title: "Second Post" }
    ]
  });

  await twd.visit("/user/123");

  const loadButton = await twd.get("button[data-testid='load-all']");
  await userEvent.click(loadButton.el);

  // Wait for both requests
  const rules = await twd.waitForRequests(["getUser", "getUserPosts"]);
  
  expect(rules).to.have.length(2);

  // Verify UI shows both user and posts
  const userName = await twd.get("[data-testid='user-name']");
  userName.should("have.text", "John Doe");

  const posts = await twd.getAll(".post-item");
  expect(posts).to.have.length(2);
});
```

## Simulating Network Delay

You can simulate network latency by adding a `delay` option (in milliseconds) to any mock rule. This is useful for testing loading states, spinners, timeouts, and other UX that depends on slow responses.

### Basic Delay

```ts
it("should show loading state while waiting for API", async () => {
  // Mock a slow API response (1 second delay)
  await twd.mockRequest("getUser", {
    method: "GET",
    url: "/api/user/123",
    response: { id: 123, name: "John Doe" },
    delay: 1000, // 1 second delay
  });

  await twd.visit("/profile");

  // Loading indicator should be visible while waiting
  const spinner = await twd.get("[data-testid='loading-spinner']");
  spinner.should("be.visible");

  // Wait for the request to complete
  await twd.waitForRequest("getUser");

  // After the response arrives, loading should be gone
  await twd.notExists("[data-testid='loading-spinner']");
  const userName = await twd.get("[data-testid='user-name']");
  userName.should("have.text", "John Doe");
});
```

::: tip
The `delay` only affects how long the browser waits for the HTTP response. The `EXECUTED` notification still fires immediately, so `twd.waitForRequest()` resolves right away -- it does not wait for the delay. This mirrors real network behavior: the server receives the request instantly, but the response takes time to arrive.
:::

### Delay with Error Responses

```ts
it("should handle timeout-like errors", async () => {
  await twd.mockRequest("slowError", {
    method: "GET",
    url: "/api/data",
    response: { error: "Gateway Timeout" },
    status: 504,
    delay: 3000, // Simulate a 3-second timeout
  });

  await twd.visit("/data-page");

  // Verify the app shows appropriate timeout messaging
  await twd.waitForRequest("slowError");
  await twd.wait(3100); // Wait for the delayed response to arrive

  const errorMessage = await twd.get(".error-message");
  errorMessage.should("contain.text", "Gateway Timeout");
});
```

## Asserting Request Count

TWD tracks how many times each mock rule has been matched. This lets you assert that an API was called the expected number of times.

### `getRequestCount(alias)`

Returns the number of times a specific mock rule was hit.

```ts
it("should call the API exactly twice", async () => {
  await twd.mockRequest("getUser", {
    method: "GET",
    url: "/api/user",
    response: { id: 1, name: "John" },
  });

  await twd.visit("/profile");

  // Trigger two requests
  const refreshButton = await twd.get("button[data-testid='refresh']");
  await userEvent.click(refreshButton.el);
  await twd.waitForRequest("getUser");

  // Re-register to reset executed flag for second wait
  await twd.mockRequest("getUser", {
    method: "GET",
    url: "/api/user",
    response: { id: 1, name: "John" },
  });

  await userEvent.click(refreshButton.el);
  await twd.waitForRequest("getUser");

  // Assert the count
  expect(twd.getRequestCount("getUser")).to.equal(2);
});
```

### `getRequestCounts()`

Returns a snapshot of all mock rule hit counts as an object.

```ts
it("should track counts for multiple endpoints", async () => {
  await twd.mockRequest("getUsers", {
    method: "GET",
    url: "/api/users",
    response: [],
  });

  await twd.mockRequest("getSettings", {
    method: "GET",
    url: "/api/settings",
    response: { theme: "dark" },
  });

  await twd.visit("/dashboard");
  await twd.waitForRequests(["getUsers", "getSettings"]);

  const counts = twd.getRequestCounts();
  expect(counts).to.deep.equal({
    getUsers: 1,
    getSettings: 1,
  });
});
```

### Counter Reset

Counters are automatically reset when you call `twd.clearRequestMockRules()`. This happens naturally in `beforeEach` cleanup:

```ts
describe("API Tests", () => {
  beforeEach(() => {
    twd.clearRequestMockRules(); // Also resets all counters
  });

  it("starts with zero counts", () => {
    expect(twd.getRequestCount("anyAlias")).to.equal(0);
    expect(twd.getRequestCounts()).to.deep.equal({});
  });
});
```

## Dynamic Mocking

### Updating Mocks Mid-Test

```ts
it("should handle changing API responses", async () => {
  // Initial mock
  await twd.mockRequest("getStatus", {
    method: "GET",
    url: "/api/status",
    response: { status: "loading" }
  });

  await twd.visit("/dashboard");

  const refreshButton = await twd.get("button[data-testid='refresh']");
  await userEvent.click(refreshButton.el);

  await twd.waitForRequest("getStatus");

  let statusText = await twd.get("[data-testid='status']");
  statusText.should("have.text", "loading");

  // Update the mock
  await twd.mockRequest("getStatus", {
    method: "GET",
    url: "/api/status",
    response: { status: "completed" }
  });

  // Trigger another request
  await userEvent.click(refreshButton.el);
  await twd.waitForRequest("getStatus");

  statusText = await twd.get("[data-testid='status']");
  statusText.should("have.text", "completed");
});
```

### Conditional Responses

```ts
it("should handle authentication states", async () => {
  // Mock unauthorized response first
  await twd.mockRequest("getProfile", {
    method: "GET",
    url: "/api/profile",
    response: { error: "Unauthorized" },
    status: 401
  });

  await twd.visit("/profile");

  // Should redirect to login
  await twd.wait(100);
  await twd.url().should("contain.url", "/login");

  // Now mock successful login
  await twd.mockRequest("login", {
    method: "POST",
    url: "/api/login",
    response: { 
      token: "abc123",
      user: { id: 1, name: "John Doe" }
    }
  });

  // Mock authorized profile request
  await twd.mockRequest("getProfile", {
    method: "GET",
    url: "/api/profile", 
    response: {
      id: 1,
      name: "John Doe",
      email: "john@example.com"
    }
  });

  // Login and verify
  const user = userEvent.setup();
  await user.type(await twd.get("#username"), "john");
  await user.type(await twd.get("#password"), "password");
  await user.click(await twd.get("button[type='submit']"));

  await twd.waitForRequest("login");
  
  // Should now access profile
  await twd.visit("/profile");
  await twd.waitForRequest("getProfile");
  
  const profileName = await twd.get("[data-testid='profile-name']");
  profileName.should("have.text", "John Doe");
});
```

## Request Inspection

### Verifying Request Data

```ts
it("should send correct form data", async () => {
  await twd.mockRequest("submitForm", {
    method: "POST",
    url: "/api/contact",
    response: { success: true }
  });

  await twd.visit("/contact");

  const user = userEvent.setup();
  
  // Fill form
  await user.type(await twd.get("#email"), "test@example.com");
  await user.type(await twd.get("#message"), "Hello world");
  await user.click(await twd.get("#newsletter"));

  // Submit
  await user.click(await twd.get("button[type='submit']"));

  // Verify request data
  const rule = await twd.waitForRequest("submitForm");
  
  expect(rule.request).to.deep.equal({
    email: "test@example.com",
    message: "Hello world", 
    newsletter: true
  });
});
```

### Headers and Metadata

```ts
it("should include authentication headers", async () => {
  // Set up authentication token
  localStorage.setItem("authToken", "bearer-token-123");

  await twd.mockRequest("authenticatedRequest", {
    method: "GET",
    url: "/api/protected",
    response: { data: "secret data" }
  });

  await twd.visit("/protected");

  const loadButton = await twd.get("button[data-testid='load-protected']");
  await userEvent.click(loadButton.el);

  const rule = await twd.waitForRequest("authenticatedRequest");
  
  // Check that the request included auth headers
  // (This depends on your app's implementation)
  console.log("Request headers:", rule.headers);
});
```

## Mock Management

### Clearing Mocks

::: tip
You can also clear all mocks (both API request mocks and component mocks) at any time by clicking the **Clear mocks** button in the TWD sidebar header, next to the "Run All" button. This is useful for quick manual resets during development without modifying test code.
:::

```ts
describe("User Management", () => {
  // Clear mocks before each test
  beforeEach(() => {
    twd.clearRequestMockRules();
  });

  it("should handle user creation", async () => {
    // This test starts with clean mocks
    await twd.mockRequest("createUser", {
      method: "POST",
      url: "/api/users",
      response: { id: 1, created: true }
    });

    // Test implementation...
  });

  // Mocks are automatically cleared before the next test
});
```

### Inspecting Active Mocks

```ts
it("should have correct mocks configured", async () => {
  await twd.mockRequest("getUsers", {
    method: "GET",
    url: "/api/users",
    response: []
  });

  await twd.mockRequest("createUser", {
    method: "POST", 
    url: "/api/users",
    response: { id: 1 }
  });

  // Check active mocks
  const activeMocks = twd.getRequestMockRules();
  expect(activeMocks).to.have.length(2);
  
  const getUsersMock = activeMocks.find(mock => mock.alias === "getUsers");
  expect(getUsersMock?.method).to.equal("GET");
});
```

## Common Patterns

### Error Handling

```ts
it("should display error message on API failure", async () => {
  await twd.mockRequest("failedRequest", {
    method: "GET",
    url: "/api/data",
    response: { 
      error: "Server error",
      message: "Something went wrong"
    },
    status: 500
  });

  await twd.visit("/data-page");

  const loadButton = await twd.get("button[data-testid='load-data']");
  await userEvent.click(loadButton.el);

  await twd.waitForRequest("failedRequest");

  // Verify error display
  const errorMessage = await twd.get(".error-message");
  errorMessage.should("be.visible");
  errorMessage.should("contain.text", "Something went wrong");

  // Verify retry button appears
  const retryButton = await twd.get("button[data-testid='retry']");
  retryButton.should("be.visible");
});
```

### Pagination

```ts
it("should handle paginated results", async () => {
  // Mock first page
  await twd.mockRequest("getPage1", {
    method: "GET",
    url: "/api/users?page=1",
    response: {
      users: [
        { id: 1, name: "User 1" },
        { id: 2, name: "User 2" }
      ],
      pagination: {
        page: 1,
        hasNext: true,
        total: 3
      }
    }
  });

  // Mock second page
  await twd.mockRequest("getPage2", {
    method: "GET", 
    url: "/api/users?page=2",
    response: {
      users: [
        { id: 3, name: "User 3" },
      ],
      pagination: {
        page: 2,
        hasNext: false,
        total: 3
      }
    }
  });

  await twd.visit("/users");

  // Load first page
  await twd.waitForRequest("getPage1");
  
  let users = await twd.getAll(".user-item");
  expect(users).to.have.length(2);

  // Load next page
  const nextButton = await twd.get("button[data-testid='next-page']");
  await userEvent.click(nextButton.el);

  await twd.waitForRequest("getPage2");

  // Should now have 4 users total
  users = await twd.getAll(".user-item");
  expect(users).to.have.length(1);
});
```

## Best Practices

### 1. Use Descriptive Aliases

```ts
// Good ✅
await twd.mockRequest("getUserProfile", { /* ... */ });
await twd.mockRequest("updateUserSettings", { /* ... */ });

// Bad ❌
twd.mockRequest("req1", { /* ... */ });
twd.mockRequest("api2", { /* ... */ });
```

### 2. Mock Realistic Data

```ts
// Good ✅ - Realistic user data
await twd.mockRequest("getUser", {
  method: "GET",
  url: "/api/user/123",
  response: {
    id: 123,
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://example.com/avatar.jpg",
    createdAt: "2024-01-15T10:30:00Z",
    role: "user"
  }
});

// Bad ❌ - Minimal/unrealistic data
twd.mockRequest("getUser", {
  method: "GET", 
  url: "/api/user/123",
  response: { name: "test" }
});
```

### 3. Mock before request event is fired

```ts
// Good ✅ - mock before request event is fired
await twd.mockRequest("saveUser", {
  method: "POST",
  url: "/api/users",
  response: { id: 1, created: true }
});

await twd.visit("/users/new");

const user = userEvent.setup();
await user.type(await twd.get("#name"), "John Doe");
await user.type(await twd.get("#email"), "john.doe@example.com");
await user.click(await twd.get("button[type='submit']"));

await twd.waitForRequest("saveUser");

const userName = await twd.get("[data-testid='user-name']");
userName.should("have.text", "John Doe");
```

```ts
// Bad ❌ - mock after request event is fired
await twd.visit("/users/new");

const user = userEvent.setup();
await user.type(await twd.get("#name"), "John Doe");
await user.type(await twd.get("#email"), "john.doe@example.com");
await user.click(await twd.get("button[type='submit']"));
// Bad ❌ - mock after request event is fired
twd.mockRequest("saveUser", {
  method: "POST",
  url: "/api/users",
  response: { id: 1 }
});
await twd.waitForRequest("saveUser");
```

### 3. Clean Up Mocks

```ts
describe("API Tests", () => {
  // Always clean up after each test
  afterEach(() => {
    twd.clearRequestMockRules();
  });

  // Or clean up before each test
  beforeEach(() => {
    twd.clearRequestMockRules();
  });
});
```

### 4. Test Error Scenarios

```ts
describe("Error Handling", () => {
  it("should handle network errors", async () => {
    twd.mockRequest("networkError", {
      method: "GET",
      url: "/api/data",
      response: { error: "Network error" },
      status: 0 // Simulate network failure
    });

    // Test your error handling...
  });

  it("should handle server errors", async () => {
    twd.mockRequest("serverError", {
      method: "GET",
      url: "/api/data", 
      response: { error: "Internal server error" },
      status: 500
    });

    // Test your error handling...
  });
});
```

## Troubleshooting

### Mock Not Triggering

1. **Check in console mock-sw.js version** - Should log `[TWD] Mock Service Worker loaded - version x.x.x` the same version as your `twd-js` package
2. **Ensure mocking is initialized** - Call `twd.initRequestMocking()`
3. **Check the URL pattern** - Make sure it matches exactly
4. **Verify the HTTP method** - GET, POST, PUT, DELETE must match
5. **Check browser console** - Look for service worker errors

### Request Not Matching

```ts
// Use RegExp for flexible matching
await twd.mockRequest("flexibleMatch", {
  method: "GET",
  url: /\/api\/users\/\d+/, // Matches any user ID
  response: { /* ... */ }
});
```

### Service Worker Issues

1. **Reinstall service worker**: Run `npx twd-js init public` again
2. **Check public directory**: Ensure `mock-sw.js` exists
3. **Browser cache**: Try hard refresh (Ctrl+Shift+R)

## Next Steps

- Learn about [User Events in the Tutorial](/tutorial/first-test) for form interactions
- Check the [API Reference](/api/twd-commands) for all mocking methods
