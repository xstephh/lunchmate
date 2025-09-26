/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const target = process.env.PRISMA_TARGET || (process.env.VERCEL ? "pg" : "sqlite");
const src =
  target === "pg"
    ? path.join(root, "prisma", "schema.postgres.prisma")
    : path.join(root, "prisma", "schema.sqlite.prisma");
const dst = path.join(root, "prisma", "schema.prisma");

fs.copyFileSync(src, dst);
console.log(`[prisma] Using schema: ${path.relative(root, src)} -> schema.prisma`);
