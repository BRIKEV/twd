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

**VIDEO HERE** - *Step-by-step setup walkthrough from installation to first test*


### 1. Add TWD Sidebar and Load Tests Automatically

To enable the TWD sidebar and automatically load your tests, use the `initTests` utility in your main entry file. This is the standard way to set up TWD in your application: the sidebar will be injected and tests loaded automatically in development mode.

**IMAGE HERE** - *Screenshot showing main.tsx file with the new TWD loader usage*

```tsx{7-23}
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Only load the test sidebar and tests in development mode
if (import.meta.env.DEV) {
  // Use Vite's glob import to find all test files
  const testModules = import.meta.glob("./**/*.twd.test.ts");
  const { initTests, twd, TWDSidebar } = await import('twd-js');
  // You need to pass the test modules, the sidebar component, and createRoot function
  initTests(testModules, <TWDSidebar open={true} position="left" />, createRoot);
  // Optionally initialize request mocking
  twd.initRequestMocking()
    .then(() => {
      console.log("Request mocking initialized");
    })
    .catch((err) => {
      console.error("Error initializing request mocking:", err);
    });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

### 2. Set Up Mock Service Worker (Optional)

If you plan to use API mocking, set up the mock service worker:

```bash
npx twd-js init public
```

This copies the required `mock-sw.js` file to your public directory.

### 3. Write Your First Test

Create your first test file:

```ts
// src/App.twd.test.ts
import { describe, it, twd, userEvent } from "twd-js";

describe("App Component", () => {
  it("should render the main heading", async () => {
    await twd.visit("/");
    
    const heading = await twd.get("h1");
    heading.should("be.visible");
  });

  it("should handle button clicks", async () => {
    await twd.visit("/");
    
    const user = userEvent.setup();
    const button = await twd.get("button");
    
    await user.click(button.el);
    
    // Add your assertions here
    const result = await twd.get("#result");
    result.should("have.text", "Button clicked!");
  });
});
```

### 4. Run Your App

Start your development server as usual:

```bash
npm run dev
```

You should now see the TWD sidebar in your browser automatically in development mode. Click on it to view and run your tests!

**IMAGE HERE** - *Screenshot of browser showing the TWD sidebar closed*

**IMAGE HERE** - *Screenshot of browser showing the TWD sidebar open with test results*


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
- Follow the [Tutorial](/tutorial/) for step-by-step learning
- Browse the [API Reference](/api/) for all available methods

## Troubleshooting


### Tests Not Loading

Make sure you:
1. Are running in development mode (`import.meta.env.DEV` is true)
2. Used the correct file naming pattern (`.twd.test.ts`)
3. Have the `initTests` logic in your main entry file

### Mock Service Worker Issues

If API mocking isn't working:
1. Run `npx twd-js init public` to install the service worker
2. Make sure you called `twd.initRequestMocking()` in your main entry file (inside the `import.meta.env.DEV` block)
3. Check the browser console for service worker registration errors

## Getting Help

- 📖 [Browse the documentation](/api/)
- 🐛 [Report issues](https://github.com/BRIKEV/twd/issues)
- 💬 [Join discussions](https://github.com/BRIKEV/twd/discussions)
