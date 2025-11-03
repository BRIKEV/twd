# API Mocking - Testing with Network Requests

Now let's learn how to test pages that make API calls! We'll use the Todo List page as our example, which loads todos from an API endpoint.

## Why Mock APIs?

When testing pages that load data from APIs, we need to:
- **Control the data** - Test with specific data without depending on a real server
- **Test in isolation** - Don't rely on external services being available
- **Test different scenarios** - Success cases, error cases, loading states
- **Fast tests** - No network delays

TWD uses **Mock Service Worker** to intercept HTTP requests and return mocked responses. This happens in the browser, so it's fast and reliable!

## The Todo List Example

Our Todo List page:
- Loads todos from `/api/todos` when the page loads
- Creates new todos via POST to `/api/todos`
- Deletes todos via DELETE to `/api/todos/:id`

Let's test all of these features!

## Setting Up Mocking with `beforeEach`

Before we start mocking, we need to set up our test suite. The `beforeEach` hook runs before each test, making it perfect for cleaning up mocks:

```ts
// src/twd-tests/todoList.twd.test.ts
import { twd, expect, userEvent } from "../../../../src";
import { describe, it, beforeEach } from "../../../../src/runner";
import todoListMock from "./mocks/todoList.json";

describe("Todo List Page", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
  });
  
  // Tests go here...
});
```

**What `beforeEach` does:**
- Runs **before each test** in the describe block
- Perfect for cleanup - clears all previous mock rules
- Ensures each test starts with a clean slate

**What `clearRequestMockRules()` does:**
- Removes all previously set up mock requests
- Prevents mocks from one test affecting another
- Essential for test isolation!

## Test 1: Displaying the Todo List

Let's start by testing that the page loads and displays todos:

```ts
it("should display the todo list", async () => {
  // Step 1: Set up the mock
  await twd.mockRequest("getTodoList", {
    method: "GET",
    url: "/api/todos",
    response: todoListMock,
    status: 200,
  });
  
  // Step 2: Navigate to the page
  await twd.visit("/todos");
  
  // Step 3: Wait for the API call to complete
  await twd.waitForRequest("getTodoList");
  
  // Step 4: Verify the todos are displayed
  const todoList = await twd.getAll("[data-testid='todo-item']");
  expect(todoList).to.have.length(2);
  
  const todo1Title = await twd.get("[data-testid='todo-title-1']");
  todo1Title.should("have.text", "Learn TWD");
});
```

Let's break this down step by step!

### Step 1: Mocking with `mockRequest()`

```ts
await twd.mockRequest("getTodoList", {
  method: "GET",
  url: "/api/todos",
  response: todoListMock,
  status: 200,
});
```

**What this does:**
- **First parameter** (`"getTodoList"`): An alias/name for this mock - we'll use this to wait for it later
- **`method`**: The HTTP method (GET, POST, PUT, DELETE, etc.)
- **`url`**: The exact URL path to intercept
- **`response`**: The data to return (can be an object, array, string, etc.)
- **`status`**: HTTP status code (200 = success, 404 = not found, 500 = server error, etc.)

**Important:** Only mock API endpoints, **not your application routes!**

```ts
// ✅ Good - Mocking API calls
await twd.mockRequest("getTodos", {
  method: "GET",
  url: "/api/todos",  // API endpoint
  response: [...]
});

// ❌ Bad - Don't mock app routes!
await twd.mockRequest("getTodos", {
  method: "GET",
  url: "/todos",  // This is your app route, not an API!
  response: [...]
});
```

### Step 2: Navigate and Load

```ts
await twd.visit("/todos");
```

When you navigate to `/todos`, the page's loader (if using React Router) will automatically make a GET request to `/api/todos`. Our mock intercepts this!

### Step 3: Wait for the Request with `waitForRequest()`

```ts
await twd.waitForRequest("getTodoList");
```

**What this does:**
- Waits for the mock request with alias `"getTodoList"` to be triggered
- Ensures the API call completed before we continue
- Prevents race conditions - we know the data is loaded!

**Why wait?**
Without waiting, we might try to check if todos are displayed before the API call completes. This would cause our test to fail!

### Step 4: Verify the Data

```ts
const todoList = await twd.getAll("[data-testid='todo-item']");
expect(todoList).to.have.length(2);
```

**`getAll()` vs `get()`:**
- `get()`: Finds one element
- `getAll()`: Finds multiple elements (returns an array)

