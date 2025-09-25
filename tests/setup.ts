// tests/setup.ts
import { expect, afterEach } from "vitest";
import * as imported from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";

const matchers: any = (imported as any).default ?? imported;
expect.extend(matchers);

afterEach(() => cleanup());
