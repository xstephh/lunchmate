// app/api/visits/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VisitCreateSchema } from "@/lib/schema";
import type { Cuisine as PCuisine, Source } from "@prisma/client";

function normalizeTagName(name: string) {
  return name.toLowerCase().trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = VisitCreateSchema.parse(body);

    // Resolve restaurantId from either existing id or an upsert from "place"
    let restaurantId = parsed.restaurantId ?? null;

    if (!restaurantId && parsed.place) {
      const p = parsed.place;
      const placeId = p.placeId ?? `${p.name}::${p.address}`;
      const cuisine = (p.cuisine ?? "other") as unknown as PCuisine;
      const source = (p.source ?? "google") as Source;

      const upserted = await prisma.restaurant.upsert({
        where: { placeId },
        update: {
          name: p.name,
          address: p.address,
          lat: p.lat ?? null,
          lng: p.lng ?? null,
          priceLevel: p.priceLevel ?? null,
          cuisine,
          source,
        },
        create: {
          name: p.name,
          address: p.address,
          lat: p.lat ?? null,
          lng: p.lng ?? null,
          priceLevel: p.priceLevel ?? null,
          cuisine,
          source,
          placeId,
        },
      });
      restaurantId = upserted.id;
    }

    if (!restaurantId) {
      return new NextResponse("restaurantId or place required", { status: 400 });
    }

    // Tags: find-or-create for each tag name (public tags; userId=null seam)
    const tagNames = (parsed.tags ?? []).map(normalizeTagName).filter(Boolean);
    const tagIds: string[] = [];

    for (const name of tagNames) {
      const existing = await prisma.tag.findFirst({ where: { userId: null, name } });
      if (existing) tagIds.push(existing.id);
      else {
        const created = await prisma.tag.create({ data: { name } });
        tagIds.push(created.id);
      }
    }

    // Create visit + tag links
    const visit = await prisma.visit.create({
      data: {
        restaurantId,
        rating: parsed.rating,
        notes: parsed.notes ?? null,
        tags: { create: tagIds.map((id) => ({ tagId: id })) },
      },
    });

    return NextResponse.json({ id: visit.id }, { status: 201 });
  } catch (e: any) {
    return new NextResponse(e?.message || "Visit create error", { status: 400 });
  }
}
