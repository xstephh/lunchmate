// app/api/restaurants/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RestaurantCreateSchema } from "@/lib/schema";
import { z } from "zod";
import { Prisma, Source, Cuisine as PCuisine } from "@prisma/client";

const ListQuery = z.object({
  cuisine: z.enum(["any", "japanese", "hong_kong", "western", "healthy", "other"]).optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = ListQuery.safeParse({
    cuisine: url.searchParams.get("cuisine") || undefined,
  });

  let where: Prisma.RestaurantWhereInput = { source: Source.manual };
  if (parsed.success && parsed.data.cuisine && parsed.data.cuisine !== "any") {
    where = { ...where, cuisine: parsed.data.cuisine as PCuisine };
  }

  const items = await prisma.restaurant.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RestaurantCreateSchema.parse(body);
    const placeId = `${parsed.name}::${parsed.address}`; // synthetic id for manual dedupe

    const created = await prisma.restaurant.upsert({
      where: { placeId },
      update: {
        name: parsed.name,
        cuisine: parsed.cuisine as unknown as PCuisine,
        address: parsed.address,
        priceLevel: parsed.priceLevel ?? null,
        lat: parsed.lat ?? null,
        lng: parsed.lng ?? null,
        source: Source.manual,
      },
      create: {
        name: parsed.name,
        cuisine: parsed.cuisine as unknown as PCuisine,
        address: parsed.address,
        priceLevel: parsed.priceLevel ?? null,
        lat: parsed.lat ?? null,
        lng: parsed.lng ?? null,
        source: Source.manual,
        placeId,
      },
    });

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (e: any) {
    return new NextResponse(e?.message || "Invalid payload", { status: 400 });
  }
}
