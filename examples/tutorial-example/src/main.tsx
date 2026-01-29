import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from "react-router";
import router from './AppRoutes';

// Only load the test sidebar and tests in development mode
if (import.meta.env.DEV) {
  const { initTWD } = await import('./dist/bundled.es.js');
  const tests = import.meta.glob("./**/*.twd.test.ts");
  
  // Initialize TWD with tests and optional configuration
  // Request mocking is automatically initialized by default
  initTWD(tests, { 
    open: true, 
    position: 'left',
    serviceWorker: true,           // Enable request mocking (default: true)
    serviceWorkerUrl: '/mock-sw.js' // Custom service worker path (default: '/mock-sw.js')
  });
}

const App = () => {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
