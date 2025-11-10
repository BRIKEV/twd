# Testing While Developing (Part 3): Mocking API Requests

In [Part 2](https://dev.to/kevinccbsg/testing-while-developing-part-2-selectors-assertions-and-user-events-d6p), we explored assertions, selectors, and user interactions in TWD.
We used those tools to test the homepage, which only had a single button.


Now, it’s time to move to the `/todos` page — which brings more realistic functionality:

- Display Todos
- Create Todos
- Remove Todos

This page uses an API created with `json-server`.
We could run our tests directly against the real API like before, but that would modify local data and require resetting the database between tests. That’s not ideal — we want each test to be fully independent.

That’s where mocking comes in.

In TWD, we recommend mocking your network requests so you can test your frontend **without backend dependencies**. This approach brings several advantages:

- You can simulate any scenario: success, errors, or missing data.
- You can validate the UX for those edge cases.
- You can reproduce bugs easily by mocking the exact request that caused them.

To achieve this, TWD provides utilities for mocking requests using Service Workers that intercept network traffic.

Let’s dive in.

## Before You Start

If you’re following along from Part 2, you can continue as is. But if you want to reset your repo or make sure you're on the correct branch:

```
# Repo git clone git@github.com:BRIKEV/twd-docs-tutorial.git
git reset --hard
git clean -d -f
git checkout 03-network-mocking
npm run serve:dev
```

---

## Installing the Service Worker

We have a command to install the Service Worker that handles request interception:

```
npx twd-js init public --save
```

This command creates a `mock-sw.js` file in the folder you specify.
Since we’re using Vite, it will be stored inside the `public` folder.

After that, initialize the worker in your `src/main.tsx` file:

```ts
if (import.meta.env.DEV) {
  // You choose how to load the tests; this example uses Vite's glob import
  const testModules = import.meta.glob("./**/*.twd.test.ts");
  const { initTests, twd, TWDSidebar } = await import('twd-js');
  // You need to pass the test modules, the sidebar component, and createRoot function
  initTests(testModules, <TWDSidebar open={true} position="left" />, createRoot);
  // if you want to use mock requests, you can initialize it here
  twd.initRequestMocking()
    .then(() => {
      console.log("Request mocking initialized");
    })
    .catch((err) => {
      console.error("Error initializing request mocking:", err);
    });
}
```

---

## Displaying Todos

Create a new file `src/twd-tests/todoList.twd.test.ts` and start with a basic test:

```ts
import { twd } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("Todo List Page", () => {
  it("should display the todo list", async () => {
    await twd.visit("/todos");
  });
});
```

This test simply visits the `/todos` page and loads the real API data:

![todo page without mock](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/9skcvw7fut99pzo55dwa.png)

Now let’s mock the request so we can control the response.

```twd
await twd.mockRequest("getTodoList", {
  method: "GET",
  url: "/api/todos",
  response: [],
  status: 200,
});
```

This method receives an alias and a configuration object — including the HTTP method, URL, mocked response, and status code.
There are more options ([check our docs](https://brikev.github.io/twd/api-mocking.html) for all available fields).

Now the complete test looks like this:

```twd
import { twd } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("Todo List Page", () => {
  it("should display the todo list", async () => {
    await twd.mockRequest("getTodoList", {
      method: "GET",
      url: "/api/todos",
      response: [],
      status: 200,
    });
    await twd.visit("/todos");
  });
});
```

This will show an empty list — exactly what we defined:

![todo page with route mocked](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/cln5fy10tc7b97uj6cfx.png)

This is **extremely powerful** because it lets you simulate all possible frontend scenarios — from successful responses to errors — without relying on your backend.
You can even capture real requests from bugs and replay them as tests.

Now let’s build a complete test with real data.

---

## Mocking with Real Data

Create a mock file: `src/twd-tests/mocks/todoList.json`

```json
[
  {
    "id": "1",
    "title": "Learn TWD",
    "description": "Understand how to use TWD for testing web applications",
    "date": "2024-12-20"
  },
  {
    "id": "2",
    "title": "Build Todo App",
    "description": "Create a todo list application to demonstrate TWD features",
    "date": "2024-12-25"
  }
]
```

And now the complete test:

```ts
import { twd } from "twd-js";
import { describe, it } from "twd-js/runner";
import todoListMock from "./mocks/todoList.json";

describe("Todo List Page", () => {
  it("should display the todo list", async () => {
    await twd.mockRequest("getTodoList", {
      method: "GET",
      url: "/api/todos",
      response: todoListMock,
      status: 200,
    });
    await twd.visit("/todos");
    await twd.waitForRequest("getTodoList");
    const todo1Title = await twd.get("[data-testid='todo-title-1']");
    todo1Title.should("have.text", "Learn TWD");
    const todo2Title = await twd.get("[data-testid='todo-title-2']");
    todo2Title.should("have.text", "Build Todo App");
    const todo1Description = await twd.get("[data-testid='todo-description-1']");
    todo1Description.should("have.text", "Understand how to use TWD for testing web applications");
    const todo2Description = await twd.get("[data-testid='todo-description-2']");
    todo2Description.should("have.text", "Create a todo list application to demonstrate TWD features");
    const todo1Date = await twd.get("[data-testid='todo-date-1']");
    todo1Date.should("have.text", "Date: 2024-12-20");
    const todo2Date = await twd.get("[data-testid='todo-date-2']");
    todo2Date.should("have.text", "Date: 2024-12-25");
  });
});
```

The new command here is:

```ts
await twd.waitForRequest("getTodoList");
```

It waits until the mocked request is triggered — useful when you need to ensure data is rendered before asserting UI state.

> Always define `mockRequest` before triggering the request (clicks, submits, or navigation).
> If you mock it too late, it might not intercept properly.

![homepage with list todos tests](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/uc6wwevk534xxpcsrigi.png)

---

## Creating a Todo

When testing the “create todo” feature, we need to verify:

- The form is filled correctly
- The correct data is sent
- The list refreshes after submission
- The new element appears in the list

Let’s define our request mocks first:

```ts
// request of creating a todo
await twd.mockRequest("createTodo", {
  method: "POST",
  url: "/api/todos",
  response: todoListMock[0],
  status: 200,
});
// empty list on first load
await twd.mockRequest("getTodoList", {
  method: "GET",
  url: "/api/todos",
  response: [],
  status: 200,
});
```

Then visit the page and confirm it’s empty:

```ts
await twd.visit("/todos");
await twd.waitForRequest("getTodoList");
const noTodosMessage = await twd.get("[data-testid='no-todos-message']");
noTodosMessage.should("be.visible");
```

Next, update the mock to include a new todo after creation:

```ts
await twd.mockRequest("getTodoList", {
  method: "GET",
  url: "/api/todos",
  response: [todoListMock[0]],
  status: 200,
});
```

Fill and submit the form:

```ts
const title = await twd.get("input[name='title']");
await userEvent.type(title.el, "Test Todo");
const description = await twd.get("input[name='description']");
await userEvent.type(description.el, "Test Description");
const date = await twd.get("input[name='date']");
await userEvent.type(date.el, "2024-12-20");
const submitButton = await twd.get("button[type='submit']");
// submit
await userEvent.click(submitButton.el);
// we wait for the list request to be made
await twd.waitForRequest("getTodoList");
```

Finally, we validate both the **request body** and **updated list**:

```ts
import { twd, expect, userEvent } from "twd-js";

// all waits return the rule with the definition and request made
const rule = await twd.waitForRequest("createTodo");
// we can validate the request sent to the backend
expect(rule.request).to.deep.equal({
  title: "Test Todo",
  description: "Test Description",
  date: "2024-12-20",
});
const todoList = await twd.getAll("[data-testid='todo-item']");
expect(todoList).to.have.length(1);
```
> expect assertions (from Chai) only show up in the sidebar on failure — unlike .should which always displays. We use Chai as these tests execute in the browser

---

## Full Example

Here’s the complete file, including a best practice: use `twd.clearRequestMockRules()` in a `beforeEach()` to ensure every test runs independently.

```ts
import { twd, expect, userEvent } from "twd-js";
import { describe, it, beforeEach } from "twd-js/runner";
import todoListMock from "./mocks/todoList.json";

describe("Todo List Page", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
  });

  // ... display test ...

  it("should create a todo", async () => {
    await twd.mockRequest("createTodo", {
      method: "POST",
      url: "/api/todos",
      response: todoListMock[0],
      status: 200,
    });
    await twd.mockRequest("getTodoList", {
      method: "GET",
      url: "/api/todos",
      response: [],
      status: 200,
    });
    await twd.visit("/todos");
    await twd.waitForRequest("getTodoList");
    await twd.mockRequest("getTodoList", {
      method: "GET",
      url: "/api/todos",
      response: [todoListMock[0]],
      status: 200,
    });
    const noTodosMessage = await twd.get("[data-testid='no-todos-message']");
    noTodosMessage.should("be.visible");
    const title = await twd.get("input[name='title']");
    await userEvent.type(title.el, "Test Todo");
    const description = await twd.get("input[name='description']");
    await userEvent.type(description.el, "Test Description");
    const date = await twd.get("input[name='date']");
    await userEvent.type(date.el, "2024-12-20");
    const submitButton = await twd.get("button[type='submit']");
    await userEvent.click(submitButton.el);
    await twd.waitForRequest("getTodoList");
    const rule = await twd.waitForRequest("createTodo");
    expect(rule.request).to.deep.equal({
      title: "Test Todo",
      description: "Test Description",
      date: "2024-12-20",
    });
    const todoList = await twd.getAll("[data-testid='todo-item']");
    expect(todoList).to.have.length(1);
  });
});
```

![All tests passed](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/5qd33cy9ky9ir6f3ztio.png)

## Removing Todos

For deleting todos, we reuse what we’ve learned — mocking, waiting, and validating.

```ts
it("should delete a todo", async () => {
  await twd.mockRequest("deleteTodo", {
    method: "DELETE",
    url: "/api/todos/1",
    response: null,
    status: 200,
  });
  await twd.mockRequest("getTodoList", {
    method: "GET",
    url: "/api/todos",
    response: todoListMock,
    status: 200,
  });
  await twd.visit("/todos");
  const deleteButton = await twd.get("[data-testid='delete-todo-1']");
  await twd.mockRequest("getTodoList", {
    method: "GET",
    url: "/api/todos",
    response: todoListMock.filter((todo) => todo.id !== "1"),
    status: 200,
  });
  await userEvent.click(deleteButton.el);
  await twd.waitForRequest("deleteTodo");
  await twd.waitForRequest("getTodoList");
  const todoList = await twd.getAll("[data-testid='todo-item']");
  expect(todoList).to.have.length(1);
});
```

---

## What's next

We’ve covered one of the most important parts of the TWD approach — mocking.
This is where the framework truly shines.

A few closing thoughts:

- Use mocks to test what you’re building — your frontend.
Don’t worry about backend or third-party services during development.
- These mocks only intercept **client-side** requests (SSR is out of scope).
- You’ll have all possible scenarios documented as runnable tests — no setup, no servers, just `npm i`.

We strongly believe this is the most efficient way to develop and test modern SPAs.
It keeps your workflow fast, predictable, and resilient to backend changes.

In the [next post](https://dev.to/kevinccbsg/testing-while-developing-part-4-running-tests-in-ci-10op), we’ll take things further by adding **terminal execution for CI**.
