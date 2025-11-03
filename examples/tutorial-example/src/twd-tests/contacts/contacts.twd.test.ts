import { twd, expect } from "../../../../../src";
import { describe, it, beforeEach } from "../../../../../src/runner";
import list from "../mocks/list.json";

describe("Contacts Page", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
  });

  it("should display the contacts page", async () => {
    await twd.mockRequest("getContacts", {
      method: "GET",
      url: "/api/contacts",
      response: list,
      status: 200,
    });
    await twd.visit("/contacts", true);
    await twd.waitForRequest("getContacts");
    const contacts = await twd.getAll("[data-testid='contact-link']");
    expect(contacts).to.have.length(list.length);
    contacts.forEach((contact, index) => {
      contact.should("have.text", `${list[index].firstName} ${list[index].lastName}`);
    });
    const newContactBtn = await twd.get("a[data-testid='new-contact-button']");
    newContactBtn.should("be.visible").should("not.have.text", "New contact");
  });
});