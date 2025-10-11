import { initSidebar } from "./initSidebar";

interface Options {
  open: boolean;
  position?: 'left' | 'right';
}

type TestModule = Record<string, () => Promise<unknown>>;

/**
 * Initialize Vite test loading.
 * @param testModules - The test modules to load.
 * @param options - Options for initializing the test loader.
 * @example
 * ```ts
 * if (import.meta.env.DEV) {
 *   const testModules = import.meta.glob("./example.twd.test.ts");
 *   const { initViteLoadTests } = await import('twd-js');
 *   await initViteLoadTests(testModules, { open: false, position: 'left' });
 * }
 * ```
 */
export const initViteLoadTests = async (testModules: TestModule, options: Options) => {
  for (const path in testModules) await testModules[path]();
  initSidebar({ open: options.open, position: options.position });
};
