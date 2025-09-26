// scripts/prepare_db_for_build.cjs
// If DATABASE_URL is SQLite, make sure the schema exists before building.

const { execSync } = require("node:child_process");

const url = process.env.DATABASE_URL || "";
const isSqlite = url.startsWith("file:") || url.startsWith("sqlite:");

if (!isSqlite) {
  console.log("[prisma] prepare_db_for_build: skipping (non-sqlite)");
  process.exit(0);
}

try {
  console.log("[prisma] prepare_db_for_build: applying migrations (sqlite)...");
  // Use migrate deploy (idempotent); if no migrations, fall back to db push
  try {
    execSync("pnpm exec prisma migrate deploy", { stdio: "inherit" });
  } catch {
    execSync("pnpm exec prisma db push", { stdio: "inherit" });
  }
  console.log("[prisma] prepare_db_for_build: done");
} catch (e) {
  console.error("[prisma] prepare_db_for_build: failed", e);
  process.exit(1);
}
