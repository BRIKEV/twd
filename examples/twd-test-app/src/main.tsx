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
  
  // Custom dark theme example - personalize your TWD UI experience
  const customTheme = {
    primary: '#3b82f6',           // Blue primary color
    background: '#1e293b',         // Dark slate background
    backgroundSecondary: '#334155', // Darker slate for secondary backgrounds
    border: '#475569',             // Slate border
    borderLight: '#64748b',        // Lighter slate for subtle borders
    text: '#f1f5f9',               // Light slate text
    textSecondary: '#cbd5e1',      // Medium slate for secondary text
    textMuted: '#94a3b8',         // Muted slate text
    success: '#22c55e',            // Green for passed tests
    successBg: '#14532d',          // Dark green background
    error: '#ef4444',              // Red for failed tests
    errorBg: '#7f1d1d',           // Dark red background
    warning: '#fbbf24',            // Amber for running tests
    warningBg: '#78350f',          // Dark amber background
    skip: '#475569',               // Slate for skipped tests
    skipBg: '#334155',             // Dark slate background
    buttonPrimary: '#3b82f6',     // Blue button
    buttonPrimaryText: '#ffffff',  // White text on buttons
    buttonSecondary: '#334155',    // Dark slate button
    buttonSecondaryText: '#f1f5f9', // Light text on secondary buttons
    buttonBorder: '#475569',       // Slate border
    sidebarWidth: '320px',        // Wider sidebar
    borderRadius: '8px',          // More rounded corners
    shadow: '2px 0 8px rgba(0,0,0,0.3)', // Stronger shadow for dark theme
    shadowSm: '0 2px 4px rgba(0, 0, 0, 0.2)', // Subtle shadow
    iconColor: '#f1f5f9',         // Light icon color
    iconColorSecondary: '#cbd5e1',  // Secondary icon color
  };
  
  // You need to pass the test modules, the sidebar component, createRoot function, and optional theme
  initTests(
    testModules, 
    <TWDSidebar open={false} position="left" />, 
    createRoot,
    customTheme
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
