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

const assertionMessages = {
  "have.text": {
    positive: {
      pass: (args: any[]) => `Assertion passed: Text is exactly "${args[0]}"`,
      fail: (args: any[], actual: any) => `Assertion failed: Expected text to be "${args[0]}", but got "${actual}"`
    },
    negative: {
      pass: (args: any[]) => `Assertion passed: Text is not exactly "${args[0]}"`,
      fail: (args: any[], actual: any) => `Assertion failed: Expected text to not be "${args[0]}", but got "${actual}"`
    }
  },
  "contain.text": {
    positive: {
      pass: (args: any[]) => `Assertion passed: Text contains "${args[0]}"`,
      fail: (args: any[], actual: any) => `Assertion failed: Expected text to contain "${args[0]}", but got "${actual}"`
    },
    negative: {
      pass: (args: any[]) => `Assertion passed: Text does not contain "${args[0]}"`,
      fail: (args: any[], actual: any) => `Assertion failed: Expected text to not contain "${args[0]}", but got "${actual}"`
    }
  },
  "be.empty": {
    positive: {
      pass: () => `Assertion passed: Text is empty`,
      fail: (args: any[], actual: any) => `Assertion failed: Expected text to be empty, but got "${actual}"`
    },
    negative: {
      pass: () => `Assertion passed: Text is not empty`,
      fail: (args: any[], actual: any) => `Assertion failed: Expected text to not be empty, but got "${actual}"`
    }
  },
  "have.attr": {
    positive: {
      pass: (args: any[]) => `Assertion passed: Attribute "${args[0]}" is "${args[1]}"`,
      fail: (args: any[], actual: any) => `Assertion failed: Expected attribute "${args[0]}" to be "${args[1]}", but got "${actual}"`
    },
    negative: {
      pass: (args: any[]) => `Assertion passed: Attribute "${args[0]}" is not "${args[1]}"`,
      fail: (args: any[], actual: any) => `Assertion failed: Expected attribute "${args[0]}" to not be "${args[1]}", but got "${actual}"`
    }
  },
  "have.value": {
    positive: {
      pass: (args: any[]) => `Assertion passed: Value is "${args[0]}"`,
      fail: (args: any[], actual: any) => `Assertion failed: Expected value to be "${args[0]}", but got "${actual}"`
    },
    negative: {
      pass: (args: any[]) => `Assertion passed: Value is not "${args[0]}"`,
      fail: (args: any[], actual: any) => `Assertion failed: Expected value to not be "${args[0]}", but got "${actual}"`
    }
  },
  "be.disabled": {
    positive: {
      pass: () => `Assertion passed: Element is disabled`,
      fail: () => `Assertion failed: Expected element to be disabled`
    },
    negative: {
      pass: () => `Assertion passed: Element is not disabled`,
      fail: () => `Assertion failed: Expected element to not be disabled`
    }
  },
  "be.enabled": {
    positive: {
      pass: () => `Assertion passed: Element is enabled`,
      fail: () => `Assertion failed: Expected element to be enabled`
    },
    negative: {
      pass: () => `Assertion passed: Element is not enabled`,
      fail: () => `Assertion failed: Expected element to not be enabled`
    }
  },
  "be.checked": {
    positive: {
      pass: () => `Assertion passed: Element is checked`,
      fail: () => `Assertion failed: Expected element to be checked`
    },
    negative: {
      pass: () => `Assertion passed: Element is not checked`,
      fail: () => `Assertion failed: Expected element to not be checked`
    }
  },
  "be.selected": {
    positive: {
      pass: () => `Assertion passed: Element is selected`,
      fail: () => `Assertion failed: Expected element to be selected`
    },
    negative: {
      pass: () => `Assertion passed: Element is not selected`,
      fail: () => `Assertion failed: Expected element to not be selected`
    }
  },
  "be.focused": {
    positive: {
      pass: () => `Assertion passed: Element is focused`,
      fail: () => `Assertion failed: Expected element to be focused`
    },
    negative: {
      pass: () => `Assertion passed: Element is not focused`,
      fail: () => `Assertion failed: Expected element to not be focused`
    }
  },
  "be.visible": {
    positive: {
      pass: () => `Assertion passed: Element is visible`,
      fail: () => `Assertion failed: Expected element to be visible`
    },
    negative: {
      pass: () => `Assertion passed: Element is not visible`,
      fail: () => `Assertion failed: Expected element to not be visible`
    }
  },
  "have.class": {
    positive: {
      pass: (args: any[]) => `Assertion passed: Element has class "${args[0]}"`,
      fail: (args: any[]) => `Assertion failed: Expected element to have class "${args[0]}"`
    },
    negative: {
      pass: (args: any[]) => `Assertion passed: Element does not have class "${args[0]}"`,
      fail: (args: any[]) => `Assertion failed: Expected element to not have class "${args[0]}"`
    }
  }
} as const;

export const runAssertion = (
  el: Element,
  name: AnyAssertion,
  ...args: any[]
): string => {
  const isNegated = name.startsWith("not.");
  const baseName = (isNegated ? name.slice(4) : name) as AssertionName;
  const content = (el.textContent || "").trim();

  const messages = assertionMessages[baseName];
  if (!messages) {
    throw new Error(`Unknown assertion: ${baseName}`);
  }

  const messageType = isNegated ? 'negative' : 'positive';

  let result: boolean;
  let actualValue: any;

  switch (baseName) {
    case "have.text":
      result = content === args[0];
      actualValue = content;
      break;
    case "contain.text":
      result = content.includes(args[0]);
      actualValue = content;
      break;
    case "be.empty":
      result = content.length === 0;
      actualValue = content;
      break;
    case "have.attr":
      actualValue = (el as HTMLElement).getAttribute(args[0]);
      result = actualValue === args[1];
      break;
    case "have.value":
      actualValue = (el as HTMLInputElement).value;
      result = actualValue === args[0];
      break;
    case "be.disabled":
      result = (el as HTMLInputElement).disabled === true;
      break;
    case "be.enabled":
      result = (el as HTMLInputElement).disabled === false;
      break;
    case "be.checked":
      result = (el as HTMLInputElement).checked === true;
      break;
    case "be.selected":
      result = (el as HTMLOptionElement).selected === true;
      break;
    case "be.focused":
      result = document.activeElement === el;
      break;
    case "be.visible":
      result = isVisible(el as HTMLElement);
      break;
    case "have.class":
      result = (el as HTMLElement).classList.contains(args[0]);
      break;
    default:
      throw new Error(`Unknown assertion: ${baseName}`);
  }

  return assertionMessage(
    result,
    isNegated,
    messages[messageType].pass(args),
    messages[messageType].fail(args, actualValue)
  );
};
