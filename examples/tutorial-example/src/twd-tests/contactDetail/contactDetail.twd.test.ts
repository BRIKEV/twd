import { twd, expect, userEvent } from "../../../../../src";
import { describe, it, beforeEach } from "../../../../../src/runner";
import contacts from "../mocks/list.json";

describe("Contacts detail page", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
  });

  it("should display the contacts detail page", async () => {
    await twd.mockRequest("getContacts", {
      method: "GET",
      url: "/api/contacts",
      response: contacts,
      status: 200,
    });
    await twd.mockRequest("updateFavorite", {
      method: "PATCH",
      url: `/api/contacts/${contacts[0].id}`,
      response: {
        ...contacts[0],
        favorite: false,
      },
      status: 200,
    });
    await twd.visit(`/contacts/${contacts[0].id}`);
    await twd.waitForRequest("getContacts");
    const newContactListElement = await twd.get("[data-testid='contact-link']:nth-child(1)");
    newContactListElement.should("have.text", "Jane Doe").should("have.class", "bg-primary");
    const toggleFavoriteBtn = await twd.get("[data-testid='toggle-favorite']");
    toggleFavoriteBtn.should("be.visible");
    const markAsFavoriteIcon = await twd.get("[aria-label='Unmark as favorite']");
    markAsFavoriteIcon.should("be.visible");
    await twd.mockRequest("getContacts", {
      method: "GET",
      url: "/api/contacts",
      response: [
        { ...contacts[0], favorite: false },
        ...contacts.slice(1),
      ],
      status: 200,
    });
    await userEvent.click(toggleFavoriteBtn.el);
    const rule = await twd.waitForRequest("updateFavorite");
    expect(rule.request.favorite).to.equal(false);
    await twd.waitForRequest("getContacts");
    const unmarkAsFavoriteIcon = await twd.get("[aria-label='Mark as favorite']");
    unmarkAsFavoriteIcon.should("be.visible");
  });
});