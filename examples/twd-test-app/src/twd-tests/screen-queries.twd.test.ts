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
    expect(primaryButton).to.exist;
    expect(toggleButton).to.exist;
    expect(disabledButton).to.exist;
    expect(disabledButton).to.have.property("disabled", true);
  });

  it("should query elements using screenDom.getByText", async () => {
    await twd.visit("/screen-queries");

    // Query by text content
    const heading = screenDom.getByText("Screen Queries Demo", { selector: "h1" });
    const paragraph = screenDom.getByText(/This page demonstrates/);
    const inlineText = screenDom.getByText("Inline text element");

    expect(heading).to.exist;
    expect(paragraph).to.exist;
    expect(inlineText).to.exist;
  });

  it("should query elements using screenDom.getByLabelText", async () => {
    await twd.visit("/screen-queries");

    // Query form inputs by label
    const searchInput = screenDom.getByLabelText("Search:");
    const emailInput = screenDom.getByLabelText("Email Address:");
    const selectInput = screenDom.getByLabelText("Choose an option:");

    expect(searchInput).to.exist;
    expect(emailInput).to.exist;
    expect(selectInput).to.exist;
  });

  it("should query elements using screenDom.getByPlaceholderText", async () => {
    await twd.visit("/screen-queries");

    // Query inputs by placeholder
    const searchPlaceholder = screenDom.getByPlaceholderText("Enter search term");
    const emailPlaceholder = screenDom.getByPlaceholderText("user@example.com");

    expect(searchPlaceholder).to.exist;
    expect(emailPlaceholder).to.exist;
  });

  it("should query elements using screenDom.getByTestId", async () => {
    await twd.visit("/screen-queries");

    // Query by test ID
    const customParagraph = screenDom.getByTestId("custom-paragraph");
    const conditionalElement = screenDom.getByTestId("conditional-element");

    expect(customParagraph).to.exist;
    expect(conditionalElement).to.exist;
  });

  it("should query elements using screenDom.getByAltText", async () => {
    await twd.visit("/screen-queries");

    // Query images by alt text
    const viteLogo = screenDom.getByAltText("Vite Logo");
    const appLogo = screenDom.getByAltText("Application Logo");

    expect(viteLogo).to.exist;
    expect(appLogo).to.exist;
  });

  it("should query links using screenDom.getByRole", async () => {
    await twd.visit("/screen-queries");

    // Query links by role
    const contactLink = screenDom.getByRole("link", { name: /contact page/i });
    const assertionsLink = screenDom.getByRole("link", { name: /assertions page/i });
    const externalLink = screenDom.getByRole("link", { name: /external link/i });

    expect(contactLink).to.exist;
    expect(assertionsLink).to.exist;
    expect(externalLink).to.exist;
  });

  it("should query headings using screenDom.getByRole", async () => {
    await twd.visit("/screen-queries");

    // Query headings by role and level
    const h1 = screenDom.getByRole("heading", { name: "Screen Queries Demo", level: 1 });
    const h2 = screenDom.getByRole("heading", { name: "Buttons and Actions", level: 2 });
    const h3 = screenDom.getByRole("heading", { name: "Heading Level 3", level: 3 });

    expect(h1).to.exist;
    expect(h2).to.exist;
    expect(h3).to.exist;
  });

  it("should query form elements using screenDom.getByRole", async () => {
    await twd.visit("/screen-queries");

    // Query checkbox and radio buttons
    const checkbox = screenDom.getByRole("checkbox", { name: /i agree to the terms/i });
    const radio1 = screenDom.getByRole("radio", { name: /option 1/i });
    const radio2 = screenDom.getByRole("radio", { name: /option 2/i });
    const combobox = screenDom.getByRole("combobox", { name: /choose an option/i });

    expect(checkbox).to.exist;
    expect(radio1).to.exist;
    expect(radio2).to.exist;
    expect(combobox).to.exist;
  });

  it("should interact with elements found via screenDom", async () => {
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
    const existing = screenDom.queryByText("Screen Queries Demo", { selector: "h1" });
    expect(existing).to.exist;
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

