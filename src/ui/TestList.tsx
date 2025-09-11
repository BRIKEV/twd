import { useState } from "react";
import groupTests, { Group } from "./groupTests";
import { TestCase } from "../twdRegistry";
import { TestListItem } from "./TestListItem";
import ChevronDown from "./Icons/ChevronDown";
import ChevronRight from "./Icons/ChevronRight";

interface TestListProps {
  runTest: (i: number) => Promise<void>;
  tests: TestCase[];
}

export const TestList = ({ runTest, tests }: TestListProps) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const renderNode = (node: Group | typeof tests[number], depth = 0) => {
    if ("status" in node) {
      // it's a test
      return <TestListItem key={node.name} node={node} depth={depth} idx={tests.indexOf(node)} runTest={runTest} />;
    }

    // it's a group
    const isCollapsed = collapsed[node.name];
    return (
      <li key={node.name} style={{ marginBottom: "6px", marginLeft: depth * 12, textAlign: "left" }}>
        <div
          style={{
            fontWeight: "bold",
            cursor: "pointer",
            color: "#374151",
            marginBottom: "4px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          onClick={() => setCollapsed((c) => ({ ...c, [node.name]: !c[node.name] }))}
        >
          {node.name} {isCollapsed ? <ChevronRight /> : <ChevronDown />}
        </div>
        {!isCollapsed && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {(node as Group).children.map((child) => renderNode(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };
  const grouped = groupTests(tests);

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {grouped.map((g) => renderNode(g))}
    </ul>
  );
};
