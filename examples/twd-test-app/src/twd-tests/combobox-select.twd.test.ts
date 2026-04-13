import { twd, expect, userEvent, screenDom } from "../../../../src";
import { describe, it, afterEach } from "../../../../src/runner";

/**
 * Tests that keyboard interactions inside a combobox (type to filter →
 * ArrowDown → Enter) work when the browser window is not focused.
 *
 * This reproduces the pattern used by selectPhoneCode() in real apps:
 *   await userEvent.click(triggerButton);
 *   await userEvent.keyboard(`${country}{arrowdown}{enter}`);
 *
 * Before the fix, keyboard() with non-Tab keys was a complete no-op when the
 * tab was unfocused: the dropdown filter was never typed into, the arrow key
 * never fired, and Enter never selected — leaving the dropdown open and
 * blocking subsequent interactions (pointer-events: none errors).
 */
describe("Combobox select — unfocused tab fallback", () => {
  afterEach(() => {
    window.focus();
  });

  it("selects a country via keyboard filter+arrow+enter when window is not focused", async () => {
    await twd.visit("/combobox-select");

    // Simulate the window losing focus — same condition as twd-relay runs
    window.blur();

    // Open the combobox
    const trigger = await screenDom.findByRole("button", { name: /select country/i });
    await userEvent.click(trigger);

    // Type to filter, arrow down to first result, enter to select.
    // Without the fix this is a no-op: the dropdown stays open with nothing
    // selected, and later clicks fail with pointer-events: none errors.
    await userEvent.keyboard("Spain{arrowdown}{enter}");

    // The selected value should be visible
    const result = await screenDom.findByTestId("selected-country");
    expect(result.textContent).to.include("Spain");
  });
});
