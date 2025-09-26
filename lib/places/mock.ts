import type { NormalizedPlace } from "./types";

export async function nearbyMock(
  lat: number,
  lng: number,
  radius: number,
): Promise<NormalizedPlace[]> {
  const base: Omit<NormalizedPlace, "name" | "location"> = {
    provider: "mock",
    address: "123 Example Rd",
    priceLevel: 2,
    rating: 4.2,
    userRatingCount: 120,
    placeId: null,
    openNow: true,
    sourcePayload: null,
  };

  const mk = (i: number, name: string, dLat: number, dLng: number): NormalizedPlace => ({
    ...base,
    name,
    location: { lat: lat + dLat, lng: lng + dLng },
  });

  return [
    mk(1, "Mock Sushi", 0.001, 0.001),
    mk(2, "Mock Noodles", -0.0013, 0.0004),
    mk(3, "Mock Bistro", 0.0007, -0.0011),
    mk(4, "Mock Tacos", -0.0005, -0.0006),
    mk(5, "Mock Diner", 0.0002, 0.0014),
  ];
}
