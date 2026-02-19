# Framework Integration

TWD is designed to work with any Vite-based application. Currently, **react, vue, angular and solid.js are supported**, and the library can be adapted to work with other build tools and frameworks.

## React

TWD works seamlessly with any Vite-based React application. **We recommend using the bundled setup** for all frameworks, including React, as it's simpler and handles dependencies automatically. The standard setup is available for React applications that need more control.

**[View React Examples](https://github.com/BRIKEV/twd/tree/main/examples)** - Multiple React examples available in the repository.

### Recommended: Bundled Setup

The bundled setup is the recommended approach for all frameworks, including React. It handles React dependencies internally, automatically initializes request mocking, and keeps your main entry file clean and simple.

```tsx
// src/main.tsx
if (import.meta.env.DEV) {
  const { initTWD } = await import('twd-js/bundled');
  const tests = import.meta.glob("./**/*.twd.test.{ts,tsx}")
  
  // Initialize TWD with tests and optional configuration
  // Request mocking is automatically initialized by default
  initTWD(tests, { 
    open: true, 
    position: 'left',
    serviceWorker: true,           // Enable request mocking (default: true)
    serviceWorkerUrl: '/mock-sw.js' // Custom service worker path (default: '/mock-sw.js')
  });
}
```

#### initTWD Options

The `initTWD` function accepts the following options:

- **`open`** (`boolean`, optional) - Whether the sidebar is open by default. Default: `true`
- **`position`** (`"left" | "right"`, optional) - Sidebar position. Default: `"left"`
- **`serviceWorker`** (`boolean`, optional) - Whether to initialize request mocking. Default: `true`
- **`serviceWorkerUrl`** (`string`, optional) - Custom path to the service worker file. Default: `'/mock-sw.js'`
- **`theme`** (`Partial<TWDTheme>`, optional) - Custom theme configuration. See [Theming](/theming) for details.

**Examples:**

```tsx
// Minimal setup - uses all defaults
initTWD(tests);

// Custom sidebar configuration
initTWD(tests, { open: false, position: 'right' });

// Disable request mocking
initTWD(tests, { serviceWorker: false });

// Custom service worker path
initTWD(tests, { serviceWorkerUrl: '/custom-path/mock-sw.js' });

// All options together
initTWD(tests, { 
  open: true, 
  position: 'right',
  serviceWorker: true,
  serviceWorkerUrl: '/my-mock-sw.js',
  theme: { primary: '#2563eb', background: '#ffffff' }
});
```

::: tip Theming
Learn more about customizing the TWD sidebar appearance in the [Theming](/theming) guide.
:::

### Alternative: Standard Setup (React Only)

The standard setup is available for React applications that need full control over the initialization. This setup requires you to manually handle React dependencies and initialize request mocking.

```tsx
// src/main.tsx
if (import.meta.env.DEV) {
  const testModules = import.meta.glob("./**/*.twd.test.{ts,tsx}");
  const { initTests, twd, TWDSidebar } = await import('twd-js');
  
  // You need to pass the test modules, the sidebar component, and createRoot function
  initTests(testModules, <TWDSidebar open={true} position="left" />, createRoot);
  
  // Initialize request mocking (optional)
  twd.initRequestMocking().catch(console.error);
}
```

::: warning
The standard setup is **React-only**. For Vue, Angular, Solid.js, and other frameworks, you must use the bundled setup.
:::

## Testing shadcn Components

If you're using shadcn/ui components in your React application, we've created a comprehensive guide with TWD patterns specifically for testing shadcn components:

**[shadcn Testing Guide](https://brikev.github.io/twd-shadcn/)** - Patterns and best practices for testing shadcn/ui components with TWD.

## Vue

For Vue applications, use the bundled version of TWD. This ensures that the React runtime required by TWD's UI is handled correctly without conflicting with your Vue app.

**[Vue Example Repository](https://github.com/BRIKEV/twd-vue-example)** - Complete working example with advanced scenarios.

```ts
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'

if (import.meta.env.DEV) {
  // Use the bundled version
  const { initTWD } = await import('twd-js/bundled');
  const tests = import.meta.glob("./**/*.twd.test.{ts,tsx}")
  
  // Initialize TWD - request mocking is automatically initialized by default
  initTWD(tests, { open: true, position: 'left' });
}

createApp(App).mount('#app')
```

## Solid

For Solid.js applications, use the bundled version of TWD. This ensures that the React runtime required by TWD's UI is handled correctly without conflicting with your Solid app.

**[Solid Example Repository](https://github.com/BRIKEV/twd-solid-example)** - Complete Solid.js integration example.

```tsx
// src/main.tsx
/* @refresh reload */
import { render } from 'solid-js/web';
import 'solid-devtools';

import App from './App';

if (import.meta.env.DEV) {
  const { initTWD } = await import('twd-js/bundled');
  const tests = import.meta.glob("./**/*.twd.test.{ts,tsx}");
  
  // Initialize TWD - request mocking is automatically initialized by default
  initTWD(tests, { open: true, position: 'left' });
}

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => <App />, root!);
```

### Notes for Solid

- This setup works with **Solid + Vite** applications
- Solid Start compatibility has not been tested yet, but may work with similar configuration

## Angular

Angular applications can also use the bundled version. Note that you might need to manually construct the `tests` object if your build tool doesn't support glob imports in the same way.

**[Angular Example Repository](https://github.com/BRIKEV/twd-angular-example)** - Working Angular integration example.

```ts
// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { isDevMode } from '@angular/core';

if (isDevMode()) {
  const { initTWD } = await import('twd-js/bundled');
  
  // Define your test files manually or use a compatible glob importer
  const tests = {
    './twd-tests/helloWorld.twd.test.ts': () => import('./twd-tests/helloWorld.twd.test'),
    './twd-tests/todoList.twd.test.ts': () => import('./twd-tests/todoList.twd.test'),
  };
  
  // Initialize TWD - request mocking is automatically initialized by default
  initTWD(tests, { open: true, position: 'left' });
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
```

## Create React App (CRA)

Create React App uses Webpack instead of Vite, so you'll need to use Webpack's `require.context` to load test files. Here's how to set it up:

```ts
// src/index.tsx (or your main entry file)
if (process.env.NODE_ENV === "development") {
  // Use Webpack's context feature to load all test files
  const context = require.context("./", true, /\.twd\.test\.ts$/);
  
  // Build a Vite-like object of async importers
  const testModules = {};
  context.keys().forEach((key) => {
    testModules[key] = async () => {
      // Webpack requires modules synchronously, so wrap in Promise.resolve
      return Promise.resolve(context(key));
    };
  });
  
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
```

### Notes for CRA

- The test files will be loaded using Webpack's module system
- This approach also works for other Webpack-based React setups

## Astro

TWD works with Astro when using React components. Create a React component to initialize the test sidebar:

**[Astro Example](https://github.com/BRIKEV/twd/tree/main/examples/astro-example)** - Astro + React integration example.

```tsx
// src/components/TestSidebar.tsx
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

export default function TestSidebar() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      const initializeTests = async () => {
        const testModules = import.meta.glob("../**/*.twd.test.{ts,tsx}");
        const { initTests, twd, TWDSidebar } = await import('twd-js');
        initTests(testModules, <TWDSidebar open={true} position="left" />, createRoot);
        
        twd.initRequestMocking()
          .then(() => console.log("Request mocking initialized"))
          .catch((err) => console.error("Error initializing request mocking:", err));
      };
      initializeTests();
    }
  }, []);

  return <div id="test-sidebar-container"></div>;
}
```

Configure Astro's Vite plugin to handle test file hot reload:

```js
// astro.config.mjs
import { twdHmr } from 'twd-js/vite-plugin';

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [
      twdHmr(), // Prevents test duplication on HMR
    ],
  },
});
```

Include the component in your Astro pages:

```astro
---
import TestSidebar from '../components/TestSidebar.tsx';
const isDev = import.meta.env.DEV
---

<Layout>
  <!-- your content -->
  {isDev && <TestSidebar client:load />}
</Layout>
```

## React Router (Framework Mode)

TWD works with React Router Framework mode applications, including SSR mode. Using `createRoutesStub`, you can mock loaders and actions to test your routes in isolation while running within your real application context.

::: info
TWD focuses on **client-side UI behavior**. Server-side loaders and actions can be mocked with `createRoutesStub` and tested as pure functions separately.
:::

### Recommended: Testing Routes with createRoutesStub

The best way to test React Router Framework Mode applications is using React Router's `createRoutesStub` API. This approach allows you to:

- Mock routes with loaders and actions
- Create different scenarios per test
- Test frontend behavior realistically
- Test loaders and actions separately as pure functions

This separation of concerns makes testing straightforward, explicit, and predictable.

**[React Router + TWD Example](https://github.com/BRIKEV/twd-react-router)** - Complete working example with this approach.

#### Setup

1. **Add a dedicated testing route** to your route configuration:

```ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("todos", "routes/todolist.tsx"),
  route("testing", "routes/testing-page.tsx"), // Add this route
] satisfies RouteConfig;
```

2. **Create the testing page**:

```tsx
// app/routes/testing-page.tsx
let twdInitialized = false;

export async function clientLoader() {
  if (import.meta.env.DEV) {
    const testModules = import.meta.glob("../**/*.twd.test.{ts,tsx}");
    if (!twdInitialized) {
      const { initTWD } = await import('twd-js/bundled');
      initTWD(testModules, {
        serviceWorker: false, // Disable service worker if not needed
      });
      twdInitialized = true;
    }
    return {};
  } else {
    return {};
  }
}

export default function TestPage() {
  return (
    <div data-testid="testing-page">
      <h1 style={{ opacity: 0.5, fontFamily: 'system-ui, sans-serif' }}>TWD Test Page</h1>
      <p style={{ opacity: 0.5, fontFamily: 'system-ui, sans-serif' }}>
        This page is used as a mounting point for TWD tests.
      </p>
    </div>
  );
}
```

3. **Create a test helper** to set up the React root:

```tsx
// test-utils/setup-react-root.tsx
import { createRoot } from "react-dom/client";
import { twd, screenDomGlobal } from "twd-js";

let root: ReturnType<typeof createRoot> | undefined;

export async function setupReactRoot() {
  if (root) {
    root.unmount();
    root = undefined;
  }

  // Navigate to the empty test page
  await twd.visit('/testing');
  
  // Get the container from the test page
  const container = await screenDomGlobal.findByTestId('testing-page');
  root = createRoot(container);
  return root;
}
```

#### Example Test

```tsx
import { createRoutesStub } from "@react-router/dev/routes";
import { useLoaderData, useParams, useMatches } from "react-router";
import { createRoot } from "react-dom/client";
import { setupReactRoot } from "../test-utils/setup-react-root";
import { twd, screenDom } from "twd-js";
import { describe, it, beforeEach } from "twd-js/runner";
import Home from "../routes/home";

describe("Home Page Test", () => {
  let root: ReturnType<typeof createRoot> | undefined;

  beforeEach(async () => {
    root = await setupReactRoot();
  });

  it("should render home page with loader data", async () => {
    // Create a route stub with mocked loader
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: () => {
          const loaderData = useLoaderData();
          const params = useParams();
          const matches = useMatches() as any;
          return <Home loaderData={loaderData} params={params} matches={matches} />;
        },
        loader() {
          return { title: "Home Page test" };
        },
      },
    ]);

    // Render the stub
    root!.render(<Stub />);
    await twd.wait(300);
    
    // Assert the rendered content
    const h1 = await screenDom.findByRole('heading', { level: 1 });
    twd.should(h1, 'have.text', 'Home Page test');
  });
});
```

This approach provides a powerful way to test React Router routes in isolation while still running within your real application context, making it easier to test complex routing scenarios and loader/action behavior.

## Framework Support Philosophy

TWD is designed for **deterministic, client-side UI testing**. It focuses on frameworks that provide:

- **Explicit execution** - Clear control over when and how components render
- **Deterministic behavior** - Predictable rendering and state management
- **Fast feedback loops** - Quick test execution and hot module replacement

TWD works with SPAs and frameworks where the UI renders client-side. This includes SSR frameworks like **React Router** where loaders and actions are explicit and testable. Server-component-first architectures like **Next.js App Router**, where rendering, data loading, and infrastructure are implicitly mixed, are not compatible with TWD's testing model.

TWD officially supports:
- **React (SPA)** - Standard Vite-based React applications
- **React Router (Framework Mode)** - Including SSR mode, with explicit loaders and `createRoutesStub`
- **Vue, Angular, Solid.js** - Other SPA frameworks
- **Astro** - When used with client-driven components

## Other Frameworks

We're actively working on adding more framework recipes and integrations. If you're using a framework not listed here:

1. **Check if it's Vite-based** - If so, the standard Vite setup should work
2. **Check if it uses Webpack** - Adapt the CRA setup above
3. **Browse our [examples directory](https://github.com/BRIKEV/twd/tree/main/examples)** - See working examples for multiple frameworks
4. **Share your setup** - We'd love to hear about your integration! [Open an issue](https://github.com/BRIKEV/twd/issues) or [start a discussion](https://github.com/BRIKEV/twd/discussions)

## Framework Support Roadmap

We plan to add official support and documentation for:

- **Svelte** - Framework support in development

## Getting Help

If you're having trouble integrating TWD with your framework:

- 📖 Check the [Getting Started Guide](/getting-started) for the standard setup
- 📚 Review the [Installation Tutorial](/tutorial/installation) for step-by-step instructions
- 🐛 [Report issues](https://github.com/BRIKEV/twd/issues) if you encounter problems
- 💬 [Join discussions](https://github.com/BRIKEV/twd/discussions) to share your setup or ask questions

