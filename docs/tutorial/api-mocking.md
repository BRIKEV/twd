# API Mocking

Learn to mock HTTP requests and responses for comprehensive testing without depending on external APIs.

## Why Mock APIs?

API mocking allows you to:

- **Test in isolation** - No dependency on external services
- **Control responses** - Test success, error, and edge cases
- **Faster tests** - No network delays
- **Reliable tests** - Consistent, predictable responses

## Getting Started with Mocking

### 1. Initialize Request Mocking

```ts
import { describe, it, beforeEach, twd } from 'twd-js';

describe('API Testing', () => {
  beforeEach(async () => {
    // Initialize mocking before each test
    await twd.initRequestMocking();
    
    // Clear any previous mocks
    twd.clearRequestMockRules();
  });

  it('should load user data', async () => {
    // Your test here
  });
});
```

### 2. Basic Request Mocking

```ts
describe('User Profile', () => {
  beforeEach(async () => {
    await twd.initRequestMocking();
    twd.clearRequestMockRules();
  });

  it('should display user information', async () => {
    // Mock the API call
    await twd.mockRequest('getUser', {
      method: 'GET',
      url: '/api/user/123',
      response: {
        id: 123,
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://example.com/avatar.jpg'
      }
    });

    // Navigate to profile page
    twd.visit('/profile/123');

    // Wait for the request to be made
    await twd.waitForRequest('getUser');

    // Verify the UI shows the mocked data
    const userName = await twd.get('[data-testid="user-name"]');
    userName.should('contain.text', 'John Doe');

    const userEmail = await twd.get('[data-testid="user-email"]');
    userEmail.should('contain.text', 'john@example.com');
  });
});
```

## Mock Request Options

### Complete Options Interface

```ts
interface MockOptions {
  method: string;           // HTTP method: 'GET', 'POST', 'PUT', 'DELETE', etc.
  url: string | RegExp;     // URL to match (exact string or regex pattern)
  response: unknown;        // Response body (object, array, string, etc.)
  status?: number;          // HTTP status code (default: 200)
  headers?: Record<string, string>; // Response headers
}
```

### HTTP Methods

```ts
// GET request
await twd.mockRequest('getUsers', {
  method: 'GET',
  url: '/api/users',
  response: [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
  ]
});

// POST request
await twd.mockRequest('createUser', {
  method: 'POST',
  url: '/api/users',
  response: { id: 3, name: 'New User', created: true },
  status: 201
});

// PUT request
await twd.mockRequest('updateUser', {
  method: 'PUT',
  url: '/api/users/123',
  response: { id: 123, name: 'Updated Name' }
});

// DELETE request
await twd.mockRequest('deleteUser', {
  method: 'DELETE',
  url: '/api/users/123',
  response: { success: true },
  status: 204
});
```

### URL Patterns

```ts
// Exact URL match
await twd.mockRequest('getUser', {
  method: 'GET',
  url: '/api/user/123',
  response: { id: 123, name: 'John' }
});

// RegExp for dynamic URLs
await twd.mockRequest('getUserById', {
  method: 'GET',
  url: /\/api\/users\/\d+/,  // Matches /api/users/123, /api/users/456, etc.
  response: { id: 123, name: 'Dynamic User' }
});

// Query parameters
await twd.mockRequest('searchUsers', {
  method: 'GET',
  url: /\/api\/users\?search=.*/,
  response: { results: [], total: 0 }
});
```

### Custom Status Codes and Headers

```ts
// Success with custom headers
await twd.mockRequest('createPost', {
  method: 'POST',
  url: '/api/posts',
  response: { id: 456, title: 'New Post' },
  status: 201,
  headers: {
    'Location': '/api/posts/456',
    'Content-Type': 'application/json'
  }
});

// Error responses
await twd.mockRequest('serverError', {
  method: 'GET',
  url: '/api/data',
  response: { error: 'Internal server error' },
  status: 500
});

await twd.mockRequest('notFound', {
  method: 'GET',
  url: '/api/missing',
  response: { error: 'Resource not found' },
  status: 404
});

await twd.mockRequest('unauthorized', {
  method: 'GET',
  url: '/api/protected',
  response: { error: 'Unauthorized' },
  status: 401
});
```

## Waiting for Requests

### Single Request

```ts
it('should handle user creation', async () => {
  await twd.mockRequest('createUser', {
    method: 'POST',
    url: '/api/users',
    response: { id: 123, created: true }
  });

  // Trigger the request (e.g., form submission)
  const submitButton = await twd.get('button[type="submit"]');
  const user = userEvent.setup();
  await user.click(submitButton.el);

  // Wait for the request to complete
  const rule = await twd.waitForRequest('createUser');
  
  // Access request details
  console.log('Request completed:', rule.alias);
  console.log('Request body:', rule.request);
});
```

### Multiple Requests

