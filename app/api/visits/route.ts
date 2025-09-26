import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VisitCreateSchema } from "@/lib/schema";
import { slugify } from "@/lib/slug";

// POST /api/visits
export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = VisitCreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;

    // Ensure restaurant exists (if called with place info)
    let restaurantId = data.restaurantId ?? null;

    if (!restaurantId && data.place) {
      // Find by placeId or by name+address
      let existing = data.place.placeId
        ? await prisma.restaurant.findUnique({ where: { placeId: data.place.placeId } })
        : await prisma.restaurant.findFirst({
            where: { name: data.place.name, address: data.place.address },
          });

      if (!existing) {
        existing = await prisma.restaurant.create({
          data: {
            name: data.place.name,
            address: data.place.address,
            lat: data.place.lat ?? null,
            lng: data.place.lng ?? null,
            priceLevel: data.place.priceLevel ?? null,
            source: data.place.source ?? "manual",
            placeId: data.place.placeId ?? null,
            // DO NOT set legacy enum `cuisine`
          },
        });
      }
      restaurantId = existing.id;

      // Optional: attach cuisine (if provided on place) via M2M
      if (data.place.cuisine) {
        const slug = slugify(data.place.cuisine);
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
          where: { restaurantId_cuisineId: { restaurantId, cuisineId: c.id } },
          update: {},
          create: { restaurantId, cuisineId: c.id },
        });
      }
    }

    if (!restaurantId) {
      return NextResponse.json(
        { ok: false, error: "restaurantId or place is required" },
        { status: 400 },
      );
    }

    // Create the Visit
    const visit = await prisma.visit.create({
      data: {
        restaurantId,
        rating: data.rating,
        notes: data.notes ?? null,
      },
    });

    // Attach tags to the Restaurant (not Visit) if provided
    if (Array.isArray(data.tags) && data.tags.length > 0) {
      for (const raw of data.tags) {
        const name = String(raw);
        const slug = slugify(name);
        const tag = await prisma.tag.upsert({
          where: { slug },
          update: { name },
          create: { name, slug },
        });
        await prisma.restaurantTag.upsert({
          where: { restaurantId_tagId: { restaurantId, tagId: tag.id } },
          update: {},
          create: { restaurantId, tagId: tag.id },
        });
      }
    }

    return NextResponse.json({ ok: true, data: visit });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
