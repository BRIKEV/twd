import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import router from './routes.ts'
import { RouterProvider } from 'react-router'

// Only load the test sidebar and tests in development mode
if (import.meta.env.DEV) {
  // You choose how to load the tests; this example uses Vite's glob import
  const testModules = import.meta.glob("./**/*.twd.test.ts");
  const { initTests, twd, TWDSidebar } = await import('../../../src');
  // You need to pass the test modules, the sidebar component, and createRoot function
  initTests(testModules, <TWDSidebar open={true} position="left" />, createRoot);
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
