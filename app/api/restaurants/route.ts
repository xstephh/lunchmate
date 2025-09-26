// app/api/restaurants/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseCsv(q: string | null): string[] {
  if (!q) return [];
  return q
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cuisineSlugs = parseCsv(searchParams.get("cuisines"));
  const tagSlugs = parseCsv(searchParams.get("tags"));

  // Build join-based filters (does not rely on legacy enum)
  const whereJoin: any = {};

  if (cuisineSlugs.length) {
    whereJoin.cuisines = {
      some: { cuisine: { slug: { in: cuisineSlugs } } },
    };
  }
  if (tagSlugs.length) {
    whereJoin.tags = {
      some: { tag: { slug: { in: tagSlugs } } },
    };
  }

  const restaurants = await prisma.restaurant.findMany({
    where: whereJoin,
    include: {
      cuisines: { include: { cuisine: true } },
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ items: restaurants });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const {
    name,
    address,
    priceLevel,
    lat,
    lng,
    cuisineSlugs = [] as string[],
    tagSlugs = [] as string[],
  } = body ?? {};

  if (!name || !address) {
    return NextResponse.json({ error: "name and address required" }, { status: 400 });
  }

  // Resolve slugs → ids
  const cuisines = cuisineSlugs.length
    ? await prisma.cuisine.findMany({ where: { slug: { in: cuisineSlugs } }, select: { id: true } })
    : [];
  const tags = tagSlugs.length
    ? await prisma.tag.findMany({ where: { slug: { in: tagSlugs } }, select: { id: true } })
    : [];

  const created = await prisma.restaurant.create({
    data: {
      name,
      address,
      priceLevel: priceLevel ?? null,
      lat: lat ?? null,
      lng: lng ?? null,
      source: "manual",
      cuisines: cuisines.length
        ? { create: cuisines.map((c) => ({ cuisineId: c.id })) }
        : undefined,
      tags: tags.length ? { create: tags.map((t) => ({ tagId: t.id })) } : undefined,
    },
    include: {
      cuisines: { include: { cuisine: true } },
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(created, { status: 201 });
}
