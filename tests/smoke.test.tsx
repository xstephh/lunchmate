// tests/smoke.test.tsx
import React from "react"; // keeps JSX safe even if config changes
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "../app/page";

describe("Home smoke test", () => {
  it("renders title and controls", () => {
    render(<HomePage />);
    expect(screen.getByText("What’s for lunch?")).toBeInTheDocument();
    expect(screen.getByLabelText("Mode")).toBeInTheDocument();
    expect(screen.getByLabelText("Cuisine")).toBeInTheDocument();
  });
});
