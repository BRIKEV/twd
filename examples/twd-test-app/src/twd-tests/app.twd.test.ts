import { twd, expect, userEvent, screenDom } from "../../../../src";
import { describe, it, beforeEach } from "../../../../src/runner";


describe("App interactions", () => {
  beforeEach(() => {
    console.log("Reset state before each test");
    twd.clearRequestMockRules();
  });

  describe("nested level 1", () => {
    beforeEach(() => {
      console.log("Reset state before each test 1");
    });
    describe("nested level 2", () => {
      beforeEach(() => {
        console.log("Reset state before each test 2");
      });
      it("clicks the button", async () => {
        await twd.visit("/");
        const btn = await twd.get("button");
        userEvent.click(btn.el);
      });
    });
  });

  it.skip("skipped test", () => {
    throw new Error("Should not run");
  });

  it("test button", async () => {
    await twd.visit("/");
    const user = userEvent.setup();
    const btn = await twd.get("button");
    await user.click(btn.el);
    await userEvent.click(btn.el);
  });

  describe("Nested describe", () => {
    it("checks text content", async () => {
      await twd.visit("/");
      let input = await twd.get("input#simple-input");
      await userEvent.type(input.el, "hola");
      input = await twd.get("input#simple-input");
      input.should("have.value", "hola");
    });
  });

  it("fetches a joke and also tests retries in the waitForRequest command as we remove mocks and define it again before the wait", async () => {
    twd.clearRequestMockRules();
    await twd.visit("/");
    const btn = await twd.get("button[data-twd='joke-button']");
    await twd.notExists("p[data-twd='joke-text']");
    await twd.mockRequest("joke", {
      method: "GET",
      url: "https://api.chucknorris.io/jokes/random",
      response: {
        value: "Mocked joke!",
      },
    });
    await userEvent.click(btn.el);
    // Wait for the mock fetch to fire
    await twd.waitForRequest("joke");
    const jokeText = await twd.get("p[data-twd='joke-text']");
    // console.log(`Joke text: ${jokeText.el.textContent}`);
    jokeText.should("have.text", "Mocked joke!");
    // overwrite mid-test
    await twd.mockRequest("joke", {
      method: "GET",
      url: "https://api.chucknorris.io/jokes/random",
      response: {
        value: "Mocked second joke!",
      },
    });
    await userEvent.click(btn.el);
    await twd.waitForRequest("joke");
    const jokeText2 = await twd.get("p[data-twd='joke-text']");
    expect(jokeText2.el.textContent).to.equal("Mocked second joke!");
    jokeText2.should("have.text", "Mocked second joke!");
    // console.log(`Joke text: ${jokeText.el.textContent}`);
    // jokeText.should('be.disabled');
  });

  it("fetches a third joke to validate if the mocks are cleaned", async () => {
    await twd.mockRequest("joke", {
      method: "GET",
      url: "https://api.chucknorris.io/jokes/random",
      response: {
        value: "Third Mocked joke!",
      },
    });
    await twd.visit("/");
    const btn = await twd.get("button[data-twd='joke-button']");
    await userEvent.click(btn.el);
    // Wait for the mock fetch to fire
    await twd.waitForRequest("joke");
    const jokeText = await twd.get("p[data-twd='joke-text']");
    // console.log(`Joke text: ${jokeText.el.textContent}`);
    jokeText.should("have.text", "Third Mocked joke!");
  });

  it("visit contact page", async () => {
    twd.visit("/contact");
    const user = userEvent.setup();
    await twd.mockRequest("contactSubmit", {
      method: "POST",
      url: 'http://localhost:3001/contact',
      response: { success: true },
    });
    // Use screenDom (testing-library) for label/role-based queries
    const emailInput = screenDom.getByLabelText("Email:");
    await user.type(emailInput, "test@example.com");
    const subjectSelect = screenDom.getByLabelText("Subject:");
    await user.selectOptions(subjectSelect, "support");
    const messageInput = screenDom.getByLabelText("Message:");
    await user.type(messageInput, "Hello, this is a test message.");
    // twd.get for special inputs that need setInputValue
    const dateInput = await twd.get("input#date");
    await user.type(dateInput.el, "2023-01-01");
    const monthInput = await twd.get("input#month");
    await user.type(monthInput.el, "2023-01");
    const timeInput = await twd.get("input#time");
    await user.type(timeInput.el, "12:00");
    const weekInput = await twd.get("input#week");
    await user.type(weekInput.el, "2023-W15");
    const colorInput = await twd.get("input#color");
    twd.setInputValue(colorInput.el, '#ff0000');
    const rangeInput = await twd.get("input#range");
    twd.setInputValue(rangeInput.el, '75');
    const hourInput = await twd.get('input[name="hour"]');
    twd.setInputValue(hourInput.el, '14:30');
    // screenDom for checkbox and radio
    const newsletterCheckbox = screenDom.getByRole("checkbox", { name: /subscribe to newsletter/i });
    await user.click(newsletterCheckbox);
    const highPriority = screenDom.getByRole("radio", { name: /high/i });
    await user.click(highPriority);
    const submitBtn = screenDom.getByRole("button", { name: /send/i });
    await user.click(submitBtn);
    const rules = await twd.waitForRequests(["contactSubmit"]);
    const request = rules[0].request;
    expect(request).to.deep.equal({
      email: "test@example.com",
      message: "Hello, this is a test message.",
      date: "2023-01-01",
      month: "2023-01",
      time: "12:00",
      color: "#ff0000",
      range: "75",
      hour: "14:30",
      week: "2023-W15",
      subject: "support",
      newsletter: "true",
      priority: "high",
    });
    await twd.url().should("contain.url", "/contact");
    // Verify submitted data is displayed using screenDom
    const submittedEmail = screenDom.getByTestId("submitted-email");
    twd.should(submittedEmail, "contain.text", "test@example.com");
    const submittedSubject = screenDom.getByTestId("submitted-subject");
    twd.should(submittedSubject, "contain.text", "support");
    const submittedNewsletter = screenDom.getByTestId("submitted-newsletter");
    twd.should(submittedNewsletter, "contain.text", "true");
    const submittedPriority = screenDom.getByTestId("submitted-priority");
    twd.should(submittedPriority, "contain.text", "high");
  });
});
