# Installation

Let's set up TWD in your React project and see the sidebar appear in your browser!

## Step 1: Install TWD

First, we'll install the TWD library in your project:

```bash
npm install twd-js
```

That's it! TWD is now installed in your project.

## Step 2: Set Up Mock Service Worker

For API mocking capabilities (which we'll use later), we need to initialize the mock service worker:

```bash
npx twd-mock init public
```

This command copies the `mock-sw.js` file to your `public` directory, which enables TWD to intercept and mock HTTP requests during testing.

## Step 3: Initialize TWD in Your App

Now, let's add the TWD sidebar to your application. Open your main entry file (usually `src/main.tsx` or `src/App.tsx`) and add the initialization code:

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from "react-router";
import router from './AppRoutes';

if (import.meta.env.DEV) {
  // Import TWD test initialization
  const testModules = import.meta.glob("./**/*.twd.test.ts");
  const { initTests, twd, TWDSidebar } = await import('twd-js');
  
  // Initialize tests with the sidebar
  initTests(
    testModules, 
    <TWDSidebar open={true} position="left" />, 
    createRoot
  );
  
  // Initialize request mocking for API testing
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
    <RouterProvider router={router} />
  </StrictMode>,
)
```

## Step 4: Create Your First Test File

Let's create a test file to see TWD in action. Create a file with the `.twd.test.ts` extension:

```ts
// src/twd-tests/helloWorld.twd.test.ts
import { twd } from "../../../../src";
import { describe, it } from "../../../../src/runner";

describe("Hello World Page", () => {
  it("should display the welcome title", async () => {
    await twd.visit("/");
    // We'll add more to this test in the next section!
  });
});
```

## Step 5: Start Your Development Server

Now, start your development server:

```bash
npm run dev
```

## See the Magic! ✨

Once your server starts and you open your browser, you'll see the **TWD sidebar appear on the left side** of your screen! 

The sidebar shows:
- 📋 **All your test files** organized by test suites
- ▶️ **Play buttons** to run individual tests or entire test suites
- ✅ **Test results** with pass/fail indicators
- 📊 **Mock rules** button to see which API calls are being mocked

The sidebar only appears in development mode - it won't show up in production builds, so there's no performance impact!

## What's Next?

Now that TWD is installed and you can see the sidebar, let's write your first complete test using selectors, assertions, and navigation!

👉 [First Test - Selectors & Assertions](./first-test)
