import { describe, it, expect } from "vitest";
import { expect as chaiExpect } from 'chai';
import { render, screen } from '@testing-library/react';
import { LogItem } from "../../ui/LogItem";
import { LogType } from "../../ui/utils/formatLogs";

describe("LogItem", () => {
  describe("component", () => {
    it("should render plain text log", () => {
      const log = "Assertion passed: Value is true";
      render(<LogItem log={log} index={0} />);
      
      const logElement = screen.getByText(log);
      expect(logElement).toBeInTheDocument();
      expect(logElement.tagName).toBe("LI");
    });

    it("should render chai message error log", () => {
      const log = JSON.stringify({
        type: LogType.CHAI_MESSAGE,
        message: "Test failed: Something went wrong",
      });
      render(<LogItem log={log} index={0} />);
      
      const logElement = screen.getByText("Test failed: Something went wrong");
      expect(logElement).toBeInTheDocument();
    });

    it("should render error log", () => {
      const log = JSON.stringify({
        type: LogType.ERROR,
        message: "Test failed: Runtime error occurred",
      });
      render(<LogItem log={log} index={0} />);
      
      const logElement = screen.getByText("Test failed: Runtime error occurred");
      expect(logElement).toBeInTheDocument();
    });

    it("should render chai diff error with expected and actual values", () => {
      const log = JSON.stringify({
        type: LogType.CHAI_DIFF,
        expected: 2,
        actual: 1,
      });
      render(<LogItem log={log} index={0} />);
      
      // Check for assertion failed message
      const assertionFailed = screen.getByText("❌ Assertion failed");
      expect(assertionFailed).toBeInTheDocument();
      
      // Check for Expected section
      const expectedLabel = screen.getByText("Expected:");
      expect(expectedLabel).toBeInTheDocument();
      const expectedValue = screen.getByText("2");
      expect(expectedValue).toBeInTheDocument();
      
      // Check for Actual section
      const actualLabel = screen.getByText("Actual:");
      expect(actualLabel).toBeInTheDocument();
      const actualValue = screen.getByText("1");
      expect(actualValue).toBeInTheDocument();
    });

    it("should render chai diff error with object values", () => {
      const log = JSON.stringify({
        type: LogType.CHAI_DIFF,
        expected: { a: 2, b: "test" },
        actual: { a: 1, b: "test" },
      });
      render(<LogItem log={log} index={0} />);
      
      // Check for assertion failed message
      const assertionFailed = screen.getByText("❌ Assertion failed");
      expect(assertionFailed).toBeInTheDocument();
      
      // Check for Expected section
      const expectedLabel = screen.getByText("Expected:");
      expect(expectedLabel).toBeInTheDocument();
      
      // Check for Actual section
      const actualLabel = screen.getByText("Actual:");
      expect(actualLabel).toBeInTheDocument();
      
      // Check that the formatted JSON is present
      const expectedPre = screen.getByText(/{\s*"a":\s*2/);
      expect(expectedPre).toBeInTheDocument();
      
      const actualPre = screen.getByText(/{\s*"a":\s*1/);
      expect(actualPre).toBeInTheDocument();
    });

    it("should render chai diff error with string values", () => {
      const log = JSON.stringify({
        type: LogType.CHAI_DIFF,
        expected: "expected string",
        actual: "actual string",
      });
      render(<LogItem log={log} index={0} />);
      
      const expectedLabel = screen.getByText("Expected:");
      expect(expectedLabel).toBeInTheDocument();
      const expectedValue = screen.getByText("expected string");
      expect(expectedValue).toBeInTheDocument();
      
      const actualLabel = screen.getByText("Actual:");
      expect(actualLabel).toBeInTheDocument();
      const actualValue = screen.getByText("actual string");
      expect(actualValue).toBeInTheDocument();
    });

    it("should apply correct styles for assertion passed log", () => {
      const log = "Assertion passed: All good";
      render(<LogItem log={log} index={0} />);
      
      const logElement = screen.getByText(log);
      expect(logElement).toHaveStyle({
        color: "var(--twd-success)",
        fontWeight: "var(--twd-font-weight-bold)",
      });
    });

    it("should apply correct styles for test failed log", () => {
      const log = "Test failed: Something went wrong";
      render(<LogItem log={log} index={0} />);
      
      const logElement = screen.getByText(log);
      expect(logElement).toHaveStyle({
        color: "var(--twd-error)",
        fontWeight: "var(--twd-font-weight-bold)",
      });
    });

    it("should handle real chai assertion error (strictEqual)", () => {
      try {
        chaiExpect(1).to.equal(2);
      } catch (error) {
        const formattedError = {
          type: LogType.CHAI_DIFF,
          expected: (error as any).expected,
          actual: (error as any).actual,
        };
        const log = JSON.stringify(formattedError);
        render(<LogItem log={log} index={0} />);
        
        const assertionFailed = screen.getByText("❌ Assertion failed");
        expect(assertionFailed).toBeInTheDocument();
        
        const expectedLabel = screen.getByText("Expected:");
        expect(expectedLabel).toBeInTheDocument();
        
        const actualLabel = screen.getByText("Actual:");
        expect(actualLabel).toBeInTheDocument();
      }
    });

    it("should handle real chai assertion error (deep equal)", () => {
      try {
        chaiExpect({ a: 1 }).to.deep.equal({ a: 2 });
      } catch (error) {
        const formattedError = {
          type: LogType.CHAI_DIFF,
          expected: (error as any).expected,
          actual: (error as any).actual,
        };
        const log = JSON.stringify(formattedError);
        render(<LogItem log={log} index={0} />);
        
        const assertionFailed = screen.getByText("❌ Assertion failed");
        expect(assertionFailed).toBeInTheDocument();
        
        const expectedLabel = screen.getByText("Expected:");
        expect(expectedLabel).toBeInTheDocument();
        
        const actualLabel = screen.getByText("Actual:");
        expect(actualLabel).toBeInTheDocument();
      }
    });

    it("should render multiple log items with different types", () => {
      const logs = [
        "Assertion passed: First check",
        JSON.stringify({
          type: LogType.CHAI_DIFF,
          expected: 2,
          actual: 1,
        }),
        JSON.stringify({
          type: LogType.ERROR,
          message: "Test failed: Final error",
        }),
      ];
      
      const { container } = render(
        <>
          {logs.map((log, idx) => (
            <LogItem key={idx} log={log} index={idx} />
          ))}
        </>
      );
      
      expect(screen.getByText("Assertion passed: First check")).toBeInTheDocument();
      expect(screen.getByText("❌ Assertion failed")).toBeInTheDocument();
      expect(screen.getByText("Test failed: Final error")).toBeInTheDocument();
      
      const listItems = container.querySelectorAll("li");
      expect(listItems).toHaveLength(3);
    });
  });
});
