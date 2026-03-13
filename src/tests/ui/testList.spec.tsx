import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react'
import * as twd from '../../runner';
import { TestList } from "../../ui/TestList";
import { buildTreeFromHandlers } from "../../ui/utils/buildTreeFromHandlers";
import { filterTree } from "../../ui/utils/filterTree";

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
    const testArray = Array.from(twd.handlers.values());
    const roots = buildTreeFromHandlers(testArray);

    render(<TestList roots={roots} runTest={mockRunTest} />);
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
    const testArray = Array.from(twd.handlers.values());
    const roots = buildTreeFromHandlers(testArray);

    render(<TestList roots={roots} runTest={mockRunTest} />);
    
    const testItem = screen.getByText('Test 1.1').closest('[data-test-name]');
    expect(testItem).toBeInTheDocument();
    expect(testItem).toHaveAttribute('data-test-name', 'Test 1.1');
  });

  it("should filter tests by search query preserving hierarchy", () => {
    twd.describe("Auth", () => {
      twd.describe("Login", () => {
        twd.it("shows error on invalid password", () => {});
        twd.it("redirects on success", () => {});
      });
      twd.describe("Signup", () => {
        twd.it("validates email format", () => {});
      });
    });
    const mockRunTest = vi.fn();
    const tests = Array.from(twd.handlers.values());

    const roots = filterTree(buildTreeFromHandlers(tests), "error");

    render(<TestList roots={roots} runTest={mockRunTest} searchQuery="error" />);

    expect(screen.getByTestId("test-group-Auth")).toBeInTheDocument();
    expect(screen.getByTestId("test-group-Login")).toBeInTheDocument();
    expect(screen.getByText("shows error on invalid password")).toBeInTheDocument();
    expect(screen.queryByText("redirects on success")).not.toBeInTheDocument();
    expect(screen.queryByTestId("test-group-Signup")).not.toBeInTheDocument();
  });

  it("should show empty state when no tests match search query", () => {
    twd.describe("Auth", () => {
      twd.it("login test", () => {});
    });
    const mockRunTest = vi.fn();
    const tests = Array.from(twd.handlers.values());

    const roots = filterTree(buildTreeFromHandlers(tests), "zzzzz");

    render(<TestList roots={roots} runTest={mockRunTest} searchQuery="zzzzz" />);

    expect(screen.getByText(/No tests match "zzzzz"/)).toBeInTheDocument();
  });

  it("should show all tests when searchQuery is empty", () => {
    twd.describe("Auth", () => {
      twd.it("test 1", () => {});
      twd.it("test 2", () => {});
    });
    const mockRunTest = vi.fn();
    const tests = Array.from(twd.handlers.values());

    const roots = buildTreeFromHandlers(tests);

    render(<TestList roots={roots} runTest={mockRunTest} searchQuery="" />);

    expect(screen.getByText("test 1")).toBeInTheDocument();
    expect(screen.getByText("test 2")).toBeInTheDocument();
  });
});
