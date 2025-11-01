import { waitForElement, wait, waitForElements } from "./utils/wait";
import { runAssertion } from "./asserts";
import { log } from "./utils/log";
import { mockRequest, Options, Rule, waitForRequest, initRequestMocking, clearRequestMockRules, getRequestMockRules, waitForRequests } from "./commands/mockBridge";
import type { AnyAssertion, ArgsFor, TWDElemAPI } from "./twd-types";
import urlCommand, { type URLCommandAPI } from "./commands/url";
import { visit } from "./commands/visit";

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
   * Sets the value of an input element and dispatches an input event. We recommend using this only for range, color, time inputs.
   * @param el The input element
   * @param value The value to set
   * 
   * @example
   * ```ts
   * const input = await twd.get("input[type='time']");
   * twd.setInputValue(input.el, "13:30");
   * 
   * ```
   */
  setInputValue: (el: Element, value: string) => void;
  /**
   * Finds multiple elements by selector and returns an array of TWD APIs for them.
   * @param selector CSS selector
   * @returns {Promise<TWDElemAPI[]>} Array of TWD APIs for the elements
   * 
   * @example
   * ```ts
   * const items = await twd.getAll(".item");
   * items.at(0).should("be.visible");
   * items.at(1).should("contain.text", "Hello");
   * expect(items).to.have.length(3);
   * ```
   */
  getAll: (selector: string) => Promise<TWDElemAPI[]>;
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
  visit: (url: string) => Promise<void>;
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
   * wait for a list of mocked requests to be made.
   * @param aliases The aliases of the mock rules to wait for
   * @returns The matched rules (with body if applicable)
   * @example
   * ```ts
   * const rules = await waitForRequests(["getUser", "postComment"]);
   * ```
   */
  waitForRequests: (aliases: string[]) => Promise<Rule[]>;
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
    // Prepend selector to exclude TWD sidebar elements
    const enhancedSelector = `body > div:not(#twd-sidebar-root) ${selector}`;
    log(`Searching get("${selector}")`);
    const el = await waitForElement(() => document.querySelector(enhancedSelector));

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
  setInputValue: (el: Element, value: string) => {
    const { set } = Object.getOwnPropertyDescriptor(
       // @ts-expect-error we ignore this error because __proto__ exists
      el.__proto__,
      'value'
    )!;
    // @ts-expect-error we ignore this error because we know set exists
    set.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  },
  getAll: async (selector: string): Promise<TWDElemAPI[]> => {
    // Prepend selector to exclude TWD sidebar elements
    const enhancedSelector = `body > div:not(#twd-sidebar-root) ${selector}`;
    log(`Searching getAll("${selector}")`);
    const els = await waitForElements(() => document.querySelectorAll(enhancedSelector));

    return els.map((el) => {
      const api: TWDElemAPI = {
        el: el as HTMLElement,
        should: (name: AnyAssertion, ...args: ArgsFor<AnyAssertion>) => {
          const message = runAssertion(el as HTMLElement, name, ...args);
          log(message);
          return api;
        },
      };
      return api;
    });
  },
  visit,
  url: urlCommand,
  mockRequest,
  waitForRequest,
  waitForRequests,
  initRequestMocking,
  clearRequestMockRules,
  getRequestMockRules,
  wait,
};
