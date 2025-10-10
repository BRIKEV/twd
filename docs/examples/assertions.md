# Assertions

Learn how to use TWD's comprehensive assertion system to verify element states, content, and behavior.

## Text Content Assertions

### Exact Text Matching

```ts
describe("Text Content", () => {
  it("should verify exact text content", async () => {
    twd.visit("/welcome");

    const heading = await twd.get("h1");
    heading.should("have.text", "Welcome to TWD");

    const description = await twd.get(".description");
    description.should("have.text", "Test While Developing");

    // Case sensitive
    const label = await twd.get("label");
    label.should("have.text", "Email Address"); // Must match exactly
  });
});
```

### Partial Text Matching

```ts
describe("Partial Text", () => {
  it("should verify text contains substring", async () => {
    twd.visit("/product/123");

    const title = await twd.get("h1");
    title.should("contain.text", "Product"); // Matches "Product Details"

    const description = await twd.get(".description");
    description.should("contain.text", "premium"); // Case sensitive

    // Useful for dynamic content
    const price = await twd.get(".price");
    price.should("contain.text", "$"); // Contains currency symbol
  });
});
```

### Empty Content

```ts
describe("Empty Content", () => {
  it("should verify empty elements", async () => {
    twd.visit("/empty-state");

    const emptyList = await twd.get(".product-list");
    emptyList.should("be.empty");

    const placeholder = await twd.get(".placeholder");
    placeholder.should("not.be.empty");
    placeholder.should("contain.text", "No products found");
  });
});
```

## Attribute Assertions

### HTML Attributes

```ts
describe("HTML Attributes", () => {
  it("should verify element attributes", async () => {
    twd.visit("/contact");

    // Form attributes
    const emailInput = await twd.get("#email");
    emailInput.should("have.attr", "type", "email");
    emailInput.should("have.attr", "required");
    emailInput.should("have.attr", "placeholder", "Enter your email");

    // Link attributes
    const externalLink = await twd.get("a[href^='https://']");
    externalLink.should("have.attr", "target", "_blank");
    externalLink.should("have.attr", "rel", "noopener noreferrer");

    // Image attributes
    const logo = await twd.get(".logo img");
    logo.should("have.attr", "alt", "Company Logo");
    logo.should("have.attr", "width", "200");
  });
});
```

### Form Values

```ts
describe("Form Values", () => {
  it("should verify input values", async () => {
    twd.visit("/profile");

    // Pre-filled form
    const nameInput = await twd.get("#name");
    nameInput.should("have.value", "John Doe");

    const emailInput = await twd.get("#email");
    emailInput.should("have.value", "john@example.com");

    // Empty fields
    const phoneInput = await twd.get("#phone");
    phoneInput.should("have.value", "");

    // After user input
    const user = userEvent.setup();
    await user.clear(phoneInput.el);
    await user.type(phoneInput.el, "555-1234");
    
    phoneInput.should("have.value", "555-1234");
  });
});
```

### CSS Classes

```ts
describe("CSS Classes", () => {
  it("should verify element classes", async () => {
    twd.visit("/dashboard");

    // Button states
    const primaryButton = await twd.get(".btn-primary");
    primaryButton.should("have.class", "btn");
    primaryButton.should("have.class", "btn-primary");
    primaryButton.should("not.have.class", "disabled");

    // Status indicators
    const successAlert = await twd.get(".alert");
    successAlert.should("have.class", "alert-success");
    successAlert.should("not.have.class", "alert-error");

    // Dynamic classes
    const menuItem = await twd.get(".nav-item.active");
    menuItem.should("have.class", "active");
  });
});
```

## Element State Assertions

### Disabled/Enabled State

```ts
describe("Element States", () => {
  it("should verify disabled/enabled states", async () => {
    twd.visit("/form");

    // Initially disabled submit button
    const submitButton = await twd.get("button[type='submit']");
    submitButton.should("be.disabled");

    // Fill required fields
    const user = userEvent.setup();
    await user.type(await twd.get("#email"), "test@example.com");
    await user.type(await twd.get("#password"), "password123");

    // Button should now be enabled
    submitButton.should("be.enabled");
    submitButton.should("not.be.disabled");

    // Disabled input field
    const readOnlyField = await twd.get("#readonly-field");
    readOnlyField.should("be.disabled");
  });
});
```

