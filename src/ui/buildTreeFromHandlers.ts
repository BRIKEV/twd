interface Test {
  name: string;
  depth: number;
  status?: "idle" | "pass" | "fail" | "skip" | "running";
  logs?: string[];
  id: string;
  parent?: string;
  type: "test" | "suite";
  only?: boolean;
  skip?: boolean;
}

export type Node = Test & { childrenNodes?: Node[] };

export const buildTreeFromHandlers = (handlers: Test[]): Node[] => {
  const map = new Map<string, Node>();
  const roots: Node[] = [];

  // Clone into a map
  for (const h of handlers) map.set(h.id, { ...h, childrenNodes: [] });

  // Connect parent/children
  for (const h of map.values()) {
    if (h.parent) {
      const parent = map.get(h.parent);
      parent?.childrenNodes?.push(h);
    } else {
      roots.push(h);
    }
  }

  return roots;
};
