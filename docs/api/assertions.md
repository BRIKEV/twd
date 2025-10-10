# Assertions

Complete reference for all TWD assertion methods to verify element states, content, and behavior.

## Text Content Assertions

### have.text

Verifies that an element's text content matches exactly.

#### Syntax

```ts
element.should("have.text", expectedText: string): TWDElemAPI
```

#### Examples

```ts
const heading = await twd.get("h1");
heading.should("have.text", "Welcome to TWD");

const button = await twd.get("button");
button.should("have.text", "Submit Form");

// Case sensitive
const label = await twd.get("label");
label.should("have.text", "Email Address"); // Must match exactly
```

#### Negation

```ts
const element = await twd.get(".message");
element.should("not.have.text", "Error occurred");
```

---

### contain.text

Verifies that an element's text content contains a substring.

#### Syntax

```ts
element.should("contain.text", substring: string): TWDElemAPI
```

#### Examples

```ts
const description = await twd.get(".product-description");
description.should("contain.text", "premium quality");

const errorMessage = await twd.get(".error");
errorMessage.should("contain.text", "required");

// Partial matching
const title = await twd.get("h1");
title.should("contain.text", "Product"); // Matches "Product Details"
```

#### Negation

```ts
const successMessage = await twd.get(".success");
successMessage.should("not.contain.text", "error");
```

---

### be.empty

Verifies that an element has no text content.

#### Syntax

```ts
element.should("be.empty"): TWDElemAPI
```

#### Examples

```ts
const emptyDiv = await twd.get(".placeholder");
emptyDiv.should("be.empty");

const clearedInput = await twd.get("#search");
clearedInput.should("be.empty");

// After clearing content
const user = userEvent.setup();
const textArea = await twd.get("textarea");
await user.clear(textArea.el);
textArea.should("be.empty");
```

#### Negation

```ts
const contentDiv = await twd.get(".content");
contentDiv.should("not.be.empty");
```

---

## Attribute Assertions

### have.attr

Verifies that an element has a specific attribute with a specific value.

#### Syntax

```ts
element.should("have.attr", attributeName: string, expectedValue: string): TWDElemAPI
```

#### Examples

```ts
// Form attributes
const emailInput = await twd.get("#email");
emailInput.should("have.attr", "type", "email");
emailInput.should("have.attr", "required");
emailInput.should("have.attr", "placeholder", "Enter your email");

// Link attributes
const externalLink = await twd.get("a[href^='https://']");
externalLink.should("have.attr", "target", "_blank");
externalLink.should("have.attr", "rel", "noopener noreferrer");

// Custom data attributes
const userCard = await twd.get(".user-card");
userCard.should("have.attr", "data-user-id", "123");
userCard.should("have.attr", "data-role", "admin");

// Boolean attributes (just check existence)
const requiredField = await twd.get("#required-field");
requiredField.should("have.attr", "required");
```

#### Negation

```ts
const optionalField = await twd.get("#optional-field");
optionalField.should("not.have.attr", "required");

const internalLink = await twd.get("a[href^='/']");
internalLink.should("not.have.attr", "target", "_blank");
```

---

### have.value

Verifies the value of form input elements.

#### Syntax

```ts
element.should("have.value", expectedValue: string): TWDElemAPI
```

#### Examples

```ts
// Input fields
const nameInput = await twd.get("#name");
nameInput.should("have.value", "John Doe");

const emailInput = await twd.get("#email");
emailInput.should("have.value", "john@example.com");

// After user input
const user = userEvent.setup();
const searchInput = await twd.get("#search");
await user.type(searchInput.el, "laptop");
searchInput.should("have.value", "laptop");

// Textarea
const messageArea = await twd.get("textarea#message");
messageArea.should("have.value", "Hello world!");

// Empty values
const clearedInput = await twd.get("#cleared");
clearedInput.should("have.value", "");
```

#### Negation

```ts
const passwordInput = await twd.get("#password");
passwordInput.should("not.have.value", "");
passwordInput.should("not.have.value", "password123");
```

---

### have.class

Verifies that an element has a specific CSS class.

#### Syntax

```ts
element.should("have.class", className: string): TWDElemAPI
```

#### Examples

```ts
// Button states
const primaryButton = await twd.get(".btn");
primaryButton.should("have.class", "btn-primary");
primaryButton.should("have.class", "btn");

// Status indicators
const alert = await twd.get(".alert");
alert.should("have.class", "alert-success");

// Dynamic classes
const activeTab = await twd.get(".tab");
activeTab.should("have.class", "active");

// Multiple class checks
const element = await twd.get(".complex-element");
element.should("have.class", "component");
element.should("have.class", "visible");
element.should("have.class", "interactive");
```

