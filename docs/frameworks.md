---
title: Framework Integration
description: Set up TWD with React, Vue, Angular, Solid.js, CRA, Astro, and React Router
---

# Framework Integration

TWD is designed to work with any Vite-based application. Currently, **react, vue, angular and solid.js are supported**, and the library can be adapted to work with other build tools and frameworks.

## React

TWD works seamlessly with any Vite-based React application. **We recommend using the `twd()` Vite plugin** — it auto-loads the sidebar and discovers test files in dev with no entry-file changes. Manual setup is available for projects that need full control.

**[View React Examples](https://github.com/BRIKEV/twd/tree/main/examples)** - Multiple React examples available in the repository.

### Recommended: Vite Plugin

Add the `twd()` plugin to your `vite.config.ts`:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { twd } from 'twd-js/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    twd({
      testFilePattern: '/**/*.twd.test.{ts,tsx}',
      open: true,
      position: 'left',
      serviceWorker: true,             // Enable request mocking (default: true)
      serviceWorkerUrl: '/mock-sw.js', // Custom service worker path (default: '/mock-sw.js')
    }),
  ],
});
```

The plugin only runs in `vite dev` (`apply: 'serve'`) — it's a no-op in production builds.

#### twd() Plugin Options

The `twd()` plugin accepts the following options:

- **`testFilePattern`** (`string`, optional) - Glob pattern for discovering test files. Default: `'/**/*.twd.test.ts'`
- **`open`** (`boolean`, optional) - Whether the sidebar is open by default. Default: `true`
- **`position`** (`"left" | "right"`, optional) - Sidebar position. Default: `"left"`
- **`serviceWorker`** (`boolean`, optional) - Whether to initialize request mocking. Default: `true`
- **`serviceWorkerUrl`** (`string`, optional) - Custom path to the service worker file. Default: `'/mock-sw.js'`
- **`theme`** (`Partial<TWDTheme>`, optional) - Custom theme configuration. See [Theming](/theming) for details.
- **`search`** (`boolean`, optional) - Whether to show the search/filter input in the sidebar. Default: `false`

**Examples:**

```ts
// Minimal setup — uses all defaults
twd();

// Custom sidebar configuration
twd({ open: false, position: 'right' });

// Custom test file pattern
twd({ testFilePattern: '/**/*.spec.{ts,tsx}' });

// Disable request mocking
twd({ serviceWorker: false });

// Enable test filtering in the sidebar
twd({ search: true });

// All options together
twd({
  testFilePattern: '/**/*.twd.test.{ts,tsx}',
  open: true,
  position: 'right',
  serviceWorker: true,
  serviceWorkerUrl: '/my-mock-sw.js',
  theme: { primary: '#2563eb', background: '#ffffff' },
});
```

::: tip Theming
Learn more about customizing the TWD sidebar appearance in the [Theming](/theming) guide.
:::

### Alternative: Manual Bundled Setup

If you need full control, you can call `initTWD` directly in your entry file instead of using the plugin. This is the same code the plugin runs internally:

```tsx
// src/main.tsx
if (import.meta.env.DEV) {
  const { initTWD } = await import('twd-js/bundled');
  const tests = import.meta.glob('./**/*.twd.test.ts');

  initTWD(tests, {
    open: true,
    position: 'left',
    serviceWorker: true,
    serviceWorkerUrl: '/mock-sw.js',
  });
}
```

`initTWD` accepts the same options as the plugin (minus `testFilePattern`, which is handled by `import.meta.glob` here). Use this approach when you need conditional init, custom test discovery, or any logic the plugin doesn't expose.

### Alternative: Standard Setup (React Only)

The standard setup gives full control over the React root and request-mocking lifecycle. React-only.

```tsx
// src/main.tsx
if (import.meta.env.DEV) {
  const testModules = import.meta.glob("./**/*.twd.test.ts");
  const { initTests, twd, TWDSidebar } = await import('twd-js');
  
  // You need to pass the test modules, the sidebar component, and createRoot function
  initTests(testModules, <TWDSidebar open={true} position="left" />, createRoot);
  
  // Initialize request mocking (optional)
  twd.initRequestMocking().catch(console.error);
}
```

::: tip
For Vue, Solid.js, and other Vite-based frameworks, use the `twd()` plugin (recommended) or the manual bundled setup. The standard setup above is React-only.
:::

## Testing shadcn Components

If you're using shadcn/ui components in your React application, we've created a comprehensive guide with TWD patterns specifically for testing shadcn components:

**[shadcn Testing Guide](https://brikev.github.io/twd-shadcn/)** - Patterns and best practices for testing shadcn/ui components with TWD.

## Vue

For Vue applications, use the `twd()` Vite plugin. The plugin is framework-agnostic and the bundled version it uses internally ships React separately, so it doesn't conflict with your Vue runtime.

**[Vue Example Repository](https://github.com/BRIKEV/twd-vue-example)** - Complete working example with advanced scenarios.

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { twd } from 'twd-js/vite-plugin';

export default defineConfig({
  plugins: [
    vue(),
    twd({
      testFilePattern: '/**/*.twd.test.ts',
      open: true,
      position: 'left',
    }),
  ],
});
```

