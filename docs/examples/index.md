# Examples

This section provides practical examples of using TWD for different testing scenarios. Each example demonstrates real-world patterns you can adapt for your own applications.

## Quick Navigation

| Category | Description | Examples |
|----------|-------------|----------|
| [Selectors](/examples/selectors) | Element selection strategies | CSS selectors, data attributes, complex queries |
| [Assertions](/examples/assertions) | Testing element states | Text content, attributes, visibility, form states |
| [API Mocking](/examples/mocking) | Request/response testing | GET/POST requests, error handling, dynamic responses |
| [User Events](/examples/user-events) | User interaction testing | Forms, clicks, keyboard input, file uploads |

## Example Application

All examples are based on a sample e-commerce application with these features:

- **User authentication** (login/register)
- **Product catalog** (search, filter, details)
- **Shopping cart** (add/remove items)
- **Checkout process** (forms, payment)
- **User profile** (settings, order history)

## Getting Started with Examples

Each example page includes:

- 📋 **Complete test code** - Copy-paste ready examples
- 🎯 **Specific use cases** - Real scenarios you'll encounter
- 💡 **Best practices** - Tips for writing maintainable tests
- 🔧 **Troubleshooting** - Common issues and solutions

## Example Structure

```ts
// Typical example structure
import { describe, it, twd, userEvent } from "twd-js";

describe("Feature Name", () => {
  beforeEach(() => {
    // Setup code
  });

  it("should handle specific scenario", async () => {
    // 1. Setup/navigation
    twd.visit("/page");
    
    // 2. User interactions
    const user = userEvent.setup();
    // ... interactions
    
    // 3. Assertions
    const element = await twd.get("selector");
    element.should("assertion", "value");
  });
});
```

## Contributing Examples

Found a useful pattern not covered here? We'd love to add it! 

- 🐛 [Report missing examples](https://github.com/BRIKEV/twd/issues)
- 💡 [Suggest new examples](https://github.com/BRIKEV/twd/discussions)
- 🔄 [Submit a pull request](https://github.com/BRIKEV/twd/pulls)

## Next Steps

Start with the examples most relevant to your testing needs:

- New to TWD? Start with [Selectors](/examples/selectors)
- Testing forms? Check out [User Events](/examples/user-events)
- Need API testing? Explore [API Mocking](/examples/mocking)
- Want comprehensive assertions? See [Assertions](/examples/assertions)