#### Negation

```ts
const button = await twd.get("button");
button.should("not.have.class", "disabled");
button.should("not.have.class", "hidden");

const inactiveTab = await twd.get(".tab:not(.active)");
inactiveTab.should("not.have.class", "active");
```

---

## Element State Assertions

### be.disabled

Verifies that a form element is disabled.

#### Syntax

```ts
element.should("be.disabled"): TWDElemAPI
```

#### Examples

```ts
// Initially disabled submit button
const submitButton = await twd.get("button[type='submit']");
submitButton.should("be.disabled");

// Disabled input field
const readOnlyInput = await twd.get("#readonly");
readOnlyInput.should("be.disabled");

// Conditionally disabled elements
const conditionalButton = await twd.get("#conditional-btn");
conditionalButton.should("be.disabled");

// After form validation fails
const user = userEvent.setup();
const form = await twd.get("form");
await user.click(await twd.get("button[type='submit']"));
submitButton.should("be.disabled");
```

#### Negation

```ts
const enabledButton = await twd.get("button");
enabledButton.should("not.be.disabled");
```

---

### be.enabled

Verifies that a form element is enabled (not disabled).

#### Syntax

```ts
element.should("be.enabled"): TWDElemAPI
```

#### Examples

```ts
// Active form elements
const nameInput = await twd.get("#name");
nameInput.should("be.enabled");

const submitButton = await twd.get("button[type='submit']");
submitButton.should("be.enabled");

// After enabling conditionally
const user = userEvent.setup();
await user.type(await twd.get("#email"), "test@example.com");
const conditionalButton = await twd.get("#conditional-btn");
conditionalButton.should("be.enabled");
```

#### Negation

```ts
const disabledField = await twd.get("#disabled-field");
disabledField.should("not.be.enabled");
```

---

### be.checked

Verifies that a checkbox or radio button is checked.

#### Syntax

```ts
element.should("be.checked"): TWDElemAPI
```

#### Examples

```ts
// Checked checkbox
const agreeCheckbox = await twd.get("#agree-terms");
agreeCheckbox.should("be.checked");

// Selected radio button
const premiumRadio = await twd.get("input[value='premium']");
premiumRadio.should("be.checked");

// After user interaction
const user = userEvent.setup();
const newsletterCheckbox = await twd.get("#newsletter");
await user.click(newsletterCheckbox.el);
newsletterCheckbox.should("be.checked");

// Default selections
const defaultRadio = await twd.get("input[name='plan'][checked]");
defaultRadio.should("be.checked");
```

#### Negation

```ts
const uncheckedBox = await twd.get("#optional-feature");
uncheckedBox.should("not.be.checked");

const unselectedRadio = await twd.get("input[value='basic']");
unselectedRadio.should("not.be.checked");
```

---

### be.selected

Verifies that an option element is selected.

#### Syntax

```ts
element.should("be.selected"): TWDElemAPI
```

#### Examples

```ts
// Default selected option
const defaultOption = await twd.get("select#country option[value='US']");
defaultOption.should("be.selected");

// After user selection
const user = userEvent.setup();
const countrySelect = await twd.get("select#country");
await user.selectOptions(countrySelect.el, "CA");

const canadaOption = await twd.get("select#country option[value='CA']");
canadaOption.should("be.selected");

// Multiple select
const multiSelect = await twd.get("select[multiple]");
await user.selectOptions(multiSelect.el, ["option1", "option3"]);

const option1 = await twd.get("select[multiple] option[value='option1']");
const option3 = await twd.get("select[multiple] option[value='option3']");

option1.should("be.selected");
option3.should("be.selected");
```

#### Negation

```ts
const unselectedOption = await twd.get("select option[value='other']");
unselectedOption.should("not.be.selected");
```

---

### be.focused

Verifies that an element currently has focus.

#### Syntax

```ts
element.should("be.focused"): TWDElemAPI
```

#### Examples

```ts
// Initial focus
const firstInput = await twd.get("#first-input");
firstInput.should("be.focused");

// After tab navigation
const user = userEvent.setup();
await user.keyboard("{Tab}");
const secondInput = await twd.get("#second-input");
secondInput.should("be.focused");

// After clicking
await user.click(await twd.get("#clickable-input"));
const clickedInput = await twd.get("#clickable-input");
clickedInput.should("be.focused");

// Focus management in modals
const modal = await twd.get(".modal");
const modalInput = await twd.get(".modal input");
modalInput.should("be.focused");
```

