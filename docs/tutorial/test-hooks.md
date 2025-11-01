# Test Hooks

Learn to use beforeEach, afterEach, it.only, and it.skip to organize and manage your tests effectively.

## Test Hooks Overview

Test hooks allow you to:

- **Set up** common test conditions with `beforeEach`
- **Clean up** after tests with `afterEach`
- **Focus** on specific tests with `it.only`
- **Skip** problematic tests with `it.skip`

## beforeEach Hook

Runs before each test in the current `describe` block.

### Basic Usage

```ts
import { describe, it, beforeEach, twd } from 'twd-js';

describe('User Dashboard', () => {
  beforeEach(async () => {
    // This runs before each test
    await twd.initRequestMocking();
    twd.clearRequestMockRules();
    
    // Mock common API calls
    await twd.mockRequest('getUser', {
      method: 'GET',
      url: '/api/user',
      response: { id: 1, name: 'John Doe', email: 'john@example.com' }
    });
    
    // Navigate to dashboard
    twd.visit('/dashboard');
  });

  it('should display user name', async () => {
    await twd.waitForRequest('getUser');
    
    const userName = await twd.get('[data-testid="user-name"]');
    userName.should('contain.text', 'John Doe');
  });

  it('should display user email', async () => {
    await twd.waitForRequest('getUser');
    
    const userEmail = await twd.get('[data-testid="user-email"]');
    userEmail.should('contain.text', 'john@example.com');
  });
});
```

### Common Setup Patterns

#### API Mocking Setup

```ts
describe('Product Catalog', () => {
  beforeEach(async () => {
    // Initialize mocking
    await twd.initRequestMocking();
    twd.clearRequestMockRules();
    
    // Mock product data
    await twd.mockRequest('getProducts', {
      method: 'GET',
      url: '/api/products',
      response: {
        products: [
          { id: 1, name: 'Laptop', price: 999, category: 'Electronics' },
          { id: 2, name: 'Book', price: 29, category: 'Education' },
          { id: 3, name: 'Headphones', price: 199, category: 'Electronics' }
        ]
      }
    });
  });

  it('should display all products', async () => {
    twd.visit('/products');
    await twd.waitForRequest('getProducts');
    
    const products = await twd.getAll('[data-testid="product-item"]');
    expect(products).to.have.length(3);
  });

  it('should filter products by category', async () => {
    twd.visit('/products?category=Electronics');
    await twd.waitForRequest('getProducts');
    
    const electronicsProducts = await twd.getAll('[data-testid="product-item"]');
    expect(electronicsProducts).to.have.length(2);
  });
});
```

#### Local Storage Setup

```ts
describe('User Preferences', () => {
  beforeEach(() => {
    // Clear and set up localStorage
    localStorage.clear();
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('language', 'en');
    localStorage.setItem('userId', '123');
  });

  it('should load user theme preference', async () => {
    twd.visit('/settings');
    
    const themeToggle = await twd.get('[data-testid="theme-toggle"]');
    themeToggle.should('have.attr', 'data-theme', 'dark');
  });

  it('should load user language preference', async () => {
    twd.visit('/settings');
    
    const languageSelect = await twd.get('[data-testid="language-select"]');
    languageSelect.should('have.value', 'en');
  });
});
```

### Nested beforeEach

```ts
describe('E-commerce Application', () => {
  beforeEach(async () => {
    // Runs before ALL tests in this describe
    await twd.initRequestMocking();
    localStorage.clear();
  });

  describe('Authenticated User', () => {
    beforeEach(async () => {
      // Runs before tests in this nested describe
      // (after the parent beforeEach)
      localStorage.setItem('authToken', 'valid-token');
      
      await twd.mockRequest('getUser', {
        method: 'GET',
        url: '/api/user',
        response: { id: 1, name: 'John', role: 'user' }
      });
    });

    it('should access protected page', async () => {
      twd.visit('/profile');
      await twd.waitForRequest('getUser');
      
      const profilePage = await twd.get('[data-testid="profile-page"]');
      profilePage.should('be.visible');
    });
  });

  describe('Guest User', () => {
    beforeEach(() => {
      // Different setup for guest users
      localStorage.removeItem('authToken');
    });

    it('should redirect to login', async () => {
      twd.visit('/profile');
      
      // Should redirect to login
      twd.url().should('contain.url', '/login');
    });
  });
});
```

