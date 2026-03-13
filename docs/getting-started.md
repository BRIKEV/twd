---
title: Getting Started
description: Install TWD and write your first in-browser test for React, Vue, Angular, or Solid.js apps
---

# Getting Started

Welcome to TWD (Test While Developing)! This guide will help you set up TWD in your application and write your first test. TWD is a deterministic browser validation layer for your frontend boundaries. It works with React, Vue, Angular, Solid.js, React Router (client-side and SSR with explicit loaders/actions), and other Vite-based frameworks.

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

### 1. Bundled Setup

The bundled setup works with all supported frameworks (React, Vue, Angular, Solid.js). It handles React dependencies internally and automatically initializes request mocking, keeping your main entry file clean and simple.

```tsx{7-20}
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Only load the test sidebar and tests in development mode
if (import.meta.env.DEV) {
  const { initTWD } = await import('twd-js/bundled');
  const tests = import.meta.glob("./**/*.twd.test.ts");
  
  // Initialize TWD with tests and optional configuration
  // Request mocking is automatically initialized by default
  initTWD(tests, {
    open: true,
    position: 'left',
    search: true,                   // Enable search/filter in the sidebar (default: false)
    serviceWorker: true,            // Enable request mocking (default: true)
    serviceWorkerUrl: '/mock-sw.js' // Custom service worker path (default: '/mock-sw.js')
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

### 2. Set Up Mock Service Worker (Optional but recommended)

If you plan to use API mocking, set up the mock service worker:

```bash
npx twd-js init public
```

This copies the required `mock-sw.js` file to your public directory.

### 3. Write Your First Test

Create your first test file:

```ts
// src/App.twd.test.ts
import { twd, userEvent, screenDom } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("App Component", () => {
  it("should render the main heading", async () => {
    await twd.visit("/");
    
    // Use screenDom for testing library queries
    const heading = screenDom.getByRole("heading", { level: 1 });
    twd.should(heading, "be.visible");
  });

  it("should handle button clicks", async () => {
    await twd.visit("/");
    
    const user = userEvent.setup();
    const button = screenDom.getByRole("button");
    
    await user.click(button);
    
    // Add your assertions here
    const result = screenDom.getByText("Button clicked!");
    twd.should(result, "be.visible");
  });
});
```

### 4. Run Your App

Start your development server as usual:

```bash
npm run dev
```

You should now see the TWD sidebar in your browser automatically in development mode. Click on it to view and run your tests!

<p align="center">
  <img src="/images/twd_side_bar_success.png" alt="TWD Sidebar showing test execution" width="800">
</p>


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
4. **Mock external systems** (APIs, auth, feature flags) for deterministic results
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
3. Have the `initTWD` logic in your main entry file

### Mock Service Worker Issues

If API mocking isn't working:
1. Run `npx twd-js init public` to install the service worker
2. Make sure request mocking is enabled in your `initTWD` options (`serviceWorker: true` is the default)
3. Check the browser console for service worker registration errors

### Test Duplication on HMR

If you notice test entries duplicating when you edit test files during development (this typically happens when you have components initialized in your `main.tsx`), add the TWD HMR plugin to your Vite config:

```ts
// vite.config.ts
import { twdHmr } from 'twd-js/vite-plugin';

export default defineConfig({
  plugins: [
    // ... other plugins
    twdHmr(),
  ],
});
```

This plugin forces a full page reload when TWD test files change, preventing duplicate test entries.

## Getting Help

- 📖 [Browse the documentation](/api/)
- 🐛 [Report issues](https://github.com/BRIKEV/twd/issues)
- 💬 [Join discussions](https://github.com/BRIKEV/twd/discussions)
