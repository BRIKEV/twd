import { twd, userEvent, screenDom, screenDomGlobal, expect } from "../../../../src/index.ts";
import { describe, it } from "../../../../src/runner.ts";

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

  it("should open the dialog", async () => {
    await twd.visit("/");
    const dialogTrigger = screenDom.getByText("Open");
    await userEvent.click(dialogTrigger);
    const dialogContent = screenDomGlobal.getByText("Are you absolutely sure?");
    twd.should(dialogContent, "be.visible");
    const closeButton = screenDomGlobal.getByText("Close");
    await userEvent.click(closeButton);
    await twd.wait(300);
    const closedDialogContent = screenDomGlobal.queryByText("Are you absolutely sure?");
    expect(closedDialogContent).to.be.null;
  });
});