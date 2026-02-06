import { describe, it, expect, vi, beforeEach } from "vitest";
import { expect as chaiExpect } from 'chai';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react'
import * as twd from '../../runner';
import { TWDSidebar } from "../../ui/TWDSidebar";
import * as mockBridge from '../../commands/mockBridge';
import * as componentMocks from '../../ui/componentMocks';

describe("TWDSidebar", () => {
  beforeEach(() => {
    // Clear all registered tests before each test case
    twd.clearTests();
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  describe("component" , () => {
    it("should render TWDSidebar right position", async () => {
      render(<TWDSidebar open position="right" />);
      const sidebarElement = screen.getByTestId("twd-sidebar");
      // position fixed but right not left
      expect(sidebarElement).toHaveStyle({ position: 'fixed', right: '0' });
      expect(sidebarElement).not.toHaveStyle({ position: 'fixed', left: '0' });
      // html margin right 280px
      expect(document.documentElement).toHaveStyle({ marginRight: '280px' });
      expect(document.documentElement).not.toHaveStyle({ marginLeft: '280px' });
    });

    it("should render TWDSidebar component closed", async () => {
      render(<TWDSidebar open={false} />);
      const sidebarElement = screen.getByText("TWD");
      expect(sidebarElement).toBeInTheDocument();
    });

    it("should render based on the sessionStorage property if exists", async () => {
      sessionStorage.setItem('twd-sidebar-open', 'true');
      render(<TWDSidebar open={false} />);
      const sidebarElement = screen.getByText("Run All");
      expect(sidebarElement).toBeInTheDocument();
    });

    it("should render TWDSidebar component open", async () => {
      render(<TWDSidebar open={true} />);
      const sidebarElement = screen.getByText("Run All");
      expect(sidebarElement).toBeInTheDocument();
    });

    it("should open the sidebar when clicking the closed sidebar", async () => {
      const user = userEvent.setup();
      render(<TWDSidebar open={false} />);
      const closedSidebarElement = screen.getByText("TWD");
      expect(closedSidebarElement).toBeInTheDocument();
      // Simulate a click event
      await user.click(closedSidebarElement);
      const openSidebarElement = screen.getByText("Run All");
      expect(openSidebarElement).toBeInTheDocument();
      expect(sessionStorage.getItem('twd-sidebar-open')).toBe('true');
      // simulate a click event to close the sidebar
      const closeButton = screen.getByText("✖");
      await user.click(closeButton);
      expect(screen.getByText("TWD")).toBeInTheDocument();
      // Run all not visible
      expect(screen.queryByText("Run All")).not.toBeInTheDocument();
      expect(sessionStorage.getItem('twd-sidebar-open')).toBe('false');
    });

    it('execute test when clicking the run button', async () => {
      const firstTest = vi.fn();
      const secondTest = vi.fn();
      twd.describe('Group 1', () => {
        twd.it('Test 1.1', firstTest);
        twd.it.skip('Test 1.2', secondTest);
      });
      const user = userEvent.setup()
      render(<TWDSidebar open={true} />);
      const runAllButton = screen.getByText("Run All");
      expect(runAllButton).toBeInTheDocument();
      // Simulate a click event
      await user.click(runAllButton);
      expect(firstTest).toHaveBeenCalled();
      expect(secondTest).not.toHaveBeenCalled();
    });

    it('skip test when there is a test with only', async () => {
      const firstTest = vi.fn();
      const secondTest = vi.fn();
      twd.describe('Group test only', () => {
        twd.it('Test no only', firstTest);
        twd.it.only('Test only', secondTest);
      });
      const user = userEvent.setup()
      render(<TWDSidebar open={true} />);
      const runAllButton = screen.getByText("Run All");
      expect(runAllButton).toBeInTheDocument();
      // Simulate a click event
      await user.click(runAllButton);
      expect(firstTest).not.toHaveBeenCalled();
      expect(secondTest).toHaveBeenCalled();
    });

    it('should render the total number of tests', async () => {
      twd.describe('Group test', () => {
        twd.it('Test 1', vi.fn());
        twd.it('Test 2', vi.fn());
        twd.it.skip('Test 2', vi.fn());
        twd.it.only('Test 2', vi.fn());
      });
      render(<TWDSidebar open={true} />);
      const totalTests = screen.getByText(/Total:\s*4/);

      // The checkmark and cross are Unicode, not HTML entities, so we must match by visible text/glyph
      // Use regular expressions to match ✓ 0 and ✗ 0 ignoring whitespace
      const passedTests = screen.getByText((content) => content.replace(/\s/g, '') === '✓0');
      const failedTests = screen.getByText((content) => content.replace(/\s/g, '') === '✗0');

      expect(passedTests).toBeInTheDocument();
      expect(failedTests).toBeInTheDocument();
      expect(totalTests).toBeInTheDocument();
    });

    it('should run one single test when clicking the run button', async () => {
      const user = userEvent.setup();
      const testFn1 = vi.fn();
      twd.describe('Group test', () => {
        twd.it('Test 1', testFn1);
      });
      render(<TWDSidebar open={true} />);
      const runTestButton = screen.getByTestId('play-icon');
      expect(runTestButton).toBeInTheDocument();
      await user.click(runTestButton);
      expect(testFn1).toHaveBeenCalled();
    });

    it('should save test name to sessionStorage when running a single test', async () => {
      const user = userEvent.setup();
      const testFn1 = vi.fn();
      twd.describe('Group test', () => {
        twd.it('My Test Name', testFn1);
      });
      render(<TWDSidebar open={true} />);
      const runTestButton = screen.getByTestId('play-icon');
      await user.click(runTestButton);
      expect(sessionStorage.getItem('twd-last-run-test-name')).toBe('My Test Name');
    });

    it('should remove test name from sessionStorage when running all tests', async () => {
      const user = userEvent.setup();
      sessionStorage.setItem('twd-last-run-test-name', 'Previous Test');
      twd.describe('Group test', () => {
        twd.it('Test 1', vi.fn());
      });
      render(<TWDSidebar open={true} />);
      const runAllButton = screen.getByText("Run All");
      await user.click(runAllButton);
      expect(sessionStorage.getItem('twd-last-run-test-name')).toBeNull();
    });

    it('should render the Clear mocks button', () => {
      render(<TWDSidebar open={true} />);
      const clearMocksButton = screen.getByRole('button', { name: 'Clear all mocks' });
      expect(clearMocksButton).toBeInTheDocument();
      expect(clearMocksButton).toHaveTextContent('Clear mocks');
    });

    it('should call clearRequestMockRules and clearComponentMocks when clicking Clear mocks', async () => {
      const user = userEvent.setup();
      const clearRequestSpy = vi.spyOn(mockBridge, 'clearRequestMockRules').mockImplementation(() => {});
      const clearComponentSpy = vi.spyOn(componentMocks, 'clearComponentMocks').mockImplementation(() => {});
      render(<TWDSidebar open={true} />);
      const clearMocksButton = screen.getByRole('button', { name: 'Clear all mocks' });
      await user.click(clearMocksButton);
      expect(clearRequestSpy).toHaveBeenCalled();
      expect(clearComponentSpy).toHaveBeenCalled();
    });
  });

  describe("fail scenarios", () => {
    it('should handle throw exceptions in tests', async () => {
      const errorTest = vi.fn().mockRejectedValue(new Error("Test error"));
      twd.describe('Group test error', () => {
        twd.it('Test error', errorTest);
      });
      const user = userEvent.setup()
      render(<TWDSidebar open={true} />);
      const runAllButton = screen.getByText("Run All");
      expect(runAllButton).toBeInTheDocument();
      // Simulate a click event
      await user.click(runAllButton);
      expect(errorTest).toHaveBeenCalled();
      const errorLog = screen.getByText(/Test failed: Test error/);
      expect(errorLog).toBeInTheDocument();
    });

    it('should handle chai assertion errors', async () => {
      twd.describe('Group test error', () => {
        twd.it('Test error', () => {
          chaiExpect(1).to.equal(2);
        });
      });
      const user = userEvent.setup()
      render(<TWDSidebar open={true} />);
      const runAllButton = screen.getByText("Run All");
      expect(runAllButton).toBeInTheDocument();
      // Simulate a click event
      await user.click(runAllButton);
      const errorLog = screen.getByText(/Assertion failed/);
      const expectedLog = screen.getByText(/Expected:/);
      expect(expectedLog).toBeInTheDocument();
      const actualLog = screen.getByText(/Actual:/);
      expect(actualLog).toBeInTheDocument();
      expect(errorLog).toBeInTheDocument();
    });
  });

  describe("accessibility - screen reader announcements", () => {
    it('should announce when a single test passes', async () => {
      const user = userEvent.setup();
      const testFn1 = vi.fn();
      twd.describe('Group test', () => {
        twd.it('My Passing Test', testFn1);
      });
      render(<TWDSidebar open={true} />);
      const runTestButton = screen.getByTestId('play-icon');
      await user.click(runTestButton);
      
      await waitFor(() => {
        const liveRegion = screen.getByText(/Test "My Passing Test" passed/);
        expect(liveRegion).toBeInTheDocument();
      });
    });

    it('should announce when a single test fails with error message', async () => {
      const user = userEvent.setup();
      twd.describe('Group test', () => {
        twd.it('My Failing Test', () => {
          throw new Error("Something went wrong");
        });
      });
      render(<TWDSidebar open={true} />);
      const runTestButton = screen.getByTestId('play-icon');
      await user.click(runTestButton);
      
      await waitFor(() => {
        const liveRegion = screen.getByText(/Test "My Failing Test" failed.*Something went wrong/);
        expect(liveRegion).toBeInTheDocument();
      });
    });

    it('should announce when a single test fails with chai assertion', async () => {
      const user = userEvent.setup();
      twd.describe('Group test', () => {
        twd.it('Chai Assertion Test', () => {
          chaiExpect(1).to.equal(2);
        });
      });
      render(<TWDSidebar open={true} />);
      const runTestButton = screen.getByTestId('play-icon');
      await user.click(runTestButton);
      
      await waitFor(() => {
        const liveRegion = screen.getByText(/Test "Chai Assertion Test" failed/);
        expect(liveRegion).toBeInTheDocument();
      });
    });

    it('should announce when a single test fails with chai deep equality (JSON diff)', async () => {
      const user = userEvent.setup();
      twd.describe('Group test', () => {
        twd.it('Chai Deep Equal Test', () => {
          chaiExpect({ name: 'John', age: 30 }).to.deep.equal({ name: 'Jane', age: 25 });
        });
      });
      render(<TWDSidebar open={true} />);
      const runTestButton = screen.getByTestId('play-icon');
      await user.click(runTestButton);
      
      await waitFor(() => {
        const liveRegion = screen.getByText(/Test "Chai Deep Equal Test" failed.*Expected value does not match actual value/);
        expect(liveRegion).toBeInTheDocument();
      });
    });

    it('should announce summary when running all tests with all passing', async () => {
      const user = userEvent.setup();
      twd.describe('Group test', () => {
        twd.it('Test 1', vi.fn());
        twd.it('Test 2', vi.fn());
        twd.it('Test 3', vi.fn());
      });
      render(<TWDSidebar open={true} />);
      const runAllButton = screen.getByText("Run All");
      await user.click(runAllButton);
      
      await waitFor(() => {
        const liveRegion = screen.getByText(/All tests passed.*3 tests completed/);
        expect(liveRegion).toBeInTheDocument();
      });
    });

    it('should announce summary when running all tests with failures', async () => {
      const user = userEvent.setup();
      twd.describe('Group test', () => {
        twd.it('Pass Test', vi.fn());
        twd.it('Fail Test 1', () => {
          chaiExpect({ status: 'error' }).to.deep.equal({ status: 'success' });
        });
        twd.it('Fail Test 2', () => {
          chaiExpect([1, 2, 3]).to.deep.equal([1, 2, 4]);
        });
      });
      render(<TWDSidebar open={true} />);
      const runAllButton = screen.getByText("Run All");
      await user.click(runAllButton);
      
      await waitFor(() => {
        const liveRegion = screen.getByText(/Test run completed.*1 test passed.*2 tests failed/);
        expect(liveRegion).toBeInTheDocument();
      });
    });

    it('should announce summary including skipped tests', async () => {
      const user = userEvent.setup();
      twd.describe('Group test', () => {
        twd.it('Pass Test', vi.fn());
        twd.it.skip('Skip Test 1', vi.fn());
        twd.it.skip('Skip Test 2', vi.fn());
      });
      render(<TWDSidebar open={true} />);
      const runAllButton = screen.getByText("Run All");
      await user.click(runAllButton);
      
      await waitFor(() => {
        const liveRegion = screen.getByText(/All tests passed.*1 test completed.*2 tests skipped/);
        expect(liveRegion).toBeInTheDocument();
      });
    });

    it('should clear previous announcement before running new test', async () => {
      const user = userEvent.setup();
      twd.describe('Group test', () => {
        twd.it('Test 1', vi.fn());
      });
      render(<TWDSidebar open={true} />);
      const runTestButton = screen.getByTestId('play-icon');
      
      // Run first time
      await user.click(runTestButton);
      await waitFor(() => {
        expect(screen.getByText(/Test "Test 1" passed/)).toBeInTheDocument();
      });
      
      // Clear and run again
      await user.click(runTestButton);
      // The message should still appear (may be same text, but it should re-announce)
      await waitFor(() => {
        expect(screen.getByText(/Test "Test 1" passed/)).toBeInTheDocument();
      });
    });
  });
});
