---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "TWD"
  text: "Test While Developing"
  tagline: because testing isn’t a phase, it’s part of the flow.
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: Tutorial
      link: /tutorial/
    - theme: alt
      text: GitHub
      link: https://github.com/BRIKEV/twd

features:
  - icon: 🧪
    title: In-Browser Test Runner
    details: Beautiful sidebar UI that runs tests directly in your browser with instant feedback as you develop.
  - icon: ⚡
    title: Instant Feedback
    details: See test results immediately as you write code. No need to switch between terminal and browser.
  - icon: 🔥
    title: Mock Service Worker Integration
    details: Powerful API mocking with Mock Service Worker integration for API contract validation.
  - icon: 📝
    title: Simple, Readable Syntax
    details: Familiar testing syntax inspired by popular frameworks like Cypress and Jest with TypeScript support.
  - icon: 🧩
    title: Automatic Test Discovery
    details: Works seamlessly with Vite to automatically discover and load your test files.
  - icon: 🛠️
    title: Multi-Framework Support
    details: Works with React, Vue, Angular, Solid.js, and other Vite-based frameworks. The bundled setup makes integration seamless across frameworks.
---

## Quick Example

See TWD in action with the test sidebar running tests directly in your browser:

<p align="center">
  <img src="/images/twd_side_bar_success.png" alt="TWD Sidebar showing test execution" width="800">
</p>

```ts
import { twd, userEvent, screenDom } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("Hello World Page", () => {
  it("should display the welcome title and counter button", async () => {
    await twd.visit("/");
    
    // Use Testing Library queries (Recommended - semantic & accessible)
    const title = screenDom.getByRole("heading", { name: /welcome to twd/i });
    twd.should(title, "be.visible");
    twd.should(title, "have.text", "Welcome to TWD");
    
    const counterButton = screenDom.getByRole("button", { name: /count is/i });
    twd.should(counterButton, "be.visible");
    twd.should(counterButton, "have.text", "Count is 0");
    
    const user = userEvent.setup();
    await user.click(counterButton);
    twd.should(counterButton, "have.text", "Count is 1");

    // Alternative: Use TWD's native selectors
    // const title = await twd.get("h1");
    // title.should("be.visible").should("have.text", "Welcome to TWD");
  });
});
```

## See It in Action

Try TWD yourself with the **[shadcn/ui live showcase](https://brikev.github.io/twd-shadcn/)** — real shadcn components with TWD tests running in the browser. Open the sidebar and click "Run All" to see instant test results.

## Why TWD?

TWD makes browser-level validation a natural part of how you build. Instead of running tests in a separate terminal, you see results instantly in your browser's sidebar while you code — validate what you control, mock what you don't.

Perfect for:
- **Frontend developers** who want immediate test feedback
- **Teams** practicing Testing while Developing (TWD)
- **React, Vue, Angular, Solid.js, and React Router** applications (including SSR mode) that need comprehensive UI validation
- **Projects** requiring API contract mocking and boundary validation

## Community

- 🐛 [Report bugs](https://github.com/BRIKEV/twd/issues)
- 💬 [Join discussions](https://github.com/BRIKEV/twd/discussions)  
- 📦 [View on npm](https://www.npmjs.com/package/twd-js)
- ⭐ [Star on GitHub](https://github.com/BRIKEV/twd)

