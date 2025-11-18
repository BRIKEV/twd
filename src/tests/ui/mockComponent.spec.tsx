import { useState } from "react";
import { describe, it, expect } from "vitest";
import { mockComponent } from "../../ui/componentMocks";
import { MockedComponent } from "../../ui/MockedComponent";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

interface ButtonProps {
  onClick: (count: number) => void;
  count: number;
}

const Button = ({ onClick, count }: ButtonProps) => {
  return (
    <button onClick={() => onClick(count + 1)}>Click me {count}</button>
  );
};

describe("MockedComponent", () => {
  it("should mock a component", async () => {
    const PageWithButton = () => {
      const [count, setCount] = useState(0);
      return (
        <div>
          <p>Count: {count}</p>
          <MockedComponent name="Button">
            <Button onClick={setCount} count={count} />
          </MockedComponent>
        </div>
      );
    };
    mockComponent("Button", ({ onClick, count }: ButtonProps) => <Button onClick={() => onClick(count + 2)} count={count} />);
    render(<PageWithButton />);
    const button = screen.getByText("Click me 0");
    await userEvent.click(button);
    expect(button).toHaveTextContent("Click me 2");
  });
});