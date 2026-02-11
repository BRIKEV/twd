import { useState, useEffect } from "react";
import { TestList } from "./TestList";
import { ClosedSidebar } from "./ClosedSidebar";
import { useLayout } from "./hooks/useLayout";
import { handlers, TestRunner, type Handler } from "../runner";
import { MockRulesButton } from "./MockRulesButton";
import { clearRequestMockRules } from "../commands/mockBridge";
import { clearComponentMocks } from "./componentMocks";
import { isChaiAssertionError, printChaiError, formatChaiError } from "./utils/chaiErrorFormat";
import { LogType } from "./utils/formatLogs";
import { displaySRMessageSpecificTest, displaySRMessageAllTests } from "./utils/screenReaderMessages";
import { TWD_VERSION } from "../constants/version";

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
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const onStateChange = () => setRefresh((n) => n + 1);
    window.addEventListener('twd:state-change', onStateChange);
    return () => window.removeEventListener('twd:state-change', onStateChange);
  }, []);

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
      console.group(`%c❌ Test failed: ${test.name}`, "color: red; font-weight: bold;");
      if (isChaiAssertionError(err)) {
        printChaiError(err);
        const formattedError = formatChaiError(err);
        if (formattedError.type === "diff") {
          // Store structured error data as JSON string with prefix
          test.logs.push(JSON.stringify({
            type: LogType.CHAI_DIFF,
            expected: formattedError.expected,
            actual: formattedError.actual,
          }));
        } else {
          test.logs.push(JSON.stringify({
            type: LogType.CHAI_MESSAGE,
            message: `Test failed: ${formattedError.message}`,
          }));
        }
      } else {
        console.error(err.message);
        test.logs.push(JSON.stringify({
          type: LogType.ERROR,
          message: `Test failed: ${err.message}`,
        }));
      }
      console.groupEnd();
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
    // Clear the last run test name when running all tests
    setMessage('');
    sessionStorage.removeItem('twd-last-run-test-name');
    await runner.runAll();
    const srMessage = displaySRMessageAllTests(tests);
    setMessage(srMessage);
  };

  const runTest = async (id: string) => {
    const test = Array.from(handlers.values()).filter(h => h.type === "test").find(t => t.id === id);
    if (!test) return;
    // Save test name to session storage for scroll persistence
    setMessage('');
    sessionStorage.setItem('twd-last-run-test-name', test.name);
    await runner.runSingle(test.id);
    const srMessage = displaySRMessageSpecificTest(test);
    setMessage(srMessage);
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
        pointerEvents: "all",
        isolation: "isolate",
        ...positionStyles[position]
      }}
      data-testid="twd-sidebar"
      role="complementary"
      aria-label="Test While Developing sidebar"
    >
      <div aria-live="polite" aria-atomic="true" style={{ position: "absolute", width: "1px", height: "1px", margin: "-1px", border: "0", padding: "0", overflow: "hidden", clip: "rect(0 0 0 0)" }}>{message}</div>
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
          <div style={{ display: "flex", gap: "var(--twd-spacing-xs)" }}>
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
              onClick={() => {
                clearRequestMockRules();
                clearComponentMocks();
              }}
              aria-label="Clear all mocks"
              style={{
                background: "var(--twd-button-secondary)",
                color: "var(--twd-button-secondary-text)",
                padding: "var(--twd-spacing-xs) var(--twd-spacing-md)",
                borderRadius: "var(--twd-border-radius)",
                border: "1px solid var(--twd-button-border)",
                cursor: "pointer",
              }}
            >
              Clear mocks
            </button>
            <span style={{
              color: "var(--twd-text-secondary)",
              fontSize: "var(--twd-font-size-sm)",
              alignSelf: "center",
            }}>v{TWD_VERSION}</span>
          </div>
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
