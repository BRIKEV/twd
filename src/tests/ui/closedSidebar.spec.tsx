import { describe, it, expect, vi } from "vitest";
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react'
import { ClosedSidebar } from "../../ui/ClosedSidebar";

describe("ClosedSidebar", () => {
  it("should render ClosedSidebar component", async () => {
    const mockSetOpen = vi.fn();
    const user = userEvent.setup()

    render(<ClosedSidebar setOpen={mockSetOpen} position="left" />);
    const sidebarElement = screen.getByText("TWD");
    expect(sidebarElement).toBeInTheDocument();
    // Simulate a click event
    await user.click(sidebarElement);
    expect(mockSetOpen).toHaveBeenCalledWith(true);
    expect(sidebarElement).toHaveStyle({ position: 'fixed', left: '0' });
  });

  it("should render ClosedSidebar component right position", async () => {
    const mockSetOpen = vi.fn();
    const user = userEvent.setup()

    render(<ClosedSidebar setOpen={mockSetOpen} position="right" />);
    const sidebarElement = screen.getByText("TWD");
    expect(sidebarElement).toBeInTheDocument();
    // Simulate a click event
    await user.click(sidebarElement);
    expect(mockSetOpen).toHaveBeenCalledWith(true);
    expect(sidebarElement).toHaveStyle({ position: 'fixed', right: '0' });
  });
});

