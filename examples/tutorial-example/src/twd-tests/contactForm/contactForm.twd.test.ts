import { twd, expect, userEvent } from "../../../../../src";
import { describe, it, beforeEach } from "../../../../../src/runner";
import list from "../mocks/list.json";

describe("New Contact", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
  });

  it("should display the new contact form", async () => {
    const newContact = {
      id: '3',
      firstName: 'New',
      lastName: 'Smith',
      username: 'new_smith',
      avatar: 'https://i.pravatar.cc/150?img=13',
      email: 'new.smith@example.com',
      phone: '+1 455-9678',
      favorite: false
    };
    await twd.mockRequest("getNewContacts", {
      method: "GET",
      url: "/api/contacts",
      response: [...list, newContact],
      status: 200,
    });
    await twd.mockRequest("newContact", {
      method: "POST",
      url: "/api/contacts",
      response: newContact,
      status: 200,
    });
    await twd.visit("/contacts/new");
    const firstName = await twd.get("input[name='firstName']");
    await userEvent.type(firstName.el, "New");
    const lastName = await twd.get("input[name='lastName']");
    await userEvent.type(lastName.el, "Smith");
    const username = await twd.get("input[name='username']");
    await userEvent.type(username.el, "new_smith");
    const email = await twd.get("input[name='email']");
    await userEvent.type(email.el, "new.smith@example.com");
    const phone = await twd.get("input[name='phone']");
    await userEvent.type(phone.el, "+1 455-9678");
    const avatar = await twd.get("input[name='avatar']");
    await userEvent.type(avatar.el, "https://i.pravatar.cc/150?img=13");
    const submitButton = await twd.get("button[type='submit']");
    await userEvent.click(submitButton.el);
    await twd.waitForRequest("newContact");
    await twd.waitForRequest("getNewContacts");
    const contacts = await twd.getAll("[data-testid='contact-link']");
    expect(contacts).to.have.length(list.length + 1);
    const newContactListElement = await twd.get("[data-testid='contact-link']:nth-child(4)");
    newContactListElement.should("have.text", "New Smith").should("have.class", "bg-primary");
  });
});