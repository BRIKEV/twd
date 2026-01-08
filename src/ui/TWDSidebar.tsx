import { useState } from "react";
import { TestList } from "./TestList";
import { ClosedSidebar } from "./ClosedSidebar";
import { useLayout } from "./hooks/useLayout";
import { handlers, TestRunner } from "../runner";
import { MockRulesButton } from "./MockRulesButton";

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

const getOpenState = (open: boolean) => {
  if (!sessionStorage.getItem('twd-sidebar-open')) {
    return open;
  }
  return sessionStorage.getItem('twd-sidebar-open') === 'true';
};

export const TWDSidebar = ({ open, position = "left" }: TWDSidebarProps) => {
  const [_, setRefresh] = useState(0);
  const [isOpen, setIsOpen] = useState(getOpenState(open));
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

  const handleSetIsOpen = (open: boolean) => {
    setIsOpen(open);
    sessionStorage.setItem('twd-sidebar-open', open.toString());
  };

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
    return <ClosedSidebar position={position} setOpen={handleSetIsOpen} />;
  }

  const totalTests = tests.filter(test => test.type === "test").length;

  return (
    <div
      style={{
        fontFamily,
        position: "fixed",
        top: 0,
        bottom: 0,
        width: "280px",
        background: "#f9fafb",
        fontSize: "14px",
        overflowY: "auto",
        boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
        textAlign: "left",
        zIndex: 1000,
        ...positionStyles[position]
      }}
      data-testid="twd-sidebar"
    >
      <div style={{ padding: "8px", background: "#f9fafb", position: "sticky", top: 0, zIndex: 1000, borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <button
            onClick={runAll}
            style={{
              background: "#1A6EF4",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Run All
          </button>
          <button
            aria-label="Close sidebar"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              paddingRight: "0",
              paddingLeft: "0",
            }}
            onClick={() => handleSetIsOpen(false)}
          >
            ✖
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px", color: "#6b7280", marginBottom: "10px" }}>
          <span style={{ color: "#374151" }}>Total: {totalTests}</span>
          <div style={{ display: "flex", gap: "4px" }}>
            <span style={{ color: "#00c951" }}>&#10003; {tests.filter(test => test.status === "pass").length}</span>
            <span style={{ color: "#fb2c36" }}>&#10007; {tests.filter(test => test.status === "fail").length}</span>
          </div>
        </div>
        <MockRulesButton />
      </div>
      <div style={{ padding: "8px" }}>
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
    </div>
  );
};
