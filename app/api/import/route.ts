// app/api/import/route.ts
import { NextResponse } from "next/server";
import Papa from "papaparse";
import { prisma } from "@/lib/prisma";
import { ImportPayloadSchema } from "@/lib/schema";
import { slugify } from "@/lib/slug";

type Row = {
  name: string;
  cuisine: "japanese" | "hong_kong" | "western" | "healthy" | "other";
  address: string;
  lat?: number | string;
  lng?: number | string;
  price_level?: number | string;
  source?: "manual";
};

function normalizeRow(r: Row) {
  const priceLevel =
    r.price_level === undefined || r.price_level === ""
      ? null
      : typeof r.price_level === "string"
      ? Number(r.price_level)
      : r.price_level;
  const lat = r.lat === undefined || r.lat === "" ? null : Number(r.lat);
  const lng = r.lng === undefined || r.lng === "" ? null : Number(r.lng);
  return {
    name: String(r.name).trim(),
    cuisine: r.cuisine,
    address: String(r.address).trim(),
    priceLevel: priceLevel ?? null,
    lat,
    lng,
    source: "manual" as const,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const items: any[] = Array.isArray(body) ? body : Array.isArray(body.items) ? body.items : [];

    if (!items.length) {
      return NextResponse.json({ ok: false, message: "No items provided" }, { status: 400 });
    }

    let created = 0;
    let updated = 0;
    let linked = 0;

    for (const n of items) {
      // Normalize cuisines array
      const cuisineSlugs: string[] = Array.isArray(n.cuisines)
        ? n.cuisines.map((c: string) => slugify(c))
        : n.cuisine
        ? [slugify(String(n.cuisine))]
        : [];

      // Find existing by placeId first (unique), else by name+address pair
      let existing = n.placeId
        ? await prisma.restaurant.findUnique({ where: { placeId: n.placeId } })
        : await prisma.restaurant.findFirst({
            where: { name: n.name ?? "", address: n.address ?? "" },
          });

      if (existing) {
        await prisma.restaurant.update({
          where: { id: existing.id },
          data: {
            name: n.name ?? existing.name,
            address: n.address ?? existing.address,
            priceLevel: typeof n.priceLevel === "number" ? n.priceLevel : existing.priceLevel,
            lat: typeof n.lat === "number" ? n.lat : existing.lat,
            lng: typeof n.lng === "number" ? n.lng : existing.lng,
            source: (n.source as any) ?? existing.source,
            // DO NOT write legacy enum field `cuisine` anymore
          },
        });
        updated++;
      } else {
        existing = await prisma.restaurant.create({
          data: {
            name: n.name,
            address: n.address,
            priceLevel: typeof n.priceLevel === "number" ? n.priceLevel : null,
            lat: typeof n.lat === "number" ? n.lat : null,
            lng: typeof n.lng === "number" ? n.lng : null,
            source: (n.source as any) ?? "manual",
            placeId: n.placeId ?? null,
            // DO NOT set `cuisine`
          },
        });
        created++;
      }

      // Link cuisines (idempotent via composite key upsert)
      for (const slug of cuisineSlugs) {
        const name = slug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        const c = await prisma.cuisine.upsert({
          where: { slug },
          update: { name },
          create: { name, slug },
        });
        await prisma.restaurantCuisine.upsert({
          where: { restaurantId_cuisineId: { restaurantId: existing.id, cuisineId: c.id } },
          update: {},
          create: { restaurantId: existing.id, cuisineId: c.id },
        });
        linked++;
      }
    }

    return NextResponse.json({ ok: true, created, updated, linked });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
