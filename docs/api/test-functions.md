# Test Functions

Core functions for structuring and organizing your TWD tests.

## describe(name, fn)

Groups related tests together for better organization and readability.

### Syntax

```ts
describe(name: string, fn: () => void): void
```

### Parameters

- **name** (`string`) - Descriptive name for the test group
- **fn** (`function`) - Function containing the test group's tests and setup

### Examples

```ts
describe("User Authentication", () => {
  it("should login with valid credentials", async () => {
    // Test implementation
  });

  it("should reject invalid credentials", async () => {
    // Test implementation  
  });
});
```

### Nested Groups

```ts
describe("Shopping Cart", () => {
  describe("Adding Items", () => {
    it("should add product to cart", async () => {
      // Test implementation
    });
  });

  describe("Removing Items", () => {
    it("should remove product from cart", async () => {
      // Test implementation
    });
  });
});
```

---

## it(name, fn)

Defines an individual test case.

### Syntax

```ts
it(name: string, fn: () => Promise<void> | void): void
```

### Parameters

- **name** (`string`) - Descriptive name for the test
- **fn** (`function`) - Test implementation (can be async)

### Examples

```ts
it("should display welcome message", async () => {
  twd.visit("/");
  const heading = await twd.get("h1");
  heading.should("contain.text", "Welcome");
});

it("should handle button clicks", async () => {
  const button = await twd.get("button");
  const user = userEvent.setup();
  await user.click(button.el);
  // Assertions...
});
```

### Async Tests

```ts
it("should load user data", async () => {
  twd.mockRequest("getUser", {
    method: "GET",
    url: "/api/user",
    response: { name: "John Doe" }
  });

  twd.visit("/profile");
  await twd.waitForRequest("getUser");
  
  const userName = await twd.get(".user-name");
  userName.should("have.text", "John Doe");
});
```

---

## itOnly(name, fn)

Runs only this test, skipping all others in the suite. Useful for debugging specific tests.

### Syntax

```ts
itOnly(name: string, fn: () => Promise<void> | void): void
```

### Parameters

- **name** (`string`) - Descriptive name for the test
- **fn** (`function`) - Test implementation (can be async)

### Examples

```ts
describe("User Management", () => {
  itOnly("should create new user", async () => {
    // Only this test will run
    twd.visit("/users/new");
    // Test implementation...
  });

  it("should delete user", async () => {
    // This test will be skipped
  });

  it("should update user", async () => {
    // This test will also be skipped
  });
});
```

### Use Cases

- **Debugging** - Focus on a failing test
- **Development** - Work on one test at a time
- **Troubleshooting** - Isolate problematic tests

::: warning
Remember to remove `itOnly` before committing code, as it will skip other tests in CI/CD.
:::

---

## itSkip(name, fn)

Skips this test. Useful for temporarily disabling broken or incomplete tests.

### Syntax

```ts
itSkip(name: string, fn: () => Promise<void> | void): void
```

### Parameters

- **name** (`string`) - Descriptive name for the test
- **fn** (`function`) - Test implementation (will not be executed)

### Examples

```ts
describe("Payment Processing", () => {
  it("should process credit card payment", async () => {
    // This test runs normally
  });

  itSkip("should process PayPal payment", async () => {
    // This test is skipped - maybe PayPal integration isn't ready
    throw new Error("This won't run");
  });

  it("should handle payment errors", async () => {
    // This test runs normally
  });
});
```

### Use Cases

- **Incomplete features** - Skip tests for unimplemented functionality
- **Known issues** - Temporarily skip failing tests while fixing
- **Environment-specific** - Skip tests that don't work in certain environments

---

## beforeEach(fn)

Runs a setup function before each test in the current `describe` block.

### Syntax

```ts
beforeEach(fn: () => Promise<void> | void): void
```

### Parameters

- **fn** (`function`) - Setup function to run before each test (can be async)

### Examples

```ts
describe("User Dashboard", () => {
  beforeEach(() => {
    // Reset state before each test
    localStorage.clear();
    twd.clearRequestMockRules();
  });

  it("should show user profile", async () => {
    // Clean state guaranteed
  });

  it("should display recent orders", async () => {
    // Clean state guaranteed
  });
});
```

### Async Setup

```ts
describe("API Integration", () => {
  beforeEach(async () => {
    // Initialize mocking
    await twd.initRequestMocking();
    
    // Set up common mocks
    twd.mockRequest("getUser", {
      method: "GET",
      url: "/api/user",
      response: { id: 1, name: "Test User" }
    });
  });

  it("should load user data", async () => {
    // Mocks are already set up
  });
});
```

### Nested beforeEach

