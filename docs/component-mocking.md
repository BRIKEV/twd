---
title: Component Mocking
description: Replace React components with mock implementations for isolated testing and edge cases
---

# Component Mocking

TWD provides powerful component mocking capabilities, allowing you to replace React components with mock implementations during testing. This is especially useful for isolating components, testing edge cases, or replacing complex dependencies with simpler test doubles.

::: tip Looking to test a component in isolation?
This page is about **replacing** a component with a stub. To **render** a single
component and test it in a real browser, see [Component Testing](/component-testing).
:::

## Overview

Component mocking in TWD allows you to:

- Replace components with mock implementations for isolated testing
- Test how parent components handle different component behaviors
- Simplify complex component dependencies during testing
- Verify component prop passing and interaction

## Setup

### 1. Wrap Components with MockedComponent

To make a component mockable, wrap it with the `MockedComponent` component and provide a unique name:

```tsx
import { MockedComponent } from "twd-js/ui";

interface ButtonProps {
  onClick: (count: number) => void;
  count: number;
}

const Button = ({ onClick, count }: ButtonProps) => {
  return (
    <button onClick={() => onClick(count + 1)}>Click me {count}</button>
  );
};

export default function CounterPage() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <MockedComponent name="Button">
        <Button onClick={setCount} count={count} />
      </MockedComponent>
    </div>
  );
}
```

::: tip
The `name` prop must be unique and match the name used in your test when calling `twd.mockComponent()`.
:::

### 2. Mock Components in Tests

Use `twd.mockComponent()` to replace the component with a mock implementation:

```ts
import { twd, screenDom, userEvent } from "twd-js";
import { describe, it, beforeEach } from "twd-js/runner";

interface ButtonProps {
  onClick: (count: number) => void;
  count: number;
}

const Button = ({ onClick, count }: ButtonProps) => {
  return (
    <button onClick={() => onClick(count + 1)}>Click me {count}</button>
  );
};

describe("Component Mocking", () => {
  beforeEach(() => {
    twd.clearComponentMocks();
  });

  it("should mock a component", async () => {
    // Mock the Button component to increment by 2 instead of 1
    twd.mockComponent("Button", ({ onClick, count }: ButtonProps) => (
      <Button onClick={() => onClick(count + 2)} count={count} />
    ));

    await twd.visit("/counter");
    let button = await screenDom.findByRole("button");
    twd.should(button, "have.text", "Click me 0");
    
    await userEvent.click(button);
    button = await screenDom.findByRole("button");
    twd.should(button, "have.text", "Click me 2");
    
    const countText = await screenDom.findByText(/^Count:/);
    twd.should(countText, "have.text", "Count: 2");
  });
});
```

## Basic Usage

### Simple Component Mock

```ts
it("should use mocked component behavior", async () => {
  // Define a mock that changes the component's behavior
  twd.mockComponent("Button", ({ onClick, count }: ButtonProps) => (
    <button onClick={() => onClick(count + 10)}>
      Mocked Button {count}
    </button>
  ));

  await twd.visit("/counter");
  
  const button = await screenDom.findByRole("button");
  await userEvent.click(button);
  
  // Verify the mock behavior
  const countText = await screenDom.findByText(/^Count:/);
  twd.should(countText, "have.text", "Count: 10");
});
```

### Component Without Mock

When a component is not mocked, it uses its original implementation:

```ts
it("should use original component when not mocked", async () => {
  // Don't call twd.mockComponent() - component uses original behavior
  await twd.visit("/counter");
  
  let button = await screenDom.findByRole("button");
  twd.should(button, "have.text", "Click me 0");
  
  await userEvent.click(button);
  button = await screenDom.findByRole("button");
  twd.should(button, "have.text", "Click me 1");
  
  const countText = await screenDom.findByText(/^Count:/);
  twd.should(countText, "have.text", "Count: 1");
});
```

## Advanced Usage

### Conditional Mocking

You can create mocks that behave differently based on props:

```ts
it("should handle conditional mocking", async () => {
  twd.mockComponent("UserCard", ({ user, onEdit }: UserCardProps) => {
    if (user.role === "admin") {
      return (
        <div>
          <h3>{user.name} (Admin)</h3>
          <button onClick={() => onEdit(user.id)}>Edit</button>
        </div>
      );
    }
    return (
      <div>
        <h3>{user.name}</h3>
      </div>
    );
  });

  await twd.visit("/users/123");
  
  const adminCard = await screenDom.findByRole("heading", { name: /\(Admin\)/ });
  twd.should(adminCard, "be.visible");
});
```

### Mocking with Different Rendering

You can completely change what the component renders:

