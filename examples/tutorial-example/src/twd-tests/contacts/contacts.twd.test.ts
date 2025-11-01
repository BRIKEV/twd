import { twd, expect } from "../../../../../src";
import { describe, it, beforeEach } from "../../../../../src/runner";
import list from "./mocks/list.json";

describe("Contacts Page", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
  });

  it("should display the contacts page", async () => {
    await twd.mockRequest("getContacts", {
      method: "GET",
      url: "/contacts",
      response: list,
      status: 200,
    });
    twd.visit("/");
    await twd.waitForRequest("getContacts");
    const contacts = await twd.getAll("[data-testid='contact-link']");
    expect(contacts).to.have.length(list.length);
  });
});