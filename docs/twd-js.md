---
title: Frontend tests that run in your real browser — TWD
description: TWD runs your tests in your dev server with a sidebar that updates as you code. For React, Vue, Angular, and Solid.
head:
  - - meta
    - property: og:title
      content: Frontend tests that run in your real browser — TWD
  - - meta
    - property: og:description
      content: TWD runs your tests in your dev server with a sidebar that updates as you code. For React, Vue, Angular, and Solid.
---

<LandingHero
  eyebrow="twd-js · the core"
  title="Frontend tests that run in your real browser."
  subtitle="Same DOM, same routes, same state as your dev server. TWD adds a sidebar that updates as you code — so testing happens alongside building, not after it."
  cta-label="Get Started"
  cta-href="/getting-started"
  image-src="/images/twd_side_bar_success.png"
  image-alt="TWD sidebar showing passing tests in the browser"
/>

## The problem

Testing gets pushed to next week. Next week never comes.

The reason isn't that you don't care — it's that testing usually runs in a different environment from where you're building. You write a feature, check it works in the browser, then context-switch to a different tool to "add tests." Suddenly what felt complete feels like overhead.

twd-js fixes this by putting the tests where the feature lives: in your real browser, in your real dev server, with a sidebar that updates as you code.

## How it works

You install `twd-js`, add the Vite plugin, and write tests next to your code in `*.twd.test.ts` files. When you run `npm run dev`, the TWD sidebar appears in your browser. Click play to run any test. Tests use the same DOM, routes, and state your users will — there's no separate test environment to keep in sync.

Selectors come from Testing Library (`screenDom.findByRole`, `findByLabelText`, …); assertions are chainable (`twd.should(el, 'be.visible')`). Mocking is built in: `twd.mockRequest(...)` intercepts fetch/XHR via a service worker so you can develop and test features without a running backend.

Nothing TWD ships to production — every `twd-js` import is dev-only (`import.meta.env.DEV`-guarded), so your prod bundle is untouched.

## Quick start

```bash
npm install --save-dev twd-js
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { twd } from 'twd-js/vite-plugin'

export default defineConfig({
  plugins: [twd({ open: true })],
})
```

```ts
// src/App.twd.test.ts
import { twd, screenDom } from 'twd-js'
import { describe, it } from 'twd-js/runner'

describe('App', () => {
  it('shows the heading', async () => {
    await twd.visit('/')
    const heading = await screenDom.findByRole('heading', { level: 1 })
    twd.should(heading, 'be.visible')
  })
})
```

Run `npm run dev` and open the app. The sidebar appears in your browser; click play to run the test.

<LandingCrossLinks
  :links='[
    { href: "/twd-relay", title: "Add an AI agent to the loop", blurb: "Let AI agents run tests in your real browser and stream structured results back." },
    { href: "/contract-testing", title: "Validate every mock", blurb: "Catch mock-vs-API drift in CI before it reaches production." },
    { href: "/getting-started", title: "Read the full setup guide", blurb: "Complete twd-js installation, configuration, and patterns reference." }
  ]'
/>
