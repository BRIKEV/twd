/**
 * Types and interfaces for the TWD testing library.
 *
 * @module twd-types
 */

/**
 * All supported assertion names for the `should` function.
 *
 * @example
 * api.should("have.text", "Hello");
 * api.should("be.empty");
 */
export type AssertionName =
  | "have.text"
  | "contain.text"
  | "be.empty"
  | "have.attr"
  | "have.value"
  | "be.disabled"
  | "be.enabled"
  | "be.checked"
  | "be.selected"
  | "be.focused"
  | "be.visible"
  | "have.class";

/**
 * Negatable assertion names (e.g., 'not.have.text').
 */
export type Negatable<T extends string> = T | `not.${T}`;

/**
 * All assertion names, including negated ones.
 */
export type AnyAssertion = Negatable<AssertionName>;

/**
 * Argument types for each assertion.
 */
export type AssertionArgs = {
  "have.text": [expected: string];
  "contain.text": [expected: string];
  "be.empty": [];
  "have.attr": [attr: string, value: string];
  "have.value": [value: string];
  "be.disabled": [];
  "be.enabled": [];
  "be.checked": [];
  "be.selected": [];
  "be.focused": [];
  "be.visible": [];
  "have.class": [className: string];
};

/**
 * Maps assertion name to its argument tuple.
 */
export type ArgsFor<A extends AnyAssertion> =
  A extends `not.${infer Base extends AssertionName}`
    ? AssertionArgs[Base]
    : A extends AssertionName
    ? AssertionArgs[A]
    : never;

/**
 * Overloads for the `should` function, for best IntelliSense.
 *
 * @example
 * twd.should("have.text", "Hello");
 * twd.should("be.empty");
 * twd.should("have.class", "active");
 */
export type ShouldFn = {
  (name: "have.text", expected: string): TWDElemAPI;
  (name: "contain.text", expected: string): TWDElemAPI;
  (name: "be.empty"): TWDElemAPI;
  (name: "have.attr", attr: string, value: string): TWDElemAPI;
  (name: "have.value", value: string): TWDElemAPI;
  (name: "be.disabled"): TWDElemAPI;
  (name: "be.enabled"): TWDElemAPI;
  (name: "be.checked"): TWDElemAPI;
  (name: "not.be.checked"): TWDElemAPI;
  (name: "be.selected"): TWDElemAPI;
  (name: "be.focused"): TWDElemAPI;
  (name: "be.visible"): TWDElemAPI;
  (name: "not.be.visible"): TWDElemAPI;
  (name: "have.class", className: string): TWDElemAPI;
  (name: "not.have.class", className: string): TWDElemAPI;
};

/**
 * The main API returned by `twd.get()`.
 *
 * Example:
 * ```ts
 * const btn = await twd.get("button");
 * btn.should("have.text", "Clicked").click();
 * 
 * ```
 * 
 */
export interface TWDElemAPI {
  /** The underlying DOM element. */
  el: Element;
  /**
   * Simulates a user click on the element.
   * Returns the same API so you can chain more actions.
   *
   * Example:
   * ```ts
   * const button = await twd.get("button");
   * button.click();
   * 
   * ```
   * 
   */
  click: () => void;
  /**
   * Types text into an input element.
   * @param text The text to type.
   * @returns The input element.
   * 
   * Example:
   * ```ts
   * const email = await twd.get("input#email");
   * email.type("test@example.com");
   * 
   * ```
   * 
   */
  type: (text: string) => HTMLInputElement;
  /**
   * Gets the text content of the element.
   * @returns The text content.
   * 
   * Example:
   * ```ts
   * const para = await twd.get("p");
   * const content = para.text();
   * console.log(content);
   * 
   * ```
   * 
   */
  text: () => string;
  /**
   * Asserts something about the element.
   * @param anyAssertion The assertion to run.
   * @param args Arguments for the assertion.
   * @returns The same API for chaining.
   * 
   * Example:
   * ```ts
   * const btn = await twd.get("button");
   * btn.should("have.text", "Click me").should("not.be.disabled");
   * 
   * ```
   * 
   */
  should: ShouldFn;
}
