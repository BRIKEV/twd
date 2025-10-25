import Loader from "./Icons/Loader";
import Play from "./Icons/Play";

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
          background: "#dcfce7",
        },
        container: {
          borderLeft: "3px solid #00c951",
        },
      };
    case "fail":
      return {
        item: {
          background: "#fee2e2",
        },
        container: {
          borderLeft: "3px solid #fb2c36",
        },
      };
    case "skip":
      return {
        item: {
          background: "#f3f4f6",
        },
      };
    case "running":
      return {
        item: {
          background: "#fef9c3",
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
    return { color: "#0d542b", fontWeight: "700" };
  } else if (text.startsWith("Test failed")) {
    return { color: "#fb2c36", fontWeight: "700" };
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
  return (
    <li
      key={node.name}
      style={{
        marginBottom: "4px",
        marginLeft: depth * 6,
        ...styles.container,
      }}
      data-testid={`test-list-item-${id}`}
    >
      <div
        style={{
          display: "flex",
          alignItems: "left",
          justifyContent: "space-between",
          padding: "4px 6px",
          borderRadius: "4px",
          ...styles.item,
        }}
      >
        <span
          style={{ fontWeight: "500", color: "#374151", maxWidth: "220px" }}
        >
          {node.name}{" "}
          {node.only && (
            <span
              style={{ color: "#2563eb" }}
              data-testid={`only-indicator-${id}`}
            >
              {" "}
              (only)
            </span>
          )}
          {node.skip && (
            <span
              style={{ color: "#6b7280" }}
              data-testid={`skip-indicator-${id}`}
            >
              {" "}
              (skipped)
            </span>
          )}
        </span>
        <button
          onClick={() => runTest(id)}
          aria-label={`Run ${node.name} test`}
          style={{
            background: "transparent",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            padding: "0",
            cursor: "pointer",
            verticalAlign: "middle",
            fontSize: "12px",
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
          style={{
            borderRadius: "4px",
            maxHeight: "260px",
            overflowY: "auto",
            padding: 0,
            background: "#f3f4f6",
            listStyle: "none",
            marginTop: "4px",
            textAlign: "left",
          }}
        >
          {node.logs.map((log, idx) => (
            <li
              key={idx}
              style={{
                fontSize: "12px",
                padding: "4px 6px",
                borderBottom: "1px solid #d1d5db",
                color: "#374151",
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
