import { twd, userEvent } from "../../../../src";
import { describe, it, beforeEach } from "../../../../src/runner";

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

    await twd.visit("/mock-component");
    let button = await twd.get("button");
    button.should("have.text", "Click me 0");
    
    await userEvent.click(button.el);
    // Re-query the button to get the updated text
    button = await twd.get("button");
    button.should("have.text", "Click me 2");
    
    const countText = await twd.get("p");
    countText.should("have.text", "Count: 2");
  });

  it("should not mock a component", async () => {
    // Don't mock the component - it should use the original behavior
    await twd.visit("/mock-component");
    let button = await twd.get("button");
    button.should("have.text", "Click me 0");
    
    await userEvent.click(button.el);
    // Re-query the button to get the updated text
    button = await twd.get("button");
    button.should("have.text", "Click me 1");
    
    const countText = await twd.get("p");
    countText.should("have.text", "Count: 1");
  });
});

