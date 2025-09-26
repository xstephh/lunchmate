/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function ensureCuisines(items) {
  const results = [];
  for (const { name, slug } of items) {
    const row = await prisma.cuisine.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
    results.push(row);
  }
  return results;
}

async function ensureTags(items) {
  const results = [];
  for (const { name, slug } of items) {
    const row = await prisma.tag.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
    results.push(row);
  }
  return results;
}

/**
 * Find by (name,address) and create if missing.
 * Then connect cuisines/tags via join tables with upsert on composite keys.
 */
async function ensureRestaurant(data, { cuisineSlugs = [], tagSlugs = [] } = {}) {
  // IMPORTANT: we do NOT use upsert here because name is not unique.
  let restaurant = await prisma.restaurant.findFirst({
    where: { name: data.name, address: data.address },
  });
  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        name: data.name,
        address: data.address,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        priceLevel: data.priceLevel ?? null,
        source: data.source ?? "manual",
        placeId: data.placeId ?? null,
        averagePublicRating: data.averagePublicRating ?? null,
        // keep legacy cuisine column empty; we use M2M now
        cuisine: null,
      },
    });
  }

  // Link cuisines
  if (cuisineSlugs.length) {
    const cuisines = await prisma.cuisine.findMany({
      where: { slug: { in: cuisineSlugs } },
    });
    for (const c of cuisines) {
      await prisma.restaurantCuisine.upsert({
        where: {
          restaurantId_cuisineId: {
            restaurantId: restaurant.id,
            cuisineId: c.id,
          },
        },
        update: {},
        create: {
          restaurantId: restaurant.id,
          cuisineId: c.id,
        },
      });
    }
  }

  // Link tags
  if (tagSlugs.length) {
    const tags = await prisma.tag.findMany({
      where: { slug: { in: tagSlugs } },
    });
    for (const t of tags) {
      await prisma.restaurantTag.upsert({
        where: {
          restaurantId_tagId: {
            restaurantId: restaurant.id,
            tagId: t.id,
          },
        },
        update: {},
        create: { restaurantId: restaurant.id, tagId: t.id },
      });
    }
  }

  return restaurant;
}

async function main() {
  // Core cuisines
  await ensureCuisines([
    { name: "Japanese", slug: "japanese" },
    { name: "Hong Kong", slug: "hong-kong" },
    { name: "Healthy", slug: "healthy" },
    { name: "Western", slug: "western" },
  ]);

  // Core tags
  await ensureTags([
    { name: "Quick", slug: "quick" },
    { name: "Healthy", slug: "healthy" },
    { name: "Budget", slug: "budget" },
    { name: "Spicy", slug: "spicy" },
  ]);

  // Sample restaurants (manual source)
  await ensureRestaurant(
    {
      name: "Sushi Gen",
      address: "123 Tokyo St",
      lat: 35.68,
      lng: 139.76,
      priceLevel: 2,
      source: "manual",
    },
    { cuisineSlugs: ["japanese"], tagSlugs: ["quick"] },
  );

  await ensureRestaurant(
    {
      name: "Cafe Central",
      address: "456 Queen's Rd Central",
      lat: 22.281,
      lng: 114.158,
      priceLevel: 2,
      source: "manual",
    },
    { cuisineSlugs: ["hong-kong"], tagSlugs: ["budget"] },
  );

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
