import { useState, useEffect, useRef } from "react";
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
  const listContainerRef = useRef<HTMLUListElement>(null);
  const hasScrolledRef = useRef(false);
  
  const toggle = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  // Scroll to the last run test on first render
  useEffect(() => {
    if (hasScrolledRef.current) return;
    
    const lastRunTestName = sessionStorage.getItem('twd-last-run-test-name');
    if (!lastRunTestName) return;

    // Wait for DOM to be ready, then scroll
    const scrollTimeout = setTimeout(() => {
      // Find test by name using data-test-name attribute
      const testElement = document.querySelector(`[data-test-name="${lastRunTestName}"]`);
      if (testElement) {
        // Find the scrollable container (the sidebar itself)
        const sidebar = listContainerRef.current?.closest('[data-testid="twd-sidebar"]') as HTMLElement;
        if (sidebar) {
          const elementRect = testElement.getBoundingClientRect();
          const sidebarRect = sidebar.getBoundingClientRect();
          const scrollTop = sidebar.scrollTop;
          const elementTop = elementRect.top - sidebarRect.top + scrollTop;

          // Scroll with some offset to account for sticky header
          sidebar.scrollTo({
            top: elementTop - 150, // 150px offset from top
            behavior: 'smooth'
          });
        }
        hasScrolledRef.current = true;
      }
    }, 100);

    return () => clearTimeout(scrollTimeout);
  }, []);

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
          aria-label={`${isCollapsed ? "Expand" : "Collapse"} test suite ${node.name}`}
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
    <ul 
      ref={listContainerRef} 
      style={{ listStyle: "none", padding: 0, margin: 0 }}
      role="list"
      aria-label="Test list"
    >
      {roots.map((n) => renderNode(n))}
    </ul>
  );
};
