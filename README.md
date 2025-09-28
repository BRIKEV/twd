# twd

[![CI](https://github.com/BRIKEV/twd/actions/workflows/ci.yml/badge.svg)](https://github.com/BRIKEV/twd/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/twd-js.svg)](https://www.npmjs.com/package/twd-js)
[![license](https://img.shields.io/github/license/brikev/twd.svg)](./LICENSE)
[![Maintainability](https://qlty.sh/gh/BRIKEV/projects/twd/maintainability.svg)](https://qlty.sh/gh/BRIKEV/projects/twd)
[![Code Coverage](https://qlty.sh/gh/BRIKEV/projects/twd/coverage.svg)](https://qlty.sh/gh/BRIKEV/projects/twd)

> ⚠️ This is a **beta release** – expect frequent updates and possible breaking changes.


TWD (Testing Web Development) is a library designed to seamlessly integrate testing into your web development workflow. It streamlines the process of writing, running, and managing tests directly in your application, with a modern UI and powerful mocking capabilities.

Currently, TWD supports React, with plans to add more frameworks soon.

---

## Features

- 🧪 **In-browser test runner** with a beautiful sidebar UI
- ⚡ **Instant feedback** as you develop
- 🔥 **Mock Service Worker** integration for API/request mocking
- 📝 **Simple, readable test syntax** (inspired by popular test frameworks)
- 🧩 **Automatic test discovery** with Vite support
- 🛠️ **Works with React** (support for more frameworks coming)

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


## Quick Start

1. **Add the TWD Sidebar to your React app:**

   ```tsx
   import { StrictMode } from 'react';
   import { createRoot } from 'react-dom/client';
   import App from './App';
   import './index.css';
   import { TWDSidebar } from 'twd-js';

   createRoot(document.getElementById('root')!).render(
     <StrictMode>
       <App />
       <TWDSidebar />
     </StrictMode>,
   );
   ```

2. **Write your tests:**

   Create files ending with `.twd.test.ts` (or any extension you prefer):

   ```ts
   // src/app.twd.test.ts
   import { describe, it, twd } from "twd-js";

   beforeEach(() => {
     // Reset state before each test
   });

   describe("App interactions", () => {
     it("clicks the button", async () => {
       twd.visit("/");
       const btn = await twd.get("button");
       btn.click();
       const message = await twd.get("#message");
       message.should("have.text", "Hello");
     });
   });
   ```

3. **Auto-load your tests:**

   - With Vite:

     ```ts
    import { twd } from "twd-js";
     // src/loadTests.ts
    import.meta.glob("./**/*.twd.test.ts", { eager: true });
     // Initialize request mocking once
     twd.initRequestMocking()
      .then(() => {
        console.log("Request mocking initialized");
      })
      .catch((err) => {
        console.error("Error initializing request mocking:", err);
      });
     // No need to export anything
     ```

   - Or manually:

     ```ts
     // src/loadTests.ts
     import "./app.twd.test";
     import "./another-test-file.twd.test";
     ```

   Import `loadTests.ts` in your main entry (e.g., `main.tsx`):

   ```tsx
   import './loadTests';
   ```

4. **Run your app and open the TWD sidebar** to see and run your tests in the browser.

---

## Mock Service Worker (API Mocking)


TWD provides a CLI to easily set up a mock service worker for API/request mocking in your app. You do **not** need to manually register the service worker in your app—TWD handles this automatically when you use `twd.initRequestMocking()` in your tests.

### Install the mock service worker

Run the following command in your project root:

```bash
npx twd-mock init <public-dir> [--save]
```

- Replace `<public-dir>` with the path to your app's public/static directory (e.g., `public/` or `dist/`).
- Use `--save` to print a registration snippet for your app.

This will copy `mock-sw.js` to your public directory.


### How to use request mocking in your tests

Just call `await twd.initRequestMocking()` at the start of your test, then use `twd.mockRequest` to define your mocks. Example:

```ts
import { describe, it, twd, userEvent } from "twd-js";

it("fetches a message", async () => {
  twd.visit("/");
  const user = userEvent.setup();
  await twd.mockRequest("message", {
    method: "GET",
    url: "https://api.example.com/message",
    response: {
      value: "Mocked message!",
    },
  });
  const btn = await twd.get("button[data-twd='message-button']");
  await user.click(btn.el);
  await twd.waitForRequest("message");
  const messageText = await twd.get("p[data-twd='message-text']");
  messageText.should("have.text", "Mocked message!");
});
```

---

## More Usage Examples

See the [examples](https://github.com/BRIKEV/twd/tree/main/examples) directory for more scenarios and advanced usage.

---

## Contributing

Contributions are welcome! Please open issues or pull requests on [GitHub](https://github.com/BRIKEV/twd).

---

## License

This project is licensed under the [MIT License](./LICENSE).