### Checked State

```ts
describe("Checked State", () => {
  it("should verify checkbox and radio states", async () => {
    twd.visit("/preferences");

    // Checkboxes
    const newsletterCheckbox = await twd.get("#newsletter");
    newsletterCheckbox.should("not.be.checked");

    const user = userEvent.setup();
    await user.click(newsletterCheckbox.el);
    newsletterCheckbox.should("be.checked");

    // Radio buttons
    const premiumRadio = await twd.get("input[value='premium']");
    const basicRadio = await twd.get("input[value='basic']");

    basicRadio.should("be.checked"); // Default selection
    premiumRadio.should("not.be.checked");

    await user.click(premiumRadio.el);
    premiumRadio.should("be.checked");
    basicRadio.should("not.be.checked");
  });
});
```

### Selected State

```ts
describe("Selected State", () => {
  it("should verify select option states", async () => {
    twd.visit("/settings");

    // Default selection
    const defaultOption = await twd.get("select#country option[value='US']");
    defaultOption.should("be.selected");

    const canadaOption = await twd.get("select#country option[value='CA']");
    canadaOption.should("not.be.selected");

    // Change selection
    const user = userEvent.setup();
    const countrySelect = await twd.get("select#country");
    await user.selectOptions(countrySelect.el, "CA");

    // Verify new selection
    canadaOption.should("be.selected");
    defaultOption.should("not.be.selected");
  });
});
```

### Focus State

```ts
describe("Focus State", () => {
  it("should verify element focus", async () => {
    twd.visit("/login");

    // Initial focus
    const usernameInput = await twd.get("#username");
    usernameInput.should("be.focused");

    // Tab to next field
    const user = userEvent.setup();
    await user.keyboard("{Tab}");

    const passwordInput = await twd.get("#password");
    passwordInput.should("be.focused");
    usernameInput.should("not.be.focused");

    // Click to focus
    await user.click(usernameInput.el);
    usernameInput.should("be.focused");
    passwordInput.should("not.be.focused");
  });
});
```

### Visibility State

```ts
describe("Visibility", () => {
  it("should verify element visibility", async () => {
    twd.visit("/modal-example");

    // Initially hidden modal
    const modal = await twd.get(".modal");
    modal.should("not.be.visible");

    // Show modal
    const showButton = await twd.get("button[data-action='show-modal']");
    await userEvent.click(showButton.el);

    modal.should("be.visible");

    // Modal content should be visible
    const modalTitle = await twd.get(".modal h2");
    const modalBody = await twd.get(".modal .modal-body");
    
    modalTitle.should("be.visible");
    modalBody.should("be.visible");

    // Close modal
    const closeButton = await twd.get(".modal button[data-action='close']");
    await userEvent.click(closeButton.el);

    modal.should("not.be.visible");
  });
});
```

## URL Assertions

### Exact URL Matching

```ts
describe("URL Navigation", () => {
  it("should verify exact URLs", async () => {
    twd.visit("/");
    twd.url().should("eq", "http://localhost:5173/");

    twd.visit("/products");
    twd.url().should("eq", "http://localhost:5173/products");

    // With query parameters
    twd.visit("/search?q=laptop");
    twd.url().should("eq", "http://localhost:5173/search?q=laptop");
  });
});
```

### URL Contains

```ts
describe("URL Patterns", () => {
  it("should verify URL contains substring", async () => {
    twd.visit("/products/category/electronics");

    twd.url().should("contain.url", "/products");
    twd.url().should("contain.url", "electronics");
    twd.url().should("not.contain.url", "clothing");

    // After navigation
    const clothingLink = await twd.get("a[href*='clothing']");
    await userEvent.click(clothingLink.el);

    twd.url().should("contain.url", "clothing");
    twd.url().should("not.contain.url", "electronics");
  });
});
```