```ts
describe("E-commerce Tests", () => {
  beforeEach(() => {
    // Runs before all tests in this describe
    localStorage.clear();
  });

  describe("Shopping Cart", () => {
    beforeEach(() => {
      // Runs before cart tests (after parent beforeEach)
      twd.visit("/cart");
    });

    it("should add items to cart", async () => {
      // Both beforeEach functions have run
    });
  });
});
```

---

## Best Practices

### 1. Descriptive Test Names

```ts
// ✅ Good - Describes what and why
it("should show validation error when email is invalid", async () => {
  // Test implementation
});

// ❌ Bad - Too vague
it("should validate email", async () => {
  // Test implementation
});
```

### 2. Logical Test Grouping

```ts
// ✅ Good - Logical grouping
describe("User Registration Form", () => {
  describe("Validation", () => {
    it("should require email field", async () => {});
    it("should require password field", async () => {});
  });

  describe("Submission", () => {
    it("should create user on valid input", async () => {});
    it("should show success message", async () => {});
  });
});
```

### 3. Clean State Management

```ts
describe("Shopping Cart", () => {
  beforeEach(() => {
    // Ensure clean state
    localStorage.removeItem("cart");
    sessionStorage.clear();
    twd.clearRequestMockRules();
  });

  it("should start with empty cart", async () => {
    // Test with guaranteed clean state
  });
});
```

### 4. Avoid Test Dependencies

```ts
// ✅ Good - Each test is independent
describe("User Management", () => {
  it("should create user", async () => {
    // Creates user from scratch
  });

  it("should delete user", async () => {
    // Creates user first, then deletes
  });
});

// ❌ Bad - Tests depend on each other
describe("User Management", () => {
  it("should create user", async () => {
    // Creates user
  });

  it("should delete user", async () => {
    // Assumes user from previous test exists
  });
});
```

### 5. Use beforeEach for Common Setup

```ts
describe("Authentication Flow", () => {
  beforeEach(async () => {
    // Common setup for all auth tests
    await twd.initRequestMocking();
    twd.visit("/login");
  });

  it("should login successfully", async () => {
    // No need to repeat visit and mock setup
  });

  it("should handle login errors", async () => {
    // No need to repeat visit and mock setup
  });
});
```

## Common Patterns

### Test Suite Organization

```ts
describe("E-commerce Application", () => {
  describe("Authentication", () => {
    beforeEach(() => {
      twd.visit("/login");
    });

    it("should login with valid credentials", async () => {});
    it("should reject invalid credentials", async () => {});
    it("should redirect after login", async () => {});
  });

  describe("Product Catalog", () => {
    beforeEach(() => {
      twd.visit("/products");
    });

    it("should display product list", async () => {});
    it("should filter products", async () => {});
    it("should search products", async () => {});
  });

  describe("Shopping Cart", () => {
    beforeEach(() => {
      localStorage.setItem("user", JSON.stringify({ id: 1 }));
      twd.visit("/cart");
    });

    it("should add products to cart", async () => {});
    it("should remove products from cart", async () => {});
    it("should calculate total price", async () => {});
  });
});
```

### Conditional Test Execution

```ts
describe("Feature Tests", () => {
  const isFeatureEnabled = localStorage.getItem("newFeature") === "true";

  if (isFeatureEnabled) {
    it("should show new feature", async () => {
      // Test new feature
    });
  } else {
    itSkip("should show new feature", async () => {
      // Feature not enabled, skip test
    });
  }
});
```

### Debug-Focused Testing

```ts
describe("Debug Session", () => {
  // Focus on the failing test
  itOnly("should handle complex user workflow", async () => {
    twd.visit("/complex-page");
    
    // Add debug logging
    console.log("Starting complex workflow test");
    
    const user = userEvent.setup();
    // ... complex test steps
    
    console.log("Workflow completed");
  });

  // Skip other tests to focus
  itSkip("should handle simple workflow", async () => {
    // Skip during debugging
  });
});
```

## Error Handling

### Test Function Errors

```ts
describe("Error Handling", () => {
  it("should handle test errors gracefully", async () => {
    try {
      const element = await twd.get(".non-existent");
      element.should("be.visible");
    } catch (error) {
      // Test will fail with descriptive error
      console.error("Element not found:", error.message);
      throw error; // Re-throw to fail the test
    }
  });
});
```

### beforeEach Errors

```ts
describe("Setup Errors", () => {
  beforeEach(async () => {
    try {
      await twd.initRequestMocking();
    } catch (error) {
      console.error("Failed to initialize mocking:", error);
      throw error; // This will fail all tests in the describe block
    }
  });

  it("should run with proper setup", async () => {
    // This won't run if beforeEach fails
  });
});
```

## Next Steps

- Learn about [TWD Commands](/api/twd-commands) for element interaction
- Explore [Assertions](/api/assertions) for testing element states
