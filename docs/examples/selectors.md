# Selectors

Learn how to effectively select DOM elements in your TWD tests using various selector strategies.

## Basic Selectors

### By Tag Name

```ts
// Select by HTML tag
const button = await twd.get("button");
const input = await twd.get("input");
const form = await twd.get("form");
```

### By ID

```ts
// Select by ID attribute
const emailInput = await twd.get("#email");
const submitButton = await twd.get("#submit-btn");
const errorMessage = await twd.get("#error-msg");
```

### By Class Name

```ts
// Select by CSS class
const errorMessage = await twd.get(".error-message");
const successAlert = await twd.get(".alert-success");
const cardComponent = await twd.get(".card");

// Multiple classes
const primaryButton = await twd.get(".btn.btn-primary");
```

## Attribute Selectors

### Data Attributes (Recommended)

```ts
// Using data-testid (best practice)
const userCard = await twd.get("[data-testid='user-card']");
const loadButton = await twd.get("[data-testid='load-more']");
const modalDialog = await twd.get("[data-testid='confirmation-modal']");

// Other data attributes
const productId = await twd.get("[data-product-id='123']");
const userId = await twd.get("[data-user='john-doe']");
```

### Form Attributes

```ts
// By input type
const emailInput = await twd.get("input[type='email']");
const passwordInput = await twd.get("input[type='password']");
const submitButton = await twd.get("button[type='submit']");

// By name attribute
const usernameField = await twd.get("input[name='username']");
const messageField = await twd.get("textarea[name='message']");

// By placeholder
const searchInput = await twd.get("input[placeholder='Search products...']");
```

## Complex Selectors

### Descendant Selectors

```ts
// Child elements
const firstListItem = await twd.get("ul > li:first-child");
const lastTableRow = await twd.get("table > tbody > tr:last-child");

// Descendant elements
const cardTitle = await twd.get(".card h3");
const formInput = await twd.get("form input[type='email']");
```

### Pseudo-selectors

```ts
// First/last child
const firstProduct = await twd.get(".product-list .product:first-child");
const lastProduct = await twd.get(".product-list .product:last-child");

// Nth child
const thirdItem = await twd.get("ul li:nth-child(3)");
const evenRows = await twd.getAll("table tr:nth-child(even)");

// Contains text
const linkWithText = await twd.get("a:contains('Learn More')");
```

## Multiple Element Selection

### Getting All Elements

```ts
// Get all matching elements
const allButtons = await twd.getAll("button");
const allInputs = await twd.getAll("input");
const allProducts = await twd.getAll(".product-card");

// Access specific elements
allButtons[0].should("be.visible"); // First button
allButtons[allButtons.length - 1].should("be.enabled"); // Last button

// Check array length
expect(allProducts).to.have.length(10);
```

### Filtering Results

```ts
// Get all, then filter in test logic
const allCards = await twd.getAll(".card");

// Test each card
for (let i = 0; i < allCards.length; i++) {
  allCards[i].should("be.visible");
  allCards[i].should("have.class", "card");
}

// Test specific cards
allCards[0].should("contain.text", "Featured Product");
allCards[2].should("have.attr", "data-product-id", "123");
```

## Practical Examples

### E-commerce Product Grid

```ts
describe("Product Grid", () => {
  it("should display all products", async () => {
    twd.visit("/products");

    // Get all product cards
    const products = await twd.getAll(".product-card");
    expect(products).to.have.length.greaterThan(0);

    // Check first product structure
    const firstProduct = products[0];
    const productImage = await twd.get(".product-card:first-child img");
    const productTitle = await twd.get(".product-card:first-child h3");
    const productPrice = await twd.get(".product-card:first-child .price");

    productImage.should("be.visible");
    productTitle.should("be.visible");
    productPrice.should("be.visible");
  });
});
```

### Navigation Menu

```ts
describe("Navigation", () => {
  it("should have working navigation links", async () => {
    twd.visit("/");

    // Test main navigation
    const homeLink = await twd.get("nav a[href='/']");
    const productsLink = await twd.get("nav a[href='/products']");
    const aboutLink = await twd.get("nav a[href='/about']");

    homeLink.should("be.visible").should("contain.text", "Home");
    productsLink.should("be.visible").should("contain.text", "Products");
    aboutLink.should("be.visible").should("contain.text", "About");

    // Test dropdown menu
    const userMenu = await twd.get("[data-testid='user-menu-trigger']");
    await userEvent.click(userMenu.el);

    const profileLink = await twd.get("[data-testid='profile-link']");
    const logoutLink = await twd.get("[data-testid='logout-link']");

    profileLink.should("be.visible");
    logoutLink.should("be.visible");
  });
});
```

