export type ProviderName = "mock" | "osm" | "google";

export type NormalizedPlace = {
  provider: ProviderName;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  priceLevel: number | null; // 0–4 or null
  rating: number | null; // 1–5 or null
  userRatingCount?: number | null; // may be null for OSM
  placeId?: string | null; // Google only
  openNow?: boolean | null; // when available
  sourcePayload?: unknown; // raw provider fragment (for debug)
};
