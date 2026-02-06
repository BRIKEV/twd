import { wait } from "../utils/wait";
import { TWD_VERSION } from "../constants/version";

// mockBridge.ts
export type Rule = {
  method: string;
  url: string | RegExp;
  response: unknown;
  alias: string;
  executed?: boolean;
  request?: any;
  status?: number;
  responseHeaders?: Record<string, string>;
  urlRegex?: boolean;
  delay?: number;
  hitCount?: number;
};

export interface Options {
  method: string;
  url: string | RegExp;
  response: unknown;
  status?: number;
  responseHeaders?: Record<string, string>;
  urlRegex?: boolean;
  delay?: number;
}

interface MockState {
  rules: Rule[];
  counts: Record<string, number>;
}

const getMockState = (): MockState => {
  if (typeof window !== 'undefined') {
    if (!window.__TWD_MOCK_STATE__) {
      window.__TWD_MOCK_STATE__ = {
        rules: [],
        counts: {},
      };
    }
    return window.__TWD_MOCK_STATE__ as MockState;
  }
  
  return {
    rules: [],
    counts: {},
  };
};

const state = getMockState();
const rules = state.rules;
const SW_DELAY = 100;
let initialized = false;

/**
 * Initialize the mocking service worker.
 * Call this once before using `mockRequest` or `waitFor`.
 */
export const initRequestMocking = async (path?: string) => {
  if (initialized) {
    console.warn('[TWD] Request mocking already initialized');
    return;
  }

  if ("serviceWorker" in navigator) {
    initialized = true;
    const workerPath = path ?? '/mock-sw.js';
    await navigator.serviceWorker.register(`${workerPath}?v=${TWD_VERSION}`);
    // Wait for the service worker to actually control the page
    if (!navigator.serviceWorker.controller) {
      await new Promise(resolve => {
        navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
      });
    }
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "EXECUTED") {
        const { alias, request, hitCount } = event.data;
        const rule = rules.find((r) => r.alias === alias);
        if (rule) {
          rule.executed = true;
          rule.request = request;
          rule.hitCount = hitCount;
        }
        state.counts[alias] = hitCount ?? ((state.counts[alias] ?? 0) + 1);
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
 *  - `responseHeaders`: (optional) Response headers
 *  - `urlRegex`: (optional) Whether the URL is a regex (default: false)
 *  - `delay`: (optional) Delay in ms before returning the response
 *
 * @example
 * ```ts
 * mockRequest("getUser", {
 *   method: "GET",
 *   url: /\/api\/user\/\d+/,
 *   response: { id: 1, name: "Kevin" },
 *   status: 200,
 *   responseHeaders: { "x-mock": "true" }
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
    version: TWD_VERSION,
  });
  await wait(SW_DELAY);
  await Promise.resolve();
};

/**
 * wait for a list of mocked requests to be made.
 * @param aliases The aliases of the mock rules to wait for
 * @returns The matched rules (with body if applicable)
 * @example
 * ```ts
 * await waitForRequests(["getUser", "postComment"]);
 * ```
 */
export const waitForRequests = async (aliases: string[]): Promise<Rule[]> => {
  const rules = await Promise.all(
    aliases.map((alias) => waitForRequest(alias))
  );
  return rules;
};

/**
 * Wait for a mocked request to be made.
 * @param alias The alias of the mock rule to wait for
 * @param retries The number of retries to make
 * @param retryDelay The delay between retries
 * @returns The matched rule (with body if applicable)
 */
export const waitForRequest = async (
  alias: string,
  retries = 10,
  retryDelay = 100,
): Promise<Rule> => {
  // First, check if the rule exists at all
  const ruleExists = rules.find((r) => r.alias === alias);
  if (!ruleExists) {
    throw new Error(`Rule ${alias} not found`);
  }
  // Poll for execution with retries
  for (let i = 0; i < retries; i++) {
    const rule = rules.find((r) => r.alias === alias && r.executed);
    if (rule) {
      return Promise.resolve(rule);
    }
    // Wait before next retry (except on last iteration)
    if (i < retries - 1) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  console.log(`Rule ${alias} was not executed within ${retries * retryDelay}ms`);
  // If we get here, the rule was never executed
  throw new Error(`Rule ${alias} was not executed within ${retries * retryDelay}ms`);
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
    version: TWD_VERSION,
  });
  rules.length = 0;
  // Reset all hit counters
  for (const key in state.counts) {
    delete state.counts[key];
  }
};

/**
 * Get the number of times a specific mock rule was hit.
 * @param alias The alias of the mock rule
 * @returns The number of times the rule was matched
 */
export const getRequestCount = (alias: string): number => {
  return state.counts[alias] ?? 0;
};

/**
 * Get a snapshot of all mock rule hit counts.
 * @returns An object mapping rule aliases to their hit counts
 */
export const getRequestCounts = (): Record<string, number> => {
  return { ...state.counts };
};

/**
 * Reset the initialized state. Only use in tests.
 * @internal
 */
export const resetMockingState = () => {
  initialized = false;
};
