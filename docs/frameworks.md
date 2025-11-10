# Framework Integration

TWD is designed to work with any Vite-based application. Currently, **React is the only supported framework**, but the library can be adapted to work with other build tools and frameworks.

## Vite-Based Applications

TWD works seamlessly with any Vite-based React application. The standard setup using `import.meta.glob()` works out of the box:

```ts
// src/main.tsx
if (import.meta.env.DEV) {
  const testModules = import.meta.glob("./**/*.twd.test.ts");
  const { initTests, twd, TWDSidebar } = await import('twd-js');
  initTests(testModules, <TWDSidebar open={true} position="left" />, createRoot);
  twd.initRequestMocking()
    .then(() => {
      console.log("Request mocking initialized");
    })
    .catch((err) => {
      console.error("Error initializing request mocking:", err);
    });
}
```

This setup works for:
- Vite + React
- Remix (with Vite)
- Any other Vite-based React setup

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

::: warning TODO
Astro integration guide is coming soon. If you're using Astro with React components, you can adapt the Vite setup, but full Astro support is still in development.

If you'd like to contribute or share your Astro setup, please [open an issue](https://github.com/BRIKEV/twd/issues) or [start a discussion](https://github.com/BRIKEV/twd/discussions).
:::

## Other Frameworks

We're actively working on adding more framework recipes and integrations. If you're using a framework not listed here:

1. **Check if it's Vite-based** - If so, the standard Vite setup should work
2. **Check if it uses Webpack** - Adapt the CRA setup above
3. **Share your setup** - We'd love to hear about your integration! [Open an issue](https://github.com/BRIKEV/twd/issues) or [start a discussion](https://github.com/BRIKEV/twd/discussions)

## Framework Support Roadmap

We plan to add official support and documentation for:

- **Vue** - Framework support in development
- **Angular** - Framework support in development

## Getting Help

If you're having trouble integrating TWD with your framework:

- 📖 Check the [Getting Started Guide](/getting-started) for the standard setup
- 📚 Review the [Installation Tutorial](/tutorial/installation) for step-by-step instructions
- 🐛 [Report issues](https://github.com/BRIKEV/twd/issues) if you encounter problems
- 💬 [Join discussions](https://github.com/BRIKEV/twd/discussions) to share your setup or ask questions

