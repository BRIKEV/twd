
import { describe, it, expect } from "vitest";
import {render, screen} from '@testing-library/react'
import Play from "../../ui/Icons/Play";
import ChevronDown from "../../ui/Icons/ChevronDown";
import ChevronRight from "../../ui/Icons/ChevronRight";
import Loader from "../../ui/Icons/Loader";

describe("Icons", () => {
  it("should render Play icon", () => {
    // Test implementation goes here
    render(<Play />);
    const iconElement = screen.getByTestId("play-icon");
    expect(iconElement).toBeInTheDocument();
  });

  it("should render ChevronDown icon", () => {
    // Test implementation goes here
    render(<ChevronDown />);
    const iconElement = screen.getByTestId("chevron-down-icon");
    expect(iconElement).toBeInTheDocument();
  });

  it("should render ChevronRight icon", () => {
    // Test implementation goes here
    render(<ChevronRight />);
    const iconElement = screen.getByTestId("chevron-right-icon");
    expect(iconElement).toBeInTheDocument();
  });

  it("should render Loader icon", () => {
    // Test implementation goes here
    render(<Loader />);
    const iconElement = screen.getByTestId("loader-icon");
    expect(iconElement).toBeInTheDocument();
  });
});
