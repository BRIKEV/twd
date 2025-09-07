// This automatically imports all files ending with .twd.test.ts
const modules = import.meta.glob("./**/*.twd.test.ts", { eager: true });

// You don't need to export anything; simply importing this in App.tsx
// will cause the test files to execute and register their tests.