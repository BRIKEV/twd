# API Reference

Complete reference documentation for all TWD functions, methods, and types.

## Quick Navigation

| Section | Description |
|---------|-------------|
| [Test Functions](/api/test-functions) | `describe`, `it`, `beforeEach`, `it.only`, `it.skip`, `afterEach` |
| [TWD Commands](/api/twd-commands) | `twd.get()`, `twd.visit()`, `twd.mockRequest()`, etc. |
| [Assertions](/api/assertions) | All available assertions and their usage |

## Import Reference

```ts
// Main imports
import { 
  describe, 
  it, 
  beforeEach, 
  afterEach,
  twd, 
  userEvent,
  expect
} from "twd-js";

// UI Component (for React apps)
import { TWDSidebar } from "twd-js";

// Vite Plugin (for production builds)
import { removeMockServiceWorker } from "twd-js";

// CI Integration (for test execution)
import { reportResults } from "twd-js";

// TWDSidebar props:
//   open?: boolean        // Whether the sidebar is open by default (default: true)
//   position?: "left" | "right" // Sidebar position (default: "left")
```

## Type Definitions

### Element API

```ts
interface TWDElemAPI {
  el: Element; // The raw DOM element
  should: ShouldFn; // Assertion function
}
```

### Assertion Types

```ts
type AssertionName = 
  | "have.text"
  | "contain.text" 
  | "be.empty"
  | "have.attr"
  | "have.value"
  | "be.disabled"
  | "be.enabled"
  | "be.checked"
  | "be.selected"
  | "be.focused"
  | "be.visible"
  | "have.class";

type AnyAssertion = AssertionName | `not.${AssertionName}`;
```

### Mock Request Types

```ts
interface Options {
  method: string;
  url: string | RegExp;
  response: unknown;
  status?: number;
  headers?: Record<string, string>;
}

interface Rule {
  method: string;
  url: string | RegExp;
  response: unknown;
  alias: string;
  executed?: boolean;
  request?: unknown;
  status?: number;
  headers?: Record<string, string>;
}
```

## Core Concepts

### Test Structure

TWD follows familiar testing patterns:

```ts
describe("Test Suite", () => {
  beforeEach(() => {
    // Setup before each test
  });

  it("should do something", async () => {
    // Test implementation
  });

  it.only("focused test", async () => {
    // Only this test runs
  });

  it.skip("skipped test", async () => {
    // This test is skipped
  });
});
```

### Element Selection and Interaction

```ts
// Select elements
const element = await twd.get("selector");
const elements = await twd.getAll("selector");

// Make assertions
element.should("assertion", ...args);

// User interactions
const user = userEvent.setup();
await user.click(element.el);
await user.type(element.el, "text");
```

### API Mocking

```ts
// Mock requests
await twd.mockRequest("alias", {
  method: "GET",
  url: "/api/endpoint",
  response: { data: "value" }
});

// Wait for requests
const rule = await twd.waitForRequest("alias");
const rules = await twd.waitForRequests(["alias1", "alias2"]);

// Clean up
twd.clearRequestMockRules();
```

### Best Practices

1. **Use data attributes** for reliable element selection
2. **Clean up mocks** after each test
3. **Wait appropriately** for async operations
4. **Be specific** with assertions
5. **Test user workflows** rather than implementation details

## Browser Compatibility

TWD works in all modern browsers that support:
- ES2020+ features
- Service Workers (for API mocking)
- DOM APIs
- Async/await

### Supported Browsers

- Chrome 80+
- Firefox 72+
- Safari 13.1+
- Edge 80+

## Performance Considerations

- Element queries use `document.querySelector` internally
- Service Worker mocking adds minimal overhead
- Tests run in the main thread (no web workers)
- Tests are not included in the bundle, so they are not included in the bundle size.

## Debugging

### Browser DevTools

- Use browser DevTools to inspect elements
- Check Network tab for mocked requests
- Console logs show TWD operations
- Check sidebar for logs and mock rules

### Common Debug Patterns

```ts
// Log element details
const element = await twd.get("selector");
console.log("Element:", element.el);
console.log("Text content:", element.el.textContent);

// Log mock rules
console.log("Active mocks:", twd.getRequestMockRules());

// Add debug waits
await twd.wait(1000); // Pause to inspect state
```

## Migration Guide

### From Other Testing Libraries

#### From Cypress

```ts
// Cypress
cy.get('[data-testid="button"]').click();
cy.get('[data-testid="message"]').should('contain', 'Success');

// TWD
const button = await twd.get('[data-testid="button"]');
await userEvent.click(button.el);
const message = await twd.get('[data-testid="message"]');
message.should('contain.text', 'Success');
```

#### From Testing Library

```ts
// Testing Library
const button = screen.getByTestId('button');
fireEvent.click(button);
expect(screen.getByTestId('message')).toHaveTextContent('Success');

// TWD
const button = await twd.get('[data-testid="button"]');
await userEvent.click(button.el);
const message = await twd.get('[data-testid="message"]');
message.should('contain.text', 'Success');
```

## Vite Plugin

### removeMockServiceWorker()

Vite plugin that removes the mock service worker file from production builds. This ensures your production bundle doesn't include testing infrastructure.

#### Syntax

```ts
import { removeMockServiceWorker } from "twd-js";
```

#### Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { removeMockServiceWorker } from 'twd-js';

export default defineConfig({
  plugins: [
    // ... other plugins
    removeMockServiceWorker()
  ]
});
```

#### What it does

- **Build-time cleanup**: Automatically removes `mock-sw.js` from the `dist` folder
- **Production-safe**: Only runs during build (`apply: 'build'`)
- **Zero configuration**: Works out of the box with standard Vite setups
- **Logging**: Provides feedback about file removal

#### Example Output

```bash
# During build
🧹 Removed mock-sw.js from build

# If no mock file found
🧹 No mock-sw.js found in build
```

---

## CI Integration

### reportResults(handlers, testStatus)

Formats and displays test results in a readable format with colored output.

#### Syntax

```ts
reportResults(handlers: Handler[], testStatus: TestResult[]): void
```

#### Parameters

- **handlers** (`Handler[]`) - Test handlers from `executeTests()`
- **testStatus** (`TestResult[]`) - Test results from `executeTests()`

#### Usage

```ts
import { executeTests, reportResults } from "twd-js";

// Complete CI workflow
const { handlers, testStatus } = await executeTests();
reportResults(handlers, testStatus);

// Exit with appropriate code
const hasFailures = testStatus.some(t => t.status === 'fail');
process.exit(hasFailures ? 1 : 0);
```

#### Example Output

```bash
User Authentication
  ✓ should login with valid credentials
  ✓ should logout successfully
  ✗ should handle invalid credentials
    - Error: Expected element to contain text "Invalid credentials"

Shopping Cart
  ✓ should add items to cart
  ○ should remove items from cart (skipped)
```

#### Output Format

- **✓** Green checkmark for passed tests
- **✗** Red X for failed tests  
- **○** Yellow circle for skipped tests
- **Error details** shown below failed tests
- **Hierarchical structure** matches your test organization

---

## Contributing

- 📖 [View source code](https://github.com/BRIKEV/twd)
- 🐛 [Report issues](https://github.com/BRIKEV/twd/issues)
- 💡 [Request features](https://github.com/BRIKEV/twd/discussions)
- 🔄 [Submit pull requests](https://github.com/BRIKEV/twd/pulls)
