// lib/providers/mockProvider.ts
import type { PlacesProvider, NearbyParams, Place } from "./types";

const MOCK_POOL: Omit<Place, "lat" | "lng">[] = [
  {
    placeId: "m1",
    name: "Mock Ramen",
    address: "1 Noodle Way",
    rating: 4.4,
    priceLevel: 2,
    cuisine: "japanese",
    source: "mock",
  },
  {
    placeId: "m2",
    name: "Mock Cha Chaan Teng",
    address: "22 Milk Tea Rd",
    rating: 4.1,
    priceLevel: 1,
    cuisine: "hong_kong",
    source: "mock",
  },
  {
    placeId: "m3",
    name: "Mock Greens",
    address: "7 Salad St",
    rating: 4.6,
    priceLevel: 2,
    cuisine: "healthy",
    source: "mock",
  },
  {
    placeId: "m4",
    name: "Mock Diner",
    address: "9 Toast Ave",
    rating: 4.0,
    priceLevel: 2,
    cuisine: "western",
    source: "mock",
  },
  {
    placeId: "m5",
    name: "Mock Izakaya",
    address: "3 Skewer Ln",
    rating: 4.5,
    priceLevel: 3,
    cuisine: "japanese",
    source: "mock",
  },
];

export function createMockProvider(): PlacesProvider {
  return {
    async nearby({ cuisine, minRating = 0 }: NearbyParams): Promise<Place[]> {
      const filtered = MOCK_POOL.filter(
        (p) => (!cuisine || p.cuisine === cuisine) && (p.rating ?? 0) >= minRating,
      );
      // give each a pseudo-random coordinate near the requested center (no need for exact math)
      return filtered.map((p, i) => ({
        ...p,
        lat: 1.3 + i * 0.001, // harmless dummy coords
        lng: 103.8 + i * 0.001,
      }));
    },
  };
}
