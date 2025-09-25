// lib/providers/googleProvider.ts
import type { PlacesProvider, NearbyParams, Place } from "./types";
import { TTLCache } from "@/lib/cache";
import { PROVIDER_NETWORK_ENABLED } from "@/lib/env";

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const ttl = new TTLCache<string, Place[]>(1000 * 60 * 10); // 10 min cache

function key(p: NearbyParams) {
  return `${p.lat.toFixed(4)}:${p.lng.toFixed(4)}:${p.radius}:${p.cuisine ?? "any"}:${
    p.minRating ?? 0
  }`;
}

export function createGoogleProvider(): PlacesProvider {
  return {
    async nearby(params: NearbyParams): Promise<Place[]> {
      if (!PROVIDER_NETWORK_ENABLED) {
        // Safety: never hit network unless explicitly enabled
        return [];
      }
      if (!API_KEY) {
        throw new Error("GOOGLE_MAPS_API_KEY missing");
      }

      const k = key(params);
      const cached = ttl.get(k);
      if (cached) return cached;

      const typesOrKeyword = params.cuisine
        ? encodeURIComponent(params.cuisine.replace("_", " "))
        : "";
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${
        params.lat
      },${params.lng}&radius=${params.radius}${
        typesOrKeyword ? `&keyword=${typesOrKeyword}` : ""
      }&opennow=true&key=${API_KEY}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Google Places error: ${res.status}`);
      const json = await res.json();

      const places: Place[] = (json.results ?? []).map((r: any) => ({
        placeId: r.place_id,
        name: r.name,
        address: r.vicinity ?? r.formatted_address ?? "",
        lat: r.geometry?.location?.lat ?? null,
        lng: r.geometry?.location?.lng ?? null,
        rating: typeof r.rating === "number" ? r.rating : null,
        priceLevel: typeof r.price_level === "number" ? r.price_level : null,
        cuisine: params.cuisine,
        source: "google",
      }));

      // filter by min rating if provided
      const out = params.minRating
        ? places.filter((p) => (p.rating ?? 0) >= params.minRating!)
        : places;
      ttl.set(k, out);
      return out;
    },
  };
}
