import "server-only";
import type { NormalizedPlace } from "./types";

const OVERPASS_URL = process.env.OVERPASS_URL ?? "https://overpass-api.de/api/interpreter";

function buildOverpassQuery(lat: number, lng: number, radius: number, q?: string) {
  // OSM cuisine is freeform, we ignore q for now or could add [~"cuisine"~"..."]
  return `
  [out:json][timeout:25];
  (
    node["amenity"="restaurant"](around:${radius},${lat},${lng});
    way["amenity"="restaurant"](around:${radius},${lat},${lng});
    relation["amenity"="restaurant"](around:${radius},${lat},${lng});
  );
  out center tags;`;
}

function tagAddr(tags: Record<string, string | undefined> = {}) {
  const parts = [
    [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" "),
    tags["addr:city"],
  ].filter(Boolean);
  return parts.join(", ");
}

export async function nearbyOsm(
  lat: number,
  lng: number,
  radius: number,
  q?: string,
): Promise<NormalizedPlace[]> {
  const body = buildOverpassQuery(lat, lng, radius, q);
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "content-type": "text/plain;charset=UTF-8" },
    body,
  });
  if (!res.ok) throw new Error(`Overpass error ${res.status}`);

  const data = await res.json();
  const elements: any[] = data?.elements ?? [];
  const out: NormalizedPlace[] = [];
  for (const e of elements) {
    const tags = (e.tags ?? {}) as Record<string, string | undefined>;
    const name = tags.name ?? "Unnamed";
    const address = tagAddr(tags);
    const center = e.center ?? (e.type === "node" ? { lat: e.lat, lon: e.lon } : null);
    if (!center) continue;
    out.push({
      provider: "osm",
      name,
      address,
      location: { lat: Number(center.lat), lng: Number(center.lon) },
      priceLevel: null,
      rating: null,
      userRatingCount: null,
      placeId: null,
      openNow: null,
      sourcePayload: { id: e.id, tags },
    });
  }
  return out.slice(0, 30); // keep response small
}