Now we can verify each todo's details:

```ts
const todo1Title = await twd.get("[data-testid='todo-title-1']");
todo1Title.should("have.text", "Learn TWD");

const todo2Title = await twd.get("[data-testid='todo-title-2']");
todo2Title.should("have.text", "Build Todo App");

const todo1Description = await twd.get("[data-testid='todo-description-1']");
todo1Description.should("have.text", "Understand how to use TWD...");
```

## Test 2: Creating a Todo

Now let's test creating a new todo! This involves:
1. Mocking the POST request
2. Filling out the form
3. Submitting it
4. Verifying it was created

```ts
it("should create a todo", async () => {
  // Step 1: Mock the initial empty list
  await twd.mockRequest("getTodoList", {
    method: "GET",
    url: "/api/todos",
    response: [],
    status: 200,
  });
  
  await twd.visit("/todos");
  await twd.waitForRequest("getTodoList");
  
  // Step 2: Verify empty state
  const noTodosMessage = await twd.get("[data-testid='no-todos-message']");
  noTodosMessage.should("be.visible");
  
  // Step 3: Mock the POST request (creation)
  await twd.mockRequest("createTodo", {
    method: "POST",
    url: "/api/todos",
    response: todoListMock[0],
    status: 200,
  });
  
  // Step 4: Mock the updated list (after creation)
  await twd.mockRequest("getTodoList", {
    method: "GET",
    url: "/api/todos",
    response: [todoListMock[0]],
    status: 200,
  });
  
  // Step 5: Fill out the form
  const title = await twd.get("input[name='title']");
  await userEvent.type(title.el, "Test Todo");
  
  const description = await twd.get("input[name='description']");
  await userEvent.type(description.el, "Test Description");
  
  const date = await twd.get("input[name='date']");
  await userEvent.type(date.el, "2024-12-20");
  
  // Step 6: Submit the form
  const submitButton = await twd.get("button[type='submit']");
  await userEvent.click(submitButton.el);
  
  // Step 7: Wait for requests and verify
  await twd.waitForRequest("getTodoList");
  const rule = await twd.waitForRequest("createTodo");
  
  // Verify the request body
  expect(rule.request).to.deep.equal({
    title: "Test Todo",
    description: "Test Description",
    date: "2024-12-20",
  });
  
  // Verify the todo appears in the list
  const todoList = await twd.getAll("[data-testid='todo-item']");
  expect(todoList).to.have.length(1);
});
```

### Typing in Form Fields

Notice how we use `userEvent.type()` to fill out form fields:

```ts
const title = await twd.get("input[name='title']");
await userEvent.type(title.el, "Test Todo");
```

**What this does:**
- Finds the input field by its `name` attribute
- Types the text character by character (like a real user!)
- Triggers all the same events (onChange, onInput, etc.)

**Important:** We use `.el` to access the underlying DOM element that `userEvent` needs.

### Verifying the Request

After submitting, we can verify what data was sent:

```ts
const rule = await twd.waitForRequest("createTodo");
expect(rule.request).to.deep.equal({
  title: "Test Todo",
  description: "Test Description",
  date: "2024-12-20",
});
```

**What `rule.request` contains:**
- The request body that was sent to the API
- Perfect for verifying the form data is correct!

## Test 3: Deleting a Todo

Let's test deleting a todo:

```ts
it("should delete a todo", async () => {
  // Step 1: Mock the DELETE request
  await twd.mockRequest("deleteTodo", {
    method: "DELETE",
    url: "/api/todos/1",
    response: null,
    status: 200,
  });
  
  // Step 2: Mock the initial list (with the todo we'll delete)
  await twd.mockRequest("getTodoList", {
    method: "GET",
    url: "/api/todos",
    response: todoListMock,
    status: 200,
  });
  
  await twd.visit("/todos");
  
  // Step 3: Find the delete button
  const deleteButton = await twd.get("[data-testid='delete-todo-1']");
  
  // Step 4: Mock the updated list (after deletion)
  await twd.mockRequest("getTodoList", {
    method: "GET",
    url: "/api/todos",
    response: todoListMock.filter((todo) => todo.id !== "1"),
    status: 200,
  });
  
  // Step 5: Click delete
  await userEvent.click(deleteButton.el);
  
  // Step 6: Wait for both requests
  await twd.waitForRequest("deleteTodo");
  await twd.waitForRequest("getTodoList");
  
  // Step 7: Verify the todo was removed
  const todoList = await twd.getAll("[data-testid='todo-item']");
  expect(todoList).to.have.length(1);
});
```

