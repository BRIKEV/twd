# First Test

Write and run your first TWD test to understand the basics.

## Your First Test

Let's create a simple test that verifies your app renders correctly.

### 1. Create a Test File

```ts
// src/tests/app.twd.test.ts
import { describe, it, twd } from 'twd-js';

describe('My First Test', () => {
  it('should display the app title', async () => {
    // Navigate to the home page
    twd.visit('/');
    
    // Find the main heading
    const heading = await twd.get('h1');
    
    // Assert it's visible
    heading.should('be.visible');
    
    // Assert it contains expected text
    heading.should('contain.text', 'Welcome');
  });
});
```

### 2. Run the Test

1. **Start your dev server** if it's not running:
   ```bash
   npm run dev
   ```

2. **Open your browser** and navigate to your app

3. **Look for the TWD sidebar** on the left side of your screen

4. **Click the play button** next to your test to run it

### 3. Understanding the Results

- ✅ **Green checkmark** = Test passed
- ❌ **Red X** = Test failed  
- 📝 **Logs** = Detailed information about what happened

## Breaking Down the Test

Let's understand each part of the test:

### Test Structure

```ts
describe('My First Test', () => {
  // Test group - organizes related tests
  
  it('should display the app title', async () => {
    // Individual test - describes what should happen
  });
});
```

### Navigation

```ts
twd.visit('/');
```

- Navigates to a specific route in your single-page application
- Works with React Router, Next.js router, etc.
- Use relative paths like `/`, `/about`, `/products`

### Element Selection

```ts
const heading = await twd.get('h1');
```

- Finds an element using CSS selectors
- Returns a TWD element API for making assertions
- Waits automatically for the element to appear

### Assertions

```ts
heading.should('be.visible');
heading.should('contain.text', 'Welcome');
```

- Tests element properties and content
- Provides clear error messages when tests fail
- Chainable for multiple assertions

## Common Selectors

### By Tag Name
```ts
const button = await twd.get('button');
const input = await twd.get('input');
```

### By ID
```ts
const header = await twd.get('#header');
const loginForm = await twd.get('#login-form');
```

### By Class
```ts
const card = await twd.get('.card');
const errorMessage = await twd.get('.error-message');
```

### By Attribute
```ts
const submitButton = await twd.get('button[type="submit"]');
const emailInput = await twd.get('input[name="email"]');
```

### By Data Attribute (Recommended)
```ts
const userCard = await twd.get('[data-testid="user-card"]');
const menuButton = await twd.get('[data-testid="menu-toggle"]');
```

## Writing Better Tests

### Use Descriptive Names

```ts
// ✅ Good - Clear and specific
it('should show validation error when email is empty', async () => {
  // Test implementation
});

// ❌ Bad - Too vague
it('should validate form', async () => {
  // Test implementation
});
```

### Test User Workflows

```ts
describe('User Registration', () => {
  it('should register a new user successfully', async () => {
    // Navigate to registration page
    twd.visit('/register');
    
    // Fill out the form
    const nameInput = await twd.get('input[name="name"]');
    const emailInput = await twd.get('input[name="email"]');
    const passwordInput = await twd.get('input[name="password"]');
    const submitButton = await twd.get('button[type="submit"]');
    
    // Use userEvent for realistic interactions
    const user = userEvent.setup();
    await user.type(nameInput.el, 'John Doe');
    await user.type(emailInput.el, 'john@example.com');
    await user.type(passwordInput.el, 'password123');
    await user.click(submitButton.el);
    
    // Verify success
    const successMessage = await twd.get('.success-message');
    successMessage.should('contain.text', 'Registration successful');
  });
});
```

### Use Data Attributes

Add `data-testid` attributes to your components for reliable testing:

```tsx
// In your React component
function LoginForm() {
  return (
    <form>
      <input 
        type="email" 
        name="email"
        data-testid="email-input"
      />
      <input 
        type="password" 
        name="password"
        data-testid="password-input"
      />
      <button 
        type="submit"
        data-testid="login-button"
      >
        Login
      </button>
    </form>
  );
}
```

```ts
// In your test
const emailInput = await twd.get('[data-testid="email-input"]');
const passwordInput = await twd.get('[data-testid="password-input"]');
const loginButton = await twd.get('[data-testid="login-button"]');
```

## Debugging Tests

### View Element Details

```ts
const element = await twd.get('button');
console.log('Element:', element.el);
console.log('Text:', element.el.textContent);
console.log('Classes:', element.el.className);
```

### Add Pauses for Inspection

```ts
it('should debug the form', async () => {
  twd.visit('/form');
  
  // Pause to inspect the page
  await twd.wait(2000);
  
  const form = await twd.get('form');
  form.should('be.visible');
});
```

### Use Browser DevTools

- **Inspect elements** to verify selectors
- **Check console** for TWD logs and errors
- **Use Network tab** to see requests (useful for API mocking later)

## Next Steps

Great job! You've written and run your first TWD test. Now let's learn about assertions and navigation.

👉 [Assertions & Navigation](./assertions-navigation)
