import { log } from "../utils/log";
import { assertionMessage } from "../utils/assertionMessage";
/**
 * All supported assertion names for the `should` function in url command
 *
 * @example
 * twd.url().should("contain.url", "/new-page");
 * twd.url().should("eq", "http://localhost:3000/new-page");
 */
export type URLAssertionName =
  | "eq"
  | "contain.url";

/**
 * Negatable assertion names (e.g., 'not.have.text').
 */
export type Negatable<T extends string> = T | `not.${T}`;

/**
 * All assertion names, including negated ones.
 */
export type AnyURLAssertion = Negatable<URLAssertionName>;

export type URLCommandAPI = {
  location: Location;
  should: (name: AnyURLAssertion, value: string) => URLCommandAPI | string;
}

/**
 * Argument types for each assertion.
 */
export type URLAssertionArgs = {
  (name: "contain.url", urlPart: string): URLCommandAPI;
  (name: "not.contain.url", urlPart: string): URLCommandAPI;
};

const should = (name: AnyURLAssertion, value: string) => {
  const isNegated = name.startsWith("not.");
  const baseName = isNegated ? name.slice(4) : name;

  switch (baseName) {
    case "eq":
      return assertionMessage(
        window.location.href === value,
        isNegated,
        `Assertion passed: URL is ${value}`,
        `Assertion failed: Expected URL to be ${value}, but got ${window.location.href}`
      );
    case "contain.url":
      return assertionMessage(
        window.location.href.includes(value),
        isNegated,
        `Assertion passed: URL contains ${value}`,
        `Assertion failed: Expected URL to contain ${value}, but got ${window.location.href}`
      );
    default:
      throw new Error(`Unknown assertion: ${name}`);
  }
};

/**
 * URL command for assertions on the current URL.
 * @returns URLCommandAPI
 */
const urlCommand = (): URLCommandAPI => {
  return {
    location: window.location,
    should: (name: AnyURLAssertion, value: string) => {
      const result = should(name, value);
      log(result);
      return result;
    },
  };
};

export default urlCommand;
