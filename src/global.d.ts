// global.d.ts
export {};

declare global {
  interface Window {
    __testRunner?: TestRunner;
  }
}
