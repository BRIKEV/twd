import { waitForElement } from "utils/wait";
import { register } from "./twdRegistry";
import { runAssertion } from "asserts";
import { log } from "utils/log";
import { mockRequest, waitFor } from "requests/mockResponses";
import { AnyAssertion, ArgsFor } from "asserts/assertion-types";

let beforeEachFn: (() => void | Promise<void>) | null = null;

export const beforeEach = (fn: typeof beforeEachFn) => {
  beforeEachFn = fn;
};

export const describe = (_: string, fn: () => void) => {
  fn(); // for now, just run immediately
};

export const it = (name: string, fn: () => Promise<void> | void) => {
  register(name, async () => {
    if (beforeEachFn) await beforeEachFn();
    await fn();
  });
};

export const itOnly = (name: string, fn: () => Promise<void> | void) => {
  register(name, async () => {
    if (beforeEachFn) await beforeEachFn();
    await fn();
  }, { only: true });
};

export const itSkip = (name: string, _fn: () => Promise<void> | void) => {
  register(name, async () => {}, { skip: true });
};

type ShouldFn = {
  (name: "have.text", expected: string): TWDAPI;
  (name: "contain.text", expected: string): TWDAPI;
  (name: "be.empty"): TWDAPI;

  (name: "have.attr", attr: string, value: string): TWDAPI;
  (name: "have.value", value: string): TWDAPI;

  (name: "be.disabled"): TWDAPI;
  (name: "be.enabled"): TWDAPI;
  (name: "be.checked"): TWDAPI;
  (name: "not.be.checked"): TWDAPI;
  (name: "be.selected"): TWDAPI;
  (name: "be.focused"): TWDAPI;

  (name: "be.visible"): TWDAPI;
  (name: "not.be.visible"): TWDAPI;

  (name: "have.class", className: string): TWDAPI;
  (name: "not.have.class", className: string): TWDAPI;
};

export interface TWDAPI {
  el: Element;
  /**
   * Simulates a user click on the element.
   * Returns the same API so you can chain more actions.
   *
   * Example:
   * ```ts
   * const btn = await twd.get("button");
   * btn.click().should("have.text", "Clicked");
   * ```
   */
  click: () => void;
  type: (text: string) => HTMLInputElement;
  text: () => string;
  should: ShouldFn;
}

// Mini Cypress-style helpers
export const twd = {
  get: async (selector: string) => {
    log(`🔎 get("${selector}")`);
    const el = await waitForElement(() => document.querySelector(selector));

    const api: TWDAPI = {
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
