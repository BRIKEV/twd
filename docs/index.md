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
    details: Powerful API mocking with Mock Service Worker integration for realistic request/response testing.
  - icon: 📝
    title: Simple, Readable Syntax
    details: Familiar testing syntax inspired by popular frameworks like Cypress and Jest with TypeScript support.
  - icon: 🧩
    title: Automatic Test Discovery
    details: Works seamlessly with Vite to automatically discover and load your test files.
  - icon: 🛠️
    title: React Ready
    details: Built specifically for React applications with plans to support more frameworks soon.
---

## Quick Example

**VIDEO HERE** - *Overview of TWD in action - showing the sidebar, running tests, and seeing results in real-time*

```ts
import { twd, userEvent } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("User login", () => {
  it("should login successfully", async () => {
    await twd.visit("/login");
    
    const user = userEvent.setup();
    const emailInput = await twd.get("input#email");
    const passwordInput = await twd.get("input#password");
    const loginButton = await twd.get("button[type='submit']");
    
    await user.type(emailInput.el, "user@example.com");
    await user.type(passwordInput.el, "password123");
    await user.click(loginButton.el);
    
    const welcome = await twd.get("h1");
    welcome.should("contain.text", "Welcome");
  });
});
```

## Why TWD?

TWD bridges the gap between development and testing by bringing tests directly into your development environment. Instead of running tests in a separate terminal, you can see results instantly in your browser's sidebar while you code.

Perfect for:
- **Frontend developers** who want immediate test feedback
- **Teams** practicing Testing while Developing (TWD)
- **React applications** that need comprehensive UI testing
- **Projects** requiring API mocking and integration testing

## Community

- 🐛 [Report bugs](https://github.com/BRIKEV/twd/issues)
- 💬 [Join discussions](https://github.com/BRIKEV/twd/discussions)  
- 📦 [View on npm](https://www.npmjs.com/package/twd-js)
- ⭐ [Star on GitHub](https://github.com/BRIKEV/twd)

