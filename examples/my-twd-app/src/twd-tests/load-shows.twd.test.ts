import { twd, expect } from "../../../../src";
import { describe, it, beforeEach } from "../../../../src/runner";
import { shows } from "./mocks/shows";


describe("App shows", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
  });

  it('should load shows page', async () => {
    await twd.mockRequest("getShows", {
      method: "GET",
      url: "https://api.tvmaze.com/search/shows?q=",
      response: shows,
    });
    twd.visit('/shows');
    await twd.waitForRequest("getShows");
    const showCards = await twd.getAll('[data-testid="show-card"]');
    expect(showCards).to.have.length(2);
  });
});
