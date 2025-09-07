# twd

[![CI](https://github.com/BRIKEV/twd/actions/workflows/ci.yml/badge.svg)](https://github.com/BRIKEV/twd/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/twd-js.svg)](https://www.npmjs.com/package/twd-js)
[![license](https://img.shields.io/github/license/brikev/twd.svg)](./LICENSE)

> ⚠️ This is a **beta release** – expect frequent updates and possible breaking changes.

TWD (Testing Web Development) is a tool designed to help integrating testing while developing web applications. It aims to streamline the testing process and make it easier for developers to write and run tests as they build their applications.

Right now we only support React, but we plan to add support for other frameworks in the future.

## Installation

You can install TWD via npm:

```bash
# with npm
npm install twd-js

# with yarn
yarn add twd-js

# with pnpm
pnpm add twd-js
```

## How to use

Add the our React Sidebar component to your application:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { TWDSidebar } from 'twd-js'
import router from './routes.ts'
import { RouterProvider } from 'react-router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <TWDSidebar />
  </StrictMode>,
)
```

Then, create test files with the `twd.test.ts` or any extension you want. For example:

```ts
// src/app.twd.test.ts
import { describe, it, twd } from "twd-js";

beforeEach(() => {
  console.log("Reset state before each test");
});

describe("App interactions", () => {
  it("clicks the button", async () => {
    twd.visit("/"); // Visit the root URL
    const btn = await twd.get("button");
    btn.click();
    const message = await twd.get("#message");
    // have.text
    const haveText = await twd.get("#message");
    haveText.should("have.text", "Hello");
  });
});
```

After you create your test you need to load them in your application. You can do this by creating a `loadTests.ts` file and importing all your test files there:

```ts
// src/loadTests.ts
import "./app.twd.test";
import "./another-test-file.twd.test";
// Import other test files here
```

Or if you're using vite you can use Vite's `import.meta.glob` to automatically import all test files in a directory:

```ts
// This automatically imports all files ending with .twd.test.ts
const modules = import.meta.glob("./**/*.twd.test.ts", { eager: true });

// You don't need to export anything; simply importing this in App.tsx
// will cause the test files to execute and register their tests.
```

Then, import the `loadTests.ts` file in your main application file (e.g., `main.tsx` or `App.tsx`):

```tsx
import './loadTests' // Import test files
```

Finally, run your application and open the TWD sidebar to see and run your tests.

You can check the [examples](https://github.com/BRIKEV/twd/tree/main/examples) directory for more usage scenarios.