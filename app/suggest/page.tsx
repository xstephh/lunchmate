import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import SuggestClient from "./suggest.client";

function mapsLink(name: string, address: string, lat?: number | null, lng?: number | null) {
  if (lat != null && lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${name} ${address}`,
  )}`;
}

async function pickRandom(cuisine: string | null) {
  const where =
    cuisine && cuisine !== "any"
      ? { source: "manual" as const, cuisine: cuisine as any }
      : { source: "manual" as const };
  const all = await prisma.restaurant.findMany({ where });
  if (all.length === 0) return null;
  const idx = Math.floor(Math.random() * all.length);
  return all[idx]!;
}

export default async function SuggestPage({
  searchParams,
}: {
  searchParams: { mode?: string; cuisine?: string };
}) {
  const cuisine = (searchParams?.cuisine as string) || "any";
  // Phase 3: Familiar-only sampler
  const pick = await pickRandom(cuisine);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Today’s pick</CardTitle>
        </CardHeader>
        <CardContent>
          {!pick ? (
            <p className="text-sm text-muted-foreground">
              No results. Try adding restaurants in{" "}
              <Link href="/manage" className="underline">
                Manage
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-3">
              <div className="text-lg font-semibold">{pick.name}</div>
              <div className="text-sm text-muted-foreground capitalize">{pick.cuisine}</div>
              <div className="text-sm">{pick.address}</div>

              <div className="flex gap-2 pt-2">
                <Suspense>
                  <SuggestClient />
                </Suspense>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={mapsLink(
                    pick.name,
                    pick.address,
                    pick.lat ?? undefined,
                    pick.lng ?? undefined,
                  )}
                >
                  <Button variant="outline">Open in Google Maps</Button>
                </a>
                <Button variant="outline" disabled title="Visit logging arrives in Phase 5">
                  I went (rate)
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
