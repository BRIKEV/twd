import { twd } from "../../../../src";
import { describe, it, beforeEach } from "../../../../src/runner";

describe("Responsive Viewport", () => {
  beforeEach(() => {
    twd.resetViewport();
  });

  it("should show desktop layout at 1024px width", async () => {
    await twd.visit("/responsive");
    twd.viewport(1024);

    // Nav should be horizontal (flex-direction: row is default)
    const nav = await twd.get('[data-testid="responsive-nav"]');
    nav.should("be.visible");

    // Sidebar should be visible on desktop
    const sidebar = await twd.get('[data-testid="responsive-sidebar"]');
    sidebar.should("be.visible");

    // Card grid should show 3 columns
    const grid = await twd.get('[data-testid="card-grid"]');
    grid.should("be.visible");
  });

  it("should show mobile layout at 375px width", async () => {
    await twd.visit("/responsive");
    twd.viewport(375, 667);

    // Nav should still be visible (but stacked vertically)
    const nav = await twd.get('[data-testid="responsive-nav"]');
    nav.should("be.visible");

    // Sidebar should be hidden on mobile
    const sidebar = await twd.get('[data-testid="responsive-sidebar"]');
    sidebar.should("not.be.visible");

    // Card grid should still be visible (single column)
    const grid = await twd.get('[data-testid="card-grid"]');
    grid.should("be.visible");
  });

  it("should reset viewport back to default", async () => {
    await twd.visit("/responsive");

    // Set a mobile viewport
    twd.viewport(375);
    const sidebar = await twd.get('[data-testid="responsive-sidebar"]');
    sidebar.should("not.be.visible");

    // Reset viewport
    twd.resetViewport();

    // Sidebar should be visible again at full width
    const sidebarAfterReset = await twd.get('[data-testid="responsive-sidebar"]');
    sidebarAfterReset.should("be.visible");
  });
});
