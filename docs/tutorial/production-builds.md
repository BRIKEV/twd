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

## Removing Mock Service Worker

The mock service worker file (`mock-sw.js`) needs to be manually removed from production builds.

### Using the Vite Plugin (Recommended)

Install and configure the TWD Vite plugin:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { removeMockServiceWorker } from 'twd-js';

export default defineConfig({
  plugins: [
    react(),
    removeMockServiceWorker() // Removes mock-sw.js from build
  ]
});
```

### What the Plugin Does

```bash
# During build process
npm run build

# Plugin output
🧹 Removed mock-sw.js from build

# Or if no mock file found
🧹 No mock-sw.js found in build
```

The plugin:
- Only runs during build (`apply: 'build'`)
- Removes `dist/mock-sw.js` after build completes
- Provides feedback about the removal
- Fails gracefully if no mock file exists

### Manual Removal (Alternative)

If you can't use the Vite plugin, remove the file manually:

```json
{
  "scripts": {
    "build": "vite build && rm -f dist/mock-sw.js",
    "build:win": "vite build && del dist\\mock-sw.js"
  }
}
```

## Troubleshooting

### Mock Service Worker Still in Build

If `mock-sw.js` appears in your production build:

1. **Check Vite plugin configuration**:
   ```ts
   // Make sure plugin is added correctly
   import { removeMockServiceWorker } from 'twd-js';
   
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
   # Should see: 🧹 Removed mock-sw.js from build
   ```

## Best Practices

### 1. Always Use the Vite Plugin

```ts
// ✅ Recommended approach
import { removeMockServiceWorker } from 'twd-js';

export default defineConfig({
  plugins: [
    react(),
    removeMockServiceWorker()
  ]
});
```
