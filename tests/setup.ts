// tests/setup.ts
import { expect, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers"; // ← namespace import
import { cleanup } from "@testing-library/react";

// Add jest-dom matchers (e.g., toBeInTheDocument)
expect.extend(matchers);

// Clean up DOM after each test
afterEach(() => {
  cleanup();
});
