import { describe, it, expect, vi } from "vitest";
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react'
import { TestListItem, assertStyles, statusStyles } from "../../ui/TestListItem";


describe("TestListItem", () => {
  describe('component' , () => {
    it("should render TestListItem component", async () => {
      const testId = 'test-1';
      const test = {
        name: 'Sample Test',
        only: false,
        skip: false,
        status: 'idle',
        logs: [],
        id: 'test-1',
        type: 'test',
        depth: 1,
      };
      const mockRunTest = vi.fn();
      const user = userEvent.setup()
  
      render(<TestListItem node={{
        ...test,
        status: 'idle',
        type: 'test',
      }} depth={2} id={testId} runTest={mockRunTest} />);
      const testNameElement = screen.getByText("Sample Test");
      expect(testNameElement).toBeInTheDocument();
      // Simulate a click event
      const buttonElement = screen.getByTestId(`run-test-button-${testId}`);
      await user.click(buttonElement);
      expect(mockRunTest).toHaveBeenCalledWith(testId);
      const onlyIndicator = screen.queryByTestId(`only-indicator-${testId}`);
      expect(onlyIndicator).toBeNull();
      const skipIndicator = screen.queryByTestId(`skip-indicator-${testId}`);
      expect(skipIndicator).toBeNull();
    });
  
    it("should render only and skip indicators when applicable", () => {
      const testId = 'test-1';
      const test = {
        name: 'Sample Test',
        only: true,
        skip: true,
        status: 'idle',
        logs: [],
        id: 'test-1',
        type: 'test',
        depth: 1,
      };
      const mockRunTest = vi.fn();
  
      render(<TestListItem node={{
        ...test,
        status: 'idle',
        type: 'test',
      }} depth={1} id={testId} runTest={mockRunTest} />);
      const onlyIndicator = screen.getByTestId(`only-indicator-${testId}`);
      expect(onlyIndicator).toBeInTheDocument();
      expect(onlyIndicator).toHaveTextContent('(only)');
      const skipIndicator = screen.getByTestId(`skip-indicator-${testId}`);
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
        id: 'test-1',
        type: 'test',
        depth: 3,
      };
      const testId = 'test-3';
      const mockRunTest = vi.fn();
      const depth = 3;
  
      render(<TestListItem node={{
        ...test,
        status: 'idle',
        type: 'test',
      }} depth={depth} id={testId} runTest={mockRunTest} />);
      const listItem = screen.getByTestId(`test-list-item-${testId}`);
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
        id: 'test-1',
        type: 'test',
        depth: 3,
      };
      const testId = 'test-4';
      const mockRunTest = vi.fn();
  
      render(<TestListItem node={{
        ...test,
        status: 'running',
        type: 'test',
      }} depth={0} id={testId} runTest={mockRunTest} />);
      const buttonElement = screen.getByTestId(`run-test-button-${testId}`);
      expect(buttonElement).toBeDisabled();
    });

    it('should show logs when present', () => {
      const test = {
        name: 'Log Test',
        only: false,
        skip: false,
        status: 'fail',
        logs: ['Assertion passed: Value is true', 'Test failed: Value is false'],
        id: 'test-1',
        type: 'test',
        depth: 3,
      };
      const testId = 'test-5';
      const mockRunTest = vi.fn();
  
      render(<TestListItem node={{
        ...test,
        status: 'fail',
        type: 'test',
      }} depth={0} id={testId} runTest={mockRunTest} />);
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
    const test = {
      name: 'Test name',
      only: false,
      skip: false,
      status: 'pass',
      logs: [],
      id: 'test-1',
      type: 'test',
      depth: 1,
    };
    it("should return correct styles for 'pass' status", () => {
      const styles = statusStyles({
        ...test,
        status: 'pass',
        type: 'test',
      });
      expect(styles).toEqual({
        item: { background: "#dcfce7" },
        container: { borderLeft: "3px solid #00c951" },
      });
    });

    it("should return correct styles for 'fail' status", () => {
      const styles = statusStyles({
        ...test,
        status: 'fail',
        type: 'test',
      });
      expect(styles).toEqual({
        item: { background: "#fee2e2" },
        container: { borderLeft: "3px solid #fb2c36" },
      });
    });

    it("should return correct styles for 'skip' status", () => {
      const styles = statusStyles({
        ...test,
        status: 'skip',
        type: 'test',
      });
      expect(styles).toEqual({
        item: { background: "#f3f4f6" },
      });
    });

    it("should return correct styles for 'running' status", () => {
      const styles = statusStyles({
        ...test,
        status: 'running',
        type: 'test',
      });
      expect(styles).toEqual({
        item: { background: "#fef9c3" },
      });
    });

    it("should return correct styles for unknown status", () => {
      const styles = statusStyles({
        ...test,
        status: 'idle',
        type: 'test',
      });
      expect(styles).toEqual({
        item: { background: "transparent" },
      });
    });
  });
});
