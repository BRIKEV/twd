# Getting Started

Welcome to TWD (Test While Developing)! This guide will help you set up TWD in your React application and write your first test.

## Installation

Install TWD using your preferred package manager:

::: code-group

```bash [npm]
npm install twd-js
```

```bash [yarn]
yarn add twd-js
```

```bash [pnpm]
pnpm add twd-js
```

:::

## Quick Setup

### 1. Add TWD Sidebar to Your App

Add the TWD sidebar component to your main React entry point:

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { TWDSidebar } from "twd-js";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <TWDSidebar />
  </StrictMode>
);
```

### 2. Set Up Mock Service Worker (Optional)

If you plan to use API mocking, set up the mock service worker:

```bash
npx twd-js init public
```

This copies the required `mock-sw.js` file to your public directory.

### 3. Create a Test Loader

Create a file to automatically load your tests:

```ts
// src/loadTests.ts
import { twd } from "twd-js";

// Auto-discover test files (with Vite)
import.meta.glob("./**/*.twd.test.ts", { eager: true });

// Initialize request mocking (if using API mocking)
twd
  .initRequestMocking()
  .then(() => {
    console.log("Request mocking initialized");
  })
  .catch((err) => {
    console.error("Error initializing request mocking:", err);
  });
```

Then import it in your main entry:

```tsx
// src/main.tsx
import "./loadTests"; // Add this line
import { StrictMode } from "react";
// ... rest of your imports
```

### 4. Write Your First Test

Create your first test file:

```ts
// src/App.twd.test.ts
import { describe, it, twd, userEvent } from "twd-js";

describe("App Component", () => {
  it("should render the main heading", async () => {
    twd.visit("/");
    
    const heading = await twd.get("h1");
    heading.should("be.visible");
  });

  it("should handle button clicks", async () => {
    twd.visit("/");
    
    const user = userEvent.setup();
    const button = await twd.get("button");
    
    await user.click(button.el);
    
    // Add your assertions here
    const result = await twd.get("#result");
    result.should("have.text", "Button clicked!");
  });
});
```

### 5. Run Your App

Start your development server as usual:

```bash
npm run dev
```

You should now see the TWD sidebar in your browser. Click on it to view and run your tests!

## File Naming Convention

We recommend naming your test files using the following patterns:

- `*.twd.test.ts`
- `*.twd.test.tsx`  
- `*.twd.test.js`
- `*.twd.test.jsx`

You can customize this pattern in your test loader using different glob patterns.

## Development Workflow

1. **Write tests** alongside your components
2. **Run tests** using the browser sidebar
3. **See instant feedback** as you develop
4. **Mock APIs** for integration testing
5. **Iterate quickly** with live reloading

## Next Steps

- Learn about [Writing Tests](/writing-tests) in detail
- Explore [API Mocking](/api-mocking) capabilities  
- Check out [Examples](/examples/) for common patterns
- Browse the [API Reference](/api/) for all available methods

## Troubleshooting

### Tests Not Loading

Make sure you:
1. Imported your test loader in `main.tsx`
2. Used the correct file naming pattern (`.twd.test.ts`)
3. Have the TWD sidebar component added to your app

### Mock Service Worker Issues

If API mocking isn't working:
1. Run `npx twd-js init public` to install the service worker
2. Make sure you called `twd.initRequestMocking()` in your test loader
3. Check the browser console for service worker registration errors

## Getting Help

- 📖 [Browse the documentation](/api/)
- 🐛 [Report issues](https://github.com/BRIKEV/twd/issues)
- 💬 [Join discussions](https://github.com/BRIKEV/twd/discussions)