Your `src/main.ts` stays untouched — no `initTWD` import needed:

```ts
// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
```

### Alternative: Manual Bundled Setup (Vue)

If you can't use the Vite plugin, fall back to manual `initTWD` in `src/main.ts`:

```ts
import { createApp } from 'vue';
import App from './App.vue';

if (import.meta.env.DEV) {
  const { initTWD } = await import('twd-js/bundled');
  const tests = import.meta.glob('./**/*.twd.test.ts');
  initTWD(tests, { open: true, position: 'left' });
}

createApp(App).mount('#app');
```

## Solid

For Solid.js applications, use the `twd()` Vite plugin. The bundled version handles its React runtime internally and doesn't conflict with your Solid runtime.

**[Solid Example Repository](https://github.com/BRIKEV/twd-solid-example)** - Complete Solid.js integration example.

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { twd } from 'twd-js/vite-plugin';

export default defineConfig({
  plugins: [
    solid(),
    twd({
      testFilePattern: '/**/*.twd.test.ts',
      open: true,
      position: 'left',
    }),
  ],
});
```

Your `src/main.tsx` stays untouched:

```tsx
// src/main.tsx
/* @refresh reload */
import { render } from 'solid-js/web';
import App from './App';

const root = document.getElementById('root');
if (!(root instanceof HTMLElement)) {
  throw new Error('Root element not found.');
}

render(() => <App />, root);
```

### Notes for Solid

- This setup works with **Solid + Vite** applications.
- Solid Start compatibility has not been tested yet, but may work with similar configuration.

## Angular

Angular CLI uses esbuild, not vanilla Vite, so the `twd()` Vite plugin doesn't apply. Angular projects use the manual bundled setup with `initTWD`. You'll typically need to build the `tests` object explicitly since Angular's build tooling doesn't support `import.meta.glob` the same way.

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

Astro uses Vite under the hood, so you can register the `twd()` plugin via Astro's `vite.plugins` config block.

**[Astro Example](https://github.com/BRIKEV/twd/tree/main/examples/astro-example)** - Astro + React integration example.

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { twd } from 'twd-js/vite-plugin';

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [
      twd({
        testFilePattern: '/**/*.twd.test.{ts,tsx}',
        open: true,
        position: 'left',
      }),
    ],
  },
});
```

The plugin handles test discovery, sidebar mounting, and HMR full-reload — no per-page component or `useEffect` boilerplate required.

## React Router (Framework Mode)

TWD works with React Router Framework mode applications, including SSR mode with explicit loaders and actions. Using `createRoutesStub`, you can mock loaders and actions to validate your route behavior at the frontend boundary.

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

This approach validates React Router routes at the frontend boundary — loaders and actions are mocked, so you're testing how your UI responds to data, not whether the backend returns it correctly.

## Framework Support Philosophy

TWD is designed for **deterministic frontend boundary validation**. It focuses on frameworks that provide:

- **Explicit execution** - Clear control over when and how components render
- **Deterministic behavior** - Predictable rendering and state management
- **Fast feedback loops** - Quick test execution and hot module replacement

TWD works with SPAs and frameworks where the UI renders client-side and external dependencies can be explicitly isolated. This includes SSR frameworks like **React Router** where loaders and actions are explicit and testable at the boundary. Server-component-first architectures like **Next.js App Router**, where rendering, data loading, and infrastructure are implicitly mixed, blur the ownership boundary and are not compatible with TWD's validation model.

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

