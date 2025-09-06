/**
 * Simulates typing text into an input or textarea element, character by character,
 * dispatching keydown, keypress, input, and keyup events for each character.
 * This more closely mimics real user input and works with React's state updates.
 *
 * @param el The input or textarea element
 * @param text The text to type
 * @returns The input element after typing
 */
const simulateType = (
  el: HTMLInputElement | HTMLTextAreaElement,
  text: string
) => {
  for (const char of text) {
    const keyCode = char.charCodeAt(0);

    // keydown
    el.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: char,
        code: `Key${char.toUpperCase()}`,
        keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true,
      })
    );

    // keypress
    el.dispatchEvent(
      new KeyboardEvent("keypress", {
        key: char,
        code: `Key${char.toUpperCase()}`,
        keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true,
      })
    );

    // beforeinput (React listens for this in modern versions)
    el.dispatchEvent(
      new InputEvent("beforeinput", {
        bubbles: true,
        cancelable: true,
        inputType: "insertText",
        data: char,
      })
    );

    // ✅ Properly update value & React's internal tracker
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(el),
      "value"
    )?.set;
    nativeInputValueSetter?.call(el, el.value + char);

    // input (this is the one React wires to)
    el.dispatchEvent(
      new Event("input", {
        bubbles: true,
      })
    );

    // keyup
    el.dispatchEvent(
      new KeyboardEvent("keyup", {
        key: char,
        code: `Key${char.toUpperCase()}`,
        keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true,
      })
    );
  }

  return el;
};

export { simulateType };
