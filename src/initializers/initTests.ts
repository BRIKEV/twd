import { initSidebar } from "./initSidebar";
import { TWDTheme } from "../ui/theme";

/**
 * A record of test module paths to their loader functions.
 * Each function returns a promise that resolves when the module is loaded.
 * This is typically used with Vite's `import.meta.glob` to dynamically import test modules.
 * @example
 * ```ts
 * const testModules = {
 *   './test1.twd.test.ts': () => import('./test1.twd.test.ts'),
 *   './test2.twd.test.ts': () => import('./test2.twd.test.ts'),
 * };
 * ```
 */
type TestModule = Record<string, () => Promise<unknown>>;

/**
 * Initialize Vite test loading.
 * @param testModules - The test modules to load.
 * @param component - The React component to render the sidebar.
 * @param createRoot - Function to create a React root.
 * @param theme - Optional theme customization
 * @example
 * ```ts
 * if (import.meta.env.DEV) {
 *   const testModules = import.meta.glob("./example.twd.test.ts");
 *   const { initTests, TWDSidebar } = await import('twd-js');
 *   await initTests(testModules, <TWDSidebar open={true} position="left" />, createRoot, {
 *     primary: '#ff0000',
 *     background: '#ffffff'
 *   });
 * }
 * ```
 */
export const initTests = async (
  testModules: TestModule,
  Component: React.ReactNode,
  createRoot: (el: HTMLElement) => { render: (el: React.ReactNode) => void },
  theme?: Partial<TWDTheme>
) => {
  for (const path in testModules) await testModules[path]();
  initSidebar({ Component, createRoot, theme });
};
