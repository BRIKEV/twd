import { twd, expect, userEvent, screenDom } from "../../../../src";
import { describe, it, afterEach } from "../../../../src/runner";

/**
 * These tests verify that blur-triggered validation and keyboard interactions
 * work correctly even when the browser tab is not focused — which is the
 * common case during automated twd-relay runs when the AI agent is active
 * while the user has another window open.
 *
 * `window.blur()` is used to programmatically remove window focus, simulating
 * the unfocused-tab condition that triggers the fallback paths in userEvent.
 */
describe("Blur validation — unfocused tab fallback", () => {
  afterEach(() => {
    // Restore window focus after each test so other tests are not affected.
    window.focus();
  });

  it("shows validation error after type, clear and Tab when window is not focused", async () => {
    await twd.visit("/blur-validation");

    // Simulate the tab losing focus — as happens when the AI relay runs tests
    // while the user has another window in the foreground.
    window.blur();

    const input = await screenDom.findByLabelText("First name:");

    // type something, then clear it — field is now empty (required)
    await userEvent.type(input, "a");
    await userEvent.clear(input);

    // Tab away — must trigger onBlur even though window has no focus.
    // Without the fix: typingFallback calls element.focus() but browsers
    // suppress focus/focusin DOM events in unfocused tabs. React never learns
    // the element is focused, so when keyboard("{Tab}") dispatches focusout,
    // React does not fire onBlur → validation never runs → this assertion fails.
    await userEvent.keyboard("{Tab}");

    // onBlur validation sets aria-describedby when the field is invalid
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).to.equal("first-name-error");

    const errorMsg = await screenDom.findByRole("alert");
    expect(errorMsg.textContent).to.equal("First name is required");
  });
});