```ts
it('should load dashboard data', async () => {
  // Mock multiple endpoints
  await twd.mockRequest('getUser', {
    method: 'GET',
    url: '/api/user',
    response: { id: 1, name: 'John' }
  });

  await twd.mockRequest('getUserPosts', {
    method: 'GET',
    url: '/api/user/posts',
    response: [{ id: 1, title: 'First Post' }]
  });

  await twd.mockRequest('getNotifications', {
    method: 'GET',
    url: '/api/notifications',
    response: { unread: 3, items: [] }
  });

  // Navigate to dashboard
  twd.visit('/dashboard');

  // Wait for all requests to complete
  const rules = await twd.waitForRequests([
    'getUser',
    'getUserPosts', 
    'getNotifications'
  ]);

  expect(rules).to.have.length(3);

  // Verify UI loaded correctly
  const userName = await twd.get('[data-testid="user-name"]');
  userName.should('contain.text', 'John');
});
```

## Testing Different Scenarios

### Success Scenarios

```ts
describe('Successful API Calls', () => {
  beforeEach(async () => {
    await twd.initRequestMocking();
    twd.clearRequestMockRules();
  });

  it('should display products list', async () => {
    await twd.mockRequest('getProducts', {
      method: 'GET',
      url: '/api/products',
      response: {
        products: [
          { id: 1, name: 'Laptop', price: 999 },
          { id: 2, name: 'Phone', price: 599 }
        ],
        total: 2
      }
    });

    twd.visit('/products');
    await twd.waitForRequest('getProducts');

    const productList = await twd.getAll('[data-testid="product-item"]');
    expect(productList).to.have.length(2);

    productList[0].should('contain.text', 'Laptop');
    productList[1].should('contain.text', 'Phone');
  });
});
```

### Error Scenarios

```ts
describe('API Error Handling', () => {
  beforeEach(async () => {
    await twd.initRequestMocking();
    twd.clearRequestMockRules();
  });

  it('should show error message when API fails', async () => {
    await twd.mockRequest('getProductsError', {
      method: 'GET',
      url: '/api/products',
      response: { error: 'Failed to load products' },
      status: 500
    });

    twd.visit('/products');
    await twd.waitForRequest('getProductsError');

    const errorMessage = await twd.get('[data-testid="error-message"]');
    errorMessage.should('be.visible');
    errorMessage.should('contain.text', 'Failed to load products');
  });

  it('should handle network timeout', async () => {
    await twd.mockRequest('timeoutError', {
      method: 'GET',
      url: '/api/slow-endpoint',
      response: { error: 'Request timeout' },
      status: 408
    });

    twd.visit('/slow-page');
    await twd.waitForRequest('timeoutError');

    const timeoutMessage = await twd.get('[data-testid="timeout-message"]');
    timeoutMessage.should('contain.text', 'Request timed out');
  });
});
```

### Loading States

```ts
describe('Loading States', () => {
  beforeEach(async () => {
    await twd.initRequestMocking();
    twd.clearRequestMockRules();
  });

  it('should show loading spinner during API call', async () => {
    await twd.mockRequest('slowRequest', {
      method: 'GET',
      url: '/api/data',
      response: { data: 'loaded' }
    });

    twd.visit('/data-page');

    // Check loading state appears
    const loadingSpinner = await twd.get('[data-testid="loading-spinner"]');
    loadingSpinner.should('be.visible');

    // Wait for request to complete
    await twd.waitForRequest('slowRequest');

    // Check loading state disappears
    loadingSpinner.should('not.be.visible');

    // Check data appears
    const dataContent = await twd.get('[data-testid="data-content"]');
    dataContent.should('be.visible');
  });
});
```

## Form Submission Testing

### POST Request with Form Data

```ts
describe('Form Submission', () => {
  beforeEach(async () => {
    await twd.initRequestMocking();
    twd.clearRequestMockRules();
  });

  it('should submit contact form', async () => {
    await twd.mockRequest('submitContact', {
      method: 'POST',
      url: '/api/contact',
      response: { success: true, message: 'Thank you for your message!' }
    });

    twd.visit('/contact');

    // Fill out form
    const nameInput = await twd.get('input[name="name"]');
    const emailInput = await twd.get('input[name="email"]');
    const messageInput = await twd.get('textarea[name="message"]');
    const submitButton = await twd.get('button[type="submit"]');

    const user = userEvent.setup();
    await user.type(nameInput.el, 'John Doe');
    await user.type(emailInput.el, 'john@example.com');
    await user.type(messageInput.el, 'Hello, this is a test message.');
    await user.click(submitButton.el);

    // Wait for submission
    const rule = await twd.waitForRequest('submitContact');

    // Verify request body
    const requestBody = JSON.parse(rule.request as string);
    expect(requestBody).to.deep.equal({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Hello, this is a test message.'
    });

    // Verify success message
    const successMessage = await twd.get('[data-testid="success-message"]');
    successMessage.should('contain.text', 'Thank you for your message!');
  });
});
```

## Advanced Mocking Patterns

