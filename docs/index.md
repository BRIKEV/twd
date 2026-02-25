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
    title: In-Browser Validation
    details: Sidebar UI that validates your frontend directly in the browser with instant feedback as you develop.
  - icon: ⚡
    title: Deterministic Results
    details: Every test runs in a real browser with mocked boundaries. No flaky network calls, no backend dependencies, no surprises in CI.
  - icon: 🔥
    title: API Boundary Mocking
    details: Mock Service Worker integration to isolate your frontend from external systems. Validate what you own, mock what you don't.
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

TWD is a deterministic browser validation layer for frontend boundaries. Instead of running tests in a separate terminal, you see results instantly in your browser's sidebar while you code — validate what you own, mock what you don't.

Perfect for:
- **Frontend developers** who want immediate validation feedback during development
- **Teams** that treat testing as part of the development flow, not an afterthought
- **React, Vue, Angular, Solid.js, and React Router** applications that need frontend boundary validation
- **Projects** that need to isolate external systems (APIs, auth, feature flags) and validate UI logic deterministically

## TWD vs System E2E

TWD is not a replacement for Playwright or system-level E2E testing. They serve different purposes at different boundaries:

| | **TWD** | **System E2E (Playwright, Cypress)** |
|---|---|---|
| **Validates** | Frontend UI logic, state transitions, error states, conditional rendering | Cross-system flows, real APIs, auth, infrastructure |
| **Boundaries** | Mocked — APIs, auth, third-party integrations | Real — backend, database, network |
| **Environment** | Deterministic browser, no external dependencies | Full system, real services |
| **Feedback** | Instant, during development | Slower, typically CI or QA stage |
| **Owns** | What you built (UI) | How systems connect |

Use TWD for fast, deterministic validation of your frontend. Use Playwright for verifying that your systems work together end-to-end. They complement each other.

## Community

- 🐛 [Report bugs](https://github.com/BRIKEV/twd/issues)
- 💬 [Join discussions](https://github.com/BRIKEV/twd/discussions)  
- 📦 [View on npm](https://www.npmjs.com/package/twd-js)
- ⭐ [Star on GitHub](https://github.com/BRIKEV/twd)

