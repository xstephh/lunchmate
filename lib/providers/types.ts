// lib/providers/types.ts
export type Place = {
  placeId: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  rating: number | null; // public rating if available
  priceLevel: number | null; // 0-4
  cuisine?: string; // normalized like "japanese" etc. (best-effort)
  source: "google" | "mock";
};

export type NearbyParams = {
  lat: number;
  lng: number;
  radius: number; // meters
  cuisine?: string; // e.g. "japanese"
  minRating?: number; // 0..5
};

export interface PlacesProvider {
  nearby(params: NearbyParams): Promise<Place[]>;
}
