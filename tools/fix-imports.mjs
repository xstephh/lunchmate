// tools/fix-imports.mjs
import { promises as fs } from "node:fs";
import { globby } from "globby";
import path from "node:path";

const ROOT = process.cwd();
const files = await globby([
  "**/*.{ts,tsx}",
  "!node_modules/**",
  "!.next/**",
  "!prisma/migrations/**",
]);

const ABSOLUTE_PREFIX = "/Users/";
let changed = 0;

for (const file of files) {
  const p = path.join(ROOT, file);
  let s = await fs.readFile(p, "utf8");
  const before = s;

  // 1) Specific common case: absolute utils path -> "@/lib/utils"
  s = s.replace(/from ["']\/Users\/[^"']+\/lib\/utils["']/g, 'from "@/lib/utils"');

  // 2) Generic absolute -> "@/<captured>"  (e.g., "/Users/xyz/project/<something>")
  s = s.replace(/from ["']\/Users\/[^"']+\/([^"']+)["']/g, (_m, rel) => {
    // normalize Windows backslashes if any
    rel = rel.replace(/\\/g, "/");
    return `from "@/${rel}"`;
  });

  if (s !== before) {
    await fs.writeFile(p, s, "utf8");
    changed++;
    console.log("fixed:", file);
  }
}

console.log(`Done. Modified ${changed} file(s).`);
