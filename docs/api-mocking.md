# API Mocking

TWD provides powerful API mocking capabilities through Mock Service Worker integration, allowing you to test your application with realistic network requests and responses.

## Setup

**VIDEO HERE** - *Step-by-step guide to setting up Mock Service Worker with TWD*

### 1. Install Mock Service Worker

First, set up the mock service worker in your project:

**IMAGE HERE** - *Terminal screenshot showing the init command and its output*

```bash
npx twd-js init public
```

This command copies the required `mock-sw.js` file to your public directory.

### 2. Initialize Mocking

Initialize request mocking in your main entry file using the standard TWD setup:

```ts
// src/main.tsx (or your main entry file)
if (import.meta.env.DEV) {
  const testModules = import.meta.glob("./**/*.twd.test.ts");
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

**VIDEO HERE** - *Live demonstration of setting up a mock, triggering a request, and seeing the mocked response*

### Simple GET Request

```ts
import { describe, it, twd, userEvent } from "twd-js";

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

    twd.visit("/profile");

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

  twd.visit("/users/new");

  const user = userEvent.setup();
  
  // Fill form
  await user.type(await twd.get("#name"), "Jane Smith");
  await user.type(await twd.get("#email"), "jane@example.com");
  
  // Submit form
  await user.click(await twd.get("button[type='submit']"));

  // Wait for request and verify
  const rule = await twd.waitForRequest("createUser");
  
  // Check the request body
  const requestBody = JSON.parse(rule.request as string);
  expect(requestBody).to.deep.equal({
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
  twd.visit("/users/123");
  
  // Trigger request and verify
  const loadButton = await twd.get("button[data-testid='load-user']");
  await userEvent.click(loadButton.el);
  
  await twd.waitForRequest("getUserById");
});
```

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
    headers: {
      "Content-Type": "application/json",
      "X-Error-Code": "USER_NOT_FOUND"
    }
  });

  twd.visit("/user/999");

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

  twd.visit("/user/123");

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

  twd.visit("/dashboard");

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

  twd.visit("/profile");

  // Should redirect to login
  await twd.wait(100);
  twd.url().should("contain.url", "/login");

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
  twd.visit("/profile");
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

  twd.visit("/contact");

  const user = userEvent.setup();
  
  // Fill form
  await user.type(await twd.get("#email"), "test@example.com");
  await user.type(await twd.get("#message"), "Hello world");
  await user.click(await twd.get("#newsletter"));

  // Submit
  await user.click(await twd.get("button[type='submit']"));

  // Verify request data
  const rule = await twd.waitForRequest("submitForm");
  const requestData = JSON.parse(rule.request as string);
  
  expect(requestData).to.deep.equal({
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

  twd.visit("/protected");

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

### Loading States

```ts
it("should show loading spinner during API call", async () => {
  // Add delay to mock to simulate slow network
  await twd.mockRequest("slowRequest", {
    method: "GET",
    url: "/api/slow",
    response: { data: "loaded" }
  });

  twd.visit("/slow-page");

  const loadButton = await twd.get("button[data-testid='load']");
  await userEvent.click(loadButton.el);

  // Check loading state immediately
  const spinner = await twd.get(".loading-spinner");
  spinner.should("be.visible");

  // Wait for request to complete
  await twd.waitForRequest("slowRequest");

  // Loading should be gone
  spinner.should("not.be.visible");

  // Data should be shown
  const data = await twd.get("[data-testid='data']");
  data.should("contain.text", "loaded");
});
```

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

  twd.visit("/data-page");

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
        total: 10
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
        { id: 4, name: "User 4" }
      ],
      pagination: {
        page: 2,
        hasNext: true,
        total: 10
      }
    }
  });

  twd.visit("/users");

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
  expect(users).to.have.length(4);
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

- Explore [Examples](/examples/mocking) for more mocking patterns
- Learn about [User Events](/examples/user-events) for form interactions
- Check the [API Reference](/api/twd-commands) for all mocking methods
