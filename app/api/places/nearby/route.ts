import "server-only";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { nearbyPlaces } from "@/lib/places";

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  const radius = url.searchParams.get("radius");
  const q = url.searchParams.get("q") ?? undefined;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return bad("lat & lng are required numbers");
  }

  try {
    const result = await nearbyPlaces({
      lat,
      lng,
      radius: radius ? Number(radius) : undefined,
      q,
    });

    // Tiny metadata banner hints (client can show “Cost-safe mode” if fallback used)
    return NextResponse.json({
      provider: result.provider,
      usedFallback: result.usedFallback,
      fromCache: result.fromCache,
      count: result.data.length,
      results: result.data,
    });
  } catch (err: any) {
    return bad(err?.message ?? "Nearby failed", 500);
  }
}
