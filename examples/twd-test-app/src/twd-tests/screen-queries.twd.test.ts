import { twd, screenDom, userEvent, expect } from "../../../../src";
import { describe, it } from "../../../../src/runner";

describe("Screen Queries Demo", () => {
  it("should query elements using screenDom.getByRole", async () => {
    await twd.visit("/screen-queries");

    // Query buttons by role
    const primaryButton = screenDom.getByRole("button", { name: /primary button/i });
    const toggleButton = screenDom.getByRole("button", { name: /toggle visibility/i });
    const disabledButton = screenDom.getByRole("button", { name: /disabled button/i });

    // Verify buttons exist
    twd.should(primaryButton, "be.visible");
    twd.should(toggleButton, "be.visible");
    twd.should(disabledButton, "be.visible");
    twd.should(disabledButton, "be.disabled");
  });

  it("should query elements using screenDom.getByText", async () => {
    await twd.visit("/screen-queries");

    // Query by text content
    const heading = screenDom.getByText("Screen Queries Demo");
    const paragraph = screenDom.getByText(/This page demonstrates/);
    const inlineText = screenDom.getByText("Inline text element");

    twd.should(heading, "be.visible");
    twd.should(paragraph, "be.visible");
    twd.should(inlineText, "be.visible");
  });

  it("should query elements using screenDom.getByLabelText", async () => {
    await twd.visit("/screen-queries");

    // Query form inputs by label
    const searchInput = screenDom.getByLabelText("Search:");
    const emailInput = screenDom.getByLabelText("Email Address:");
    const selectInput = screenDom.getByLabelText("Choose an option:");

    twd.should(searchInput, "be.visible");
    twd.should(emailInput, "be.visible");
    twd.should(selectInput, "be.visible");
  });

  it("should query elements using screenDom.getByPlaceholderText", async () => {
    await twd.visit("/screen-queries");

    // Query inputs by placeholder
    const searchPlaceholder = screenDom.getByPlaceholderText("Enter search term");
    const emailPlaceholder = screenDom.getByPlaceholderText("user@example.com");

    twd.should(searchPlaceholder, "be.visible");
    twd.should(emailPlaceholder, "be.visible");
  });

  it("should query elements using screenDom.getByTestId", async () => {
    await twd.visit("/screen-queries");

    // Query by test ID
    const customParagraph = screenDom.getByTestId("custom-paragraph");
    const conditionalElement = screenDom.getByTestId("conditional-element");

    twd.should(customParagraph, "be.visible");
    twd.should(conditionalElement, "be.visible");
  });

  it("should query elements using screenDom.getByAltText", async () => {
    await twd.visit("/screen-queries");

    // Query images by alt text
    const viteLogo = screenDom.getByAltText("Vite Logo");
    const appLogo = screenDom.getByAltText("Application Logo");

    twd.should(viteLogo, "be.visible");
    twd.should(appLogo, "be.visible");
  });

  it("should query links using screenDom.getByRole", async () => {
    await twd.visit("/screen-queries");

    // Query links by role
    const contactLink = screenDom.getByRole("link", { name: /contact page/i });
    const assertionsLink = screenDom.getByRole("link", { name: /assertions page/i });
    const externalLink = screenDom.getByRole("link", { name: /external link/i });

    twd.should(contactLink, "be.visible");
    twd.should(assertionsLink, "be.visible");
    twd.should(externalLink, "be.visible");
  });

  it("should query headings using screenDom.getByRole", async () => {
    await twd.visit("/screen-queries");

    // Query headings by role and level
    const h1 = screenDom.getByRole("heading", { name: "Screen Queries Demo", level: 1 });
    const h2 = screenDom.getByRole("heading", { name: "Buttons and Actions", level: 2 });
    const h3 = screenDom.getByRole("heading", { name: "Heading Level 3", level: 3 });

    twd.should(h1, "be.visible");
    twd.should(h2, "be.visible");
    twd.should(h3, "be.visible");
  });

  it("should query form elements using screenDom.getByRole", async () => {
    await twd.visit("/screen-queries");

    // Query checkbox and radio buttons
    const checkbox = screenDom.getByRole("checkbox", { name: /i agree to the terms/i });
    const radio1 = screenDom.getByRole("radio", { name: /option 1/i });
    const radio2 = screenDom.getByRole("radio", { name: /option 2/i });
    const combobox = screenDom.getByRole("combobox", { name: /choose an option/i });

    twd.should(checkbox, "be.visible");
    twd.should(radio1, "be.visible");
    twd.should(radio2, "be.visible");
    twd.should(combobox, "be.visible");
  });

  it.only("should interact with elements found via screenDom", async () => {
    await twd.visit("/screen-queries");
    const user = userEvent.setup();

    // Find and interact with search input
    const searchInput = screenDom.getByLabelText("Search:");
    await user.type(searchInput, "test query");

    // Verify the input has the value
    expect(searchInput).to.have.property("value", "test query");

    // Find and click the toggle button
    const toggleButton = screenDom.getByRole("button", { name: /toggle visibility/i });
    await user.click(toggleButton);

    // The conditional element should disappear
    const conditionalElement = screenDom.queryByTestId("conditional-element");
    expect(conditionalElement).to.be.null;
  });

  it("should use screenDom queryBy methods for optional elements", async () => {
    await twd.visit("/screen-queries");

    // queryBy returns null if not found (doesn't throw)
    const nonExistent = screenDom.queryByText("This text doesn't exist");
    expect(nonExistent).to.be.null;

    // But existing elements still work
    const existing = screenDom.queryByText("Screen Queries Demo");
    twd.should(existing as HTMLElement, "be.visible");
  });

  it("should use screenDom getAllBy methods for multiple elements", async () => {
    await twd.visit("/screen-queries");

    // getAllBy returns array of all matching elements
    const allButtons = screenDom.getAllByRole("button");
    expect(allButtons.length).to.be.greaterThan(0);

    const allLinks = screenDom.getAllByRole("link");
    expect(allLinks.length).to.be.greaterThan(0);

    const allHeadings = screenDom.getAllByRole("heading");
    expect(allHeadings.length).to.be.greaterThan(2);
  });
});

