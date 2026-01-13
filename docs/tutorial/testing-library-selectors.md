# Using Testing Library Selectors

In this part, we’ll look at a new feature in TWD: support for Testing Library–style selectors.
These selectors are widely known in the community, and while you could technically use them before (TWD is very flexible), now they’re fully integrated — including visual selection in the **sidebar**.

## Before You Start

If you’re following along from Part 5, you can continue as is. But if you want to reset your repo or make sure you're on the correct branch:

```
# Repo git clone git@github.com:BRIKEV/twd-docs-tutorial.git
git reset --hard
git clean -d -f
git checkout 06-selectors-testing-library
npm run serve:dev
```

## Let’s Begin

We’re going to migrate our current `twd.get` calls (which uses querySelector and we were using data-testid in previous post) to the new Testing Library selectors.

## Using screenDom

First, update your `src/twd-tests/helloWorld.twd.test.ts` file.

```ts
// We will change this
const title = await twd.get("[data-testid='welcome-title']");
// to this
const title = await screenDom.getByText("Welcome to TWD");
```

For assertions, we’ll use a new command: `twd.should`.
It works exactly like `element.should`, but can be used with any element returned by `screenDom`.

Your updated test will look like this:

```ts
import { twd, userEvent, screenDom } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("Hello World Page", () => {
  it("should display the welcome title and counter button", async () => {
    await twd.visit("/");
    
    const title = await screenDom.getByText("Welcome to TWD");
    twd.should(title, 'be.visible');
    
    const counterButton = await screenDom.getByText("Count is 0");
    twd.should(counterButton, 'be.visible');
    
    await userEvent.click(counterButton);
    twd.should(counterButton, 'have.text', 'Count is 1');
    
    await userEvent.click(counterButton);
    twd.should(counterButton, 'have.text', 'Count is 2');
    
    await userEvent.click(counterButton);
    twd.should(counterButton, 'have.text', 'Count is 3');
  });
});
```
> You can mix both approaches.
`twd.get` includes a built-in `.should`, while screenDom lets you use familiar Testing Library selectors, combined with `twd.should`.

## Todo list Tests

Here’s how the Todo tests look after migrating to testing-library selectors:

```ts
import { twd, expect, userEvent, screenDom } from "twd-js";
import { describe, it, beforeEach } from "twd-js/runner";
import todoListMock from "./mocks/todoList.json";

describe("Todo List Page", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
  });

  it("should display the todo list", async () => {
    await twd.mockRequest("getTodoList", {
      method: "GET",
      url: "/api/todos",
      response: todoListMock,
      status: 200,
    });
    await twd.visit("/todos");
    await twd.waitForRequest("getTodoList");
    
    const todo1Title = await screenDom.getByText("Learn TWD");
    twd.should(todo1Title, "be.visible");
    
    const todo2Title = await screenDom.getByText("Build Todo App");
    twd.should(todo2Title, "be.visible");
    
    const todo1Description = await screenDom.getByText("Understand how to use TWD for testing web applications");
    twd.should(todo1Description, "be.visible");
    
    const todo2Description = await screenDom.getByText("Create a todo list application to demonstrate TWD features");
    twd.should(todo2Description, "be.visible");
    
    const todo1Date = await screenDom.getByText("Date: 2024-12-20");
    twd.should(todo1Date, "be.visible");
    
    const todo2Date = await screenDom.getByText("Date: 2024-12-25");
    twd.should(todo2Date, "be.visible");
  });

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
    
    const noTodosMessage = await screenDom.getByText("No todos yet. Create one above!");
    twd.should(noTodosMessage, "be.visible");
    
    await twd.mockRequest("getTodoList", {
      method: "GET",
      url: "/api/todos",
      response: [
        todoListMock[0]
      ],
      status: 200,
    });
    
    const titleInput = await screenDom.getByLabelText("Title");
    await userEvent.type(titleInput, "Test Todo");
    
    const descriptionInput = await screenDom.getByLabelText("Description");
    await userEvent.type(descriptionInput, "Test Description");
    
    const dateInput = await screenDom.getByLabelText("Date");
    await userEvent.type(dateInput, "2024-12-20");
    
    const submitButton = await screenDom.getByRole("button", { name: "Create Todo" });
    await userEvent.click(submitButton);
    
    await twd.waitForRequest("getTodoList");
    const rule = await twd.waitForRequest("createTodo");
    expect(rule.request).to.deep.equal({
      title: "Test Todo",
      description: "Test Description",
      date: "2024-12-20",
    });

    const todoList = await screenDom.getAllByText(/Learn TWD|Build Todo App|Test Todo/);
    expect(todoList).to.have.length(1);
  });

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
    
    // Find the delete button for the first todo (Learn TWD)
    // Since there are multiple delete buttons, we'll get all and use the first one
    // which corresponds to the first todo item
    const deleteButtons = await screenDom.getAllByRole("button", { name: "Delete" });
    const deleteButton = deleteButtons[0];
    
    await twd.mockRequest("getTodoList", {
      method: "GET",
      url: "/api/todos",
      response: todoListMock.filter((todo) => todo.id !== "1"),
      status: 200,
    });
    
    await userEvent.click(deleteButton);
    await twd.waitForRequest("deleteTodo");
    await twd.waitForRequest("getTodoList");
    
    const todoList = await screenDom.getAllByText(/Learn TWD|Build Todo App/);
    expect(todoList).to.have.length(1);
    twd.should(todoList[0], "be.visible");
  });
});
```

## Conclusion

As you can see, TWD is flexible enough to support both styles of selectors.
And remember: these tests run inside your actual application, so anything your app can access—stores, utilities, helpers—can be used to set up your scenarios.

TWD is all about keeping testing close to development, while staying simple, flexible, and intuitive.
