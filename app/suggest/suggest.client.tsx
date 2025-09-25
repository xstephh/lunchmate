"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

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

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState("");
  const [tagsText, setTagsText] = useState("quick, healthy");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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
          // fall through; we'll call without lat/lng (works with mock provider)
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
      setShowForm(false);
      setNotes("");
      setTagsText("quick, healthy");
      setRating(5);
    } catch (e: any) {
      setErr(e.message || "Failed to get suggestion");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPick(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, cuisine]);

  async function submitVisit() {
    if (!pick) return;
    setSubmitting(true);
    setErr(null);
    try {
      const tags = tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload =
        pick.source === "manual"
          ? {
              restaurantId: pick.id,
              rating,
              notes,
              tags,
            }
          : {
              place: {
                placeId: pick.id,
                name: pick.name,
                address: pick.address,
                lat: pick.lat,
                lng: pick.lng,
                priceLevel: pick.priceLevel ?? null,
                source: pick.source,
                // We don't know cuisine reliably for Google; keep optional.
              },
              rating,
              notes,
              tags,
            };

      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to create visit");
      }
      setToast("Visit saved. See History for details.");
      setShowForm(false);
    } catch (e: any) {
      setErr(e.message || "Submit error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      {loading && <p className="text-sm text-muted-foreground">Picking...</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
      {toast && <p className="text-sm text-green-600">{toast}</p>}
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
            <Button variant="outline" onClick={() => setShowForm((s) => !s)}>
              {showForm ? "Cancel" : "I went (rate)"}
            </Button>
          </div>

          {showForm && (
            <div className="mt-3 rounded-xl border p-3 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Your rating:</span>
                <StarRating value={rating} onChange={setRating} />
                <span className="text-xs text-muted-foreground ml-2">{rating}/5</span>
              </div>

              <div>
                <label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Quick lunch, nice salad, friendly staff"
                />
              </div>

              <div>
                <label htmlFor="tags" className="text-sm font-medium">
                  Tags (comma-separated)
                </label>
                <input
                  id="tags"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="quick, healthy, spicy"
                />
              </div>

              <div className="flex gap-2">
                <Button disabled={submitting} onClick={submitVisit}>
                  {submitting ? "Saving..." : "Save visit"}
                </Button>
                <a href="/history" className="text-sm underline self-center">
                  Go to History →
                </a>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          aria-label={`Rate ${i}`}
          className="p-1"
          onClick={() => onChange(i)}
        >
          <Star
            size={18}
            className={i <= value ? "fill-yellow-400 stroke-yellow-400" : "stroke-muted-foreground"}
          />
        </button>
      ))}
    </div>
  );
}
