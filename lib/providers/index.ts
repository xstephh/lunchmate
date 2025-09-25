// lib/providers/index.ts
import { PLACES_PROVIDER } from "@/lib/env";
import type { PlacesProvider } from "./types";
import { createMockProvider } from "./mockProvider";
import { createGoogleProvider } from "./googleProvider";

export function createPlacesProvider(): PlacesProvider {
  switch (PLACES_PROVIDER) {
    case "google":
      return createGoogleProvider();
    case "mock":
    default:
      return createMockProvider();
  }
}
