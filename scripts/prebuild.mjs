// scripts/prebuild.mjs
import { execSync } from "node:child_process";
import { existsSync, copyFileSync } from "node:fs";

const isVercel = !!process.env.VERCEL; // Vercel sets VERCEL=1
const from = isVercel ? "prisma/schema.postgres.prisma" : "prisma/schema.sqlite.prisma";
const to = "prisma/schema.prisma";

if (!existsSync(from)) {
  console.error(`[prebuild] Missing schema file: ${from}`);
  process.exit(1);
}

copyFileSync(from, to);
console.log(`[prebuild] Using schema: ${from}`);

try {
  // Validate & generate Prisma Client for whichever schema we picked
  execSync("pnpm exec prisma validate", { stdio: "inherit" });
  execSync("pnpm exec prisma generate", { stdio: "inherit" });
} catch (err) {
  process.exit(1);
}
