import { TestCase } from "../twdRegistry";

interface TestListItemProps {
  node: TestCase;
  depth: number;
  idx: number;
  runTest: (i: number) => void;
}

export const TestListItem = ({ node, depth, idx, runTest }: TestListItemProps) => {
  return (
        <li key={node.name} style={{ marginBottom: "4px", marginLeft: depth * 6 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 6px",
              borderRadius: "4px",
              background:
                node.status === "pass"
                  ? "#dcfce7"
                  : node.status === "fail"
                  ? "#fee2e2"
                  : node.status === "skip"
                  ? "#f3f4f6"
                  : node.status === "running"
                  ? "#fef9c3"
                  : "transparent",
            }}
          >
            <span>
              {node.name}{" "}
              {node.only && <span style={{ color: "#2563eb" }}>(only)</span>}
              {node.skip && <span style={{ color: "#6b7280" }}>(skipped)</span>}
            </span>
            <button
              onClick={() => runTest(idx)}
              style={{
                background: "transparent",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                padding: "2px 6px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              ▶
            </button>
          </div>
          {node.logs && node.logs.length > 0 && (
            <ul
              style={{
                borderRadius: "4px",
                maxHeight: "160px",
                overflowY: "auto",
                padding: 0,
                background: "#f3f4f6",
                listStyle: "none",
                marginTop: "4px",
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
