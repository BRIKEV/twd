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
): void => {
  const isNegated = name.startsWith("not.");
  const baseName = (isNegated ? name.slice(4) : name) as AssertionName;

  const runCheck = (): boolean => {
    const content = (el.textContent || "").trim();

    switch (baseName) {
      // Content
      case "have.text":
        return content === args[0];
      case "contain.text":
        return content.includes(args[0]);
      case "be.empty":
        return content.length === 0;

      // Attributes
      case "have.attr":
        return (el as HTMLElement).getAttribute(args[0]) === args[1];
      case "have.value":
        return (el as HTMLInputElement).value === args[0];

      // State
      case "be.disabled":
        return (el as HTMLInputElement).disabled === true;
      case "be.enabled":
        return (el as HTMLInputElement).disabled === false;
      case "be.checked":
        return (el as HTMLInputElement).checked === true;
      case "be.selected":
        return (el as HTMLOptionElement).selected === true;
      case "be.focused":
        return document.activeElement === el;

      // Visibility
      case "be.visible": {
        return isVisible(el as HTMLElement);
      }

      // Classes
      case "have.class":
        return (el as HTMLElement).classList.contains(args[0]);

      default:
        throw new Error(`Unknown assertion: ${baseName}`);
    }
  };

  const result = runCheck();
  if (isNegated ? result : !result) {
    throw new Error(
      `Assertion failed: ${name} ${args.length ? JSON.stringify(args) : ""}`
    );
  }
};
