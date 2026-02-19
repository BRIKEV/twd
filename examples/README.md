# TWD Examples

This directory contains working examples of TWD integrated with various frameworks and setups. Each example demonstrates how to set up and use TWD for testing in different environments.

## Local Examples (In This Repository)

### React Examples

#### [twd-test-app](./twd-test-app)
A comprehensive React test application demonstrating TWD features and capabilities. This is the main testing playground for the TWD library.

**Features:**
- Complete TWD feature showcase
- Standard React + Vite setup
- API mocking examples
- User interaction testing

**How to run:**
```bash
cd examples/twd-test-app
npm install
npm run dev
```

#### [tutorial-example](./tutorial-example)
Step-by-step example following the TWD tutorial. Perfect for learning TWD from scratch.

**Features:**
- Beginner-friendly setup
- Progressive examples
- Follows official tutorial

**How to run:**
```bash
cd examples/tutorial-example
npm install
npm run dev
```

### Vue Example

#### [vue-twd-example](./vue-twd-example)
Demonstrates TWD integration with Vue 3 using the bundled setup.

**Features:**
- Vue 3 + Vite + TWD
- Bundled TWD setup (recommended for Vue)
- Component testing examples

**How to run:**
```bash
# First, build TWD from the root directory
npm run build

cd examples/vue-twd-example
npm install
npm run dev
```

## External Example Repositories

We maintain separate repositories for framework-specific examples that demonstrate TWD integration:

### [TWD Solid Example](https://github.com/BRIKEV/twd-solid-example)
Complete example of TWD integration with Solid.js.

**Setup:**
```bash
git clone https://github.com/BRIKEV/twd-solid-example.git
cd twd-solid-example
npm install
npm run dev
```

**Key features:**
- Solid.js + Vite + TWD
- Bundled TWD setup
- Solid-specific testing patterns

### [TWD Angular Example](https://github.com/BRIKEV/twd-angular-example)
Shows how to use TWD with Angular applications.

**Setup:**
```bash
git clone https://github.com/BRIKEV/twd-angular-example.git
cd twd-angular-example
npm install
npm run dev
```

**Key features:**
- Angular + TWD integration
- Manual test file registration
- Angular-specific setup patterns

### [TWD Vue Example](https://github.com/BRIKEV/twd-vue-example)
Extended Vue 3 example with more advanced testing scenarios.

**Setup:**
```bash
git clone https://github.com/BRIKEV/twd-vue-example.git
cd twd-vue-example
npm install
npm run dev
```

**Key features:**
- Vue 3 composition API testing
- Pinia store testing
- Vue Router integration

## Quick Start Guide

### For React Projects

Use the standard setup with `initTests`:

```tsx
// src/main.tsx
if (import.meta.env.DEV) {
  const testModules = import.meta.glob("./**/*.twd.test.{ts,tsx}");
  const { initTests, twd, TWDSidebar } = await import('twd-js');
  initTests(testModules, <TWDSidebar open={true} position="left" />, createRoot);
  twd.initRequestMocking().catch(console.error);
}
```

### For Vue, Solid, and Angular

Use the bundled setup with `initTWD`:

```ts
// src/main.ts (Vue/Angular) or main.tsx (Solid)
if (import.meta.env.DEV) {
  const { initTWD } = await import('twd-js/bundled');
  const tests = import.meta.glob("./**/*.twd.test.{ts,tsx}");
  initTWD(tests, { open: true, position: 'left' });
}
```

## Example Test File

All examples include test files following this pattern:

```ts
// *.twd.test.ts
import { twd, userEvent, screenDom } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("Example Component", () => {
  it("should render correctly", async () => {
    await twd.visit("/");
    
    const heading = screenDom.getByRole("heading", { name: /welcome/i });
    twd.should(heading, "be.visible");
    
    const button = screenDom.getByRole("button");
    const user = userEvent.setup();
    await user.click(button);
    
    twd.should(button, "have.text", "Clicked!");
  });
});
```

## Running Examples Locally

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm

### Build TWD First (for local examples)

Most local examples require building TWD first:

```bash
# From the root of the TWD repository
npm install
npm run build
```

### Then Run Any Example

```bash
cd examples/[example-name]
npm install
npm run dev
```

## Contributing Examples

We welcome contributions of new examples! If you've integrated TWD with a framework or setup not shown here:

1. Create a working example
2. Add clear documentation in a README.md
3. Submit a pull request or share in [GitHub Discussions](https://github.com/BRIKEV/twd/discussions)

## Getting Help

- 📖 [Full Documentation](https://brikev.github.io/twd/)
- 🚀 [Getting Started Guide](https://brikev.github.io/twd/getting-started)
- 🎯 [Framework Integration](https://brikev.github.io/twd/frameworks)
- 🐛 [Report Issues](https://github.com/BRIKEV/twd/issues)
- 💬 [Discussions](https://github.com/BRIKEV/twd/discussions)

## License

All examples in this repository are available under the same MIT License as TWD.
