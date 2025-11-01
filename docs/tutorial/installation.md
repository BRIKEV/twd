# Installation

Set up TWD in your React project and get ready to start testing.

## Quick Start

### 1. Install TWD

```bash
npm install twd-js
# or
yarn add twd-js
```

### 2. Install Mock Service Worker

```bash
npx twd-mock init public
```

This copies the mock service worker file to your `public` directory.

### 3. Add TWD Sidebar to Your App

```tsx
// src/main.tsx or src/App.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { TWDSidebar } from 'twd-js';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    {/* Add TWD Sidebar - only shows in development */}
    <TWDSidebar />
  </React.StrictMode>
);
```

### 4. Create Your First Test File

```ts
// src/tests/app.twd.test.ts
import { describe, it, twd } from 'twd-js';

describe('App', () => {
  it('should render welcome message', async () => {
    twd.visit('/');
    
    const heading = await twd.get('h1');
    heading.should('be.visible');
  });
});
```

### 5. Start Your Development Server

```bash
npm run dev
# or
yarn dev
```

You should now see the TWD sidebar in your browser! 🎉

## Detailed Setup

### Project Structure

After installation, your project should look like this:

```
my-app/
├── public/
│   ├── mock-sw.js          # Mock service worker (added by TWD)
│   └── ...
├── src/
│   ├── tests/              # Your test files (create this)
│   │   └── *.twd.test.ts
│   ├── App.tsx
│   └── main.tsx            # TWDSidebar added here
├── package.json
└── ...
```

### Configuration Options

#### TWDSidebar Props

```tsx
<TWDSidebar 
  open={true}           // Start with sidebar open (default: true)
  position="left"       // Sidebar position: "left" | "right" (default: "left")
/>
```

#### Environment Detection

TWD automatically detects development vs production:

- **Development**: Sidebar is visible and functional
- **Production**: Sidebar is hidden (no bundle impact)

### Vite Configuration (Optional)

For production builds, add the TWD plugin to remove mock files:

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

## Troubleshooting

### Common Issues

#### Sidebar Not Showing

1. **Check console for errors** - Look for JavaScript errors
2. **Verify TWDSidebar import** - Make sure it's imported correctly
3. **Check development mode** - Sidebar only shows in development

#### Mock Service Worker Issues

1. **File not found** - Run `npx twd-mock init public` again
2. **HTTPS issues** - Service workers require HTTPS in production
3. **Browser support** - Ensure your browser supports service workers

#### Test Files Not Loading

1. **File naming** - Use `*.twd.test.ts` or `*.twd.test.js`
2. **File location** - Place files in `src/` directory or subdirectories
3. **Import errors** - Check your import statements

### Getting Help

- 📖 [API Reference](/api/) for detailed documentation
- 🐛 [Report issues](https://github.com/BRIKEV/twd/issues)
- 💬 [Ask questions](https://github.com/BRIKEV/twd/discussions)

## Next Steps

Now that TWD is installed, let's write your first test! 

👉 [First Test](./first-test)