## afterEach Hook

Runs after each test in the current `describe` block.

### Basic Usage

```ts
describe('Form Testing', () => {
  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any global state
    window.location.hash = '';
  });

  it('should save form data to localStorage', async () => {
    twd.visit('/contact');
    
    const nameInput = await twd.get('input[name="name"]');
    const user = userEvent.setup();
    await user.type(nameInput.el, 'John Doe');
    
    // Verify localStorage was updated
    expect(localStorage.getItem('formData')).to.contain('John Doe');
  });

  it('should clear form on reset', async () => {
    twd.visit('/contact');
    
    const resetButton = await twd.get('button[data-action="reset"]');
    const user = userEvent.setup();
    await user.click(resetButton.el);
    
    // localStorage should be cleared by the app
    expect(localStorage.getItem('formData')).to.be.null;
  });
  
  // afterEach runs after each test above, ensuring clean state
});
```

### Database/API Cleanup

```ts
describe('User Management', () => {
  let createdUserIds: number[] = [];

  afterEach(async () => {
    // Clean up any users created during tests
    for (const userId of createdUserIds) {
      await twd.mockRequest(`deleteUser${userId}`, {
        method: 'DELETE',
        url: `/api/users/${userId}`,
        response: { success: true }
      });
    }
    createdUserIds = [];
    
    // Clear mocks
    twd.clearRequestMockRules();
  });

  it('should create new user', async () => {
    const newUserId = 123;
    createdUserIds.push(newUserId);
    
    await twd.mockRequest('createUser', {
      method: 'POST',
      url: '/api/users',
      response: { id: newUserId, name: 'New User' }
    });
    
    // Test user creation...
  });
});
```

## it.only - Focus on Specific Tests

Use `it.only` to run only specific tests, skipping all others.

### Basic Usage

```ts
describe('Feature Development', () => {
  it('should handle user login', async () => {
    // This test will be skipped
    console.log('This will not run');
  });

  it.only('should validate email format', async () => {
    // Only this test will run
    twd.visit('/register');
    
    const emailInput = await twd.get('input[name="email"]');
    const user = userEvent.setup();
    await user.type(emailInput.el, 'invalid-email');
    
    const errorMessage = await twd.get('[data-testid="email-error"]');
    errorMessage.should('contain.text', 'Invalid email format');
  });

  it('should create user account', async () => {
    // This test will also be skipped
    console.log('This will not run either');
  });
});
```

### Multiple it.only

```ts
describe('Debugging Session', () => {
  it('should load homepage', async () => {
    // Skipped
  });

  it.only('should handle form validation', async () => {
    // This runs
    twd.visit('/form');
    // Debug this specific test
  });

  it('should submit form', async () => {
    // Skipped
  });

  it.only('should show success message', async () => {
    // This also runs
    twd.visit('/success');
    // Debug this specific test too
  });
});
```

### Use Cases for it.only

#### 1. Debugging Failing Tests

```ts
describe('Bug Investigation', () => {
  it('working test 1', async () => {
    // This works fine
  });

  it.only('failing test - debug me', async () => {
    // Focus on this failing test
    twd.visit('/problematic-page');
    
    // Add debug logging
    console.log('Current URL:', window.location.href);
    
    const element = await twd.get('.problematic-element');
    console.log('Element found:', element.el);
    
    element.should('be.visible');
  });

  it('working test 2', async () => {
    // This works fine too
  });
});
```

#### 2. Developing New Features

