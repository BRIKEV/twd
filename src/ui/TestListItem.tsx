import { useRef, useEffect } from "react";
import Loader from "./Icons/Loader";
import Play from "./Icons/Play";
import SkipOnlyName from "./SkipOnlyName";
import { LogItem } from "./LogItem";

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

const statusClass = (status?: Test["status"]): string => {
  switch (status) {
    case "pass":    return "twd-status-pass";
    case "fail":    return "twd-status-fail";
    case "skip":    return "twd-status-skip";
    case "running": return "twd-status-running";
    default:        return "";
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

  const isPreviouslyRunTest =
    typeof window !== "undefined" &&
    sessionStorage.getItem("twd-last-run-test-name") === node.name;

  // Auto-scroll to bottom when test finishes (pass/fail) or when new logs are added
  useEffect(() => {
    const logsContainer = logsContainerRef.current;
    if (!logsContainer || !node.logs || node.logs.length === 0) return;

    const testJustFinished =
      previousStatusRef.current === "running" &&
      (node.status === "pass" || node.status === "fail");

    const newLogsAdded = node.logs.length > previousLogsLengthRef.current;

    if (testJustFinished || newLogsAdded) {
      setTimeout(() => {
        logsContainer.scrollTop = logsContainer.scrollHeight;
      }, 0);
    }

    previousStatusRef.current = node.status;
    previousLogsLengthRef.current = node.logs.length;
  }, [node.status, node.logs]);

  const getStatusLabel = () => {
    switch (node.status) {
      case "pass":    return "passed";
      case "fail":    return "failed";
      case "running": return "running";
      case "skip":    return "skipped";
      default:        return "not run";
    }
  };

  return (
    <li
      key={node.name}
      style={{
        marginBottom: "var(--twd-spacing-xs)",
        marginLeft: `calc(${depth} * var(--twd-spacing-sm))`,
      }}
      data-testid={`test-list-item-${id}`}
      data-test-name={node.name}
      role="listitem"
      aria-label={`Test ${node.name}, status: ${getStatusLabel()}`}
    >
      <div
        className={`twd-test-item ${statusClass(node.status)}`}
        style={isPreviouslyRunTest ? { border: "1px dashed var(--twd-border)" } : undefined}
      >
        <span className="twd-test-item-name">
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
          className="twd-btn twd-btn-icon"
          disabled={node.status === "running"}
          data-testid={`run-test-button-${id}`}
        >
          {node.status === "running" ? <Loader /> : <Play />}
        </button>
      </div>
      {node.logs && node.logs.length > 0 && (
        <ul ref={logsContainerRef} className="twd-test-item-logs">
          {node.logs.map((log, idx) => (
            <LogItem key={idx} log={log} index={idx} />
          ))}
        </ul>
      )}
    </li>
  );
};
