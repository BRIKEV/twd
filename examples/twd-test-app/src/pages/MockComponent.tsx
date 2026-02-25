import { useState } from "react";
import { MockedComponent } from "../../../../src/ui/MockedComponent";

interface ButtonProps {
  onClick: (count: number) => void;
  count: number;
}

const Button = ({ onClick, count }: ButtonProps) => {
  return (
    <button onClick={() => onClick(count + 1)}>Click me {count}</button>
  );
};

export default function MockComponent() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem' }}>
      <h1>Component Mocking Example</h1>
      <p>Count: {count}</p>
      <MockedComponent name="Button">
        <Button onClick={setCount} count={count} />
      </MockedComponent>
    </div>
  );
}

