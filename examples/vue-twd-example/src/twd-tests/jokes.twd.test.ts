import { twd, userEvent, expect } from '../dist/index.es.js';
import { describe, it } from '../dist/runner.es.js';

describe('Jokes Mock Test', () => {
  it('fetches a joke and tests mocks in Vue', async () => {
    twd.clearRequestMockRules();
    await twd.visit('/');
    
    // Check initial state
    const btn = await twd.get("button[data-twd='joke-button']");
    await twd.notExists("p[data-twd='joke-text']");

    // Mock first joke
    await twd.mockRequest("joke", {
      method: "GET",
      url: "https://api.chucknorris.io/jokes/random",
      response: {
        value: "Vue Mocked joke!",
      },
    });

    await userEvent.click(btn.el);
    await twd.waitForRequest("joke");
    
    const jokeText = await twd.get("p[data-twd='joke-text']");
    jokeText.should("have.text", "Vue Mocked joke!");

    // Mock second joke (overwrite)
    await twd.mockRequest("joke", {
      method: "GET",
      url: "https://api.chucknorris.io/jokes/random",
      response: {
        value: "Vue Mocked second joke!",
      },
    });

    await userEvent.click(btn.el);
    await twd.waitForRequest("joke");
    
    const jokeText2 = await twd.get("p[data-twd='joke-text']");
    jokeText2.should("have.text", "Vue Mocked second joke!");
    
    // Assert using Chai expect as well
    expect(jokeText2.el.textContent).to.equal("Vue Mocked second joke!");
  });
});

