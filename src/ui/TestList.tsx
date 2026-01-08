import { useState } from "react";
import { buildTreeFromHandlers, Node } from "./buildTreeFromHandlers";
import { TestListItem } from "./TestListItem";
import ChevronDown from "./Icons/ChevronDown";
import ChevronRight from "./Icons/ChevronRight";
import SkipOnlyName from "./SkipOnlyName";

interface Test {
  name: string;
  depth: number;
  status?: "idle" | "pass" | "fail" | "skip" | "running";
  logs?: string[];
  parent?: string;
  id: string;
  type: "test" | "suite";
  only?: boolean;
  skip?: boolean;
}

interface TestListProps {
  runTest: (id: string) => Promise<void>;
  tests: Test[];
}

export const TestList = ({ tests, runTest }: TestListProps) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const renderNode = (node: Node, depth = 0) => {
    if (node.type === "test") {
      return (
        <TestListItem
          key={node.id}
          node={node}
          depth={depth}
          id={node.id}
          runTest={() => runTest(node.id)}
        />
      );
    }

    const isCollapsed = collapsed[node.id];
    
    return (
      <li key={node.id} style={{ marginLeft: `calc(${depth} * var(--twd-spacing-lg))` }}>
        <span
          style={{
            fontWeight: "var(--twd-font-weight-bold)",
            cursor: "pointer",
            color: "var(--twd-text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--twd-spacing-xs)",
            gap: "var(--twd-spacing-sm)",
          }}
          data-testid={`test-group-${node.name}`}
          tabIndex={0}
          role="button"
          aria-expanded={!isCollapsed}
          onClick={() => toggle(node.id)}
        >
          <SkipOnlyName id={node.id} name={node.name} skip={node.skip} only={node.only} />
          {isCollapsed ? <ChevronRight /> : <ChevronDown />}
        </span>

        {!isCollapsed && node.childrenNodes && node.childrenNodes.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {node.childrenNodes.map((child) => renderNode(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  const roots = buildTreeFromHandlers(tests);

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {roots.map((n) => renderNode(n))}
    </ul>
  );
};