#### Negation

```ts
const unfocusedInput = await twd.get("#other-input");
unfocusedInput.should("not.be.focused");
```

---

### be.visible

Verifies that an element is visible on the page.

#### Syntax

```ts
element.should("be.visible"): TWDElemAPI
```

#### Examples

```ts
// Always visible elements
const header = await twd.get("header");
header.should("be.visible");

const mainContent = await twd.get("main");
mainContent.should("be.visible");

// Conditionally visible elements
const successMessage = await twd.get(".success-message");
successMessage.should("be.visible");

// After showing modal
const user = userEvent.setup();
const showModalButton = await twd.get("button[data-action='show-modal']");
await user.click(showModalButton.el);

const modal = await twd.get(".modal");
modal.should("be.visible");

// Dynamic content
const loadedContent = await twd.get(".dynamic-content");
loadedContent.should("be.visible");
```

#### Negation

```ts
// Hidden elements
const hiddenDiv = await twd.get(".hidden");
hiddenDiv.should("not.be.visible");

// Closed modal
const closedModal = await twd.get(".modal");
closedModal.should("not.be.visible");

// Loading spinner after load
const spinner = await twd.get(".loading-spinner");
await twd.wait(2000);
spinner.should("not.be.visible");
```

---

## URL Assertions

### eq (URL)

Verifies that the current URL matches exactly.

#### Syntax

```ts
twd.url().should("eq", expectedUrl: string): URLCommandAPI
```

#### Examples

```ts
// Exact URL matching
twd.visit("/");
twd.url().should("eq", "http://localhost:3000/");

twd.visit("/products");
twd.url().should("eq", "http://localhost:3000/products");

// With query parameters
twd.visit("/search?q=laptop&sort=price");
twd.url().should("eq", "http://localhost:3000/search?q=laptop&sort=price");

// After navigation
const user = userEvent.setup();
const loginLink = await twd.get("a[href='/login']");
await user.click(loginLink.el);
twd.url().should("eq", "http://localhost:3000/login");
```

#### Negation

```ts
twd.url().should("not.eq", "http://localhost:3000/wrong-page");
```

---

### contain.url

Verifies that the current URL contains a substring.

#### Syntax

```ts
twd.url().should("contain.url", substring: string): URLCommandAPI
```

#### Examples

```ts
// Path matching
twd.visit("/products/category/electronics");
twd.url().should("contain.url", "/products");
twd.url().should("contain.url", "electronics");
twd.url().should("contain.url", "category");

// Domain matching
twd.url().should("contain.url", "localhost");
twd.url().should("contain.url", "3000");

// Query parameters
twd.visit("/search?q=laptop");
twd.url().should("contain.url", "q=laptop");
twd.url().should("contain.url", "search");

// After navigation
const categoryLink = await twd.get("a[href*='clothing']");
await userEvent.click(categoryLink.el);
twd.url().should("contain.url", "clothing");
```

#### Negation

```ts
twd.url().should("not.contain.url", "/admin");
twd.url().should("not.contain.url", "error");
```

---

## Assertion Chaining

All assertions return the element API, allowing you to chain multiple assertions:

```ts
const element = await twd.get("button");

// Chain multiple assertions
element
  .should("be.visible")
  .should("be.enabled")
  .should("have.class", "btn-primary")
  .should("contain.text", "Submit")
  .should("not.be.disabled");

// Complex form validation
const emailInput = await twd.get("#email");
emailInput
  .should("have.attr", "type", "email")
  .should("have.attr", "required")
  .should("be.enabled")
  .should("be.visible")
  .should("not.have.value", "");
```

## Practical Examples

### Form Validation

```ts
describe("Form Validation", () => {
  it("should validate required fields", async () => {
    twd.visit("/contact");

    const user = userEvent.setup();
    const submitButton = await twd.get("button[type='submit']");
    
    // Submit empty form
    await user.click(submitButton.el);

    // Check validation errors
    const emailError = await twd.get(".error-email");
    emailError
      .should("be.visible")
      .should("contain.text", "required")
      .should("have.class", "error-message");

    const messageError = await twd.get(".error-message");
    messageError
      .should("be.visible")
      .should("not.be.empty");

    // Fix one error
    const emailInput = await twd.get("#email");
    await user.type(emailInput.el, "test@example.com");

    emailInput.should("have.value", "test@example.com");
    emailError.should("not.be.visible");
  });
});
```