```ts
describe('New Feature Development', () => {
  it('existing feature test', async () => {
    // Skip while working on new feature
  });

  it.only('new feature - work in progress', async () => {
    // Focus on developing this new test
    twd.visit('/new-feature');
    
    // Incrementally build the test
    const newButton = await twd.get('[data-testid="new-button"]');
    newButton.should('be.visible');
    
    // TODO: Add more assertions as feature develops
  });
});
```

## it.skip - Skip Problematic Tests

Use `it.skip` to temporarily disable tests without deleting them.

### Basic Usage

```ts
describe('Test Suite with Known Issues', () => {
  it('should work correctly', async () => {
    // This test runs normally
    twd.visit('/working-page');
    const element = await twd.get('.working-element');
    element.should('be.visible');
  });

  it.skip('should handle edge case', async () => {
    // This test is skipped - maybe the feature isn't ready
    twd.visit('/edge-case-page');
    // This code won't execute
    throw new Error('This error will not be thrown');
  });

  it('should handle normal case', async () => {
    // This test runs normally
    twd.visit('/normal-page');
    const element = await twd.get('.normal-element');
    element.should('be.visible');
  });
});
```

### Use Cases for it.skip

#### 1. Incomplete Features

```ts
describe('Payment Processing', () => {
  it('should process credit card payments', async () => {
    // Credit card processing is implemented
    twd.visit('/checkout');
    // Test implementation...
  });

  it.skip('should process PayPal payments', async () => {
    // PayPal integration not ready yet
    twd.visit('/checkout');
    const paypalButton = await twd.get('[data-testid="paypal-button"]');
    // This would fail because PayPal isn't implemented yet
  });

  it.skip('should process cryptocurrency payments', async () => {
    // Future feature - not implemented
    twd.visit('/checkout');
    // Placeholder for future implementation
  });
});
```

#### 2. Environment-Specific Tests

```ts
describe('Browser-Specific Features', () => {
  it('should work in all browsers', async () => {
    // Universal functionality
    twd.visit('/universal-feature');
    const element = await twd.get('.universal-element');
    element.should('be.visible');
  });

  it.skip('should use Safari-specific API', async () => {
    // Skip if not running in Safari
    // This test only works in Safari
    if (navigator.userAgent.includes('Safari')) {
      // Test Safari-specific functionality
    }
  });
});
```

#### 3. Flaky Tests

```ts
describe('Integration Tests', () => {
  it('should handle stable API', async () => {
    // Reliable test
    await twd.mockRequest('stableAPI', {
      method: 'GET',
      url: '/api/stable',
      response: { data: 'reliable' }
    });
    
    twd.visit('/stable-page');
    await twd.waitForRequest('stableAPI');
    
    const result = await twd.get('[data-testid="result"]');
    result.should('contain.text', 'reliable');
  });

  it.skip('should handle flaky third-party service', async () => {
    // Skip this flaky test temporarily while investigating
    // TODO: Fix flaky behavior in third-party integration
    twd.visit('/third-party-integration');
    // This test sometimes fails due to external service issues
  });
});
```

## Advanced Hook Patterns

### Conditional Setup

```ts
describe('Multi-Environment Tests', () => {
  beforeEach(async () => {
    await twd.initRequestMocking();
    
    // Different setup based on test environment
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      // Production-like setup
      await twd.mockRequest('prodAPI', {
        method: 'GET',
        url: '/api/prod-endpoint',
        response: { env: 'production' }
      });
    } else {
      // Development setup
      await twd.mockRequest('devAPI', {
        method: 'GET',
        url: '/api/dev-endpoint',
        response: { env: 'development' }
      });
    }
  });

  it('should adapt to environment', async () => {
    twd.visit('/environment-page');
    
    const envIndicator = await twd.get('[data-testid="env-indicator"]');
    envIndicator.should('be.visible');
    // Test will work in both environments
  });
});
```

### Shared State Management

