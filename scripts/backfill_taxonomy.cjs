/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function slugify(s) {
  return (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  // 1) Backfill cuisines from legacy enum column if any remain
  const legacy = await prisma.restaurant.findMany({
    where: { cuisine: { not: null } },
    select: { id: true, cuisine: true },
  });

  const values = Array.from(
    new Set(
      legacy
        .map((r) => r.cuisine)
        .filter(Boolean)
        .map((x) => String(x).toLowerCase()),
    ),
  );

  console.log(`Found ${values.length} legacy cuisine values: ${JSON.stringify(values)}`);

  let links = 0;
  for (const v of values) {
    const name = v
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const slug = slugify(v);

    if (dryRun) {
      console.log(`[dry-run] would upsert Cuisine { name: "${name}", slug: "${slug}" }`);
      continue;
    }

    const c = await prisma.cuisine.upsert({
      where: { slug }, // ← slug is unique
      update: { name },
      create: { name, slug },
    });

    const needLink = legacy.filter((r) => String(r.cuisine).toLowerCase() === v);
    for (const r of needLink) {
      if (dryRun) {
        console.log(`[dry-run] would link restaurantId=${r.id} to cuisineId=${c.id}`);
      } else {
        await prisma.restaurantCuisine.upsert({
          where: { restaurantId_cuisineId: { restaurantId: r.id, cuisineId: c.id } },
          update: {},
          create: { restaurantId: r.id, cuisineId: c.id },
        });
      }
      links++;
    }
  }

  console.log(`Created ${dryRun ? 0 : links} RestaurantCuisine links`);

  // 2) Ensure default Tags exist (quick, healthy, budget, spicy)
  const defaultTags = ["quick", "healthy", "budget", "spicy"];
  for (const name of defaultTags) {
    const slug = slugify(name);
    if (dryRun) {
      console.log(`[dry-run] would upsert Tag { name: "${name}", slug: "${slug}" }`);
      continue;
    }
    await prisma.tag.upsert({
      where: { slug }, // ← slug is unique
      update: { name },
      create: { name, slug },
    });
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
