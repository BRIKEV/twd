import { describe, it, itOnly, itSkip, beforeEach, twd } from "../../../src/twd";

beforeEach(() => {
  console.log("Reset state before each test");
});

describe("App interactions", () => {
  it("clicks the button", async () => {
    const btn = await twd.get("button");
    btn.click();
  });

  itSkip("skipped test", () => {
    throw new Error("Should not run");
  });

  itOnly("only this one runs if present", async () => {
    const btn = await twd.get("button");
    btn.click();
    console.log("Ran only test");
  });
  it("checks text content", async () => {
    const input = await twd.get("input#simple-input");
    const value = input.type('hola');
    console.log(`Input value: ${value.value}`);
  });

  it("fetches a joke", async () => {
    twd.mockRequest("joke", "GET", "https://api.chucknorris.io/jokes/random", {
      value: "Mocked joke!",
    });
    let btn = await twd.get("button[data-twd='joke-button']");
    btn.click();
    // Wait for the mock fetch to fire
    await twd.waitFor("joke");
    let jokeText = await twd.get("p[data-twd='joke-text']");
    // console.log(`Joke text: ${jokeText.el.textContent}`);
    jokeText.should("have.text", "Mocked joke!");
    // overwrite mid-test
    twd.mockRequest("joke", "GET", "https://api.chucknorris.io/jokes/random", {
      value: "Mocked second joke!",
    });
    btn = await twd.get("button[data-twd='joke-button']");
    btn.click();
    await twd.waitFor("joke");
    jokeText = await twd.get("p[data-twd='joke-text']");
    // console.log(`Joke text: ${jokeText.el.textContent}`);
    jokeText.should('be.disabled');
  });

  it("visit contact page", async () => {
    twd.visit("/contact");
    twd.mockRequest("contactSubmit", "POST", 'http://localhost:3001/contact', { success: true });
    const emailInput = await twd.get("input#email");
    emailInput.type("test@example.com");
    const messageInput = await twd.get("textarea#message");
    messageInput.type("Hello, this is a test message.");
    const submitBtn = await twd.get("button[type='submit']");
    // submitBtn.click();
    // const rule = await twd.waitFor("contactSubmit");
    // console.log(`Submitted body: ${rule.body}`);
  });
});
