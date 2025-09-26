// components/filters/CuisineTagFilter.client.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import MultiSelectPopover, { type Option } from "./MultiSelectPopover.client";

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json();
  const items = (json.items ?? []) as Array<{ name: string; slug: string }>;
  return items.map((i) => ({ label: i.name, value: i.slug }));
}

export default function CuisineTagFilter() {
  const [cuisineOptions, setCuisineOptions] = useState<Option[]>([]);
  const [tagOptions, setTagOptions] = useState<Option[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // initial values from URL
  const initialCuisines = useMemo(
    () => (searchParams.get("cuisines") || "").split(",").filter(Boolean),
    [searchParams],
  );
  const initialTags = useMemo(
    () => (searchParams.get("tags") || "").split(",").filter(Boolean),
    [searchParams],
  );

  const [cuisines, setCuisines] = useState<string[]>(initialCuisines);
  const [tags, setTags] = useState<string[]>(initialTags);

  useEffect(() => {
    fetchOptions("/api/cuisines").then(setCuisineOptions);
    fetchOptions("/api/tags").then(setTagOptions);
  }, []);

  // keep local state in sync when URL changes externally
  useEffect(() => {
    setCuisines(initialCuisines);
    setTags(initialTags);
  }, [initialCuisines, initialTags]);

  // push query params without full reload
  function syncQuery(nextCuisines: string[], nextTags: string[]) {
    const s = new URLSearchParams(searchParams.toString());
    if (nextCuisines.length) s.set("cuisines", nextCuisines.join(","));
    else s.delete("cuisines");
    if (nextTags.length) s.set("tags", nextTags.join(","));
    else s.delete("tags");
    router.replace(`${pathname}?${s.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CuisineChip />
      <MultiSelectPopover
        label="Cuisines"
        options={cuisineOptions}
        value={cuisines}
        onChange={(v) => {
          setCuisines(v);
          syncQuery(v, tags);
        }}
      />
      <MultiSelectPopover
        label="Tags"
        options={tagOptions}
        value={tags}
        onChange={(v) => {
          setTags(v);
          syncQuery(cuisines, v);
        }}
      />
    </div>
  );
}

function CuisineChip() {
  return (
    <span className="inline-flex select-none items-center rounded-full border px-2 py-1 text-xs text-muted-foreground">
      Filter
    </span>
  );
}
