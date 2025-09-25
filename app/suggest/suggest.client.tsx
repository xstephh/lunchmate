"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type PickResult = {
  id: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  source: "manual" | "google" | "mock";
  publicRating?: number | null;
  priceLevel?: number | null;
} | null;

function mapsLink(name: string, address: string, lat?: number | null, lng?: number | null) {
  if (lat != null && lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${name} ${address}`,
  )}`;
}

export default function SuggestClient({ mode, cuisine }: { mode: string; cuisine: string }) {
  const [pick, setPick] = useState<PickResult>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const needsGeo = useMemo(() => mode !== "familiar", [mode]);

  async function fetchPick(useGeo = true) {
    setLoading(true);
    setErr(null);
    try {
      let lat: number | undefined;
      let lng: number | undefined;

      if (needsGeo && useGeo && typeof navigator !== "undefined" && "geolocation" in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
            }),
          );
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {
          // silent: we’ll fallback to API without lat/lng for mock provider
        }
      }

      const qs = new URLSearchParams({
        mode,
        cuisine,
        ...(lat != null && lng != null ? { lat: String(lat), lng: String(lng) } : {}),
      });
      const res = await fetch(`/api/suggest?${qs}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data === "string" ? data : "Suggest error");
      setPick(data.pick);
    } catch (e: any) {
      setErr(e.message || "Failed to get suggestion");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // initial fetch
    fetchPick(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, cuisine]);

  return (
    <div className="space-y-3">
      {loading && <p className="text-sm text-muted-foreground">Picking...</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
      {!loading && !pick && !err && (
        <p className="text-sm text-muted-foreground">No candidates found.</p>
      )}

      {pick && (
        <>
          <div className="text-lg font-semibold">{pick.name}</div>
          <div className="text-sm text-muted-foreground capitalize">{cuisine}</div>
          <div className="text-sm">{pick.address}</div>
          {pick.publicRating != null && (
            <div className="text-xs text-muted-foreground">
              Public rating: {pick.publicRating} ⭐
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button onClick={() => fetchPick(false)}>Reroll</Button>
            <a
              target="_blank"
              rel="noreferrer"
              href={mapsLink(pick.name, pick.address, pick.lat, pick.lng)}
            >
              <Button variant="outline">Open in Google Maps</Button>
            </a>
            <Button variant="outline" disabled title="Visit logging arrives in Phase 5">
              I went (rate)
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
