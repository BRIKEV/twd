---
title: Watch your AI agent test in your own browser — twd-relay
description: Optional companion to the headless agent loop. twd-relay runs your agent's TWD tests inside the browser tab you already have open, so you can watch them live.
head:
  - - meta
    - property: og:title
      content: Watch your AI agent test in your own browser — twd-relay
  - - meta
    - property: og:description
      content: Optional companion to the headless agent loop. twd-relay runs your agent's TWD tests inside the browser tab you already have open, so you can watch them live.
---

<LandingHero
  eyebrow="twd-relay · optional"
  title="Watch your agent test in your own browser."
  subtitle="Your agent runs TWD tests headlessly by default. Add twd-relay when you want to see them run live in the tab you already have open — for pairing, demos, or understanding a tricky test."
  cta-label="Set up live watching"
  cta-href="/ai-remote-testing"
  image-src="/images/twd-skill.gif"
  image-alt="AI agent driving TWD: tests running and passing in the browser sidebar"
/>

## When you want it

The [agent loop](/ai-overview) runs with `twd-cli`: a headless browser against your dev
server, so nobody has to keep a tab open and several agents can work in parallel. That is
the default, and it stays the default.

`twd-relay` is for the moments a human wants to **watch**. It connects the agent to the
tab you are looking at, so the sidebar lights up as each test runs. The trade-off: the tab
has to stay open and in the foreground while the run lasts.

To review what an agent built after the fact, [record the tests](/recording) instead — a
clip per test lands on the pull request, with nobody watching live.

## Quick start

```bash
npm install --save-dev twd-relay
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { twd } from 'twd-js/vite-plugin'
import { twdRemote } from 'twd-relay/vite'

export default defineConfig({
  plugins: [
    twd(),          // sidebar + test discovery
    twdRemote(),    // relay endpoint + auto-injected browser client
  ],
})
```

Start `npm run dev`, open the app, and ask your agent to _"run the tests with twd-relay so
I can watch"_. Or trigger a run yourself:

```bash
npx twd-relay run
```

<LandingCrossLinks
  :links='[
    { href: "/ai-overview", title: "Get started with AI agents", blurb: "Install the skills and let your agent write, run and fix tests headlessly." },
    { href: "/recording", title: "Record instead of watching", blurb: "One clip per test on the pull request, reviewed whenever you have a minute." },
    { href: "/ai-remote-testing", title: "Full relay setup and recovery docs", blurb: "Non-Vite setup, throttled tabs, stuck runs and the message protocol." }
  ]'
/>
