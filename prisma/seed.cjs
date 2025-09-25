/* prisma/seed.cjs */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const sampleRestaurants = [
  {
    name: "Sakura Bento",
    cuisine: "japanese",
    address: "12 Sushi St",
    priceLevel: 2,
    source: "manual",
  },
  {
    name: "Tea & Taste",
    cuisine: "hong_kong",
    address: "88 Nathan Rd",
    priceLevel: 1,
    source: "manual",
  },
  {
    name: "Green Bowl",
    cuisine: "healthy",
    address: "5 Leaf Ave",
    priceLevel: 2,
    source: "manual",
  },
  {
    name: "Toast & Co",
    cuisine: "western",
    address: "101 Bread Ln",
    priceLevel: 2,
    source: "manual",
  },
];

async function ensureTag(name) {
  // Composite unique with NULL can't be used in upsert `where`, so:
  const existing = await prisma.tag.findFirst({ where: { name, userId: null } });
  if (existing) return existing;
  return prisma.tag.create({ data: { name } });
}

async function ensureRestaurant(r) {
  const syntheticPlaceId = r.placeId ?? `${r.name}::${r.address}`;
  const existing = await prisma.restaurant.findUnique({
    where: { placeId: syntheticPlaceId },
  });
  if (existing) return existing;
  return prisma.restaurant.create({
    data: { ...r, placeId: syntheticPlaceId },
  });
}

async function main() {
  // Tags
  const quick = await ensureTag("quick");
  const healthy = await ensureTag("healthy");

  // Restaurants
  for (const r of sampleRestaurants) {
    await ensureRestaurant(r);
  }

  // One sample visit (idempotent: only create if missing)
  const rest = await prisma.restaurant.findFirst({ where: { name: "Green Bowl" } });
  if (rest) {
    const existingVisit = await prisma.visit.findFirst({
      where: { restaurantId: rest.id },
    });
    if (!existingVisit) {
      const visit = await prisma.visit.create({
        data: {
          restaurantId: rest.id,
          rating: 5,
          notes: "Healthy and quick lunch.",
          tags: {
            create: [{ tagId: healthy.id }, { tagId: quick.id }],
          },
        },
      });
      // eslint-disable-next-line no-console
      console.log("Seed visit:", visit.id);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
