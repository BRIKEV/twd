import { wait } from "../utils/wait";

// mockBridge.ts
export type Rule = {
  method: string;
  url: string | RegExp;
  response: unknown;
  alias: string;
  executed?: boolean;
  request?: unknown;
  status?: number;
  headers?: Record<string, string>;
  urlRegex?: boolean;
};

export interface Options {
  method: string;
  url: string | RegExp;
  response: unknown;
  status?: number;
  headers?: Record<string, string>;
  urlRegex?: boolean;
}

const rules: Rule[] = [];
const SW_DELAY = 100;

/**
 * Initialize the mocking service worker.
 * Call this once before using `mockRequest` or `waitFor`.
 */
export const initRequestMocking = async () => {
  if ("serviceWorker" in navigator) {
    await navigator.serviceWorker.register("/mock-sw.js?v=1");
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "EXECUTED") {
        const { alias, request } = event.data;
        const rule = rules.find((r) => r.alias === alias);
        if (rule) {
          rule.executed = true;
          rule.request = request;
        }
      }
    });
  }
};

/**
 * Mock a network request.
 *
 * @param alias Identifier for the mock rule. Useful for `waitFor()`.
 * @param options Options to configure the mock:
 *  - `method`: HTTP method ("GET", "POST", …)
 *  - `url`: URL string or RegExp to match
 *  - `response`: Body of the mocked response
 *  - `status`: (optional) HTTP status code (default: 200)
 *  - `headers`: (optional) Response headers
 *
 * @example
 * ```ts
 * mockRequest("getUser", {
 *   method: "GET",
 *   url: /\/api\/user\/\d+/,
 *   response: { id: 1, name: "Kevin" },
 *   status: 200,
 *   headers: { "x-mock": "true" }
 * });
 * ```
 */
export const mockRequest = async (alias: string, options: Options) => {
  const rule: Rule = { alias, ...options, executed: false };
  const idx = rules.findIndex((r) => r.alias === alias);
  if (idx !== -1) rules[idx] = rule;
  else rules.push(rule);

  // Push to SW
  navigator.serviceWorker.controller?.postMessage({
    type: "ADD_RULE",
    rule,
  });
  await wait(SW_DELAY);
  await Promise.resolve();
};

/**
 * Wait for a mocked request to be made.
 * @param alias The alias of the mock rule to wait for
 * @returns The matched rule (with body if applicable)
 */
export const waitForRequest = async (alias: string): Promise<Rule> => {
  await wait(SW_DELAY);
  const rule = rules.find((r) => r.alias === alias && r.executed);
  if (rule) return Promise.resolve(rule);
  throw new Error(`Rule ${alias} not found or not executed`);
};

/**
 * Get the current list of request mock rules.
 * @returns The current list of request mock rules.
 */
export const getRequestMockRules = () => rules;

/**
 * Clear all request mock rules.
 */
export const clearRequestMockRules = () => {
  // Also tell the SW
  navigator.serviceWorker.controller?.postMessage({
    type: "CLEAR_RULES",
  });
  rules.length = 0;
};
