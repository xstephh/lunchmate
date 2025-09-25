// lib/dedupe.ts
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\s,.-]+/g, " ")
    .trim();
}

export function isSameRestaurant(
  a: { name: string; address: string },
  b: { name: string; address: string },
) {
  return normalize(a.name) === normalize(b.name) && normalize(a.address) === normalize(b.address);
}
