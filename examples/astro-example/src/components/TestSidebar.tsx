import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

export default function TestSidebar() {
  useEffect(() => {
    // Only load the test sidebar and tests in development mode
    if (import.meta.env.DEV) {
      const initializeTests = async () => {
        try {
          // Use Vite's glob import to find all test files
          const testModules = import.meta.glob("../**/*.twd.test.ts");
          const { initTests, twd, TWDSidebar } = await import('twd-js');
          // You need to pass the test modules, the sidebar component, and createRoot function
          initTests(testModules, <TWDSidebar open={true} position="left" />, createRoot);
          
          // Optionally initialize request mocking
          twd.initRequestMocking()
            .then(() => {
              console.log("Request mocking initialized");
            })
            .catch((err) => {
              console.error("Error initializing request mocking:", err);
            });
        } catch (error) {
          console.error("Error initializing tests:", error);
        }
      };

      initializeTests();
    }
  }, []);

  return <div id="test-sidebar-container"></div>;
}