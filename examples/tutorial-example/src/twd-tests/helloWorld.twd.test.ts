import { twd, userEvent } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("Hello World Page", () => {
  it("should display the welcome title and counter button", async () => {
    await twd.visit("/");
    
    const title = await twd.get("[data-testid='welcome-title']");
    title.should("be.visible").should("have.text", "Welcome to TWD");
    
    const counterButton = await twd.get("[data-testid='counter-button']");
    counterButton.should("be.visible").should("have.text", "Count is 0");
    
    await userEvent.click(counterButton.el);
    counterButton.should("have.text", "Count is 1");
    
    await userEvent.click(counterButton.el);
    counterButton.should("have.text", "Count is 2");
    
    await userEvent.click(counterButton.el);
    counterButton.should("have.text", "Count is 3");
  });
});