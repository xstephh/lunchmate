// lib/pipeline.ts
import { prisma } from "@/lib/prisma";
import type { PlacesProvider, Place } from "@/lib/providers/types";
import { isSameRestaurant } from "@/lib/dedupe";
import type { Candidate } from "@/lib/sampler";
import { Source, Prisma } from "@prisma/client";

export async function getFamiliar(cuisine?: string | null) {
  const where: Prisma.RestaurantWhereInput =
    cuisine && cuisine !== "any"
      ? { source: Source.manual, cuisine: cuisine as any }
      : { source: Source.manual };

  return prisma.restaurant.findMany({
    where,
    include: { visits: true },
    orderBy: { createdAt: "desc" },
  });
}

export function fromPlaces(places: Place[]): Candidate[] {
  return places.map((p) => ({
    id: p.placeId,
    name: p.name,
    address: p.address,
    lat: p.lat,
    lng: p.lng,
    placeId: p.placeId,
    cuisine: p.cuisine ?? null,
    source: p.source,
    publicRating: p.rating ?? null,
    priceLevel: p.priceLevel ?? null,
  }));
}

export async function getFresh(
  provider: PlacesProvider,
  params: { lat: number; lng: number; radius: number; cuisine?: string; minRating: number },
) {
  const results = await provider.nearby({
    lat: params.lat,
    lng: params.lng,
    radius: params.radius,
    cuisine: params.cuisine,
    minRating: params.minRating,
  });

  // remove items that already exist in DB (placeId match OR normalized name+address)
  const existing = await prisma.restaurant.findMany({
    select: { placeId: true, name: true, address: true },
  });

  const out: Place[] = [];
  for (const p of results) {
    const dup =
      existing.some((e) => e.placeId && p.placeId && e.placeId === p.placeId) ||
      existing.some((e) =>
        isSameRestaurant(
          { name: e.name, address: e.address },
          { name: p.name, address: p.address },
        ),
      );
    if (!dup) out.push(p);
  }
  return out;
}

export function mergeMixed(
  familiar: Candidate[],
  fresh: Candidate[],
  weightManual = 0.5,
): Candidate[] {
  // interleave based on weight; simple concat with tagging is fine; sampler will weight by rating anyway
  const total = familiar.length + fresh.length || 1;
  const targetManual = Math.round(total * weightManual);
  const manual = familiar.slice(0, targetManual);
  const newer = fresh.slice(0, total - manual.length);
  return [...manual, ...newer];
}
