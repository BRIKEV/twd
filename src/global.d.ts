// global.d.ts
export {};

declare global {
  interface Window {
    __testRunner?: any;
    __TWD_STATE__?: any;
    __twdSetPace?: (ms: unknown) => number;
    __TWD_MOCK_STATE__?: any;
    __twdCollectMock?: (mock: {
      alias: string;
      url: string;
      method: string;
      status: number;
      response: unknown;
      responseHeaders?: Record<string, string>;
      urlRegex: boolean;
      testId: string;
    }) => void;
    /** Raised by twdSnapshot({ debug: true }) or by twd-cli. Gates matchLayout entirely. */
    __TWD_SNAPSHOTS__?: boolean;
    /** Rewrite an existing reference instead of failing. Set by twd-cli --update-snapshots. */
    __TWD_UPDATE_SNAPSHOTS__?: boolean;
    /** A missing reference is a failure and is never created. Set by twd-cli. */
    __TWD_SNAPSHOT_CI__?: boolean;
  }
}
