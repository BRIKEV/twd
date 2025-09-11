import { TestCase } from "../twdRegistry";
import Play from "./Icons/Play";

interface TestListItemProps {
  node: TestCase;
  depth: number;
  idx: number;
  runTest: (i: number) => void;
}

const statusStyles = (node: TestCase) => {
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
}

export const TestListItem = ({ node, depth, idx, runTest }: TestListItemProps) => {
  const styles = statusStyles(node);
  return (
        <li key={node.name} style={{ marginBottom: "4px", marginLeft: depth * 6, ...styles.container }}>
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
            <span>
              {node.name}{" "}
              {node.only && <span style={{ color: "#2563eb" }}>(only)</span>}
              {node.skip && <span style={{ color: "#6b7280" }}>(skipped)</span>}
            </span>
            <button
              onClick={() => runTest(idx)}
              aria-label={`Run ${node.name} test`}
              style={{
                background: "transparent",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                padding: "6px",
                cursor: "pointer",
                verticalAlign: "middle",
                fontSize: "12px",
                width: "24px",
              }}
            >
              <Play />
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
