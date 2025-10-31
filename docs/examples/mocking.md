# API Mocking Examples

Learn how to effectively mock API requests in your TWD tests for realistic integration testing.

## Setup

Before using API mocking, you need to set up the mock service worker:

1. **Install the mock service worker:**

```bash
npx twd-js init public
```

2. **Remove service worker from production builds:**

Add the `removeMockServiceWorker` Vite plugin to your `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import { removeMockServiceWorker } from 'twd-js';

export default defineConfig({
  plugins: [
    // ... other plugins
    removeMockServiceWorker()
  ]
});
```

3. **Initialize mocking in your app:**

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

*This section will be completed with comprehensive examples of API mocking patterns.*

## Coming Soon

This section will include detailed examples of:

- **GET Requests** - Fetching user data, product lists, search results
- **POST Requests** - Creating users, submitting forms, uploading files  
- **PUT/PATCH Requests** - Updating user profiles, editing content
- **DELETE Requests** - Removing items, deleting accounts
- **Error Handling** - Network errors, 404s, 500s, validation errors
- **Authentication** - Login flows, protected routes, token refresh
- **Real-time Data** - WebSocket mocking, live updates
- **File Uploads** - Image uploads, document processing
- **Pagination** - Loading more data, infinite scroll
- **Search & Filtering** - Dynamic queries, faceted search

## Quick Preview

```ts
// Example of what's coming
describe("User Management", () => {
  it("should create new user", async () => {
    twd.mockRequest("createUser", {
      method: "POST",
      url: "/api/users",
      response: { id: 123, name: "John Doe", created: true },
      status: 201
    });

    // Test implementation...
    const rule = await twd.waitForRequest("createUser");
    expect(JSON.parse(rule.request)).to.deep.equal({
      name: "John Doe",
      email: "john@example.com"
    });
  });
});
```

## Temporary Reference

For now, please refer to the main [API Mocking](/api-mocking) documentation for complete examples and patterns.
