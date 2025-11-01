# Assertions & Navigation

Master TWD's assertion system, URL testing, and working with multiple elements.

## Assertions Overview

Assertions are the heart of testing - they verify that your app behaves as expected.

### Basic Assertion Syntax

```ts
element.should('assertion', ...args);
```

All assertions can be negated with `not.`:

```ts
element.should('not.be.visible');
element.should('not.contain.text', 'Error');
```

## Content Assertions

### Text Content

```ts
describe('Content Testing', () => {
  it('should verify text content', async () => {
    twd.visit('/welcome');
    
    const heading = await twd.get('h1');
    
    // Exact text match
    heading.should('have.text', 'Welcome to Our App');
    
    // Partial text match
    heading.should('contain.text', 'Welcome');
    
    // Empty content
    const emptyDiv = await twd.get('.placeholder');
    emptyDiv.should('be.empty');
  });
});
```

### Form Values

```ts
describe('Form Testing', () => {
  it('should verify input values', async () => {
    twd.visit('/profile');
    
    const nameInput = await twd.get('input[name="name"]');
    const emailInput = await twd.get('input[name="email"]');
    
    // Check current values
    nameInput.should('have.value', 'John Doe');
    emailInput.should('have.value', 'john@example.com');
    
    // Check empty inputs
    const passwordInput = await twd.get('input[name="password"]');
    passwordInput.should('have.value', '');
  });
});
```

## Attribute Assertions

### HTML Attributes

```ts
describe('Attribute Testing', () => {
  it('should verify element attributes', async () => {
    twd.visit('/form');
    
    const submitButton = await twd.get('button[type="submit"]');
    const emailInput = await twd.get('input[name="email"]');
    
    // Check specific attributes
    submitButton.should('have.attr', 'type', 'submit');
    emailInput.should('have.attr', 'required', '');
    emailInput.should('have.attr', 'placeholder', 'Enter your email');
    
    // Check data attributes
    const userCard = await twd.get('[data-testid="user-card"]');
    userCard.should('have.attr', 'data-user-id', '123');
  });
});
```

### CSS Classes

```ts
describe('CSS Class Testing', () => {
  it('should verify element classes', async () => {
    twd.visit('/dashboard');
    
    const activeTab = await twd.get('.tab.active');
    const errorMessage = await twd.get('.message');
    
    // Check for specific classes
    activeTab.should('have.class', 'active');
    errorMessage.should('have.class', 'error');
    
    // Negative assertions
    const inactiveTab = await twd.get('.tab:not(.active)');
    inactiveTab.should('not.have.class', 'active');
  });
});
```

## State Assertions

### Element States

```ts
describe('Element State Testing', () => {
  it('should verify element states', async () => {
    twd.visit('/form');
    
    const submitButton = await twd.get('button[type="submit"]');
    const checkbox = await twd.get('input[type="checkbox"]');
    const selectOption = await twd.get('option[value="premium"]');
    const nameInput = await twd.get('input[name="name"]');
    
    // Visibility
    submitButton.should('be.visible');
    
    // Enabled/Disabled
    submitButton.should('be.enabled');
    // After some interaction that disables it:
    // submitButton.should('be.disabled');
    
    // Checked state
    checkbox.should('not.be.checked');
    // After checking:
    // checkbox.should('be.checked');
    
    // Selected state
    selectOption.should('not.be.selected');
    
    // Focus state
    nameInput.should('not.be.focused');
    // After focusing:
    // nameInput.should('be.focused');
  });
});
```

## URL Testing

### Basic URL Assertions

```ts
describe('Navigation Testing', () => {
  it('should verify URL changes', async () => {
    // Start at home page
    twd.visit('/');
    twd.url().should('contain.url', '/');
    
    // Navigate to about page
    twd.visit('/about');
    twd.url().should('contain.url', '/about');
    
    // Check exact URL
    twd.url().should('eq', 'http://localhost:3000/about');
  });
});
```

### URL Testing with User Interactions

```ts
describe('Interactive Navigation', () => {
  it('should navigate when clicking links', async () => {
    twd.visit('/');
    
    // Click navigation link
    const aboutLink = await twd.get('a[href="/about"]');
    const user = userEvent.setup();
    await user.click(aboutLink.el);
    
    // Verify URL changed
    twd.url().should('contain.url', '/about');
    
    // Verify page content loaded
    const aboutHeading = await twd.get('h1');
    aboutHeading.should('contain.text', 'About Us');
  });
});
```

### Query Parameters and Hash

```ts
describe('URL Parameters', () => {
  it('should handle query parameters and hash', async () => {
    // Navigate with query parameters
    twd.visit('/search?q=laptop&category=electronics');
    twd.url().should('contain.url', 'q=laptop');
    twd.url().should('contain.url', 'category=electronics');
    
    // Navigate with hash
    twd.visit('/docs#getting-started');
    twd.url().should('contain.url', '#getting-started');
  });
});
```

