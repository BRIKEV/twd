# Framework Integration

TWD is designed to work with any Vite-based application. Currently, **React and Solid.js are officially supported**, and the library can be adapted to work with other build tools and frameworks.

## React

TWD works seamlessly with any Vite-based React application. You can use the standard setup or the bundled setup for a simpler configuration.

### Standard Setup

The standard setup gives you full control over the initialization and allows you to customize the sidebar component directly.

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

### Simplified Setup (Bundled)

You can also use the simplified bundled setup, which handles React dependencies internally and automatically initializes request mocking. This is great for keeping your main entry file clean.

```tsx
// src/main.tsx
if (import.meta.env.DEV) {
  const { initTWD } = await import('twd-js/bundled');
  const tests = import.meta.glob("./**/*.twd.test.ts")
  
  // Initialize TWD with tests and optional configuration
  // Request mocking is automatically initialized
  initTWD(tests, { open: true, position: 'left' });
}
```

## Vue

For Vue applications, use the bundled version of TWD. This ensures that the React runtime required by TWD's UI is handled correctly without conflicting with your Vue app. Request mocking is automatically initialized.

```ts
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'

if (import.meta.env.DEV) {
  // Use the bundled version
  const { initTWD } = await import('twd-js/bundled');
  const tests = import.meta.glob("./**/*.twd.test.ts")
  
  // Request mocking is automatically initialized
  initTWD(tests);
}

createApp(App).mount('#app')
```

## Solid

For Solid.js applications, use the bundled version of TWD. This ensures that the React runtime required by TWD's UI is handled correctly without conflicting with your Solid app. Request mocking is automatically initialized.

```tsx
// src/main.tsx
/* @refresh reload */
import { render } from 'solid-js/web';
import 'solid-devtools';

import App from './App';

if (import.meta.env.DEV) {
  const { initTWD } = await import('twd-js/bundled');
  const tests = import.meta.glob("./**/*.twd.test.ts");
  
  // Request mocking is automatically initialized
  initTWD(tests);
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

Angular applications can also use the bundled version. Note that you might need to manually construct the `tests` object if your build tool doesn't support glob imports in the same way. Request mocking is automatically initialized.

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
  
  // Request mocking is automatically initialized
  initTWD(tests);
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

```tsx
// src/components/TestSidebar.tsx
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

export default function TestSidebar() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      const initializeTests = async () => {
        const testModules = import.meta.glob("../**/*.twd.test.ts");
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
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [
      {
        name: "force-full-reload-on-tests",
        handleHotUpdate({ file, server }) {
          if (file.endsWith(".twd.test.ts")) {
            server.ws.send({ type: "full-reload", path: "*" });
            return [];
          }
        },
      },
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

## Other Frameworks

We're actively working on adding more framework recipes and integrations. If you're using a framework not listed here:

1. **Check if it's Vite-based** - If so, the standard Vite setup should work
2. **Check if it uses Webpack** - Adapt the CRA setup above
3. **Share your setup** - We'd love to hear about your integration! [Open an issue](https://github.com/BRIKEV/twd/issues) or [start a discussion](https://github.com/BRIKEV/twd/discussions)

## Framework Support Roadmap

We plan to add official support and documentation for:

- **Svelte** - Framework support in development

## Getting Help

If you're having trouble integrating TWD with your framework:

- 📖 Check the [Getting Started Guide](/getting-started) for the standard setup
- 📚 Review the [Installation Tutorial](/tutorial/installation) for step-by-step instructions
- 🐛 [Report issues](https://github.com/BRIKEV/twd/issues) if you encounter problems
- 💬 [Join discussions](https://github.com/BRIKEV/twd/discussions) to share your setup or ask questions

