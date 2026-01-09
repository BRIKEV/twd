import { useRef, useEffect } from "react";
import Loader from "./Icons/Loader";
import Play from "./Icons/Play";
import SkipOnlyName from "./SkipOnlyName";

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

interface TestListItemProps {
  node: Test;
  depth: number;
  id: string;
  runTest: (i: string) => void;
}

export const statusStyles = (node: Test) => {
  switch (node.status) {
    case "pass":
      return {
        item: {
          background: "var(--twd-success-bg)",
        },
        container: {
          borderLeft: "3px solid var(--twd-success)",
        },
      };
    case "fail":
      return {
        item: {
          background: "var(--twd-error-bg)",
        },
        container: {
          borderLeft: "3px solid var(--twd-error)",
        },
      };
    case "skip":
      return {
        item: {
          background: "var(--twd-skip-bg)",
        },
      };
    case "running":
      return {
        item: {
          background: "var(--twd-warning-bg)",
        },
      };
    default:
      return {
        item: {
          background: "transparent",
        },
      };
  }
};

export const assertStyles = (text: string) => {
  if (text.startsWith("Assertion passed") || text.startsWith("Event fired")) {
    return { color: "var(--twd-success)", fontWeight: "var(--twd-font-weight-bold)" };
  } else if (text.startsWith("Test failed")) {
    return { color: "var(--twd-error)", fontWeight: "var(--twd-font-weight-bold)" };
  }
  return {};
};

export const TestListItem = ({
  node,
  depth,
  id,
  runTest,
}: TestListItemProps) => {
  const styles = statusStyles(node);
  const logsContainerRef = useRef<HTMLUListElement>(null);
  const previousStatusRef = useRef<typeof node.status>(node.status);
  const previousLogsLengthRef = useRef<number>(node.logs?.length || 0);
  
  // Check if this is the previously run test (for visual indicator)
  const isPreviouslyRunTest = typeof window !== 'undefined' && 
    sessionStorage.getItem('twd-last-run-test-name') === node.name;

  // Auto-scroll to bottom when test finishes (pass/fail) or when new logs are added
  useEffect(() => {
    const logsContainer = logsContainerRef.current;
    if (!logsContainer || !node.logs || node.logs.length === 0) return;

    const testJustFinished = 
      previousStatusRef.current === "running" && 
      (node.status === "pass" || node.status === "fail");
    
    const newLogsAdded = node.logs.length > previousLogsLengthRef.current;

    // Scroll to bottom if test just finished or new logs were added
    if (testJustFinished || newLogsAdded) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        logsContainer.scrollTop = logsContainer.scrollHeight;
      }, 0);
    }

    // Update refs for next render
    previousStatusRef.current = node.status;
    previousLogsLengthRef.current = node.logs.length;
  }, [node.status, node.logs]);

  return (
    <li
      key={node.name}
      style={{
        marginBottom: "var(--twd-spacing-xs)",
        marginLeft: `calc(${depth} * var(--twd-spacing-sm))`,
        ...styles.container,
      }}
      data-testid={`test-list-item-${id}`}
      data-test-name={node.name}
    >
      <div
        style={{
          display: "flex",
          alignItems: "left",
          justifyContent: "space-between",
          padding: "var(--twd-spacing-xs) var(--twd-spacing-sm)",
          borderRadius: "var(--twd-border-radius)",
          ...styles.item,
          ...(isPreviouslyRunTest && {
            border: "1px dashed var(--twd-border)",
          }),
        }}
      >
        <span
          style={{ 
            fontWeight: "var(--twd-font-weight-medium)", 
            color: "var(--twd-text)", 
            maxWidth: "220px" 
          }}
        >
          <SkipOnlyName
            id={id}
            name={node.name}
            skip={node.skip}
            only={node.only}
          />
        </span>
        <button
          onClick={() => runTest(id)}
          aria-label={`Run ${node.name} test`}
          style={{
            background: "transparent",
            border: "1px solid var(--twd-border-light)",
            borderRadius: "var(--twd-border-radius)",
            padding: "0",
            cursor: "pointer",
            verticalAlign: "middle",
            fontSize: "var(--twd-font-size-sm)",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          disabled={node.status === "running"}
          data-testid={`run-test-button-${id}`}
        >
          {node.status === "running" ? <Loader /> : <Play />}
        </button>
      </div>
      {node.logs && node.logs.length > 0 && (
        <ul
          ref={logsContainerRef}
          style={{
            borderRadius: "var(--twd-border-radius)",
            maxHeight: "260px",
            overflowY: "auto",
            padding: 0,
            background: "var(--twd-background-secondary)",
            listStyle: "none",
            marginTop: "var(--twd-spacing-xs)",
            textAlign: "left",
          }}
        >
          {node.logs.map((log, idx) => (
            <li
              key={idx}
              style={{
                fontSize: "var(--twd-font-size-sm)",
                padding: "var(--twd-spacing-xs) var(--twd-spacing-sm)",
                borderBottom: "1px solid var(--twd-border-light)",
                color: "var(--twd-text)",
                ...assertStyles(log),
              }}
            >
              {log}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};
