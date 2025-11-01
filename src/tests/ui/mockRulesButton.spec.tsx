import { describe, it, expect, vi } from "vitest";
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react'
import { MockRulesButton } from "../../ui/MockRulesButton";

describe("MockRulesButton", () => {
  it("should render button with rules count and log to console when clicked", async () => {
    // Setup mock request
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'group');
    const consoleLogSpy = vi.spyOn(console, 'log');
    
    render(<MockRulesButton />);
    
    // Check button renders with rules count
    const button = screen.getByRole('button', { name: /view mock rules details in console/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Rules: 0/0 triggeredView rules in console');
    
    // Click button and verify console logging
    await user.click(button);
    
    expect(consoleSpy).toHaveBeenCalledWith('🌐 TWD Mock Rules');
    expect(consoleLogSpy).toHaveBeenCalledWith('Total rules:', 0);
    expect(consoleLogSpy).toHaveBeenCalledWith('Triggered rules:', 0);
    
    consoleSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });
});
