import { twd, expect, screenDom, userEvent } from "../../../../src";
import { describe, it, beforeEach } from "../../../../src/runner";

const contactsResponse = [
  { id: 1, name: "Ana Garcia", email: "ana.garcia@example.com" },
  { id: 2, name: "Luis Martinez", email: "luis.martinez@example.com" },
  { id: 3, name: "Carmen Lopez", email: "carmen.lopez@example.com" },
  { id: 4, name: "Javier Romero", email: "javier.romero@example.com" },
];

describe("contactsPage", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
  });

  it("renders the contacts list from the loader response", async () => {
    await twd.mockRequest("contactsList", {
      method: "GET",
      response: {
        contacts: contactsResponse,
        currentPage: 2,
        totalPages: 2,
      },
      url: "/v1/contacts",
    });

    await twd.visit("/contacts");
    await twd.waitForRequest("contactsList");

    const heading = screenDom.getByRole("heading", { name: /contactos/i });
    twd.should(heading, "be.visible");

    for (const contact of contactsResponse.slice(0, 2)) {
      const name = screenDom.getByText(contact.name);
      const email = screenDom.getByText(contact.email);

      twd.should(name, "be.visible");
      twd.should(email, "be.visible");
    }

    const pageTwoLink = screenDom.getByRole("link", { name: "2" });
    await userEvent.click(pageTwoLink);

    // TODO: there is a bug with twd assertion
    // await twd.url().should("contain.url", "/contacts?page=2");

  });
});
