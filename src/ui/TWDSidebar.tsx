import { useState } from "react";
import { tests } from "../twdRegistry";
import { TestList } from "./TestList";
import { ClosedSidebar } from "./ClosedSidebar";

interface TWDSidebarProps {
  open: boolean;
}

export const TWDSidebar = ({ open }: TWDSidebarProps) => {
  const [_, setRefresh] = useState(0);
  const [isOpen, setIsOpen] = useState(open);

  const runTest = async (i: number) => {
    const test = tests[i];
    test.logs = [];

    test.status = "running";
    setRefresh((n) => n + 1);
    if (test.skip) {
      test.status = "skip";
    } else {
      try {
        await test.fn();
        test.status = "pass";
      } catch (e) {
        test.status = "fail";
        console.error("Test failed:", test.name, e);
        test.logs.push(`Test failed: ${(e as Error).message}`);
      }
    }
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

  if (!isOpen) {
    return <ClosedSidebar setOpen={setIsOpen} />;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "280px",
        textAlign: "left",
        background: "#f9fafb",
        borderRight: "1px solid #e5e7eb",
        padding: "8px",
        fontSize: "14px",
        overflowY: "auto",
        boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px", alignItems: "center" }}>
        <strong
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#374151",
          }}
        >
          TWD Tests
        </strong>
        <button
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
          }}
          onClick={() => setIsOpen(false)}
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
        Run All
      </button>

      <TestList tests={tests} runTest={runTest} />
    </div>
  );
};