## Negated Assertions

### Using "not" Prefix

```ts
describe("Negated Assertions", () => {
  it("should verify opposite conditions", async () => {
    twd.visit("/form");

    const submitButton = await twd.get("button[type='submit']");
    
    // Negated state assertions
    submitButton.should("not.be.enabled");
    submitButton.should("not.have.class", "active");
    submitButton.should("not.have.attr", "disabled", "false");

    // Negated text assertions
    const heading = await twd.get("h1");
    heading.should("not.be.empty");
    heading.should("not.have.text", "Wrong Title");
    heading.should("not.contain.text", "error");

    // Negated visibility
    const errorMessage = await twd.get(".error-message");
    errorMessage.should("not.be.visible");
  });
});
```

## Practical Examples

### Form Validation

```ts
describe("Form Validation", () => {
  it("should show validation errors", async () => {
    twd.visit("/register");

    const user = userEvent.setup();
    const submitButton = await twd.get("button[type='submit']");

    // Submit empty form
    await user.click(submitButton.el);

    // Check validation errors
    const emailError = await twd.get(".error-email");
    emailError.should("be.visible");
    emailError.should("contain.text", "Email is required");

    const passwordError = await twd.get(".error-password");
    passwordError.should("be.visible");
    passwordError.should("contain.text", "Password must be at least 8 characters");

    // Fix email error
    const emailInput = await twd.get("#email");
    await user.type(emailInput.el, "test@example.com");

    // Email error should disappear
    emailError.should("not.be.visible");
    
    // Password error should still be visible
    passwordError.should("be.visible");
  });
});
```

### Shopping Cart

```ts
describe("Shopping Cart", () => {
  it("should update cart state", async () => {
    twd.visit("/products");

    // Initially empty cart
    const cartCount = await twd.get(".cart-count");
    cartCount.should("have.text", "0");

    const cartEmpty = await twd.get(".cart-empty");
    cartEmpty.should("be.visible");

    // Add product to cart
    const addToCartButton = await twd.get("button[data-product='123']");
    await userEvent.click(addToCartButton.el);

    // Cart should update
    cartCount.should("have.text", "1");
    cartEmpty.should("not.be.visible");

    // Cart items should be visible
    const cartItems = await twd.get(".cart-items");
    cartItems.should("be.visible");

    const cartItem = await twd.get(".cart-item[data-product='123']");
    cartItem.should("be.visible");
    cartItem.should("contain.text", "Product Name");
  });
});
```

### Loading States

```ts
describe("Loading States", () => {
  it("should show loading indicators", async () => {
    twd.visit("/dashboard");

    const loadDataButton = await twd.get("button[data-action='load-data']");
    const loadingSpinner = await twd.get(".loading-spinner");
    const dataContainer = await twd.get(".data-container");

    // Initial state
    loadingSpinner.should("not.be.visible");
    dataContainer.should("be.empty");

    // Click load button
    await userEvent.click(loadDataButton.el);

    // Loading state
    loadingSpinner.should("be.visible");
    loadDataButton.should("be.disabled");
    loadDataButton.should("contain.text", "Loading...");

    // Wait for data to load
    await twd.wait(2000);

    // Loaded state
    loadingSpinner.should("not.be.visible");
    loadDataButton.should("be.enabled");
    loadDataButton.should("contain.text", "Load Data");
    dataContainer.should("not.be.empty");
  });
});
```

### Responsive Design

```ts
describe("Responsive Design", () => {
  it("should adapt to screen size", async () => {
    twd.visit("/");

    // Desktop navigation
    const desktopNav = await twd.get(".desktop-nav");
    const mobileNav = await twd.get(".mobile-nav");
    const hamburgerButton = await twd.get(".hamburger-menu");

    // Assuming desktop view initially
    desktopNav.should("be.visible");
    mobileNav.should("not.be.visible");
    hamburgerButton.should("not.be.visible");

    // Note: Actual responsive testing would require
    // viewport manipulation, which depends on your setup
  });
});
```

