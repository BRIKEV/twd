import { twd, expect, userEvent } from "twd-js";
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
    const noTodosMessage = await twd.get("[data-testid='no-todos-message']");
    noTodosMessage.should("be.visible");
    await twd.mockRequest("getTodoList", {
      method: "GET",
      url: "/api/todos",
      response: [
        todoListMock[0]
      ],
      status: 200,
    });
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
});