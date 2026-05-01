import { useState, useEffect, useRef } from 'react';
import { Node } from './utils/buildTreeFromHandlers';
import { TestListItem } from './TestListItem';
import ChevronDown from './Icons/ChevronDown';
import ChevronRight from './Icons/ChevronRight';
import SkipOnlyName from './SkipOnlyName';

interface TestListProps {
  roots: Node[];
  runTest: (id: string) => Promise<void>;
  searchQuery?: string;
}

export const TestList = ({ roots, runTest, searchQuery = '' }: TestListProps) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const listContainerRef = useRef<HTMLUListElement>(null);
  const hasScrolledRef = useRef(false);

  const toggle = (id: string) => setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

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
        const sidebar = listContainerRef.current?.closest(
          '[data-testid="twd-sidebar"]',
        ) as HTMLElement;
        if (sidebar) {
          const elementRect = testElement.getBoundingClientRect();
          const sidebarRect = sidebar.getBoundingClientRect();
          const scrollTop = sidebar.scrollTop;
          const elementTop = elementRect.top - sidebarRect.top + scrollTop;

          // Measure the sticky header to account for its actual height (varies with search input)
          const stickyHeader = sidebar.querySelector<HTMLElement>(
            '[data-testid="twd-sidebar-header"]',
          );
          const headerOffset = stickyHeader
            ? stickyHeader.getBoundingClientRect().height + 16
            : 150;

          sidebar.scrollTo({
            top: elementTop - headerOffset,
            behavior: 'smooth',
          });
        }
        hasScrolledRef.current = true;
      }
    }, 100);

    return () => clearTimeout(scrollTimeout);
  }, []);

  const renderNode = (node: Node, depth = 0) => {
    if (node.type === 'test') {
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
        <div className="twd-test-group">
          <span
            className="twd-test-group-toggle"
            data-testid={`test-group-${node.name}`}
            tabIndex={0}
            role="button"
            aria-expanded={!isCollapsed}
            aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} test suite ${node.name}`}
            onClick={() => toggle(node.id)}
          >
            <SkipOnlyName id={node.id} name={node.name} skip={node.skip} only={node.only} />
            {isCollapsed ? <ChevronRight /> : <ChevronDown />}
          </span>
        </div>

        {!isCollapsed && node.childrenNodes && node.childrenNodes.length > 0 && (
          <ul className="twd-test-list">
            {node.childrenNodes.map((child) => renderNode(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <ul ref={listContainerRef} className="twd-test-list" role="list" aria-label="Test list">
      {roots.length === 0 && searchQuery ? (
        <li
          style={{
            padding: 'var(--twd-spacing-md)',
            color: 'var(--twd-text-secondary)',
            fontSize: 'var(--twd-font-size-sm)',
            textAlign: 'center',
          }}
        >
          No tests match "{searchQuery}"
        </li>
      ) : (
        roots.map((n) => renderNode(n))
      )}
    </ul>
  );
};
