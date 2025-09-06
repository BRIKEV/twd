import { waitForElement } from "utils/wait";
import { register } from "./twdRegistry";
import { runAssertion } from "asserts";
import { log } from "utils/log";
import { mockRequest, waitFor } from "requests/mockResponses";
import type { AnyAssertion, ArgsFor, TWDElemAPI } from "./twd-types";

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
export const describe = (_: string, fn: () => void) => {
  fn(); // for now, just run immediately
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
   * Example:
   * 
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
   * Example:
   * 
   * ```ts
   * twd.visit("/contact");
   * 
   * ```
   */
  visit: (url: string) => void;
  /**
   * Mock a network request.
   * @param alias Identifier for the mock rule. Useful for waitFor().
   * @param method HTTP method (GET, POST, etc.)
   * @param url URL or pattern to match
   * @param response Mocked response data
   * 
   * Example:
   * 
   * ```ts
   * twd.mockRequest("aliasId", "GET", "https://your.api/endpoint", {
   *   value: "Mocked response!",
   * });
   * 
   * ```
   */
  mockRequest: (alias: string, method: string, url: string | RegExp, response: unknown) => void;
  /**
   * Wait for a mocked request to be made.
   * @param alias The alias of the mock rule to wait for
   * 
   * Example:
   * 
   * ```ts
   * await twd.waitFor("aliasId");
   * 
   * ```
   */
  waitFor: (alias: string) => Promise<void>;
}

/**
 * Mini Cypress-style helpers for DOM testing.
 * @namespace twd
 */
export const twd: TWDAPI = {
  get: async (selector: string): Promise<TWDElemAPI> => {
    log(`🔎 get("${selector}")`);
    const el = await waitForElement(() => document.querySelector(selector));

    const api: TWDElemAPI = {
      el,
      click: () => {
        log(`🖱️ click(${selector})`);
        el.click();
      },
      type: (text: string) => {
        log(`⌨️ type("${text}") into ${selector}`);
        (el as HTMLInputElement).value = text;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        return el as HTMLInputElement;
      },
      should: (name: AnyAssertion, ...args: ArgsFor<AnyAssertion>) => {
        runAssertion(el, name, ...args);
        return api;
      },
      text: () => {
        const content = el.textContent || "";
        log(`📄 text(${selector}) → "${content}"`);
        return content;
      },
    };
    return api;
  },
  visit: (url: string) => {
    log(`🌍 visit("${url}")`);
    window.history.pushState({}, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  },
  mockRequest,
  waitFor,
};