**Key points:**
- We mock the DELETE request with the specific todo ID
- After deletion, we mock the updated list (without the deleted todo)
- We wait for both the DELETE and the subsequent GET request
- We verify the list now has one less item

## The "Rules Triggered" Button

When you're running tests with mocks, look at the TWD sidebar - you'll see a **"Rules Triggered"** button! 

**What it shows:**
- All the mock requests that have been triggered during your test
- The request details (method, URL, body)
- The response that was returned

**How to use it:**
1. Run a test that uses mocks
2. Click the "Rules Triggered" button in the sidebar
3. See all the API calls that were intercepted
4. Perfect for debugging - verify your mocks are working!

This is especially useful when:
- A mock isn't being triggered (check if it appears in the list)
- You want to see what data was sent in a request
- You're debugging why a test is failing

## Complete Example

Here's the complete test file with all three tests:

```ts
// src/twd-tests/todoList.twd.test.ts
import { twd, expect, userEvent } from "../../../../src";
import { describe, it, beforeEach } from "../../../../src/runner";
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
    const todoList = await twd.getAll("[data-testid='todo-item']");
    expect(todoList).to.have.length(2);
    // ... more assertions
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

## Best Practices

### 1. Always Use `beforeEach` to Clear Mocks

```ts
describe("My Tests", () => {
  beforeEach(() => {
    twd.clearRequestMockRules(); // Clean slate for each test
  });
});
```

### 2. Mock Before Navigating

```ts
// ✅ Good - Mock first, then navigate
await twd.mockRequest("getTodos", { ... });
await twd.visit("/todos");

// ❌ Bad - Navigate first, mock might be too late
await twd.visit("/todos");
await twd.mockRequest("getTodos", { ... });
```

### 3. Always Wait for Requests

```ts
// ✅ Good - Wait for the request
await twd.visit("/todos");
await twd.waitForRequest("getTodos");
// Now verify the UI

// ❌ Bad - Don't assume it's done
await twd.visit("/todos");
// UI might not be updated yet!
```

### 4. Use Descriptive Mock Aliases

```ts
// ✅ Good - Clear purpose
await twd.mockRequest("getTodoList", { ... });
await twd.mockRequest("createTodo", { ... });

// ❌ Bad - Unclear
await twd.mockRequest("api1", { ... });
await twd.mockRequest("req2", { ... });
```

### 5. Don't Mock Your App Routes

```ts
// ✅ Good - Mock API endpoints
await twd.mockRequest("getTodos", {
  url: "/api/todos",  // API endpoint
  ...
});

// ❌ Bad - Don't mock app routes
await twd.mockRequest("getTodos", {
  url: "/todos",  // This is your app route!
  ...
});
```

## Common Issues

### Mock Not Triggered

**Problem:** The mock isn't being called.

**Solutions:**
1. Check the URL matches exactly (including leading `/`)
2. Verify the HTTP method matches
3. Use the "Rules Triggered" button to see what's being called
4. Make sure you're mocking before navigating

### Request Happens Before Mock

**Problem:** The API call happens before the mock is set up.

**Solution:** Always set up mocks **before** navigating:

```ts
// ✅ Correct order
await twd.mockRequest("getTodos", { ... });
await twd.visit("/todos");

// ❌ Wrong order
await twd.visit("/todos");
await twd.mockRequest("getTodos", { ... }); // Too late!
```

### Test Fails Because Data Not Loaded

**Problem:** You're checking for elements before the API call completes.

**Solution:** Always wait for the request:

```ts
await twd.visit("/todos");
await twd.waitForRequest("getTodos"); // Wait for data to load
// Now it's safe to check the UI
const todos = await twd.getAll("[data-testid='todo-item']");
```

## What's Next?

Excellent! You now know how to:
- ✅ Mock API requests
- ✅ Wait for requests to complete
- ✅ Test form submissions
- ✅ Test deletions
- ✅ Use `beforeEach` for cleanup
- ✅ Use the "Rules Triggered" button for debugging

Next, let's learn about **CI Integration** - running these tests automatically in your CI/CD pipeline!

👉 [CI Integration](./ci-integration)