```ts
describe('Shopping Cart Flow', () => {
  let cartItems: any[] = [];

  beforeEach(async () => {
    await twd.initRequestMocking();
    
    // Mock cart API with shared state
    await twd.mockRequest('getCart', {
      method: 'GET',
      url: '/api/cart',
      response: { items: cartItems }
    });
  });

  afterEach(() => {
    // Reset shared state after each test
    cartItems = [];
  });

  it('should start with empty cart', async () => {
    twd.visit('/cart');
    await twd.waitForRequest('getCart');
    
    const emptyMessage = await twd.get('[data-testid="empty-cart"]');
    emptyMessage.should('be.visible');
  });

  it('should add item to cart', async () => {
    // Simulate adding item
    cartItems.push({ id: 1, name: 'Laptop', price: 999 });
    
    await twd.mockRequest('addToCart', {
      method: 'POST',
      url: '/api/cart/add',
      response: { success: true }
    });
    
    twd.visit('/products/1');
    
    const addButton = await twd.get('[data-testid="add-to-cart"]');
    const user = userEvent.setup();
    await user.click(addButton.el);
    
    await twd.waitForRequest('addToCart');
    
    // Verify cart updated
    twd.visit('/cart');
    const cartItem = await twd.get('[data-testid="cart-item"]');
    cartItem.should('contain.text', 'Laptop');
  });
});
```

## Best Practices

### 1. Keep Hooks Simple

```ts
// ✅ Good - Simple, focused setup
beforeEach(async () => {
  await twd.initRequestMocking();
  twd.clearRequestMockRules();
  localStorage.clear();
});

// ❌ Bad - Too complex, hard to debug
beforeEach(async () => {
  // 50 lines of complex setup
  // Multiple API calls
  // Complex state manipulation
  // Hard to understand what each test needs
});
```

### 2. Use Descriptive Comments

```ts
beforeEach(async () => {
  // Initialize mocking system
  await twd.initRequestMocking();
  
  // Clear previous test state
  twd.clearRequestMockRules();
  localStorage.clear();
  
  // Set up authenticated user
  localStorage.setItem('authToken', 'test-token');
  
  // Mock user profile API
  await twd.mockRequest('getProfile', {
    method: 'GET',
    url: '/api/profile',
    response: { id: 1, name: 'Test User' }
  });
});
```

### 3. Remove it.only Before Committing

```ts
// ❌ Don't commit this - it will skip other tests in CI
it.only('should test specific feature', async () => {
  // Test implementation
});

// ✅ Remove .only before committing
it('should test specific feature', async () => {
  // Test implementation
});
```

### 4. Document Skipped Tests

```ts
it.skip('should handle complex workflow', async () => {
  // TODO: Fix flaky behavior - Issue #123
  // This test fails intermittently due to timing issues
  // Skip until we can investigate the root cause
  
  twd.visit('/complex-workflow');
  // Test implementation...
});
```

## Troubleshooting

### beforeEach Not Running

```ts
describe('Debug beforeEach', () => {
  beforeEach(() => {
    console.log('beforeEach is running'); // Add debug logging
    // Your setup code
  });

  it('should run test', async () => {
    console.log('Test is running');
    // Test implementation
  });
});
```

### Hooks Running in Wrong Order

```ts
describe('Hook Order', () => {
  beforeEach(() => {
    console.log('1. Parent beforeEach');
  });

  describe('Nested', () => {
    beforeEach(() => {
      console.log('2. Child beforeEach');
    });

    afterEach(() => {
      console.log('3. Child afterEach');
    });

    it('should show hook order', async () => {
      console.log('4. Test running');
      // Test implementation
    });
  });

  afterEach(() => {
    console.log('5. Parent afterEach');
  });
});
```

### it.only Not Working

Make sure you're using the correct syntax:

```ts
// ✅ Correct
it.only('test name', async () => {
  // Test implementation
});

// ❌ Incorrect
only.it('test name', async () => {
  // This won't work
});
```

## Next Steps

Excellent! You now know how to organize and manage your tests with hooks. Let's learn how to build production-ready applications without including test code.

👉 [Production Builds](./production-builds)
