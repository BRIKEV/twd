---
title: Token-efficient browser testing for AI agents — TWD
description: Claude Code triggers tests in your live app and streams structured results back. No Playwright, no screenshots, no token bleed.
head:
  - - meta
    - property: og:title
      content: Token-efficient browser testing for AI agents — TWD
  - - meta
    - property: og:description
      content: Claude Code triggers tests in your live app and streams structured results back. No Playwright, no screenshots, no token bleed.
---

<LandingHero
  eyebrow="twd-relay · for AI agents"
  title="Token-efficient browser testing for AI agents."
  subtitle="Claude Code (or any agent) triggers test runs in your live app and streams structured pass/fail results back. No Playwright, no screenshots, no token bleed. Just write → run → read → fix."
  cta-label="Read the setup guide"
  cta-href="/ai-remote-testing"
  image-src="/images/twd-skill.gif"
  image-alt="AI agent driving TWD: writing tests and watching them pass in the browser sidebar"
/>

## The problem

AI agents write test files that look correct, then never execute them in a real browser. No one notices until production does.

The other half of the problem: when agents *do* try to run browser tests, they usually reach for Playwright or Puppeteer MCP. Those tools talk back in screenshots and DOM dumps, and the payloads are huge. A single test run can burn thousands of tokens on visual diffs the agent can't really reason about.

twd-relay fixes both halves. It runs in the dev server you already have open, and it streams structured pass/fail events back over a WebSocket. Text, not pixels.

## How it works

`twd-relay` is a WebSocket server that routes messages between your **browser** (where TWD is loaded) and an **external client** (an AI agent, a script, or the bundled `twd-relay run` CLI).

```
┌───────────────┐     WebSocket      ┌──────────────────┐                ┌───────────────────┐
│  AI Agent     │◄──────────────────►│  Relay Server    │◄──────────────►│  Browser (TWD)    │
│  (Claude Code,│   /__twd/ws        │  (Vite plugin or │                │  Test runner +    │
│   script)     │                    │   standalone)    │                │  sidebar UI       │
└───────────────┘                    └──────────────────┘                └───────────────────┘
```

The agent sends `{ type: "run", scope: "all" }`; the relay forwards it to the browser; TWD runs the tests; per-test events stream back; the relay closes with `run:complete`. The agent reads pass/fail/skip counts, opens failing test names, fixes the code, and runs again. A tight write/run/read/fix loop with no browser automation runtime, no screenshots, and a tiny token footprint per iteration.

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

Add a line to your agent's instructions file (e.g. `CLAUDE.md`):

```text
To run TWD tests: npx twd-relay run
Exit code 0 means all tests passed; 1 means failures or errors.
```

That's it. Start `npm run dev`, leave the tab open, and your agent can drive tests on demand.

<LandingCrossLinks
  :links='[
    { href: "/twd-js", title: "Start with the sidebar", blurb: "Get the core in-browser testing experience before plugging in AI." },
    { href: "/contract-testing", title: "Validate mocks in CI", blurb: "Once your tests are stable, gate every mock against the real OpenAPI spec." },
    { href: "/ai-remote-testing", title: "Full protocol and recovery docs", blurb: "Heartbeats, throttle-abort, RUN_IN_PROGRESS recovery, and the message protocol." }
  ]'
/>
