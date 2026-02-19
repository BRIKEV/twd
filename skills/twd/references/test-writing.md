# TWD Test Writing Reference

## Testing Philosophy: Flow-Based Tests

TWD tests should focus on **full user flows**, not granular unit-style assertions. Each `it()` block should test a meaningful user journey through a page.

- One `describe()` per page or major feature
- Each `it()` covers a complete flow: setup mocks → visit → interact → assert outcome
- Don't write one test per element — test the full journey
- Group flows by scenario: happy path, empty states, error handling, CRUD operations
- Multiple assertions per `it()` is expected — they should tell a story

## Required Imports

```typescript
import { twd, userEvent, screenDom, expect } from "twd-js";
import { describe, it, beforeEach, afterEach } from "twd-js/runner";
```

- `twd-js` — Main API (`twd`, `userEvent`, `screenDom`, `screenDomGlobal`, `expect`)
- `twd-js/runner` — Test functions (`describe`, `it`, `beforeEach`, `afterEach`)
- `twd-js/ui` — UI components (`MockedComponent`)

NEVER import `describe`, `it`, `beforeEach`, `expect` from Jest, Mocha, or other libraries.

## File Location and Naming

Place all test files in `src/twd-tests/`. For larger projects, organize by domain (e.g., `src/twd-tests/auth/`, `src/twd-tests/dashboard/`). Shared mock data goes in `src/twd-tests/mocks/`.

Files must follow: `*.twd.test.ts` or `*.twd.test.tsx`

## Async/Await (Required)

```typescript
// These are ALL async — ALWAYS await
await twd.visit("/page");
await twd.get("button");
await twd.getAll(".item");
await userEvent.click(button);
await userEvent.type(input, "text");
await screenDom.findByRole("button");
await twd.waitForRequest("label");
await twd.notExists(".spinner");
```

## Element Selection

**Preferred: Testing Library queries via `screenDom`**

```typescript
// By role (RECOMMENDED)
screenDom.getByRole("button", { name: "Submit" });
screenDom.getByRole("heading", { name: "Welcome", level: 1 });

// By label (form inputs)
screenDom.getByLabelText("Email Address");

// By text
screenDom.getByText("Success!");
screenDom.getByText(/welcome/i);

// By test ID
screenDom.getByTestId("user-card");

// Query variants
screenDom.getByRole("button");        // Throws if not found
screenDom.queryByRole("button");      // Returns null if not found
await screenDom.findByRole("button"); // Waits for element (async)
screenDom.getAllByRole("button");     // Returns array
```

**For modals/portals use `screenDomGlobal`:**

```typescript
import { screenDomGlobal } from "twd-js";
const modal = screenDomGlobal.getByRole("dialog");
```

**Fallback: CSS selectors via `twd.get()`**

```typescript
const button = await twd.get("button");
const byId = await twd.get("#email");
const multiple = await twd.getAll(".item");
```

## User Interactions

```typescript
const user = userEvent.setup();

await user.click(screenDom.getByRole("button", { name: "Save" }));
await user.type(screenDom.getByLabelText("Email"), "hello@example.com");
await user.dblClick(element);
await user.clear(input);
await user.selectOptions(select, "option-value");
await user.keyboard("{Enter}");

// With twd.get() elements — use .el for raw DOM
const twdButton = await twd.get(".save-btn");
await user.click(twdButton.el);
```

## Assertions

**Function style (any element):**

```typescript
twd.should(screenDom.getByRole("button"), "be.visible");
twd.should(screenDom.getByRole("button"), "have.text", "Submit");
twd.should(element, "contain.text", "partial");
twd.should(element, "have.class", "active");
twd.should(element, "have.attr", "type", "submit");
twd.should(element, "have.value", "test@example.com");
twd.should(element, "be.disabled");
twd.should(element, "be.checked");
twd.should(element, "not.be.visible");
```

**Method style (on twd elements):**

```typescript
const el = await twd.get("h1");
el.should("have.text", "Welcome");
el.should("be.visible");
```

**URL assertions:**

```typescript
await twd.url().should("eq", "http://localhost:3000/dashboard");
await twd.url().should("contain.url", "/dashboard");
```

**Chai expect (non-element assertions):**

```typescript
expect(array).to.have.length(3);
expect(value).to.equal("expected");
expect(obj).to.deep.equal({ key: "value" });
```

## Navigation and Waiting

```typescript
await twd.visit("/");
await twd.visit("/login");
await twd.wait(1000);                         // Wait for time (ms)
await screenDom.findByText("Success!");        // Wait for element
await twd.notExists(".loading-spinner");       // Wait for element to NOT exist
```

## API Mocking

