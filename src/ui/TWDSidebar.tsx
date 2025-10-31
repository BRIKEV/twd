import { useState } from "react";
import { TestList } from "./TestList";
import { ClosedSidebar } from "./ClosedSidebar";
import { useLayout } from "./hooks/useLayout";
import { handlers, TestRunner } from "../runner";

interface TWDSidebarProps {
  /**
   * Whether the sidebar is open by default
   */
  open: boolean;
  /**
   * Sidebar position
   * - left: Sidebar on the left side (default)
   * - right: Sidebar on the right side
   * 
   * @default "left"
   */
  position?: "left" | "right";
}

const positionStyles = {
  left: { left: 0, borderRight: "1px solid #e5e7eb" },
  right: { right: 0, borderLeft: "1px solid #e5e7eb" },
};

const fontFamily = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`;

export const TWDSidebar = ({ open, position = "left" }: TWDSidebarProps) => {
  const [_, setRefresh] = useState(0);
  const [isOpen, setIsOpen] = useState(open);
  useLayout({ isOpen, position });

  const runner = new TestRunner({
    onStart: (test) => {
      test.status = "running";
      setRefresh((n) => n + 1);
    },
    onPass: (test) => {
      test.status = "pass";
      setRefresh((n) => n + 1);
    },
    onFail: (test, err) => {
      test.status = "fail";
      console.error("Test failed:", test.name, err);
      test.logs.push(`Test failed: ${err.message}`);
      setRefresh((n) => n + 1);
    },
    onSkip: (test) => {
      test.status = "skip";
      setRefresh((n) => n + 1);
    },
  });

  const runAll = async () => {
    await runner.runAll();
  };

  const runTest = async (id: string) => {
    const test = Array.from(handlers.values()).filter(h => h.type === "test").find(t => t.id === id);
    if (!test) return;
    await runner.runSingle(test.id);
  };
  
  const tests = Array.from(handlers.values());

    if (!isOpen) {
    return <ClosedSidebar position={position} setOpen={setIsOpen} />;
  }

  return (
    <div
      style={{
        fontFamily,
        position: "fixed",
        top: 0,
        bottom: 0,
        width: "280px",
        background: "#f9fafb",
        padding: "8px",
        fontSize: "14px",
        overflowY: "auto",
        boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
        textAlign: "left",
        zIndex: 1000,
        ...positionStyles[position]
      }}
      data-testid="twd-sidebar"
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
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
          aria-label="Close sidebar"
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

      <TestList
        tests={tests.map(test => ({
          name: test.name,
          depth: test.depth,
          status: test.status,
          logs: test.logs,
          id: test.id,
          parent: test.parent,
          type: test.type,
          only: test.only,
          skip: test.skip,
        }))}
        runTest={runTest}
      />
    </div>
  );
};
