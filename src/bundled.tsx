import { createRoot } from 'react-dom/client';
import { initTests } from './initializers/initTests';
import { TWDSidebar } from './ui/TWDSidebar';
import { twd } from '.';

interface TestModule {
  [key: string]: () => Promise<unknown>;
}

export const initTWD = (files: TestModule) => {
  initTests(files, <TWDSidebar open={true} position="left" />, createRoot);
  twd.initRequestMocking()
    .then(() => {
      console.log("Request mocking initialized");
    })
    .catch((err) => {
      console.error("Error initializing request mocking:", err);
    });
};