### Form Elements

```ts
describe("Contact Form", () => {
  it("should have all required form fields", async () => {
    twd.visit("/contact");

    // Required fields
    const nameInput = await twd.get("input[name='name']");
    const emailInput = await twd.get("input[name='email']");
    const messageTextarea = await twd.get("textarea[name='message']");
    const submitButton = await twd.get("button[type='submit']");

    // Check field attributes
    nameInput.should("have.attr", "required");
    emailInput.should("have.attr", "type", "email");
    messageTextarea.should("have.attr", "rows", "5");
    submitButton.should("contain.text", "Send Message");

    // Optional fields
    const phoneInput = await twd.get("input[name='phone']");
    const companyInput = await twd.get("input[name='company']");

    phoneInput.should("not.have.attr", "required");
    companyInput.should("not.have.attr", "required");
  });
});
```

## Best Practices

### 1. Use Data Attributes

```ts
// ✅ Good - Stable and semantic
const deleteButton = await twd.get("[data-testid='delete-user-btn']");
const userCard = await twd.get("[data-testid='user-card-123']");

// ❌ Avoid - Fragile and implementation-dependent
const deleteButton = await twd.get(".btn.btn-danger.small");
const userCard = await twd.get("div:nth-child(3) > div.card");
```

### 2. Be Specific When Needed

```ts
// ✅ Good - Specific context
const modalCloseButton = await twd.get(".modal button[aria-label='Close']");
const formSubmitButton = await twd.get("form button[type='submit']");

// ❌ Too generic - Could match wrong element
const closeButton = await twd.get("button");
const submitButton = await twd.get("button");
```

### 3. Use Semantic Selectors

```ts
// ✅ Good - Semantic and accessible
const mainHeading = await twd.get("h1");
const navigationMenu = await twd.get("nav ul");
const searchLandmark = await twd.get("[role='search']");

// ✅ Also good - ARIA labels
const menuButton = await twd.get("button[aria-label='Open menu']");
const closeDialog = await twd.get("button[aria-label='Close dialog']");
```

### 4. Handle Dynamic Content

```ts
// ✅ Good - Wait for dynamic content
const dynamicList = await twd.get("[data-testid='dynamic-list']");
const listItems = await twd.getAll("[data-testid='list-item']");

// Check that items loaded
expect(listItems).to.have.length.greaterThan(0);

// ✅ Good - Use specific selectors for generated content
const generatedId = "user-123";
const userElement = await twd.get(`[data-user-id='${generatedId}']`);
```

## Common Patterns

### Waiting for Elements

```ts
// Element that appears after loading
const loadingSpinner = await twd.get(".loading-spinner");
loadingSpinner.should("be.visible");

// Wait for content to load
await twd.wait(1000);

const content = await twd.get(".content");
content.should("be.visible");

const spinner = await twd.get(".loading-spinner");
spinner.should("not.be.visible");
```

### Conditional Elements

```ts
// Check if element exists conditionally
describe("Admin Features", () => {
  it("should show admin panel for admin users", async () => {
    // Set admin role
    localStorage.setItem("userRole", "admin");
    
    twd.visit("/dashboard");

    // Admin-only elements
    const adminPanel = await twd.get("[data-testid='admin-panel']");
    const userManagement = await twd.get("[data-testid='user-management']");

    adminPanel.should("be.visible");
    userManagement.should("be.visible");
  });

  it("should hide admin panel for regular users", async () => {
    // Set regular user role
    localStorage.setItem("userRole", "user");
    
    twd.visit("/dashboard");

    // Admin panel should not exist
    const adminPanels = await twd.getAll("[data-testid='admin-panel']");
    expect(adminPanels).to.have.length(0);
  });
});
```

## Troubleshooting

### Multiple Matches

```ts
// ❌ Ambiguous - might select wrong button
const button = await twd.get("button");

// ✅ Better - Be more specific
const submitButton = await twd.get("button[type='submit']");
const cancelButton = await twd.get("button[data-action='cancel']");
```

### Dynamic IDs

```ts
// ❌ Fragile - ID might change
const element = await twd.get("#user-12345");

// ✅ Better - Use data attributes or classes
const element = await twd.get("[data-user-id='12345']");
const element = await twd.get(".user-card[data-id='12345']");
```

## Next Steps

- Learn about [Assertions](/examples/assertions) to test element states
- Explore [User Events](/examples/user-events) for interacting with selected elements
- Check [API Mocking](/examples/mocking) for testing dynamic content
