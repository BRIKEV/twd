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

### TWDSidebar Hides in Production

```tsx
// src/main.tsx
import { TWDSidebar } from 'twd-js';

function App() {
  return (
    <div>
      <YourApp />
      {/* Automatically hidden in production builds */}
      <TWDSidebar />
    </div>
  );
}
```

The TWDSidebar component automatically detects the environment and hides itself in production.

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

## Verifying Production Builds

### 1. Build Your Application

```bash
npm run build
# or
yarn build
```

### 2. Check Build Output

```bash
# List files in dist directory
ls -la dist/

# Should NOT contain:
# - mock-sw.js (if using the plugin)
# - Any .twd.test.js files
# - TWD sidebar code (it's conditionally rendered)

# Should contain:
# - index.html
# - assets/ directory with JS/CSS
# - Your app's static assets
```

### 3. Test Production Build Locally

```bash
# Serve production build
npm run preview
# or
npx serve dist
```

Visit your app and verify:
- ✅ No TWD sidebar visible
- ✅ No console errors about missing mock-sw.js
- ✅ App functions normally without test infrastructure

## Environment Detection

TWD uses environment detection to behave differently in development vs production:

### Development Mode

```ts
// In development (npm run dev)
if (process.env.NODE_ENV === 'development') {
  // TWDSidebar is visible
  // Mock service worker can be loaded
  // Test files are discoverable
}
```

### Production Mode

```ts
// In production (npm run build)
if (process.env.NODE_ENV === 'production') {
  // TWDSidebar is hidden
  // No test infrastructure loaded
  // Optimized bundle
}
```

## Advanced Build Configuration

### Custom Build Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:staging": "tsc && vite build --mode staging",
    "build:production": "tsc && vite build --mode production",
    "preview": "vite preview",
    "clean": "rm -rf dist node_modules/.vite"
  }
}
```

### Environment-Specific Configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { removeMockServiceWorker } from 'twd-js';

export default defineConfig(({ mode }) => {
  const plugins = [react()];
  
  // Only add TWD plugin for production builds
  if (mode === 'production') {
    plugins.push(removeMockServiceWorker());
  }
  
  return {
    plugins,
    build: {
      // Production-specific build options
      minify: mode === 'production',
      sourcemap: mode !== 'production'
    }
  };
});
```

### Bundle Analysis

Verify your bundle doesn't include test code:

```bash
# Install bundle analyzer
npm install --save-dev vite-bundle-analyzer

# Analyze bundle
npx vite-bundle-analyzer
```

Look for:
- ❌ No test files in the bundle
- ❌ No mock service worker code
- ❌ No TWD development utilities
- ✅ Only production application code

## Docker Builds

### Multi-stage Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy only production build
COPY --from=builder /app/dist /usr/share/nginx/html

# Verify no test files copied
RUN ls -la /usr/share/nginx/html && \
    ! ls /usr/share/nginx/html/mock-sw.js 2>/dev/null || \
    (echo "ERROR: mock-sw.js found in production build" && exit 1)

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Build Verification

```bash
# Build Docker image
docker build -t my-app .

# Run container
docker run -p 8080:80 my-app

# Verify production build
curl http://localhost:8080
# Should serve your app without test infrastructure
```

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/build.yml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build production
        run: npm run build
      
      - name: Verify production build
        run: |
          # Verify mock-sw.js was removed
          if [ -f "dist/mock-sw.js" ]; then
            echo "ERROR: mock-sw.js found in production build"
            exit 1
          fi
          
          # Verify essential files exist
          if [ ! -f "dist/index.html" ]; then
            echo "ERROR: index.html not found"
            exit 1
          fi
          
          echo "✅ Production build verified"
      
      - name: Deploy
        run: |
          # Your deployment commands here
          echo "Deploying to production..."
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

### TWDSidebar Still Visible

If the sidebar appears in production:

1. **Check environment variables**:
   ```bash
   # Verify NODE_ENV is set correctly
   echo $NODE_ENV  # Should be 'production'
   ```

2. **Verify build process**:
   ```bash
   # Make sure you're serving the built version
   npm run build && npm run preview
   ```

3. **Check component import**:
   ```tsx
   // Make sure you're importing from the correct package
   import { TWDSidebar } from 'twd-js';  // ✅ Correct
   ```

### Large Bundle Size

If your bundle is larger than expected:

1. **Analyze bundle**:
   ```bash
   npx vite-bundle-analyzer
   ```

2. **Check for test imports**:
   ```ts
   // ❌ Don't import test utilities in production code
   import { twd } from 'twd-js';  // Only in test files
   
   // ✅ Only import what you need for production
   import { TWDSidebar } from 'twd-js';  // Only UI components
   ```

### Service Worker Errors

If you see service worker errors in production:

1. **Clear browser cache**:
   ```bash
   # Hard refresh in browser
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

2. **Unregister old service workers**:
   ```js
   // In browser console
   navigator.serviceWorker.getRegistrations().then(function(registrations) {
     for(let registration of registrations) {
       registration.unregister();
     }
   });
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

### 2. Verify Builds in CI

```yaml
# Add verification step to CI
- name: Verify production build
  run: |
    npm run build
    # Add checks for unwanted files
    ! ls dist/mock-sw.js || exit 1
```

### 3. Test Production Builds Locally

```bash
# Always test production builds before deploying
npm run build
npm run preview
```

### 4. Monitor Bundle Size

```json
{
  "scripts": {
    "build": "vite build",
    "analyze": "vite-bundle-analyzer"
  }
}
```

## Next Steps

Perfect! Your application is now ready for production deployment. Let's learn how to integrate TWD tests into your continuous integration pipeline.

👉 [CI Integration](./ci-integration)