## Working with Multiple Elements

### Getting Multiple Elements

```ts
describe('Multiple Elements', () => {
  it('should work with element collections', async () => {
    twd.visit('/products');
    
    // Get all product cards
    const productCards = await twd.getAll('.product-card');
    
    // Check count using expect
    expect(productCards).to.have.length(12);
    
    // Test individual elements
    productCards[0].should('be.visible');
    productCards[0].should('contain.text', 'Product');
    
    // Test all elements
    for (let i = 0; i < productCards.length; i++) {
      productCards[i].should('be.visible');
      productCards[i].should('have.class', 'product-card');
    }
  });
});
```

### List Testing Patterns

```ts
describe('List Testing', () => {
  it('should verify list items', async () => {
    twd.visit('/todo');
    
    const todoItems = await twd.getAll('.todo-item');
    
    // Verify list has expected number of items
    expect(todoItems).to.have.length(5);
    
    // Test first and last items
    todoItems[0].should('contain.text', 'Buy groceries');
    todoItems[todoItems.length - 1].should('contain.text', 'Walk the dog');
    
    // Verify all items are visible
    todoItems.forEach(item => {
      item.should('be.visible');
    });
  });
});
```

### Table Testing

```ts
describe('Table Testing', () => {
  it('should verify table data', async () => {
    twd.visit('/users');
    
    // Get table rows (excluding header)
    const rows = await twd.getAll('tbody tr');
    expect(rows).to.have.length(10);
    
    // Test specific row content
    const firstRow = rows[0];
    const cells = await twd.getAll('td', firstRow.el);
    
    cells[0].should('contain.text', 'John Doe');
    cells[1].should('contain.text', 'john@example.com');
    cells[2].should('contain.text', 'Admin');
  });
});
```

## Advanced Assertion Patterns

### Conditional Testing

```ts
describe('Conditional Testing', () => {
  it('should handle conditional elements', async () => {
    twd.visit('/dashboard');
    
    // Check if user is logged in
    const loginButton = await twd.get('.login-button').catch(() => null);
    const userMenu = await twd.get('.user-menu').catch(() => null);
    
    if (loginButton) {
      // User is not logged in
      loginButton.should('be.visible');
      loginButton.should('contain.text', 'Login');
    } else if (userMenu) {
      // User is logged in
      userMenu.should('be.visible');
      userMenu.should('contain.text', 'Profile');
    }
  });
});
```

### Chaining Assertions

```ts
describe('Assertion Chaining', () => {
  it('should chain multiple assertions', async () => {
    twd.visit('/profile');
    
    const nameInput = await twd.get('input[name="name"]');
    
    // Chain multiple assertions
    nameInput
      .should('be.visible')
      .should('be.enabled')
      .should('have.value', 'John Doe')
      .should('have.attr', 'required', '');
  });
});
```

## Best Practices

### 1. Use Specific Selectors

```ts
// ✅ Good - Specific and stable
const submitButton = await twd.get('button[data-testid="submit-form"]');

// ❌ Bad - Too generic, might break
const button = await twd.get('button');
```

### 2. Test User-Visible Behavior

```ts
// ✅ Good - Tests what users see
heading.should('contain.text', 'Welcome');

// ❌ Bad - Tests implementation details
heading.should('have.class', 'text-2xl font-bold');
```

### 3. Use Meaningful Test Names

```ts
// ✅ Good - Clear what's being tested
it('should show error message when email is invalid', async () => {
  // Test implementation
});

// ❌ Bad - Unclear purpose
it('should test email validation', async () => {
  // Test implementation
});
```

### 4. Group Related Tests

```ts
describe('User Authentication', () => {
  describe('Login Form', () => {
    it('should show validation errors for empty fields', async () => {});
    it('should login with valid credentials', async () => {});
    it('should show error for invalid credentials', async () => {});
  });
  
  describe('Registration Form', () => {
    it('should register new user successfully', async () => {});
    it('should prevent duplicate email registration', async () => {});
  });
});
```

## Troubleshooting

### Element Not Found

```ts
// Add debug information
try {
  const element = await twd.get('.missing-element');
} catch (error) {
  console.log('Available elements:', document.querySelectorAll('*'));
  throw error;
}
```

### Timing Issues

```ts
// Wait for dynamic content
await twd.wait(1000);
const dynamicElement = await twd.get('.loaded-content');
```

### Assertion Failures

```ts
// Add context to assertions
const element = await twd.get('input');
console.log('Current value:', element.el.value);
element.should('have.value', 'expected-value');
```

## Next Steps

Now you understand assertions and navigation! Let's learn about API mocking to test your app's backend interactions.

👉 [API Mocking](./api-mocking)
