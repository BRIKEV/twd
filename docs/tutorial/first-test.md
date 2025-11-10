# Selectors, Assertions, and User Events

In the [previous tutorial](./installation), we set up our basic testing configuration and used the `visit` command to load our app.
Now, we're ready to make our tests a little more meaningful.

In this part, we'll focus on three key features:

- Selectors – how we find elements in our UI
- Assertions – how we verify what's on screen
- User events – how we simulate real interactions

Let's dive in.

## Before You Start

If you're following along from the installation tutorial, you can continue as is. But if you want to reset your repo or make sure you're on the correct branch:

```
# Repo git clone git@github.com:BRIKEV/twd-docs-tutorial.git
git reset --hard
git clean -d -f
git checkout 02-assertions
npm run serve:dev
```

---

## Selectors

TWD uses a simple and familiar approach for selectors.
It provides two commands — `get` and `getAll` — which are based directly on the native DOM APIs `document.querySelector` and `document.querySelectorAll`.

That means you can use any selector you'd normally use in the browser: class, id, tag, attribute, role, etc.
We believe this keeps things flexible and intuitive, especially for developers already comfortable with the DOM.

Let's improve our existing test file `src/twd-tests/helloWorld.twd.test.ts`.
We'll test that our title displays the text "Welcome to TWD" and that our counter button updates as expected.

We'll start by selecting the elements using twd.get:

```ts
const title = await twd.get("[data-testid='welcome-title']");
```

Here, we're using a `data-testid` attribute — just like in React Testing Library or Cypress.
Because `get` is based on `querySelector`, you can use any CSS selector you prefer.

For the counter button, we can do the same:

```ts
const counterButton = await twd.get("[data-testid='counter-button']");
```

> Note: Selectors are async because TWD automatically retries finding the element for up to two seconds.
> So don't forget to use `await` before them.

---

## Assertions

Once we've selected our elements, it's time to verify that our UI behaves as expected.

Each selected element returned by `twd.get` includes two useful properties:

- `el` – the raw DOM element
- `should` – a utility for performing assertions

Here's how we can assert visibility and text content:

```ts
const title = await twd.get("[data-testid='welcome-title']");
title.should("be.visible").should("have.text", "Welcome to TWD");

const counterButton = await twd.get("[data-testid='counter-button']");
counterButton.should("be.visible").should("have.text", "Count is 0");
```

The should command is chainable, so you can stack multiple conditions easily.
TWD supports several built-in assertions such as:

- be.visible
- have.text
- have.class
- have.attribute
- and even their `not` versions (e.g. `should("not.have.text", "Error")`)

Once you run your tests, the sidebar will clearly show what was tested:

![Tests running](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/6cpsujkux94p9jzfw1a8.png)

---

## Interacting with the UI

Now that we can find and verify elements, let's make things interactive.

TWD integrates directly with [user event](https://github.com/testing-library/user-event) from React Testing Library — a well-known tool that handles realistic user interactions such as clicks, typing, and keyboard input.

We chose `user-event` because it already supports most common browser interactions and mimics how a real user would use the app.
TWD also provides a custom `setInputValue` helper for specific inputs that `user-event` doesn't handle perfectly.

To use it, import both `twd` and `userEvent`:

```ts
import { twd, userEvent } from "twd-js";
```

Then, to simulate a click:

```ts
const counterButton = await twd.get("[data-testid='counter-button']");
await userEvent.click(counterButton.el);
```

Notice we pass the element itself (`.el`) to `userEvent`, as that's what the library expects.

---

## Putting It All Together

Now let's combine selectors, assertions, and events into a single test.
Our `helloWorld.twd.test.ts` will look like this:

```ts
import { twd, userEvent } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("Hello World Page", () => {
  it("should display the welcome title and counter button", async () => {
    await twd.visit("/");
    
    const title = await twd.get("[data-testid='welcome-title']");
    title.should("be.visible").should("have.text", "Welcome to TWD");
    
    const counterButton = await twd.get("[data-testid='counter-button']");
    counterButton.should("be.visible").should("have.text", "Count is 0");
    
    await userEvent.click(counterButton.el);
    counterButton.should("have.text", "Count is 1");
    
    await userEvent.click(counterButton.el);
    counterButton.should("have.text", "Count is 2");
    
    await userEvent.click(counterButton.el);
    counterButton.should("have.text", "Count is 3");
  });
});
```

And the test results will look like this:

![test running after three clicks](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/l1e29i5r2cuyjsz2mz6l.png)

As you can see, the UI updates in real time — and since it's your actual app, you can continue using it normally while your tests run.

---

## What's Next

In the [next tutorial](./api-mocking), we'll explore one of the most powerful features of TWD: network mocking.
This will let developers test their frontend independently, without relying on backend integrations — perfect for building and testing features faster.

You can also learn more about selectors, assertions, and user events in our [official API documentation](/api/twd-commands).