```ts
it("should render completely different content", async () => {
  twd.mockComponent("ComplexChart", () => (
    <div>
      <p>Chart data would be displayed here</p>
      <button>Refresh Chart</button>
    </div>
  ));

  await twd.visit("/dashboard");
  
  const mockChart = await screenDom.findByText("Chart data would be displayed here");
  twd.should(mockChart, "be.visible");

  // The mock replaced the real chart, so its button is present too.
  const refresh = await screenDom.findByRole("button", { name: "Refresh Chart" });
  twd.should(refresh, "be.visible");
});
```

### Testing Error States

Mock components to simulate error scenarios:

```ts
it("should handle component errors", async () => {
  twd.mockComponent("DataFetcher", ({ onError }: DataFetcherProps) => {
    // Simulate an error state
    return (
      <div role="alert">
        <p>Failed to load data</p>
        <button onClick={() => onError(new Error("Network error"))}>
          Retry
        </button>
      </div>
    );
  });

  await twd.visit("/data-page");
  
  const errorState = await screenDom.findByRole("alert");
  twd.should(errorState, "be.visible");
  twd.should(errorState, "contain.text", "Failed to load data");
});
```

### Mocking Multiple Components

You can mock multiple components in the same test:

```ts
it("should mock multiple components", async () => {
  // Mock first component
  twd.mockComponent("Header", () => (
    <header>Mock Header</header>
  ));

  // Mock second component
  twd.mockComponent("Footer", () => (
    <footer>Mock Footer</footer>
  ));

  await twd.visit("/page");
  
  const header = await screenDom.findByRole("banner");
  const footer = await screenDom.findByRole("contentinfo");
  
  twd.should(header, "be.visible");
  twd.should(footer, "be.visible");
});
```

## Mock Management

### Clearing Mocks

::: tip
You can also clear all component mocks (and API request mocks) at once by clicking the **Clear mocks** button in the TWD sidebar header, next to the "Run All" button.
:::

Always clear component mocks between tests to ensure isolation:

```ts
describe("Component Tests", () => {
  beforeEach(() => {
    // Clear all component mocks before each test
    twd.clearComponentMocks();
  });

  it("should test with mock", async () => {
    twd.mockComponent("Button", () => <button>Mocked</button>);
    // Test implementation...
  });

  it("should test without mock", async () => {
    // This test runs with clean state - no mocks active
    // Test implementation...
  });
});
```

## Best Practices

### 1. Use Descriptive Component Names

```ts
// Good ✅
<MockedComponent name="UserProfileCard">
  <UserProfileCard user={user} />
</MockedComponent>

// Bad ❌
<MockedComponent name="Card">
  <UserProfileCard user={user} />
</MockedComponent>
```

### 2. Clear Mocks Between Tests

```ts
describe("Component Tests", () => {
  beforeEach(() => {
    twd.clearComponentMocks();
  });

  // Your tests...
});
```

### 3. Keep Mock Implementations Simple

```ts
// Good ✅ - Simple, focused mock
twd.mockComponent("Button", ({ onClick }: ButtonProps) => (
  <button onClick={() => onClick(10)}>Mock Button</button>
));

// Bad ❌ - Overly complex mock that's hard to understand
twd.mockComponent("Button", ({ onClick, count, disabled, className, ...rest }: ButtonProps) => {
  const [internalState, setInternalState] = useState(0);
  // Complex logic...
});
```

### 4. Preserve Component Interface

When mocking, try to maintain the same props interface:

```ts
// Good ✅ - Maintains the same props
twd.mockComponent("Button", ({ onClick, count }: ButtonProps) => (
  <button onClick={() => onClick(count + 2)}>Click me {count}</button>
));

// Bad ❌ - Changes the interface, might break parent component
twd.mockComponent("Button", () => (
  <div>Completely different component</div>
));
```

## Troubleshooting

### Mock Not Applied

1. **Check component name** - Ensure the name in `MockedComponent` matches the name in `twd.mockComponent()`
2. **Verify MockedComponent wrapper** - The component must be wrapped with `MockedComponent`
3. **Check mock timing** - Call `twd.mockComponent()` before visiting the page or before the component renders

```ts
// Good ✅ - Mock before visiting
twd.mockComponent("Button", () => <button>Mocked</button>);
await twd.visit("/page");

// Bad ❌ - Mock after component already rendered
await twd.visit("/page");
twd.mockComponent("Button", () => <button>Mocked</button>);
```

## Next Steps

- Learn about [API Mocking](/api-mocking) for testing network requests
- Check the [Writing Tests Guide](/writing-tests) for more testing patterns
- Review the [API Reference](/api/twd-commands) for complete method documentation

