import { describe, it, expect, vi, suite, beforeEach } from "vitest";
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react'
import * as twd from '../../';
import { TWDSidebar } from "../../ui/TWDSidebar";
import { clearTests } from "../../twdRegistry";

describe("TWDSidebar", () => {
  beforeEach(() => {
    // Clear all registered tests before each test case
    clearTests();
    vi.clearAllMocks();
  });

  describe("component" , () => {
    it("should render TWDSidebar component closed", async () => {
      render(<TWDSidebar open={false} />);
      const sidebarElement = screen.getByText("TWD");
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
      // simulate a click event to close the sidebar
      const closeButton = screen.getByText("✖");
      await user.click(closeButton);
      expect(screen.getByText("TWD")).toBeInTheDocument();
      // Run all not visible
      expect(screen.queryByText("Run All")).not.toBeInTheDocument();
    });

    it('execute test when clicking the run button', async () => {
      const firstTest = vi.fn();
      const secondTest = vi.fn();
      twd.describe('Group 1', () => {
        twd.it('Test 1.1', firstTest);
        twd.itSkip('Test 1.2', secondTest);
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
        twd.itOnly('Test only', secondTest);
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
  });
});
