import { describe, it, expect } from "vitest";
import { VisitCreateSchema } from "../lib/schema";

describe("VisitCreateSchema", () => {
  it("accepts restaurantId path", () => {
    const data = {
      restaurantId: "abc123",
      rating: 4,
      notes: "tasty",
      tags: ["quick", "healthy"],
    };
    const parsed = VisitCreateSchema.safeParse(data);
    expect(parsed.success).toBe(true);
  });

  it("accepts place path", () => {
    const data = {
      place: {
        placeId: "g-123",
        name: "Mock Ramen",
        address: "1 Noodle Way",
        lat: 1.234,
        lng: 103.456,
        priceLevel: 2,
        source: "mock",
        cuisine: "japanese",
      },
      rating: 5,
    };
    const parsed = VisitCreateSchema.safeParse(data);
    expect(parsed.success).toBe(true);
  });

  it("requires either restaurantId or place", () => {
    const data = { rating: 3 };
    const parsed = VisitCreateSchema.safeParse(data);
    expect(parsed.success).toBe(false);
  });

  it("rejects invalid rating", () => {
    const data = {
      restaurantId: "abc",
      rating: 6,
    };
    const parsed = VisitCreateSchema.safeParse(data);
    expect(parsed.success).toBe(false);
  });
});
