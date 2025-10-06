import { waitForElement, wait } from "./utils/wait";
import { popSuite, pushSuite, register } from "./twdRegistry";
import { runAssertion } from "./asserts";
import { log } from "./utils/log";
import { mockRequest, Options, Rule, waitForRequest, initRequestMocking, clearRequestMockRules, getRequestMockRules } from "./commands/mockBridge";
import type { AnyAssertion, ArgsFor, TWDElemAPI } from "./twd-types";
import urlCommand, { type URLCommandAPI } from "./commands/url";
import { visit } from "./commands/visit";

/**
 * Stores the function to run before each test.
 */
let beforeEachFn: (() => void | Promise<void>) | null = null;

/**
 * Registers a function to run before each test.
 * @example
 * beforeEach(() => { ... });
 */
export const beforeEach = (fn: typeof beforeEachFn) => {
  beforeEachFn = fn;
};

/**
 * Groups related tests together.
 * @example
 * describe("My group", () => { ... });
 */
export const describe = (name: string, fn: () => void) => {
  pushSuite(name);
  fn(); // for now, just run immediately
  popSuite();
};

/**
 * Defines a test case.
 * @example
 * it("does something", async () => { ... });
 */
export const it = (name: string, fn: () => Promise<void> | void) => {
  register(name, async () => {
    if (beforeEachFn) await beforeEachFn();
    await fn();
  });
};

/**
 * Defines an exclusive test case (only this runs).
 * @example
 * itOnly("runs only this", async () => { ... });
 */
export const itOnly = (name: string, fn: () => Promise<void> | void) => {
  register(name, async () => {
    if (beforeEachFn) await beforeEachFn();
    await fn();
  }, { only: true });
};

/**
 * Skips a test case.
 * @example
 * itSkip("skipped test", () => { ... });
 */
export const itSkip = (name: string, _fn: () => Promise<void> | void) => {
  register(name, async () => {}, { skip: true });
};

interface TWDAPI {
  /**
   * Finds an element by selector and returns the TWD API for it.
   * @param selector CSS selector
   * @returns {Promise<TWDElemAPI>} The TWD API for the element
   * 
   * @example
   * ```ts
   * const btn = await twd.get("button");
   * 
   * ```
   * 
   */
  get: (selector: string) => Promise<TWDElemAPI>;
  /**
   * Simulates visiting a URL (SPA navigation).
   * @param url The URL to visit
   *
   * @example
   * ```ts
   * twd.visit("/contact");
   * 
   * ```
   */
  visit: (url: string) => void;
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
  mockRequest: (alias: string, options: Options) => void;
  /**
   * Wait for a mocked request to be made.
   * @param alias The alias of the mock rule to wait for
   * @return The matched rule (with body if applicable)
   * 
   * @example
   * ```ts
   * const rule = await twd.waitFor("aliasId");
   * console.log(rule.body);
   * 
   * ```
   */
  waitForRequest: (alias: string) => Promise<Rule>;
  /**
   * URL-related assertions.
   *
   * @example
   * ```ts
   * twd.url().should("eq", "http://localhost:3000/contact");
   * twd.url().should("contain.url", "/contact");
   * 
   * ```
   */
  url: () => URLCommandAPI;
  /**
   * Initializes request mocking (registers the service worker).
   * Must be called before using `twd.mockRequest()`.
   *
   * @example
   * ```ts
   * await twd.initRequestMocking();
   * 
   * ```
   */
  initRequestMocking: () => Promise<void>;
  /**
   * Clears all request mock rules.
   *
   * @example
   * ```ts
   * twd.clearRequestMockRules();
   * 
   * ```
   */
  clearRequestMockRules: () => void;
  /**
   * Gets all current request mock rules.
   *
   * @example
   * ```ts
   * const rules = twd.getRequestMockRules();
   * console.log(rules);
   * ```
   */
  getRequestMockRules: () => Rule[];
  /**
   * Waits for a specified time.
   * @param time Time in milliseconds to wait
   * @returns A promise that resolves after the specified time
   * @example
   * ```ts
   * await twd.wait(500); // wait for 500ms
   * ```
   */
  wait: (time: number) => Promise<void>;
}

/**
 * Mini Cypress-style helpers for DOM testing.
 * @namespace twd
 */
export const twd: TWDAPI = {
  get: async (selector: string): Promise<TWDElemAPI> => {
    log(`Searching get("${selector}")`);
    const el = await waitForElement(() => document.querySelector(selector));

    const api: TWDElemAPI = {
      el,
      should: (name: AnyAssertion, ...args: ArgsFor<AnyAssertion>) => {
        const message = runAssertion(el, name, ...args);
        log(message);
        return api;
      },
    };
    return api;
  },
  visit,
  url: urlCommand,
  mockRequest,
  waitForRequest,
  initRequestMocking,
  clearRequestMockRules,
  getRequestMockRules,
  wait,
};
