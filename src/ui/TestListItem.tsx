import { useRef, useEffect, useMemo } from "react";
import Loader from "./Icons/Loader";
import Play from "./Icons/Play";
import SkipOnlyName from "./SkipOnlyName";
import { LogItem } from "./LogItem";

const STATIC_STYLES = {
  container: {
    marginBottom: "var(--twd-spacing-xs)",
  },
  item: {
    display: "flex",
    alignItems: "left",
    justifyContent: "space-between",
    padding: "var(--twd-spacing-sm) var(--twd-spacing-sm)",
    borderRadius: "var(--twd-border-radius)",
  },
  nameSpan: {
    fontWeight: "var(--twd-font-weight-medium)",
    fontSize: "var(--twd-font-size-md)",
    color: "var(--twd-text)",
    maxWidth: "220px",
  },
  button: {
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
  },
  logsList: {
    borderRadius: "var(--twd-border-radius)",
    maxHeight: "260px",
    overflowY: "auto" as const,
    padding: 0,
    background: "var(--twd-background-secondary)",
    listStyle: "none",
    marginTop: "var(--twd-spacing-xs)",
    textAlign: "left" as const,
  },
} as const;

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


export const TestListItem = ({
  node,
  depth,
  id,
  runTest,
}: TestListItemProps) => {
  const logsContainerRef = useRef<HTMLUListElement>(null);
  const previousStatusRef = useRef<typeof node.status>(node.status);
  const previousLogsLengthRef = useRef<number>(node.logs?.length || 0);

  // Memoize status styles - only recompute when status changes
  const statusStyle = useMemo(() => statusStyles(node), [node.status]);

  // Check if this is the previously run test (for visual indicator)
  const isPreviouslyRunTest =
    typeof window !== "undefined" &&
    sessionStorage.getItem("twd-last-run-test-name") === node.name;

  // Memoize container style - only recompute when depth or status changes
  const containerStyle = useMemo(
    () => ({
      ...STATIC_STYLES.container,
      marginLeft: `calc(${depth} * var(--twd-spacing-sm))`,
      ...(statusStyle.container || {}),
    }),
    [depth, statusStyle]
  );

  // Memoize item style - only recompute when status or isPreviouslyRunTest changes
  const itemStyle = useMemo(
    () => ({
      ...STATIC_STYLES.item,
      ...statusStyle.item,
      ...(isPreviouslyRunTest && {
        border: "1px dashed var(--twd-border)",
      }),
    }),
    [statusStyle, isPreviouslyRunTest]
  );

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

  const getStatusLabel = () => {
    switch (node.status) {
      case "pass":
        return "passed";
      case "fail":
        return "failed";
      case "running":
        return "running";
      case "skip":
        return "skipped";
      default:
        return "not run";
    }
  };

  return (
    <li
      key={node.name}
      style={containerStyle}
      data-testid={`test-list-item-${id}`}
      data-test-name={node.name}
      role="listitem"
      aria-label={`Test ${node.name}, status: ${getStatusLabel()}`}
    >
      <div style={itemStyle}>
        <span style={STATIC_STYLES.nameSpan}>
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
          style={STATIC_STYLES.button}
          disabled={node.status === "running"}
          data-testid={`run-test-button-${id}`}
        >
          {node.status === "running" ? <Loader /> : <Play />}
        </button>
      </div>
      {node.logs && node.logs.length > 0 && (
        <ul ref={logsContainerRef} style={STATIC_STYLES.logsList}>
          {node.logs.map((log, idx) => (
            <LogItem key={idx} log={log} index={idx} />
          ))}
        </ul>
      )}
    </li>
  );
};
