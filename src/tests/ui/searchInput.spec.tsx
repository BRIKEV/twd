import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { SearchInput } from "../../ui/SearchInput";

describe("SearchInput", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("renders search input with correct attributes", () => {
    render(<SearchInput value="" onChange={vi.fn()} />);
    const input = screen.getByLabelText("Filter tests");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "search");
    expect(input).toHaveAttribute("placeholder", "Filter tests...");
  });

  it("calls onChange when typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);
    const input = screen.getByLabelText("Filter tests");
    await user.type(input, "auth");
    expect(onChange).toHaveBeenCalled();
  });

  it("calls onChange with empty string when escape key is pressed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="auth" onChange={onChange} />);
    const input = screen.getByLabelText("Filter tests");
    await user.type(input, "{esc}");
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("calls onChange with empty string when clear button is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="auth" onChange={onChange} />);
    const clearButton = screen.getByLabelText("Clear search filter");
    await user.click(clearButton);
    expect(onChange).toHaveBeenCalledWith("");
  });
});
