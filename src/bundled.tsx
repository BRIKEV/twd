import { render } from 'preact';
import { initTests } from './initializers/initTests';
import { TWDSidebar } from './ui/TWDSidebar';
import { initRequestMocking } from './commands/mockBridge';

interface TestModule {
  [key: string]: () => Promise<unknown>;
}

interface InitTWDOptions {
  open?: boolean;
  position?: "left" | "right";
  serviceWorker?: boolean;
  serviceWorkerUrl?: string;
}

// Create a compatibility wrapper for Preact's render to match React's createRoot API
const createRoot = (el: HTMLElement) => ({
  render: (component: any) => {
    render(component, el);
  },
});

/**
 * Initialize TWD with tests and optional configuration
 * @param files The test modules
 * @param options The options for the initialization
 * @param options.open Whether to open the sidebar
 * @param options.position The position of the sidebar
 * @param options.serviceWorker Whether to use the service worker
 * @param options.serviceWorkerUrl The URL of the service worker
 * @returns void
 * @example
 * initTWD(testModules, { open: true, position: 'left' });
 * @example
 * initTWD(testModules, { open: true, position: 'left', serviceWorker: false });
 * @example
 * initTWD(testModules, { open: true, position: 'left', serviceWorker: true, serviceWorkerUrl: '/mock-sw.js' });
 */
export const initTWD = (files: TestModule, options?: InitTWDOptions) => {
  const { open = true, position = "left", serviceWorker = true, serviceWorkerUrl = '/mock-sw.js' } = options || {};
  initTests(files, <TWDSidebar open={open} position={position} />, createRoot);
  if (serviceWorker) {
  initRequestMocking(serviceWorkerUrl)
    .then(() => {
      console.log("Request mocking initialized");
    })
      .catch((err) => {
        console.error("Error initializing request mocking:", err);
      });
  }
};