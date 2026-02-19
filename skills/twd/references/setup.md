# TWD Setup Reference

## Step 1: Install Packages

```bash
npm install twd-js
npm install --save-dev twd-relay
```

## Step 2: Initialize Mock Service Worker

```bash
npx twd-js init public
```

This copies `mock-sw.js` to the `public/` directory. If the public directory has a different name (e.g., `static/`), use that path instead.

## Step 3: Configure Entry Point

TWD should only load in development mode.

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
  const tests = {
    './twd-tests/feature.twd.test.ts': () => import('./twd-tests/feature.twd.test'),
  };
  initTWD(tests, { open: true, position: 'left' });
}
```

## Step 4: Vite Plugins

```typescript
// vite.config.ts
import { twdHmr } from 'twd-js/vite-plugin';
import { twdRemote } from 'twd-relay/vite';
import type { PluginOption } from 'vite';

export default defineConfig({
  plugins: [
    // ... other plugins
    twdHmr(),
    twdRemote() as PluginOption,
  ],
});
```

## Step 5: Connect Browser Client (for twd-relay)

```typescript
// Add inside your import.meta.env.DEV block, after initTWD:
import { createBrowserClient } from 'twd-relay/browser';
const client = createBrowserClient();
client.connect();
```

## Step 6: Write a First Test

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

## Verify Setup

```bash
npx twd-relay run
```

If exit code is 0 and the test passes, setup is complete.
