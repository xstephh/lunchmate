"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Select } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import Link from "next/link";

const MODES = [
  { value: "familiar", label: "Familiar (my list)" },
  { value: "fresh", label: "Fresh (new & nearby)" },
  { value: "mixed", label: "Mixed" },
] as const;

const CUISINES = [
  { value: "any", label: "Any" },
  { value: "japanese", label: "Japanese" },
  { value: "hong_kong", label: "Hong Kong Style" },
  { value: "western", label: "Western" },
  { value: "healthy", label: "Healthy" },
] as const;

export default function HomePage() {
  const [mode, setMode] = useState<string>("familiar");
  const [cuisine, setCuisine] = useState<string>("any");
  const [rememberLoc, setRememberLoc] = useState(false);

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

          <Separator className="my-2" />

          <div className="text-sm text-muted-foreground">
            <p>
              Fresh mode uses official APIs. By default, it’s <b>disabled</b> to guarantee $0 cost.
              You can enable a provider later in settings/env.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              Radius: <b>1000m</b> (default) • Epsilon: <b>0.15</b>
            </div>
            <Link
              href={{
                pathname: "/suggest",
                query: { mode, cuisine, rememberLoc: String(rememberLoc) },
              }}
            >
              <Button>Find a place</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
