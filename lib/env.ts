// lib/env.ts
function numFromEnv(key: string, fallback: number): number {
  const v = process.env[key];
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export const PLACES_PROVIDER = (process.env.PLACES_PROVIDER ?? "mock").toLowerCase(); // mock|google|foursquare
export const PLACES_ENABLED =
  String(process.env.PLACES_ENABLED ?? "false").toLowerCase() === "true";

// Only network providers require PLACES_ENABLED=true. mock is always allowed.
export const PROVIDER_NETWORK_ENABLED = PLACES_ENABLED && PLACES_PROVIDER !== "mock";

export const SUGGESTION_EPSILON = numFromEnv("SUGGESTION_EPSILON", 0.15);
export const SUGGESTION_RADIUS_METERS = Math.max(100, numFromEnv("SUGGESTION_RADIUS_METERS", 1000));
export const SUGGESTION_MIN_PUBLIC_RATING = Math.min(
  5,
  Math.max(0, numFromEnv("SUGGESTION_MIN_PUBLIC_RATING", 4.0)),
);