### Shopping Cart State

```ts
describe("Shopping Cart", () => {
  it("should update cart state correctly", async () => {
    twd.visit("/products");

    // Initial empty state
    const cartCount = await twd.get(".cart-count");
    cartCount
      .should("have.text", "0")
      .should("be.visible");

    const emptyMessage = await twd.get(".cart-empty");
    emptyMessage
      .should("be.visible")
      .should("contain.text", "empty");

    // Add item to cart
    const addButton = await twd.get("button[data-product='123']");
    await userEvent.click(addButton.el);

    // Verify cart updates
    cartCount
      .should("have.text", "1")
      .should("not.have.text", "0");

    emptyMessage.should("not.be.visible");

    const cartItem = await twd.get(".cart-item");
    cartItem
      .should("be.visible")
      .should("have.attr", "data-product", "123")
      .should("contain.text", "Product Name");
  });
});
```

### Modal Dialog

```ts
describe("Modal Dialog", () => {
  it("should handle modal state transitions", async () => {
    twd.visit("/modal-example");

    const modal = await twd.get(".modal");
    const overlay = await twd.get(".modal-overlay");
    const showButton = await twd.get("button[data-action='show-modal']");

    // Initial hidden state
    modal.should("not.be.visible");
    overlay.should("not.be.visible");
    showButton.should("be.visible").should("be.enabled");

    // Show modal
    await userEvent.click(showButton.el);

    modal
      .should("be.visible")
      .should("have.class", "modal-open");

    overlay.should("be.visible");

    // Focus management
    const modalInput = await twd.get(".modal input");
    modalInput.should("be.focused");

    // Close modal
    const closeButton = await twd.get(".modal button[data-action='close']");
    closeButton
      .should("be.visible")
      .should("be.enabled");

    await userEvent.click(closeButton.el);

    modal.should("not.be.visible");
    overlay.should("not.be.visible");
    showButton.should("be.focused"); // Focus returns
  });
});
```

## Best Practices

### 1. Use Appropriate Assertion Types

```ts
// ✅ Good - Right assertion for the job
element.should("contain.text", "Welcome"); // Partial match
element.should("have.value", "exact@email.com"); // Exact value
element.should("be.checked"); // Boolean state

// ❌ Wrong assertion type
element.should("have.text", "Welcome to our amazing website with lots of features!"); // Too specific
element.should("contain.text", "exact@email.com"); // Should be exact match
```

### 2. Chain Related Assertions

```ts
// ✅ Good - Logical grouping
const button = await twd.get("button");
button
  .should("be.visible")
  .should("be.enabled")
  .should("have.class", "btn-primary");

// ❌ Repetitive
const button = await twd.get("button");
button.should("be.visible");
button.should("be.enabled");
button.should("have.class", "btn-primary");
```

### 3. Test User-Visible Behavior

```ts
// ✅ Good - Tests what users see
const errorMessage = await twd.get(".error-message");
errorMessage
  .should("be.visible")
  .should("contain.text", "Invalid email")
  .should("have.class", "error");

// ❌ Implementation details
element.should("have.attr", "data-error-state", "true");
```

### 4. Use Negation Appropriately

```ts
// ✅ Good - Clear intent
const modal = await twd.get(".modal");
modal.should("not.be.visible");

const button = await twd.get("button");
button.should("not.be.disabled");

// ✅ Also good - Positive assertion when clearer
button.should("be.enabled"); // Clearer than "not.be.disabled"
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

// Issue: Timing problems
// ❌ Element might not be ready
const element = await twd.get(".async-content");
element.should("be.visible");

// ✅ Wait for content to load
await twd.wait(1000);
const element = await twd.get(".async-content");
element.should("be.visible");
```

### Element State Issues

```ts
// Issue: Element appears but isn't interactive yet
const button = await twd.get("button");
button.should("be.visible"); // ✅ Passes
button.should("be.enabled"); // ❌ Might fail if still loading

// Solution: Wait for interactive state
await twd.wait(500); // Wait for initialization
button.should("be.enabled");

// Or check loading states
const spinner = await twd.get(".loading");
spinner.should("not.be.visible"); // Wait for loading to complete
button.should("be.enabled");
```

## Next Steps

- Explore [TWD Commands](/api/twd-commands) for element selection
- Check [Test Functions](/api/test-functions) for organizing tests
