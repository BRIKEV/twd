import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react'
import * as twd from '../../runner';
import { TestList } from "../../ui/TestList";

describe("TestList", () => {
  beforeEach(() => {
    twd.clearTests();
    sessionStorage.clear();
  });
  it("should render TestList component with tests", async () => {
    twd.describe('Group 1', () => {
      twd.it('Test 1.1', () => {});
      twd.it('Test 1.2', () => {});
    });

    twd.describe('Group 2', () => {
      twd.it('Test 2.1', () => {});
      twd.describe('Subgroup 2.1', () => {
        twd.it('Test 2.1.1', () => {});
      });
    });
    const mockRunTest = vi.fn();
    const user = userEvent.setup();
    const tests = twd.handlers;
    const testArray = Array.from(tests.values());

    render(<TestList tests={testArray} runTest={mockRunTest} />);
    // aria-expanded is false when collapsed
    const testGroupA = screen.getByTestId('test-group-Group 1');
    expect(testGroupA).toBeInTheDocument();
    expect(testGroupA).toHaveAttribute('aria-expanded', 'true');

    // Simulate a click event to expand
    await user.click(testGroupA);
    expect(testGroupA).toHaveAttribute('aria-expanded', 'false');
    const TestgroupB = screen.getByTestId('test-group-Group 2');
    expect(TestgroupB).toBeInTheDocument();
    expect(TestgroupB).toHaveAttribute('aria-expanded', 'true');
    // Simulate a click event to expand
    await user.click(TestgroupB);
    expect(TestgroupB).toHaveAttribute('aria-expanded', 'false');
  });

  it('should have data-test-name attribute on test items', () => {
    twd.describe('Group 1', () => {
      twd.it('Test 1.1', () => {});
    });
    const mockRunTest = vi.fn();
    const tests = twd.handlers;
    const testArray = Array.from(tests.values());

    render(<TestList tests={testArray} runTest={mockRunTest} />);
    
    const testItem = screen.getByText('Test 1.1').closest('[data-test-name]');
    expect(testItem).toBeInTheDocument();
    expect(testItem).toHaveAttribute('data-test-name', 'Test 1.1');
  });
});
