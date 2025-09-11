import { assertionMessage } from "../utils/assertionMessage";
import { AnyAssertion, AssertionName } from "../twd-types";

function isVisible(el: HTMLElement): boolean {
  if (!el.isConnected) return false;
  let current: HTMLElement | null = el;
  while (current) {
    const style = getComputedStyle(current);
    if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") {
      return false;
    }
    current = current.parentElement;
  }
  return true;
}

export const runAssertion = (
  el: Element,
  name: AnyAssertion,
  ...args: any[]
): string => {
  const isNegated = name.startsWith("not.");
  const baseName = (isNegated ? name.slice(4) : name) as AssertionName;

    const content = (el.textContent || "").trim();

  switch (baseName) {
    // Content
    case "have.text":
      return assertionMessage(
        content === args[0],
        isNegated,
        `Assertion passed: Text is exactly "${args[0]}"`,
        `Assertion failed: Expected text to be "${args[0]}", but got "${content}"`,
      );
    case "contain.text":
      return assertionMessage(
        content.includes(args[0]),
        isNegated,
        `Assertion passed: Text contains "${args[0]}"`,
        `Assertion failed: Expected text to contain "${args[0]}", but got "${content}"`
      );
    case "be.empty":
      return assertionMessage(
        content.length === 0,
        isNegated,
        `Assertion passed: Text is empty`,
        `Assertion failed: Expected text to be empty, but got "${content}"`,
      );

    // Attributes
    case "have.attr":
      return assertionMessage(
        (el as HTMLElement).getAttribute(args[0]) === args[1],
        isNegated,
        `Assertion passed: Attribute "${args[0]}" is "${args[1]}"`,
        `Assertion failed: Expected attribute "${args[0]}" to be "${args[1]}", but got "${(el as HTMLElement).getAttribute(args[0])}"`
      );
    case "have.value":
      return assertionMessage(
        (el as HTMLInputElement).value === args[0],
        isNegated,
        `Assertion passed: Value is "${args[0]}"`,
        `Assertion failed: Expected value to be "${args[0]}", but got "${(el as HTMLInputElement).value}"`,
      );

    // State
    case "be.disabled":
      return assertionMessage(
        (el as HTMLInputElement).disabled === true,
        isNegated,
        `Assertion passed: Element is disabled`,
        `Assertion failed: Expected element to be disabled`,
      );
    case "be.enabled":
      return assertionMessage(
        (el as HTMLInputElement).disabled === false,
        isNegated,
        `Assertion passed: Element is enabled`,
        `Assertion failed: Expected element to be enabled`
      );
    case "be.checked":
      return assertionMessage(
        (el as HTMLInputElement).checked === true,
        isNegated,
        `Assertion passed: Element is checked`,
        `Assertion failed: Expected element to be checked`,
      );
    case "be.selected":
      return assertionMessage(
        (el as HTMLOptionElement).selected === true,
        isNegated,
        `Assertion passed: Element is selected`,
        `Assertion failed: Expected element to be selected`,
      );
    case "be.focused":
      return assertionMessage(
        document.activeElement === el,
        isNegated,
        `Assertion passed: Element is focused`,
        `Assertion failed: Expected element to be focused`,
      );
  
    // Visibility
    case "be.visible": {
      return assertionMessage(
        isVisible(el as HTMLElement),
        isNegated,
        `Assertion passed: Element is visible`,
        `Assertion failed: Expected element to be visible`,
      );
    }

    // Classes
    case "have.class":
      return assertionMessage(
        (el as HTMLElement).classList.contains(args[0]),
        isNegated,
        `Assertion passed: Element has class "${args[0]}"`,
        `Assertion failed: Expected element to have class "${args[0]}"`,
      );

    default:
      throw new Error(`Unknown assertion: ${baseName}`);
  }
};
