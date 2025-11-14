# TWD

[![CI](https://github.com/BRIKEV/twd/actions/workflows/ci.yml/badge.svg)](https://github.com/BRIKEV/twd/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/twd-js.svg)](https://www.npmjs.com/package/twd-js)
[![license](https://img.shields.io/github/license/brikev/twd.svg)](./LICENSE)
[![Maintainability](https://qlty.sh/gh/BRIKEV/projects/twd/maintainability.svg)](https://qlty.sh/gh/BRIKEV/projects/twd)
[![Code Coverage](https://qlty.sh/gh/BRIKEV/projects/twd/coverage.svg)](https://qlty.sh/gh/BRIKEV/projects/twd)

<p>
  <img src="./images/logo_full_sized.png" alt="TWD Logo" width="400">
</p>

TWD (Testing Web Development) is a library designed to seamlessly integrate testing into your web development workflow. It streamlines the process of writing, running, and managing tests directly in your application, with a modern UI and powerful mocking capabilities.

**📖 [Full Documentation](https://brikev.github.io/twd/) | 🚀 [Getting Started](https://brikev.github.io/twd/getting-started) | 📚 [API Reference](https://brikev.github.io/twd/api/)**

## Features

- 🧪 **In-browser test runner** with a beautiful sidebar UI
- ⚡ **Instant feedback** as you develop
- 🔥 **Mock Service Worker** integration for API/request mocking
- 📝 **Simple, readable test syntax** (inspired by popular test frameworks)
- 🧩 **Automatic test discovery** with Vite support
- 🎯 **Testing Library support** - Use `screenDom` for semantic, accessible queries
- 🛠️ **Works with React** (support for more frameworks coming)

## Installation

```bash
npm install twd-js
# or
yarn add twd-js
# or
pnpm add twd-js
```

## Quick Start

1. **Add TWD to your React app:**

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

if (import.meta.env.DEV) {
  const testModules = import.meta.glob("./**/*.twd.test.ts");
  const { initTests, twd, TWDSidebar } = await import('twd-js');
  initTests(testModules, <TWDSidebar open={true} position="left" />, createRoot);
  twd.initRequestMocking().catch(console.error);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode><App /></StrictMode>
);
```

2. **Write your first test:**

```ts
// src/app.twd.test.ts
import { twd, userEvent, screenDom } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("Hello World Page", () => {
  it("should display the welcome title and counter button", async () => {
    await twd.visit("/");
    
    // Option 1: Use TWD's native selectors
    const title = await twd.get("h1");
    title.should("be.visible").should("have.text", "Welcome to TWD");
    
    const counterButton = await twd.get("button");
    counterButton.should("be.visible").should("have.text", "Count is 0");
    
    const user = userEvent.setup();
    await user.click(counterButton.el);
    counterButton.should("have.text", "Count is 1");
    
    // Option 2: Use Testing Library queries (semantic, accessible)
    // const title = screenDom.getByRole("heading", { name: /welcome to twd/i });
    // twd.should(title, "be.visible");
    // twd.should(title, "have.text", "Welcome to TWD");
    // 
    // const counterButton = screenDom.getByRole("button", { name: /count is/i });
    // twd.should(counterButton, "be.visible");
    // await user.click(counterButton);
    // twd.should(counterButton, "have.text", "Count is 1");
  });
});
```

3. **Run your app** - The TWD sidebar will appear automatically in development mode!

<p align="center">
  <img src="./images/twd_side_bar_success.png" alt="TWD Sidebar in action" width="800">
</p>

## Key Concepts

### Element Selection

TWD supports two approaches:

**Native Selectors:**
```ts
const button = await twd.get("button");
button.should("be.visible");
```

**Testing Library Queries:**
```ts
const button = screenDom.getByRole("button", { name: /submit/i });
twd.should(button, "be.visible");
```

### User Interactions

```ts
const user = userEvent.setup();
await user.click(button);
await user.type(input, "Hello World");
```

### API Mocking

```ts
twd.mockRequest("getUser", {
  method: "GET",
  url: "/api/user",
  response: { id: 1, name: "John" }
});

const rule = await twd.waitForRequest("getUser");
```

## Learn More

- 📖 **[Full Documentation](https://brikev.github.io/twd/)** - Complete guides and tutorials
- 🎯 **[Writing Tests](https://brikev.github.io/twd/writing-tests)** - Learn how to write effective tests
- 🔥 **[API Mocking](https://brikev.github.io/twd/api-mocking)** - Mock API requests in your tests
- 📚 **[API Reference](https://brikev.github.io/twd/api/)** - Complete API documentation
- 🧪 **[Testing Library Support](https://brikev.github.io/twd/api/react-testing-library)** - Use semantic queries

## Examples

Check out the [examples directory](https://github.com/BRIKEV/twd/tree/main/examples) for complete working examples.

## Contributing

Contributions are welcome! Please open issues or pull requests on [GitHub](https://github.com/BRIKEV/twd).

## License

This project is licensed under the [MIT License](./LICENSE).
