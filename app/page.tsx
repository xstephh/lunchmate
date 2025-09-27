"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Select } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import Link from "next/link";

import MultiSelectPopover, { type Option } from "@/components/filters/MultiSelectPopover.client";

const MODES = [
  { value: "familiar", label: "Familiar (my list)" },
  { value: "fresh", label: "Fresh (new & nearby)" },
  { value: "mixed", label: "Mixed" },
] as const;

// Keep legacy single-select cuisine (back-compat + tests)
const CUISINES = [
  { value: "any", label: "Any" },
  { value: "japanese", label: "Japanese" },
  { value: "hong_kong", label: "Hong Kong Style" },
  { value: "western", label: "Western" },
  { value: "healthy", label: "Healthy" },
] as const;

async function fetchTags(): Promise<Option[]> {
  const res = await fetch("/api/tags", { cache: "no-store" });
  const json = await res.json();
  const items = (json.items ?? []) as Array<{ name: string; slug: string }>;
  return items.map((i) => ({ label: i.name, value: i.slug }));
}

export default function HomePage() {
  const [mode, setMode] = useState<string>("familiar");
  const [cuisine, setCuisine] = useState<string>("any");

  // optional Tag multi-select
  const [tagOptions, setTagOptions] = useState<Option[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  // preserved for link, don’t remove if downstream expects it
  const [rememberLoc, setRememberLoc] = useState(false);

  useEffect(() => {
    fetchTags()
      .then(setTagOptions)
      .catch(() => setTagOptions([]));
  }, []);

  const findQuery = useMemo(() => {
    const q: Record<string, string> = { mode, cuisine, rememberLoc: String(rememberLoc) };
    if (tags.length) q.tags = tags.join(","); // cuisine AND all selected tags
    return q;
  }, [mode, cuisine, rememberLoc, tags]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>What’s for lunch?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="mode">Mode</Label>
              <div className="mt-2">
                <Select
                  id="mode"
                  value={mode}
                  onChange={setMode}
                  options={MODES as unknown as { value: string; label: string }[]}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="cuisine">Cuisine</Label>
              <div className="mt-2">
                <Select
                  id="cuisine"
                  value={cuisine}
                  onChange={setCuisine}
                  options={CUISINES as unknown as { value: string; label: string }[]}
                />
              </div>
            </div>
          </div>

          {/* Only Tags multi-select (optional) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="text-xs text-muted-foreground">Filter:</span>
            <MultiSelectPopover label="Tags" options={tagOptions} value={tags} onChange={setTags} />
          </div>

          <Separator className="my-2" />

          <div className="text-sm text-muted-foreground">
            <p></p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              Radius: <b>1000m</b> (default)
            </div>
            <Link href={{ pathname: "/suggest", query: findQuery }}>
              <Button>Find a place</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
