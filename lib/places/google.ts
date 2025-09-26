import "server-only";
import type { NormalizedPlace } from "./types";

const API = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
const KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function nearbyGoogle(
  lat: number,
  lng: number,
  radius: number,
  minRating = 0,
): Promise<NormalizedPlace[]> {
  if (!KEY) throw new Error("Missing GOOGLE_MAPS_API_KEY");
  const url = new URL(API);
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("radius", String(radius));
  url.searchParams.set("type", "restaurant");
  url.searchParams.set("key", KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Google Places error ${res.status}`);
  const json = await res.json();

  const results: any[] = json?.results ?? [];
  const mapped: NormalizedPlace[] = results.map((r) => ({
    provider: "google",
    name: r.name,
    address: r.vicinity ?? r.formatted_address ?? "",
    location: { lat: r.geometry?.location?.lat, lng: r.geometry?.location?.lng },
    priceLevel: typeof r.price_level === "number" ? r.price_level : null,
    rating: typeof r.rating === "number" ? r.rating : null,
    userRatingCount: typeof r.user_ratings_total === "number" ? r.user_ratings_total : null,
    openNow: r.opening_hours?.open_now ?? null,
    placeId: r.place_id ?? null,
    sourcePayload: { types: r.types, business_status: r.business_status },
  }));

  return mapped.filter((p) => p.rating == null || p.rating >= minRating).slice(0, 30);
}