Always mock BEFORE `twd.visit()` or the action that triggers the request.

```typescript
// Mock GET
await twd.mockRequest("getUser", {
  method: "GET",
  url: "/api/user/123",
  response: { id: 123, name: "John Doe" },
  status: 200,
});

// Mock POST
await twd.mockRequest("createUser", {
  method: "POST",
  url: "/api/users",
  response: { id: 456, created: true },
  status: 201,
});

// Regex URL matching
await twd.mockRequest("getUserById", {
  method: "GET",
  url: /\/api\/users\/\d+/,
  response: { id: 999, name: "Dynamic User" },
  urlRegex: true,
});

// Error responses
await twd.mockRequest("serverError", {
  method: "GET",
  url: "/api/data",
  response: { error: "Server error" },
  status: 500,
});

// Wait for request and inspect body
const rule = await twd.waitForRequest("submitForm");
expect(rule.request).to.deep.equal({ email: "test@example.com" });

// Wait for multiple requests
await twd.waitForRequests(["getUser", "getPosts"]);

// Clear all mocks (always in beforeEach)
twd.clearRequestMockRules();
```

## Component Mocking

```tsx
// In your component — wrap with MockedComponent
import { MockedComponent } from "twd-js/ui";

function Dashboard() {
  return (
    <MockedComponent name="ExpensiveChart">
      <ExpensiveChart data={data} />
    </MockedComponent>
  );
}
```

```typescript
// In your test
twd.mockComponent("ExpensiveChart", () => (
  <div data-testid="mock-chart">Mocked Chart</div>
));
```

## Module Stubbing with Sinon

ESM named exports are IMMUTABLE. Wrap hooks/services in objects with default export:

```typescript
// hooks/useAuth.ts — CORRECT: stubbable
const useAuth = () => useAuth0();
export default { useAuth };
```

```typescript
// In test:
import Sinon from "sinon";
import authModule from "../hooks/useAuth";

Sinon.stub(authModule, "useAuth").returns({
  isAuthenticated: true,
  user: { name: "John" },
});
// Always Sinon.restore() in beforeEach
```

## Standard Test Template

```typescript
import { twd, userEvent, screenDom, expect } from "twd-js";
import { describe, it, beforeEach } from "twd-js/runner";

const mockItems = [
  { id: 1, name: "Item One", status: "active" },
  { id: 2, name: "Item Two", status: "draft" },
];

describe("Items Page", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
    twd.clearComponentMocks();
  });

  it("should load items and allow filtering by status", async () => {
    await twd.mockRequest("getItems", {
      method: "GET",
      url: "/api/items",
      response: mockItems,
      status: 200,
    });

    await twd.visit("/items");
    await twd.waitForRequest("getItems");

    // Verify page loaded
    twd.should(screenDom.getByRole("heading", { name: "Items" }), "be.visible");
    expect(screenDom.getAllByRole("listitem")).to.have.length(2);

    // Filter by status
    const user = userEvent.setup();
    await user.selectOptions(screenDom.getByLabelText("Status"), "active");

    expect(screenDom.getAllByRole("listitem")).to.have.length(1);
    twd.should(screenDom.getByText("Item One"), "be.visible");
  });

  it("should show empty state when no items exist", async () => {
    await twd.mockRequest("getItems", {
      method: "GET",
      url: "/api/items",
      response: [],
      status: 200,
    });

    await twd.visit("/items");
    await twd.waitForRequest("getItems");

    twd.should(screenDom.getByText(/no items found/i), "be.visible");
  });

  it("should handle server error gracefully", async () => {
    await twd.mockRequest("getItems", {
      method: "GET",
      url: "/api/items",
      response: { error: "Internal server error" },
      status: 500,
    });

    await twd.visit("/items");
    await twd.waitForRequest("getItems");

    twd.should(await screenDom.findByText(/something went wrong/i), "be.visible");
  });
});
```

## Common Mistakes to AVOID

1. **Forgetting `await`** on `twd.get()`, `userEvent.*`, `twd.visit()`, `screenDom.findBy*`
2. **Mocking AFTER visit** — always mock before `twd.visit()`
3. **Not clearing mocks** — always `twd.clearRequestMockRules()` and `twd.clearComponentMocks()` in `beforeEach`
4. **Using Node.js APIs** — tests run in the browser, no `fs`, `path`, etc.
5. **Importing from wrong package** — `describe`/`it`/`beforeEach` from `twd-js/runner`, `expect` from `twd-js`, NOT Jest/Mocha
6. **Stubbing named exports** — ESM makes them immutable. Use the default-export object pattern
7. **Writing granular unit tests** — don't write one `it()` per element. Test full user flows
