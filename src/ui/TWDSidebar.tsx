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
  left: { left: 0, borderRight: "1px solid var(--twd-border)" },
  right: { right: 0, borderLeft: "1px solid var(--twd-border)" },
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
        width: "var(--twd-sidebar-width)",
        background: "var(--twd-background)",
        fontSize: "var(--twd-font-size-md)",
        overflowY: "auto",
        boxShadow: "var(--twd-shadow)",
        textAlign: "left",
        zIndex: "var(--twd-z-index-sidebar)",
        ...positionStyles[position]
      }}
      data-testid="twd-sidebar"
    >
      <div style={{ 
        padding: "var(--twd-spacing-md)", 
        background: "var(--twd-background)", 
        position: "sticky", 
        top: 0, 
        zIndex: "var(--twd-z-index-sticky)", 
        borderBottom: "1px solid var(--twd-border)" 
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "var(--twd-spacing-xl)" 
        }}>
          <button
            onClick={runAll}
            style={{
              background: "var(--twd-button-primary)",
              color: "var(--twd-button-primary-text)",
              padding: "var(--twd-spacing-xs) var(--twd-spacing-md)",
              borderRadius: "var(--twd-border-radius)",
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
              fontSize: "var(--twd-font-size-md)",
              paddingRight: "0",
              paddingLeft: "0",
            }}
            onClick={() => handleSetIsOpen(false)}
          >
            ✖
          </button>
        </div>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          fontSize: "var(--twd-font-size-md)", 
          color: "var(--twd-text-secondary)", 
          marginBottom: "10px" 
        }}>
          <span style={{ color: "var(--twd-text)" }}>Total: {totalTests}</span>
          <div style={{ display: "flex", gap: "var(--twd-spacing-xs)" }}>
            <span style={{ color: "var(--twd-success)" }}>&#10003; {tests.filter(test => test.status === "pass").length}</span>
            <span style={{ color: "var(--twd-error)" }}>&#10007; {tests.filter(test => test.status === "fail").length}</span>
          </div>
        </div>
        <MockRulesButton />
      </div>
      <div style={{ padding: "var(--twd-spacing-md)" }}>
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
