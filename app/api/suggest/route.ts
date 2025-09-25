// app/api/suggest/route.ts
import { NextResponse } from "next/server";
import { createPlacesProvider } from "@/lib/providers";
import { fromPlaces, getFamiliar, getFresh, mergeMixed } from "@/lib/pipeline";
import { attachVisitStats, sampleWeighted } from "@/lib/sampler";
import {
  SUGGESTION_EPSILON,
  SUGGESTION_RADIUS_METERS,
  SUGGESTION_MIN_PUBLIC_RATING,
  PLACES_PROVIDER,
  PROVIDER_NETWORK_ENABLED,
} from "@/lib/env";
import { z } from "zod";

const Query = z.object({
  mode: z.enum(["familiar", "fresh", "mixed"]).default("familiar"),
  cuisine: z.enum(["any", "japanese", "hong_kong", "western", "healthy", "other"]).default("any"),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().optional(),
  epsilon: z.coerce.number().optional(),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = Query.parse({
      mode: url.searchParams.get("mode") ?? undefined,
      cuisine: url.searchParams.get("cuisine") ?? undefined,
      lat: url.searchParams.get("lat") ?? undefined,
      lng: url.searchParams.get("lng") ?? undefined,
      radius: url.searchParams.get("radius") ?? undefined,
      epsilon: url.searchParams.get("epsilon") ?? undefined,
    });

    const epsilon = parsed.epsilon ?? SUGGESTION_EPSILON;
    const cuisine = parsed.cuisine === "any" ? null : parsed.cuisine;

    // Familiar always available (DB)
    const familiarRaw = await getFamiliar(cuisine);
    const familiar = attachVisitStats(familiarRaw, "averagePublicRating");

    // Fresh uses provider (mock by default, google if you enable)
    let fresh: ReturnType<typeof fromPlaces> = [];
    if (parsed.mode !== "familiar") {
      if ((parsed.lat == null || parsed.lng == null) && PLACES_PROVIDER !== "mock") {
        // For real providers, we require location
        return new NextResponse("lat/lng required for fresh/mixed", { status: 400 });
      }
      const provider = createPlacesProvider();
      if (PLACES_PROVIDER !== "mock" && !PROVIDER_NETWORK_ENABLED) {
        // feature flag blocks network (keeps $0)
        fresh = [];
      } else if (parsed.lat != null && parsed.lng != null) {
        const freshRaw = await getFresh(provider, {
          lat: parsed.lat!,
          lng: parsed.lng!,
          radius: parsed.radius ?? SUGGESTION_RADIUS_METERS,
          cuisine: cuisine ?? undefined,
          minRating: SUGGESTION_MIN_PUBLIC_RATING,
        });
        fresh = fromPlaces(freshRaw);
      } else {
        // mock provider can work without lat/lng — return a few mocks
        const freshRaw = await provider.nearby({
          lat: 1.3001,
          lng: 103.8001,
          radius: parsed.radius ?? SUGGESTION_RADIUS_METERS,
          cuisine: cuisine ?? undefined,
          minRating: SUGGESTION_MIN_PUBLIC_RATING,
        });
        fresh = fromPlaces(freshRaw);
      }
    }

    // Choose candidates
    let candidates =
      parsed.mode === "familiar"
        ? familiar
        : parsed.mode === "fresh"
        ? fresh
        : mergeMixed(familiar, fresh, 0.5);

    // Final sample
    const pick = sampleWeighted(candidates, { epsilon });
    return NextResponse.json({
      pick,
      meta: {
        mode: parsed.mode,
        cuisine: parsed.cuisine,
        epsilon,
        counts: { familiar: familiar.length, fresh: fresh.length, total: candidates.length },
        provider: PLACES_PROVIDER,
        providerNetworkEnabled: PROVIDER_NETWORK_ENABLED,
      },
    });
  } catch (e: any) {
    return new NextResponse(e?.message || "Suggest error", { status: 400 });
  }
}
