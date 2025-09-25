// lib/cuisine.ts
export type CuisineKey = "japanese" | "hong_kong" | "western" | "healthy" | "other";

export const CUISINE_LABELS: Record<CuisineKey, string> = {
  japanese: "Japanese",
  hong_kong: "Hong Kong Style",
  western: "Western",
  healthy: "Healthy",
  other: "Other",
};

export const CUISINE_OPTIONS: { value: CuisineKey; label: string }[] = Object.entries(
  CUISINE_LABELS,
).map(([value, label]) => ({ value: value as CuisineKey, label }));
