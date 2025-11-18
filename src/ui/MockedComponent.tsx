// createMockableComponent.tsx
import { getMockForComponent } from "./componentMocks";

interface MockedComponentProps<TProps = any> {
  name: string;
  children: React.ReactElement<TProps>;
}

export function MockedComponent<TProps extends Record<string, any>>({
  name,
  children,
}: MockedComponentProps<TProps>) {
  const Mock = getMockForComponent<TProps>(name);

  if (Mock) {
    return <Mock {...children.props} />;
  }

  return children;
}
