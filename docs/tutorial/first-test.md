# First Test - Selectors & Assertions

Let's write your first complete TWD test! We'll use the Hello World page example to learn about navigation, element selection, and assertions.

## The Hello World Page

In our tutorial example, we have a simple home page with:
- A welcome title
- A counter button that increments when clicked

Let's test it step by step!

## Complete Test Example

Here's the full test we'll be building:

```ts
// src/twd-tests/helloWorld.twd.test.ts
import { twd, userEvent } from "../../../../src";
import { describe, it } from "../../../../src/runner";

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

Let's break this down piece by piece!

## Step 1: Navigation with `twd.visit()`

The first thing we do in our test is navigate to a route:

```ts
await twd.visit("/");
```

**What this does:**
- Navigates to the root route (`/`) of your application
- Works with React Router, Next.js router, or any routing solution
- Automatically waits for the page to load before continuing

**Try it yourself:**
```ts
await twd.visit("/about");    // Navigate to /about
await twd.visit("/todos");     // Navigate to /todos
await twd.visit("/contacts");  // Navigate to /contacts
```

## Step 2: Selecting Elements with `twd.get()`

After navigating, we need to find elements on the page:

```ts
const title = await twd.get("[data-testid='welcome-title']");
```

**What this does:**
- Finds an element using a CSS selector
- Waits automatically for the element to appear (no need for manual waits!)
- Returns a TWD element object that we can use for assertions

### Using Data Attributes (Recommended)

The best practice is to use `data-testid` attributes in your components:

```tsx
// In your React component
<h1 data-testid="welcome-title">Welcome to TWD</h1>
```

Then in your test:
```ts
const title = await twd.get("[data-testid='welcome-title']");
```

**Why use data-testid?**
- ✅ Stable - won't break if CSS classes change
- ✅ Semantic - clearly indicates it's for testing
- ✅ Not tied to styling - won't break if design changes

### Other Selector Options

You can also use standard CSS selectors:

```ts
// By tag name
const heading = await twd.get("h1");

// By ID
const header = await twd.get("#header");

// By class
const card = await twd.get(".card");

// By attribute
const submitBtn = await twd.get("button[type='submit']");

// Combined selectors
const emailInput = await twd.get("input[name='email']");
```

## Step 3: Making Assertions with `.should()`

Once we have an element, we can make assertions about it:

```ts
title.should("be.visible").should("have.text", "Welcome to TWD");
```

**What this does:**
- Checks that the element is visible on the page
- Checks that the element contains the exact text "Welcome to TWD"
- Chainable - you can add multiple assertions in one line!

### Common Assertions

```ts
// Visibility
element.should("be.visible");
element.should("not.be.visible");

// Text content
element.should("have.text", "Exact text");
element.should("contain.text", "Partial text");

// Attributes
element.should("have.attr", "data-testid", "my-button");
element.should("have.class", "active");

// Multiple assertions (chained)
element
  .should("be.visible")
  .should("have.text", "Hello")
  .should("have.class", "highlight");
```

## Step 4: User Interactions with `userEvent`

To test interactive elements like buttons, we use `userEvent`:

```ts
await userEvent.click(counterButton.el);
```

**What this does:**
- Simulates a real user click on the button
- Triggers all the same events a real click would (onClick, onMouseDown, etc.)
- Waits for the interaction to complete

**Note:** We use `.el` to access the underlying DOM element that `userEvent` needs.

### Other User Interactions

```ts
// Click
await userEvent.click(button.el);

// Type text
await userEvent.type(input.el, "Hello World");

// Clear input
await userEvent.clear(input.el);

// Select options
await userEvent.selectOptions(select.el, "option1");
```

## Step 5: Testing State Changes

After clicking the button, we verify the state changed:

```ts
await userEvent.click(counterButton.el);
counterButton.should("have.text", "Count is 1");
```

**What's happening:**
1. We click the button
2. React updates the state (count goes from 0 to 1)
3. The button text updates
4. We assert the new text is correct

TWD automatically waits for React to update the DOM before making assertions, so you don't need to manually wait!

## Running the Test

Now that you understand the test, here's how to run it:

1. **Make sure your dev server is running:**
   ```bash
   npm run dev
   ```

2. **Open your browser** and look for the TWD sidebar on the left

3. **Find your test** in the sidebar - you should see "Hello World Page" with a test underneath

4. **Click the play button** ▶️ next to the test to run it

5. **Watch it execute!** You'll see:
   - The page navigate to `/`
   - The title element be found
   - The button be clicked multiple times
   - All assertions pass ✅

## Understanding the Test Flow

Let's trace through what happens when you run the test:

```
1. twd.visit("/") 
   → Browser navigates to home page
   
2. twd.get("[data-testid='welcome-title']")
   → Waits for the title element to appear
   → Returns element object
   
3. title.should("be.visible")
   → Checks if element is visible ✅
   
4. title.should("have.text", "Welcome to TWD")
   → Checks if text matches ✅
   
5. twd.get("[data-testid='counter-button']")
   → Finds the counter button
   
6. counterButton.should("have.text", "Count is 0")
   → Verifies initial state ✅
   
7. userEvent.click(counterButton.el)
   → Clicks the button
   → React updates state (count = 1)
   
8. counterButton.should("have.text", "Count is 1")
   → Verifies state updated ✅
   
... and so on for clicks 2 and 3
```

## Tips for Writing Tests

### Use Descriptive Test Names

```ts
// ✅ Good - Clear what it tests
it("should display the welcome title and counter button", async () => {
  // ...
});

// ❌ Bad - Too vague
it("should work", async () => {
  // ...
});
```

### Test User Workflows

Think about what a real user would do:

```ts
it("should increment counter when button is clicked", async () => {
  // 1. Navigate to page
  await twd.visit("/");
  
  // 2. Find the button
  const button = await twd.get("[data-testid='counter-button']");
  
  // 3. Verify initial state
  button.should("have.text", "Count is 0");
  
  // 4. Interact with it
  await userEvent.click(button.el);
  
  // 5. Verify it changed
  button.should("have.text", "Count is 1");
});
```

### Keep Tests Focused

Each test should verify one specific behavior:

```ts
// ✅ Good - One focused test
it("should display welcome title", async () => {
  await twd.visit("/");
  const title = await twd.get("[data-testid='welcome-title']");
  title.should("be.visible");
});

// ❌ Bad - Testing too many things
it("should test everything", async () => {
  // Too many assertions in one test
});
```

## Common Issues

### Element Not Found

If you get an error that an element wasn't found:

```ts
// ❌ This might fail if element loads slowly
const button = await twd.get("[data-testid='my-button']");
```

**Solution:** TWD automatically waits, but make sure:
- The selector is correct
- The element actually exists in your component
- You're on the right page (check with `twd.visit()`)

### Assertion Failed

If an assertion fails:

```ts
// Check what the actual value is
console.log(button.el.textContent); // See actual text
```

**Tip:** Use the browser DevTools to inspect elements and verify selectors!

## What's Next?

Great job! You now know how to:
- ✅ Navigate to pages
- ✅ Select elements
- ✅ Make assertions
- ✅ Interact with elements

Next, let's learn about **API mocking** - how to test pages that load data from APIs!

👉 [API Mocking - Testing with Network Requests](./api-mocking)
