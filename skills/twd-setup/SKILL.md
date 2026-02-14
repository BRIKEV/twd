---
name: twd-setup
description: TWD project setup guide — helps AI agents install and configure TWD (Test While Developing) in a new or existing project. Use when setting up TWD, configuring Vite, or troubleshooting TWD initialization.
---

# TWD Project Setup Guide

You are helping set up **TWD (Test While Developing)**, an in-browser testing library for SPAs. Follow these steps carefully.

**Supported frameworks:** React, Vue, Angular, Solid.js, Astro (with React), React Router (Framework Mode)
**Not compatible with:** Next.js App Router, SSR-first architectures

## Step 1: Install TWD

```bash
npm install twd-js
```

## Step 2: Initialize Mock Service Worker

Required for API mocking. Run this in the project root:

```bash
npx twd-js init public
```

This copies `mock-sw.js` to the `public/` directory. If the public directory has a different name (e.g., `static/`), use that path instead.

## Step 3: Configure Entry Point

TWD should only load in development mode. Choose the setup based on the framework:

### Bundled Setup (Recommended — all frameworks)

```typescript
// src/main.ts (or main.tsx)
if (import.meta.env.DEV) {
  const { initTWD } = await import('twd-js/bundled');
  const tests = import.meta.glob("./**/*.twd.test.ts");

  initTWD(tests, {
    open: true,
    position: 'left',
    serviceWorker: true,
    serviceWorkerUrl: '/mock-sw.js',
  });
}
```

**initTWD options:**
- `open` (boolean) — sidebar open by default. Default: `true`
- `position` (`"left"` | `"right"`) — sidebar position. Default: `"left"`
- `serviceWorker` (boolean) — enable API mocking. Default: `true`
- `serviceWorkerUrl` (string) — service worker path. Default: `'/mock-sw.js'`
- `theme` (object) — custom theme. See TWD theming docs.

### Standard Setup (React only — more control)

```tsx
// src/main.tsx
import { createRoot } from 'react-dom/client';

if (import.meta.env.DEV) {
  const testModules = import.meta.glob("./**/*.twd.test.ts");
  const { initTests, twd, TWDSidebar } = await import('twd-js');
  initTests(testModules, <TWDSidebar open={true} position="left" />, createRoot);
  twd.initRequestMocking().catch(console.error);
}
```

### Framework-Specific Notes

**Vue:**
```typescript
// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';

if (import.meta.env.DEV) {
  const { initTWD } = await import('twd-js/bundled');
  const tests = import.meta.glob("./**/*.twd.test.ts");
  initTWD(tests, { open: true, position: 'left' });
}

createApp(App).mount('#app');
```

**Angular:**
```typescript
// src/main.ts
import { isDevMode } from '@angular/core';

if (isDevMode()) {
  const { initTWD } = await import('twd-js/bundled');
  // Angular may not support import.meta.glob — define tests manually:
  const tests = {
    './twd-tests/feature.twd.test.ts': () => import('./twd-tests/feature.twd.test'),
  };
  initTWD(tests, { open: true, position: 'left' });
}
```

**Solid.js:**
```tsx
// src/main.tsx
if (import.meta.env.DEV) {
  const { initTWD } = await import('twd-js/bundled');
  const tests = import.meta.glob("./**/*.twd.test.ts");
  initTWD(tests, { open: true, position: 'left' });
}
```

## Step 4: Add Vite HMR Plugin (Recommended)

Prevents test entries from duplicating during hot module replacement:

```typescript
// vite.config.ts
import { twdHmr } from 'twd-js/vite-plugin';

export default defineConfig({
  plugins: [
    // ... other plugins
    twdHmr(),
  ],
});
```

## Step 5: Write a First Test

Create a test file to verify the setup:

```typescript
// src/App.twd.test.ts
import { twd, screenDom } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("App", () => {
  it("should render the main heading", async () => {
    await twd.visit("/");
    const heading = screenDom.getByRole("heading", { level: 1 });
    twd.should(heading, "be.visible");
  });
});
```

## Step 6: Run the App

```bash
npm run dev
```

The TWD sidebar should appear in the browser. Click it to view and run tests.

## Optional: AI Remote Testing (twd-relay)

For AI agents that need to run tests from the CLI:

```bash
npm install --save-dev twd-relay
```

**Vite plugin setup (recommended):**

```typescript
// vite.config.ts
import { twdRemote } from 'twd-relay/vite';

export default defineConfig({
  plugins: [
    // ... other plugins
    twdRemote(),
  ],
});
```

**Connect browser client:**

```typescript
// Add inside your import.meta.env.DEV block, after initTWD:
import { createBrowserClient } from 'twd-relay/browser';
const client = createBrowserClient();
client.connect();
```

**Run tests from CLI:**

```bash
npx twd-relay run
```

## Troubleshooting

### Tests Not Loading
- Verify `import.meta.env.DEV` is true (dev mode)
- Check file naming: must be `*.twd.test.ts` or `*.twd.test.tsx`
- Ensure the `initTWD`/`initTests` call is in the main entry file
- Check the glob pattern matches your test file locations

### Mock Service Worker Issues
- Run `npx twd-js init public` to install the service worker
- With standard setup: ensure `twd.initRequestMocking()` is called
- Check browser console for service worker registration errors

### Test Duplication on HMR
- Add `twdHmr()` plugin to Vite config

### Sidebar Not Appearing
- Confirm you're in development mode
- Check browser console for initialization errors
- Ensure the entry point code runs before the app renders
