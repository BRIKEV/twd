import { twd, expect, userEvent } from "../../../../src";
import { describe, it, itOnly, itSkip, beforeEach } from "../../../../src/runner";

beforeEach(() => {
  console.log("Reset state before each test");
});

describe("App interactions", () => {
  it("clicks the button", async () => {
    const btn = await twd.get("button");
    userEvent.click(btn.el);
  });

  itSkip("skipped test", () => {
    throw new Error("Should not run");
  });

  itOnly("only this one runs if present and long text to check the layout", async () => {
    const user = userEvent.setup();
    const btn = await twd.get("button");
    await user.click(btn.el);
    await userEvent.click(btn.el);
    console.log("Ran only test");
  });
  describe("Nested describe", () => {
    it("checks text content", async () => {
      let input = await twd.get("input#simple-input");
      await userEvent.type(input.el, "hola");
      input = await twd.get("input#simple-input");
      input.should("have.value", "hola");
    });
  });

  it("fetches a joke", async () => {
    await twd.mockRequest("joke", {
      method: "GET",
      url: "https://api.chucknorris.io/jokes/random",
      response: {
        value: "Mocked joke!",
      },
    });
    let btn = await twd.get("button[data-twd='joke-button']");
    userEvent.click(btn.el);
    // Wait for the mock fetch to fire
    await twd.waitForRequest("joke");
    let jokeText = await twd.get("p[data-twd='joke-text']");
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
    btn = await twd.get("button[data-twd='joke-button']");
    userEvent.click(btn.el);
    await twd.waitForRequest("joke");
    jokeText = await twd.get("p[data-twd='joke-text']");
    expect(jokeText.el.textContent).to.equal("Mocked second joke!");
    jokeText.should("have.text", "Mocked second joke!");
    // console.log(`Joke text: ${jokeText.el.textContent}`);
    // jokeText.should('be.disabled');
    twd.clearRequestMockRules();
  });

  it("fetches a third joke to validate if the mocks are cleaned", async () => {
    await twd.mockRequest("joke", {
      method: "GET",
      url: "https://api.chucknorris.io/jokes/random",
      response: {
        value: "Third Mocked joke!",
      },
    });
    const btn = await twd.get("button[data-twd='joke-button']");
    await userEvent.click(btn.el);
    // Wait for the mock fetch to fire
    await twd.waitForRequest("joke");
    const jokeText = await twd.get("p[data-twd='joke-text']");
    // console.log(`Joke text: ${jokeText.el.textContent}`);
    jokeText.should("have.text", "Third Mocked joke!");
    twd.clearRequestMockRules();
  });

  it("visit contact page", async () => {
    twd.visit("/contact");
    const user = userEvent.setup();
    await twd.mockRequest("contactSubmit", {
      method: "POST",
      url: 'http://localhost:3001/contact',
      response: { success: true },
    });
    const emailInput = await twd.get("input#email");
    await user.type(emailInput.el, "test@example.com");
    const messageInput = await twd.get("textarea#message");
    await user.type(messageInput.el, "Hello, this is a test message.");
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
    const submitBtn = await twd.get("button[type='submit']");
    await user.click(submitBtn.el);
    const rules = await twd.waitForRequests(["contactSubmit"]);
    const request = rules[0].request;
    expect(request).to.deep.equal({ email: "test@example.com", message: "Hello, this is a test message.", date: "2023-01-01", month: "2023-01", time: "12:00", color: "#ff0000", range: "75", hour: "14:30", week: "2023-W15" });
    twd.url().should("contain.url", "/contact");
    twd.clearRequestMockRules();
  });
});
