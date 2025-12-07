import { createRoot } from 'react-dom/client';
import { initTests } from './initializers/initTests';
import { TWDSidebar } from './ui/TWDSidebar';
import { twd } from '.';

interface TestModule {
  [key: string]: () => Promise<unknown>;
}

interface InitTWDOptions {
  open?: boolean;
  position?: "left" | "right";
}

export const initTWD = (files: TestModule, options?: InitTWDOptions) => {
  const { open = true, position = "left" } = options || {};
  initTests(files, <TWDSidebar open={open} position={position} />, createRoot);
  twd.initRequestMocking()
    .then(() => {
      console.log("Request mocking initialized");
    })
    .catch((err) => {
      console.error("Error initializing request mocking:", err);
    });
};