// componentMocks.ts
type ComponentMock<T = any> = React.ComponentType<T>;

const componentMocks = new Map<string, ComponentMock>();

export function mockComponent<TProps extends Record<string, any>>(
  id: string,
  component: React.ComponentType<TProps>
): void {
  componentMocks.set(id, component as ComponentMock);
}

export function getMockForComponent<TProps = any>(
  id: string
): React.ComponentType<TProps> | undefined {
  return componentMocks.get(id) as React.ComponentType<TProps> | undefined;
}
