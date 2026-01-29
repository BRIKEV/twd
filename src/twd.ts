import { waitForElement, wait, waitForElements } from "./utils/wait";
import { runAssertion } from "./asserts";
import { log } from "./utils/log";
import { mockRequest, Options, Rule, waitForRequest, initRequestMocking, clearRequestMockRules, getRequestMockRules, waitForRequests } from "./commands/mockBridge";
import type { AnyAssertion, ArgsFor, TWDElemAPI } from "./twd-types";
import urlCommand, { type URLCommandAPI } from "./commands/url";
import { visit } from "./commands/visit";
import { mockComponent, clearComponentMocks } from "./ui/componentMocks";

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
   * @param [reload] Whether to force a reload even if already on the URL (optional)
   *
   * @example
   * ```ts
   * twd.visit("/contact");
   * // visit with reload
   * twd.visit("/contact", true);
   * ```
   */
  visit: (url: string, reload?: boolean) => Promise<void>;
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
  mockRequest: (alias: string, options: Options) => Promise<void>;
  /**
   * Wait for a mocked request to be made.
   * @param alias The alias of the mock rule to wait for
   * @param retries The number of retries to make
   * @param retryDelay The delay between retries
   * @return The matched rule (with body if applicable)
   * 
   * @example
   * ```ts
   * const rule = await twd.waitFor("aliasId");
   * console.log(rule.body);
   * const rule = await twd.waitFor("aliasId", 5, 100);
   * console.log(rule.body);
   * 
   * ```
   */
  waitForRequest: (alias: string, retries?: number, retryDelay?: number) => Promise<Rule>;
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
   * @param [path] service worker absolute path (optional)
   *
   * @example
   * ```ts
   * await twd.initRequestMocking();
   * // init with custom service worker path
   * await twd.initRequestMocking('/test-path/mock-sw.js');
   * ```
   */
  initRequestMocking: (path?: string) => Promise<void>;
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
  /**
   * Asserts something about the element.
   * @param el The element to assert on
   * @param name The name of the assertion.
   * @param args Arguments for the assertion.
   * @returns The same API for chaining.
   * @example
   * ```ts
   * const button = await twd.get("button");
   * const text = screenDom.getByText("Hello");
   * twd.should(button.el, "have.text", "Hello");
   * twd.should(text, "be.empty");
   * twd.should(button.el, "have.class", "active");
   * ```
   */
  should: (el: Element, name: AnyAssertion, ...args: ArgsFor<AnyAssertion>) => void;
  /**
   * Mock a component.
   * @param name The name of the component to mock
   * @param component The component to mock
   * @returns The mocked component
   * @example
   * ```ts
   * twd.mockComponent("Button", Button);
   * ```
   */
  mockComponent: (name: string, component: React.ComponentType<any>) => void;
  /**
   * Clears all component mocks.
   *
   * @example
   * ```ts
   * twd.clearComponentMocks();
   * ```
   */
  clearComponentMocks: () => void;
  /**
   * Asserts that an element does not exist in the DOM.
   * @param selector CSS selector of the element to check
   * @returns A promise that resolves if the element does not exist, or rejects if it does
   * 
   * @example
   * ```ts
   * await twd.notExists(".non-existent");
   * ```
   */
  notExists: (selector: string) => Promise<void>;
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
    const el = await waitForElement(selector, () => document.querySelector(enhancedSelector));

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
    const els = await waitForElements(selector, () => document.querySelectorAll(enhancedSelector));

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
  should: (el: Element, name: AnyAssertion, ...args: ArgsFor<AnyAssertion>) => {
    const message = runAssertion(el, name, ...args);
    log(message);
  },
  wait,
  mockComponent,
  clearComponentMocks,
  notExists: async (selector: string): Promise<void> => {
    // Prepend selector to exclude TWD sidebar elements
    const enhancedSelector = `body > div:not(#twd-sidebar-root) ${selector}`;
    log(`Checking notExists("${selector}")`);
    const existingElement = document.querySelector(enhancedSelector);
    if (existingElement) {
      throw new Error(`Element "${selector}" exists in the DOM.`);
    }
    log(`Assertion passed: Element "${selector}" does not exist in the DOM.`);
  },
};
