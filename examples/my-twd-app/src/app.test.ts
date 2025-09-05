import { describe, it, itOnly, itSkip, beforeEach, twd } from "../../../src/twd";
import { intercept, waitFor } from "../../../src/twd-intercept";
import { expect } from "chai";

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
    intercept("joke", "GET", "https://api.chucknorris.io/jokes/random", {
      value: "Mocked joke!",
    });
    let btn = await twd.get("button[data-twd='joke-button']");
    btn.click();
    // Wait for the mock fetch to fire
    await waitFor("joke");
    let jokeText = await twd.get("p[data-twd='joke-text']");
    // console.log(`Joke text: ${jokeText.el.textContent}`);
    expect(jokeText.el.textContent).to.equal("Mocked joke!");
    // overwrite mid-test
    intercept("joke", "GET", "https://api.chucknorris.io/jokes/random", {
      value: "Mocked second joke!",
    });
    btn = await twd.get("button[data-twd='joke-button']");
    btn.click();
    await waitFor("joke");
    jokeText = await twd.get("p[data-twd='joke-text']");
    // console.log(`Joke text: ${jokeText.el.textContent}`);
    expect(jokeText.el.textContent).to.equal("Mocked second joke!");
  });

  it("visit contact page", async () => {
    twd.visit("/contact");
    const emailInput = await twd.get("input#email");
    emailInput.type("test@example.com");
    const messageInput = await twd.get("textarea#message");
    messageInput.type("Hello, this is a test message.");
  });
});
