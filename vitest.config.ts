// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Let esbuild transpile TSX/JSX using the automatic React runtime
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
  },
});
