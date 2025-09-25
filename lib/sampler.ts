// lib/sampler.ts
import type { Restaurant, Visit } from "@prisma/client";

export type Candidate = {
  id: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  placeId?: string | null;
  cuisine?: string | null;
  source: "manual" | "google" | "mock";
  publicRating?: number | null;
  priceLevel?: number | null;
  // stats
  avgMyRating?: number | null;
  lastVisitedAt?: Date | null;
};

export type ScoreOptions = {
  epsilon: number; // exploration prob 0..1
};

function score(c: Candidate): number {
  // Base 1.0
  let w = 1;

  // Personal rating boost: avg 0..5 -> multiplier 1..2
  if (c.avgMyRating != null) {
    w *= 1 + Math.max(0, Math.min(5, c.avgMyRating)) / 5;
  }

  // Public rating boost: 0..5 -> multiplier 1..1.6
  if (c.publicRating != null) {
    w *= 1 + (c.publicRating / 5) * 0.6;
  }

  // Mild recency decay: if visited within 7 days, downweight ~40%
  if (c.lastVisitedAt) {
    const days = (Date.now() - c.lastVisitedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (days < 7) {
      w *= 0.6;
    } else if (days < 21) {
      w *= 0.85;
    }
  }

  return Math.max(0.0001, w);
}

export function sampleWeighted(cands: Candidate[], { epsilon }: ScoreOptions): Candidate | null {
  if (cands.length === 0) return null;
  // With prob epsilon: pure explore
  if (Math.random() < epsilon) {
    return cands[Math.floor(Math.random() * cands.length)];
  }

  // Exploit: weighted by score
  const weights = cands.map((c) => score(c));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < cands.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return cands[i]!;
  }
  return cands[cands.length - 1]!;
}

export function attachVisitStats(
  items: (Restaurant & { visits: Visit[] })[],
  publicRatingField?: keyof Restaurant,
): Candidate[] {
  return items.map((r) => {
    const avg =
      r.visits.length > 0 ? r.visits.reduce((s, v) => s + v.rating, 0) / r.visits.length : null;
    const last =
      r.visits.length > 0
        ? r.visits.reduce(
            (max, v) => (v.createdAt > max ? v.createdAt : max),
            r.visits[0]!.createdAt,
          )
        : null;

    return {
      id: r.id,
      name: r.name,
      address: r.address,
      lat: r.lat ?? null,
      lng: r.lng ?? null,
      placeId: r.placeId,
      cuisine: r.cuisine,
      source: r.source,
      publicRating: publicRatingField ? ((r as any)[publicRatingField] as number | null) : null,
      priceLevel: r.priceLevel ?? null,
      avgMyRating: avg,
      lastVisitedAt: last,
    };
  });
}
