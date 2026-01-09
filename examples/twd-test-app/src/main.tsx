import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import router from './routes.tsx'
import { RouterProvider } from 'react-router'

// Only load the test sidebar and tests in development mode
if (import.meta.env.DEV) {
  // You choose how to load the tests; this example uses Vite's glob import
  const testModules = import.meta.glob("./**/*.twd.test.{ts,tsx}");
  const { initTests, twd, TWDSidebar } = await import('../../../src/index.ts');
  
  // You need to pass the test modules, the sidebar component, createRoot function, and optional theme
  initTests(
    testModules, 
    <TWDSidebar open={false} position="left" />, 
    createRoot,
  );
  
  // if you want to use mock requests, you can initialize it here
  twd.initRequestMocking()
    .then(() => {
      console.log("Request mocking initialized");
    })
    .catch((err) => {
      console.error("Error initializing request mocking:", err);
    });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
