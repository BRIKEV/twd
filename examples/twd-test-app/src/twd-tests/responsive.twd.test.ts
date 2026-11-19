import { twd, expect } from "../../../../src";
import { describe, it } from "../../../../src/runner";

// Resize the window (or use DevTools device mode): the tests for the other
// width are greyed in place, and a suite written for it collapses.
describe("Responsive", () => {
  describe("Mobile layout", { viewport: "mobile" }, () => {
    it("renders at a phone width", async () => {
      await twd.visit("/");
      expect(window.innerWidth).to.be.at.most(767);
    });
  });

  it("renders at a desktop width", { viewport: "desktop" }, async () => {
    await twd.visit("/");
    expect(window.innerWidth).to.be.at.least(1024);
  });
});
