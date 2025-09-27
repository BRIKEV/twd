import { describe, it, expect, vi } from "vitest";
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react'
import { TestListItem, assertStyles, statusStyles } from "../../ui/TestListItem";

describe("TestListItem", () => {
  describe('component' , () => {
    it("should render TestListItem component", async () => {
      const test = {
        name: 'Sample Test',
        only: false,
        skip: false,
        status: 'idle',
        logs: [],
        fn: () => { /* test function */ },
        suite: ['Sample Suite']
      };
      const idx = 1;
      const mockRunTest = vi.fn();
      const user = userEvent.setup()
  
      render(<TestListItem node={{
        ...test,
        status: 'idle',
      }} depth={2} idx={idx} runTest={mockRunTest} />);
      const testNameElement = screen.getByText("Sample Test");
      expect(testNameElement).toBeInTheDocument();
      // Simulate a click event
      const buttonElement = screen.getByTestId(`run-test-button-${idx}`);
      await user.click(buttonElement);
      expect(mockRunTest).toHaveBeenCalledWith(idx);
      const onlyIndicator = screen.queryByTestId(`only-indicator-${idx}`);
      expect(onlyIndicator).toBeNull();
      const skipIndicator = screen.queryByTestId(`skip-indicator-${idx}`);
      expect(skipIndicator).toBeNull();
    });
  
    it("should render only and skip indicators when applicable", () => {
      const test = {
        name: 'Only Test',
        only: true,
        skip: true,
        status: 'idle',
        logs: [],
        fn: () => { /* test function */ },
        suite: ['Sample Suite']
      };
      const idx = 2;
      const mockRunTest = vi.fn();
  
      render(<TestListItem node={{
        ...test,
        status: 'idle',
      }} depth={1} idx={idx} runTest={mockRunTest} />);
      const onlyIndicator = screen.getByTestId(`only-indicator-${idx}`);
      expect(onlyIndicator).toBeInTheDocument();
      expect(onlyIndicator).toHaveTextContent('(only)');
      const skipIndicator = screen.getByTestId(`skip-indicator-${idx}`);
      expect(skipIndicator).toBeInTheDocument();
      expect(skipIndicator).toHaveTextContent('(skipped)');
    });
  
    it("should add appropriate styles based on depth", () => {
      const test = {
        name: 'Depth Test',
        only: false,
        skip: false,
        status: 'idle',
        logs: [],
        fn: () => { /* test function */ },
        suite: ['Sample Suite']
      };
      const idx = 3;
      const mockRunTest = vi.fn();
      const depth = 3;
  
      render(<TestListItem node={{
        ...test,
        status: 'idle',
      }} depth={depth} idx={idx} runTest={mockRunTest} />);
      const listItem = screen.getByTestId(`test-list-item-${idx}`);
      expect(listItem).toBeInTheDocument();
      expect(listItem).toHaveStyle(`margin-left: ${depth * 6}px`);
    });
  
    it("should disable run button when test is running", () => {
      const test = {
        name: 'Running Test',
        only: false,
        skip: false,
        status: 'running',
        logs: [],
        fn: () => { /* test function */ },
        suite: ['Sample Suite']
      };
      const idx = 4;
      const mockRunTest = vi.fn();
  
      render(<TestListItem node={{
        ...test,
        status: 'running',
      }} depth={0} idx={idx} runTest={mockRunTest} />);
      const buttonElement = screen.getByTestId(`run-test-button-${idx}`);
      expect(buttonElement).toBeDisabled();
    });

    it('should show logs when present', () => {
      const test = {
        name: 'Log Test',
        only: false,
        skip: false,
        status: 'fail',
        logs: ['Assertion passed: Value is true', 'Test failed: Value is false'],
        fn: () => { /* test function */ },
        suite: ['Sample Suite']
      };
      const idx = 5;
      const mockRunTest = vi.fn();
  
      render(<TestListItem node={{
        ...test,
        status: 'fail',
      }} depth={0} idx={idx} runTest={mockRunTest} />);
      const log1 = screen.getByText('Assertion passed: Value is true');
      expect(log1).toBeInTheDocument();
      expect(log1).toHaveStyle('color: #0d542b; font-weight: 700;');
      const log2 = screen.getByText('Test failed: Value is false');
      expect(log2).toBeInTheDocument();
      expect(log2).toHaveStyle('color: #fb2c36; font-weight: 700;');
    });
  });

  describe('assertStyles methods', () => {
    it("should return correct styles for 'Assertion passed' text", () => {
      const styles = assertStyles("Assertion passed: All good");
      expect(styles).toEqual({ color: "#0d542b", fontWeight: "700" });
    });
    
    it("should return correct styles for 'Test failed' text", () => {
      const styles = assertStyles("Test failed: Something went wrong");
      expect(styles).toEqual({ color: "#fb2c36", fontWeight: "700" });
    });

    it("should return empty styles for other text", () => {
      const styles = assertStyles("Some other log message");
      expect(styles).toEqual({});
    });
  });

  describe('statusStyles method', () => {
    it("should return correct styles for 'pass' status", () => {
      const styles = statusStyles({ name: '', only: false, skip: false, status: 'pass', logs: [], fn: () => {}, suite: [] });
      expect(styles).toEqual({
        item: { background: "#dcfce7" },
        container: { borderLeft: "3px solid #00c951" },
      });
    });

    it("should return correct styles for 'fail' status", () => {
      const styles = statusStyles({ name: '', only: false, skip: false, status: 'fail', logs: [], fn: () => {}, suite: [] });
      expect(styles).toEqual({
        item: { background: "#fee2e2" },
        container: { borderLeft: "3px solid #fb2c36" },
      });
    });

    it("should return correct styles for 'skip' status", () => {
      const styles = statusStyles({ name: '', only: false, skip: false, status: 'skip', logs: [], fn: () => {}, suite: [] });
      expect(styles).toEqual({
        item: { background: "#f3f4f6" },
      });
    });

    it("should return correct styles for 'running' status", () => {
      const styles = statusStyles({ name: '', only: false, skip: false, status: 'running', logs: [], fn: () => {}, suite: [] });
      expect(styles).toEqual({
        item: { background: "#fef9c3" },
      });
    });

    it("should return correct styles for unknown status", () => {
      const styles = statusStyles({ name: '', only: false, skip: false, status: 'idle', logs: [], fn: () => {}, suite: [] });
      expect(styles).toEqual({
        item: { background: "transparent" },
      });
    });
  });
});
