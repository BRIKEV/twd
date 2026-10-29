---
title: Production Builds
description: Build production-ready apps without including test code or mock service workers
---

# Production Builds

Learn how to build production-ready applications without including test code or mock service workers.

## Why Remove Test Code from Production?

When building for production, you want to:

- **Reduce bundle size** - Remove test files and mock service workers
- **Improve performance** - Eliminate development-only code
- **Enhance security** - Don't expose test infrastructure
- **Clean deployment** - Only ship what users need

## Automatic Test Exclusion

TWD automatically handles most production concerns:

### Test Files Are Not Bundled

```
src/
├── components/
│   ├── Button.tsx          ✅ Included in production
│   └── Header.tsx          ✅ Included in production
├── tests/
│   ├── button.twd.test.ts  ❌ Excluded from production
│   └── header.twd.test.ts  ❌ Excluded from production
└── utils/
    └── helpers.ts          ✅ Included in production
```

Test files (`.twd.test.ts` or `.twd.test.js`) are automatically excluded from your production bundle.

## Removing the Service Worker

The mock service worker file (`mock-sw.js`) needs to be manually removed from production builds.

### Using the Vite Plugin (Recommended)

Add `removeMockServiceWorker()` alongside the `twd()` plugin you already configured for development:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { twd, removeMockServiceWorker } from 'twd-js/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    twd(),                     // dev: sidebar + tests + service worker registration
    removeMockServiceWorker(), // build: removes mock-sw.js from the build output
  ],
});
```

If you serve the worker from a custom `serviceWorkerUrl`, pass the same path: `removeMockServiceWorker({ fileName: 'workers/mock-sw.js' })`.

### What the Plugin Does

```bash
# During build process
npm run build

# Plugin output
🧹 twd: removed mock-sw.js from dist

# Or, if the client build did not contain the worker
⚠️  twd: mock-sw.js was not found in dist, nothing was removed. ...
```

The plugin:
- Only runs during build (`apply: 'build'`)
- Removes the worker from the output directory of each build, so a custom `build.outDir` or React Router v7's `build/client` works without extra configuration
- Skips server builds silently, since Vite only copies `public/` into the client output
- Warns when the client build did not contain the worker, instead of reporting success

### Nuxt

Nuxt copies `public/` into `.output/public` outside the Vite build, so the plugin cannot see the file there and prints the warning above. Remove it after the build instead:

```json
{
  "scripts": {
    "build": "nuxt build && rm -f .output/public/mock-sw.js"
  }
}
```

### Manual Removal (Alternative)

If you can't use the Vite plugin, remove the file manually from your build output:

```json
{
  "scripts": {
    "build": "vite build && rm -f dist/mock-sw.js",
    "build:win": "vite build && del dist\\mock-sw.js"
  }
}
```

## Troubleshooting

### Service Worker Still in Build

If `mock-sw.js` appears in your production build:

1. **Check Vite plugin configuration**:
   ```ts
   // Make sure plugin is added correctly
   import { removeMockServiceWorker } from 'twd-js/vite-plugin';
   
   export default defineConfig({
     plugins: [
       react(),
       removeMockServiceWorker() // Must be here
     ]
   });
   ```

2. **Verify build command**:
   ```bash
   # Make sure you're running build, not dev
   npm run build  # ✅ Correct
   npm run dev    # ❌ Wrong for production
   ```

3. **Check plugin output**:
   ```bash
   # Look for plugin messages during build
   npm run build
   # Should see: 🧹 twd: removed mock-sw.js from dist
   ```

## Best Practices

### 1. Always Use the Vite Plugin

```ts
// ✅ Recommended approach
import { removeMockServiceWorker } from 'twd-js/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    removeMockServiceWorker()
  ]
});
```
