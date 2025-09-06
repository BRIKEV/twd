// assertion-types.ts

export type AssertionName =
  // Content
  | "have.text"
  | "contain.text"
  | "be.empty"

  // Attributes
  | "have.attr"
  | "have.value"

  // State
  | "be.disabled"
  | "be.enabled"
  | "be.checked"
  | "be.selected"
  | "be.focused"

  // Visibility
  | "be.visible"

  // Classes
  | "have.class";

// Allow negation automatically
export type Negatable<T extends AssertionName> = T | `not.${T}`;
export type AnyAssertion = Negatable<AssertionName>;

// Define args for each base assertion
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

// Map assertion name → argument tuple
export type ArgsFor<A extends AnyAssertion> =
  A extends `not.${infer Base extends AssertionName}`
    ? AssertionArgs[Base]
    : A extends AssertionName
    ? AssertionArgs[A]
    : never;

// Overloads for should()