### Dynamic Responses

```ts
describe('Dynamic API Responses', () => {
  it('should handle different user roles', async () => {
    // Mock for admin user
    await twd.mockRequest('getAdminUser', {
      method: 'GET',
      url: '/api/user',
      response: {
        id: 1,
        name: 'Admin User',
        role: 'admin',
        permissions: ['read', 'write', 'delete']
      }
    });

    twd.visit('/dashboard');
    await twd.waitForRequest('getAdminUser');

    // Admin should see admin panel
    const adminPanel = await twd.get('[data-testid="admin-panel"]');
    adminPanel.should('be.visible');

    // Clear and mock regular user
    twd.clearRequestMockRules();
    
    await twd.mockRequest('getRegularUser', {
      method: 'GET',
      url: '/api/user',
      response: {
        id: 2,
        name: 'Regular User',
        role: 'user',
        permissions: ['read']
      }
    });

    twd.visit('/dashboard');
    await twd.waitForRequest('getRegularUser');

    // Regular user should not see admin panel
    const adminPanelHidden = await twd.get('[data-testid="admin-panel"]').catch(() => null);
    expect(adminPanelHidden).to.be.null;
  });
});
```

### Pagination Testing

```ts
describe('Pagination', () => {
  beforeEach(async () => {
    await twd.initRequestMocking();
    twd.clearRequestMockRules();
  });

  it('should handle paginated results', async () => {
    // Mock first page
    await twd.mockRequest('getPage1', {
      method: 'GET',
      url: /\/api\/posts\?page=1/,
      response: {
        posts: [
          { id: 1, title: 'Post 1' },
          { id: 2, title: 'Post 2' }
        ],
        pagination: {
          current: 1,
          total: 3,
          hasNext: true
        }
      }
    });

    // Mock second page
    await twd.mockRequest('getPage2', {
      method: 'GET',
      url: /\/api\/posts\?page=2/,
      response: {
        posts: [
          { id: 3, title: 'Post 3' },
          { id: 4, title: 'Post 4' }
        ],
        pagination: {
          current: 2,
          total: 3,
          hasNext: true
        }
      }
    });

    twd.visit('/posts');
    await twd.waitForRequest('getPage1');

    // Verify first page loaded
    const posts = await twd.getAll('[data-testid="post-item"]');
    expect(posts).to.have.length(2);

    // Click next page
    const nextButton = await twd.get('[data-testid="next-page"]');
    const user = userEvent.setup();
    await user.click(nextButton.el);

    await twd.waitForRequest('getPage2');

    // Verify second page loaded
    const newPosts = await twd.getAll('[data-testid="post-item"]');
    expect(newPosts).to.have.length(2);
    newPosts[0].should('contain.text', 'Post 3');
  });
});
```

## Best Practices

### 1. Clean Up Mocks

```ts
describe('API Tests', () => {
  beforeEach(async () => {
    await twd.initRequestMocking();
    twd.clearRequestMockRules(); // Always clear before each test
  });

  // Tests here
});
```

### 2. Use Realistic Data

```ts
// ✅ Good - Realistic user data
await twd.mockRequest('getUser', {
  method: 'GET',
  url: '/api/user/123',
  response: {
    id: 123,
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://example.com/avatars/john.jpg',
    createdAt: '2024-01-15T10:30:00Z',
    preferences: {
      theme: 'dark',
      notifications: true
    }
  }
});

// ❌ Bad - Too minimal
await twd.mockRequest('getUser', {
  method: 'GET',
  url: '/api/user/123',
  response: { name: 'test' }
});
```

### 3. Test Both Success and Error Cases

```ts
describe('User Profile', () => {
  it('should load user data successfully', async () => {
    // Test success case
  });

  it('should handle user not found error', async () => {
    // Test 404 error
  });

  it('should handle server error', async () => {
    // Test 500 error
  });
});
```

### 4. Use Descriptive Aliases

```ts
// ✅ Good - Clear purpose
await twd.mockRequest('getUserProfile', { /* ... */ });
await twd.mockRequest('updateUserEmail', { /* ... */ });

// ❌ Bad - Unclear purpose
await twd.mockRequest('api1', { /* ... */ });
await twd.mockRequest('request2', { /* ... */ });
```

## Troubleshooting

### Mock Not Triggered

```ts
// Check active mocks
console.log('Active mocks:', twd.getRequestMockRules());

// Verify URL pattern matches
await twd.mockRequest('test', {
  method: 'GET',
  url: '/api/exact-url', // Make sure this matches exactly
  response: { data: 'test' }
});
```

### Service Worker Issues

```ts
// Ensure service worker is initialized
try {
  await twd.initRequestMocking();
  console.log('Service worker initialized');
} catch (error) {
  console.error('Service worker failed:', error);
}
```

## Next Steps

Great! You now know how to mock APIs for comprehensive testing. Let's learn about test hooks to organize and manage your tests better.

👉 [Test Hooks](./test-hooks)
