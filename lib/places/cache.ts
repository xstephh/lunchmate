import { prisma } from "@/lib/prisma";

const ttlSeconds = Number(process.env.PLACES_CACHE_TTL_SECONDS ?? 86400);
const budgetProvider = (process.env.BUDGET_PROVIDER ?? "google").toLowerCase();
const dailyCap = Number(process.env.BUDGET_DAILY_REQUESTS ?? "0");

function roundCoord(n: number, precision = 3) {
  const f = Math.pow(10, precision);
  return Math.round(n * f) / f;
}

export function buildCacheKey(p: {
  provider: string;
  lat: number;
  lng: number;
  radius: number;
  q?: string;
}) {
  const lat = roundCoord(p.lat);
  const lng = roundCoord(p.lng);
  const q = (p.q ?? "").trim().toLowerCase();
  return `${p.provider}:${lat},${lng}:${p.radius}:${q}`;
}

export async function getCached(key: string) {
  const row = await prisma.placesCache.findUnique({ where: { key } });
  if (!row) return null;
  if (new Date(row.expiresAt).getTime() <= Date.now()) return null;
  return row.payload as unknown;
}

export async function setCached(key: string, provider: string, payload: unknown, ttl = ttlSeconds) {
  const expiresAt = new Date(Date.now() + ttl * 1000);
  await prisma.placesCache.upsert({
    where: { key },
    update: { payload: payload as any, expiresAt },
    create: {
      key,
      provider,
      payload: payload as any,
      expiresAt,
    },
  });
}

function todayKey(provider: string) {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `budget:${provider}:${y}-${m}-${day}`;
}

function endOfUtcDay(): Date {
  const d = new Date();
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

export async function incrementBudget(provider: string, inc = 1) {
  const key = todayKey(provider);
  const expiresAt = endOfUtcDay();
  const current = await prisma.placesCache.findUnique({ where: { key } });
  const count =
    typeof current?.payload === "object" && current?.payload && "count" in (current.payload as any)
      ? Number((current.payload as any).count ?? 0)
      : 0;

  await prisma.placesCache.upsert({
    where: { key },
    update: { payload: { count: count + inc } as any, expiresAt },
    create: { key, provider, payload: { count: inc } as any, expiresAt },
  });

  return count + inc;
}

export async function getBudget(provider: string) {
  const key = todayKey(provider);
  const current = await prisma.placesCache.findUnique({ where: { key } });
  const count =
    typeof current?.payload === "object" && current?.payload && "count" in (current.payload as any)
      ? Number((current.payload as any).count ?? 0)
      : 0;
  return count;
}

export async function withinBudget(provider: string, add = 1) {
  // Only enforce for the configured paid provider.
  if (dailyCap <= 0) return false;
  if (provider.toLowerCase() !== budgetProvider) return true;
  const current = await getBudget(provider);
  return current + add <= dailyCap;
}
