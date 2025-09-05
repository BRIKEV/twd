import { useState } from "react";
import { tests } from "./twdRegistry";

export const TWDSidebar = () => {
  const [_, setRefresh] = useState(0);
  const [open, setOpen] = useState(true);

  const runTest = async (i: number) => {
    const test = tests[i];
    test.logs = []; // reset logs

    // capture logs
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

    // restore
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

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "260px",
        background: "#f9fafb",
        borderRight: "1px solid #e5e7eb",
        padding: "8px",
        fontSize: "14px",
        overflowY: "auto",
        boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
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
        {tests.map((t, i) => (
          <li key={i} style={{ marginBottom: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 6px",
                borderRadius: "4px",
                background:
                  t.status === "pass"
                    ? "#dcfce7"
                    : t.status === "fail"
                    ? "#fee2e2"
                    : t.status === "skip"
                    ? "#f3f4f6"
                    : t.status === "running"
                    ? "#fef9c3"
                    : "transparent",
              }}
            >
              <span style={{ flex: 1 }}>
                {t.name}{" "}
                {t.only && <span style={{ color: "#2563eb" }}>(only)</span>}
                {t.skip && <span style={{ color: "#6b7280" }}>(skipped)</span>}
              </span>
              <button
                onClick={() => runTest(i)}
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
            {t.logs && t.logs.length > 0 && (
              <ul
                style={{
                  borderRadius: "4px",
                  maxHeight: "240px",
                  overflowY: "auto",
                  padding: 0,
                  background: "#f3f4f6",
                  listStyle: "none",
                }}
              >
                {t.logs.map((log, idx) => (
                  <li
                    key={idx}
                    style={{
                      color: "#111827",
                      borderBottom: "1px solid #d1d5db",
                      fontSize: "12px",
                      padding: "6px",
                      borderRadius: "2px",
                      transition: "background 0.2s",
                      cursor: "default",
                      textAlign: "left",
                    }}
                  >
                    {log}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
