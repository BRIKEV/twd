import { twd } from "../../../src";

// This automatically imports all files ending with .twd.test.ts
import.meta.glob("./**/*.twd.test.ts", { eager: true });
twd.initRequestMocking()
  .then(() => {
    console.log("Request mocking initialized");
  })
  .catch((err) => {
    console.error("Error initializing request mocking:", err);
  });
// You don't need to export anything; simply importing this in App.tsx
// will cause the test files to execute and register their tests.