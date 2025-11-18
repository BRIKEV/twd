// componentMocks.ts
type ComponentMock<T = any> = React.ComponentType<T>;

const componentMocks = new Map<string, ComponentMock>();

export const mockComponent = <TProps extends Record<string, any>>(
  id: string,
  component: React.ComponentType<TProps>
): void => {
  componentMocks.set(id, component as ComponentMock);
}

export function clearComponentMocks(): void {
  componentMocks.clear();
}

export const getMockForComponent = <TProps = any>(
  id: string
): React.ComponentType<TProps> | undefined => {
  return componentMocks.get(id) as React.ComponentType<TProps> | undefined;
}