## Advanced Patterns

### Chaining Assertions

```ts
describe("Assertion Chaining", () => {
  it("should chain multiple assertions", async () => {
    twd.visit("/profile");

    const profileCard = await twd.get(".profile-card");
    
    // Chain multiple assertions
    profileCard
      .should("be.visible")
      .should("have.class", "card")
      .should("not.have.class", "loading")
      .should("contain.text", "John Doe");

    const emailField = await twd.get("#email");
    emailField
      .should("have.attr", "type", "email")
      .should("have.value", "john@example.com")
      .should("be.enabled")
      .should("not.be.disabled");
  });
});
```

### Dynamic Content

```ts
describe("Dynamic Content", () => {
  it("should handle dynamically loaded content", async () => {
    twd.visit("/search");

    const searchInput = await twd.get("#search");
    const resultsContainer = await twd.get(".results");

    // Initial state
    resultsContainer.should("be.empty");

    // Perform search
    const user = userEvent.setup();
    await user.type(searchInput.el, "laptop");

    // Wait for results
    await twd.wait(1000);

    // Check results
    resultsContainer.should("not.be.empty");
    
    const results = await twd.getAll(".result-item");
    expect(results).to.have.length.greaterThan(0);

    // Check first result
    results[0].should("be.visible");
    results[0].should("contain.text", "laptop");
  });
});
```

## Best Practices

### 1. Be Specific with Assertions

```ts
// ✅ Good - Specific and meaningful
element.should("have.text", "Welcome, John!");
element.should("have.attr", "aria-label", "Close dialog");

// ❌ Too generic
element.should("be.visible");
element.should("not.be.empty");
```

### 2. Test User-Visible Behavior

```ts
// ✅ Good - Tests what users see
const errorMessage = await twd.get(".error-message");
errorMessage.should("be.visible");
errorMessage.should("contain.text", "Invalid email address");

// ❌ Implementation details
element.should("have.class", "error-state-active");
```

### 3. Use Appropriate Assertion Types

```ts
// ✅ Good - Right assertion for the job
element.should("contain.text", "Welcome"); // Partial match
element.should("have.value", "john@example.com"); // Exact value
element.should("be.checked"); // Boolean state

// ❌ Wrong assertion type
element.should("have.text", "Welcome to our amazing website!"); // Too specific
```

### 4. Combine with User Events

```ts
// ✅ Good - Test complete interactions
const user = userEvent.setup();
const button = await twd.get("button");

button.should("be.enabled");
await user.click(button.el);
button.should("be.disabled");

const successMessage = await twd.get(".success");
successMessage.should("be.visible");
```

## Troubleshooting

### Assertion Failures

```ts
// Common issues and solutions

// Issue: Text doesn't match exactly
// ❌ Fails if text is "Welcome, John!" 
element.should("have.text", "Welcome");

// ✅ Use contain.text for partial matches
element.should("contain.text", "Welcome");

// Issue: Element not visible yet
// ❌ Might fail if element loads async
const element = await twd.get(".async-content");
element.should("be.visible");

// ✅ Add wait or check loading state first
await twd.wait(1000);
const element = await twd.get(".async-content");
element.should("be.visible");
```

### Timing Issues

```ts
// Handle async content loading
describe("Async Content", () => {
  it("should wait for content to load", async () => {
    twd.visit("/async-page");

    // Wait for loading to complete
    const loadingSpinner = await twd.get(".loading");
    loadingSpinner.should("be.visible");

    await twd.wait(2000); // Wait for async operation

    loadingSpinner.should("not.be.visible");

    const content = await twd.get(".content");
    content.should("be.visible");
    content.should("not.be.empty");
  });
});
```

## Next Steps

- Learn about [User Events](/examples/user-events) to trigger state changes
- Explore [API Mocking](/examples/mocking) to test with controlled data
- Check the [API Reference](/api/assertions) for all available assertions
