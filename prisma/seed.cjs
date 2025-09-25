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

async function main() {
  // Upsert sample tags (optional)
  const quick = await prisma.tag.upsert({
    where: { userId_name: { userId: null, name: "quick" } },
    update: {},
    create: { name: "quick" },
  });
  const healthy = await prisma.tag.upsert({
    where: { userId_name: { userId: null, name: "healthy" } },
    update: {},
    create: { name: "healthy" },
  });

  // Seed restaurants
  for (const r of sampleRestaurants) {
    await prisma.restaurant.upsert({
      where: { placeId: r.placeId ?? `${r.name}::${r.address}` }, // synthetic unique when no placeId
      update: {},
      create: {
        ...r,
        // store synthetic placeId for manual entries to help dedupe later
        placeId: `${r.name}::${r.address}`,
      },
    });
  }

  // Add one sample visit
  const rest = await prisma.restaurant.findFirst({ where: { name: "Green Bowl" } });
  if (rest) {
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

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
