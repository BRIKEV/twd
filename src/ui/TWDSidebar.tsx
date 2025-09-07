import { useState } from "react";
import { TestCase, tests } from "../twdRegistry";

type Group = {
  name: string;
  children: (Group | typeof tests[number])[];
};

const groupTests = (tests: TestCase[]) => {
  const root: Group = { name: "root", children: [] };

  for (const test of tests) {
    let current = root;
    test.suite.forEach((suite) => {
      let next = current.children.find(
        (c) => "name" in c && !(c as any).status && c.name === suite
      ) as Group | undefined;
      if (!next) {
        next = { name: suite, children: [] };
        current.children.push(next);
      }
      current = next;
    });
    current.children.push(test);
  }

  return root.children;
};

export const TWDSidebar = () => {
  const [_, setRefresh] = useState(0);
  const [open, setOpen] = useState(true);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const runTest = async (i: number) => {
    const test = tests[i];
    test.logs = [];
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      test.logs?.push("📝 " + args.map(String).join(" "));
      originalLog(...args);
      setRefresh((n) => n + 1);
    };
    console.error = (...args) => {
      test.logs?.push("❌ " + args.map(String).join(" "));
      originalError(...args);
      setRefresh((n) => n + 1);
    };

    test.status = "running";
    if (test.skip) {
      test.status = "skip";
    } else {
      try {
        await test.fn();
        test.status = "pass";
      } catch (e) {
        test.status = "fail";
        console.error("Test failed:", test.name, e);
      }
    }

    console.log = originalLog;
    console.error = originalError;
    setRefresh((n) => n + 1);
  };

  const runAll = async () => {
    const onlyTests = tests.filter((t) => t.only);
    const toRun = onlyTests.length > 0 ? onlyTests : tests;
    for (let i = 0; i < toRun.length; i++) {
      const idx = tests.indexOf(toRun[i]);
      await runTest(idx);
    }
  };

  const renderNode = (node: Group | typeof tests[number], depth = 0) => {
    if ("status" in node) {
      // it's a test
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
              onClick={() => runTest(tests.indexOf(node))}
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
          }}
          onClick={() => setCollapsed((c) => ({ ...c, [node.name]: !c[node.name] }))}
        >
          {node.name} {isCollapsed ? "▶" : "▼"}
        </div>
        {!isCollapsed && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {(node as Group).children.map((child) => renderNode(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  if (!open) {
    return (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: 0,
          transform: "translateY(-50%)",
          background: "#3b82f6",
          color: "white",
          padding: "6px 10px",
          borderTopRightRadius: "6px",
          borderBottomRightRadius: "6px",
          cursor: "pointer",
          fontSize: "12px",
        }}
        onClick={() => setOpen(true)}
      >
        ▶ TWD
      </div>
    );
  }
  const grouped = groupTests(tests);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "280px",
        background: "#f9fafb",
        borderRight: "1px solid #e5e7eb",
        padding: "8px",
        fontSize: "14px",
        overflowY: "auto",
        boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <strong>TWD Tests</strong>
        <button
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
          }}
          onClick={() => setOpen(false)}
        >
          ✖
        </button>
      </div>

      <button
        onClick={runAll}
        style={{
          background: "#3b82f6",
          color: "white",
          padding: "4px 8px",
          borderRadius: "4px",
          border: "none",
          marginBottom: "10px",
          cursor: "pointer",
        }}
      >
        ▶ Run All
      </button>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {grouped.map((g) => renderNode(g))}
      </ul>
    </div>
  );
};
