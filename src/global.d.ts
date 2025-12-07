// global.d.ts
export {};

declare global {
  interface Window {
    __testRunner?: any;
    __TWD_STATE__?: any;
    __TWD_MOCK_STATE__?: any;
  }
}
