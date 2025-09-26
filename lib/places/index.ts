import "server-only";
import { getCached, setCached, buildCacheKey, withinBudget, incrementBudget } from "./cache";
import type { ProviderName, NormalizedPlace } from "./types";
import { nearbyMock } from "./mock";
import { nearbyOsm } from "./osm";
import { nearbyGoogle } from "./google";

const DEFAULT_PROVIDER: ProviderName = (process.env.PLACES_PROVIDER as ProviderName) || "osm";
const DEFAULT_RADIUS = Number(process.env.NEARBY_RADIUS_METERS_DEFAULT ?? 1500);
const MIN_PUBLIC_RATING = Number(process.env.MIN_PUBLIC_RATING ?? 4.2);

function sanitize(n: any, fallback: number) {
  const v = Number(n);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

async function callProvider(
  provider: ProviderName,
  lat: number,
  lng: number,
  radius: number,
): Promise<NormalizedPlace[]> {
  switch (provider) {
    case "google":
      return nearbyGoogle(lat, lng, radius, MIN_PUBLIC_RATING);
    case "osm":
      return nearbyOsm(lat, lng, radius);
    default:
      return nearbyMock(lat, lng, radius);
  }
}

export async function nearbyPlaces(params: {
  lat: number;
  lng: number;
  radius?: number;
  q?: string; // reserved for future filters
}): Promise<{
  provider: ProviderName;
  data: NormalizedPlace[];
  fromCache: boolean;
  usedFallback: boolean;
}> {
  const lat = Number(params.lat);
  const lng = Number(params.lng);
  const radius = sanitize(params.radius, DEFAULT_RADIUS);
  const q = (params.q ?? "").trim();

  const requested = DEFAULT_PROVIDER;
  const provider: ProviderName = requested;

  const key = buildCacheKey({ provider, lat, lng, radius, q });
  const cached = await getCached(key);
  if (cached) {
    return { provider, data: cached as NormalizedPlace[], fromCache: true, usedFallback: false };
  }

  // Budget guard: Google may be blocked or capped.
  let effective: ProviderName = provider;
  let usedFallback = false;

  if (provider === "google") {
    const ok = await withinBudget("google", 1);
    if (!ok) {
      effective = "osm";
      usedFallback = true;
    }
  }

  try {
    const data = await callProvider(effective, lat, lng, radius);
    if (provider === "google" && !usedFallback) {
      await incrementBudget("google", 1); // count the call
    }
    await setCached(key, effective, data);
    return { provider: effective, data, fromCache: false, usedFallback };
  } catch (e) {
    // Second-chance fallback to mock if provider fails
    if (effective !== "mock") {
      const data = await callProvider("mock", lat, lng, radius);
      await setCached(key, "mock", data, 60); // short TTL for mock
      return { provider: "mock", data, fromCache: false, usedFallback: true };
    }
    throw e;
  }
}
