import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

// GET /api/restaurants?cuisine=japanese or cuisines=japanese,western
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cuisineParam = searchParams.get("cuisine");
  const cuisinesParam = searchParams.get("cuisines");

  const slugs = new Set<string>();
  if (cuisineParam) slugs.add(slugify(cuisineParam));
  if (cuisinesParam) {
    cuisinesParam
      .split(",")
      .map((s) => slugify(s))
      .filter(Boolean)
      .forEach((s) => slugs.add(s));
  }

  const where: any = {};
  if (slugs.size > 0) {
    where.cuisines = {
      some: {
        cuisine: { slug: { in: Array.from(slugs) } },
      },
    };
  }

  const data = await prisma.restaurant.findMany({
    where,
    include: {
      cuisines: { include: { cuisine: true } },
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ ok: true, data });
}

// POST /api/restaurants  (create a manual restaurant & link cuisines by slug)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      address,
      lat = null,
      lng = null,
      priceLevel = null,
      source = "manual",
      placeId = null,
      cuisines = [] as string[] | undefined,
    } = body || {};

    if (!name || !address) {
      return NextResponse.json(
        { ok: false, message: "name and address required" },
        { status: 400 },
      );
    }

    const created = await prisma.restaurant.create({
      data: {
        name,
        address,
        lat: typeof lat === "number" ? lat : null,
        lng: typeof lng === "number" ? lng : null,
        priceLevel: typeof priceLevel === "number" ? priceLevel : null,
        source,
        placeId,
        // DO NOT set legacy enum field `cuisine`
      },
    });

    // link cuisines if provided
    if (Array.isArray(cuisines) && cuisines.length > 0) {
      for (const raw of cuisines) {
        const slug = slugify(raw);
        const cname = slug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        const c = await prisma.cuisine.upsert({
          where: { slug },
          update: { name: cname },
          create: { name: cname, slug },
        });
        await prisma.restaurantCuisine.upsert({
          where: { restaurantId_cuisineId: { restaurantId: created.id, cuisineId: c.id } },
          update: {},
          create: { restaurantId: created.id, cuisineId: c.id },
        });
      }
    }

    return NextResponse.json({ ok: true, data: created });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
