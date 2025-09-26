// components/filters/MultiSelectPopover.client.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type Option = { label: string; value: string };

type Props = {
  label: string;
  options: Option[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  className?: string;
};

export default function MultiSelectPopover({
  label,
  options,
  value,
  onChange,
  placeholder = "Search…",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!q.trim()) return options;
    const needle = q.toLowerCase();
    return options.filter(
      (o) => o.label.toLowerCase().includes(needle) || o.value.toLowerCase().includes(needle),
    );
  }, [q, options]);

  const selectedLabels = useMemo(() => {
    const set = new Set(value);
    return options.filter((o) => set.has(o.value)).map((o) => o.label);
  }, [value, options]);

  function toggle(v: string) {
    const set = new Set(value);
    set.has(v) ? set.delete(v) : set.add(v);
    onChange(Array.from(set));
  }

  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Close on click outside
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!open) return;
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted/50"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-medium">{label}:</span>
        {selectedLabels.length ? (
          <span className="truncate max-w-[220px]">{selectedLabels.join(", ")}</span>
        ) : (
          <span className="text-muted-foreground">Any</span>
        )}
        <svg className="h-4 w-4 opacity-60" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M5.5 7l4.5 4.5L14.5 7" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          className={cn(
            // Make sure this surface is OPAQUE, not transparent
            "absolute left-0 z-50 mt-2 w-72 rounded-xl border bg-background p-2 shadow-xl ring-1 ring-border",
            // Safety: if parent has clipping, at least keep it on top
            "overflow-hidden",
          )}
        >
          <input
            placeholder={placeholder}
            className="mb-2 w-full rounded-md border bg-background px-2 py-1 text-sm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <ul role="listbox" className="max-h-64 overflow-auto text-sm">
            {filtered.length === 0 && (
              <li className="px-2 py-2 text-muted-foreground">No results</li>
            )}
            {filtered.map((o) => {
              const checked = value.includes(o.value);
              return (
                <li key={o.value}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={checked}
                      onChange={() => toggle(o.value)}
                    />
                    <span>{o.label}</span>
                  </label>
                </li>
              );
            })}
          </ul>

          <div className="mt-2 flex items-center justify-between gap-2">
            <button
              className="rounded-md border px-2 py-1 text-xs hover:bg-muted/50"
              onClick={() => onChange([])}
            >
              Clear
            </button>
            <button
              className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground"
              onClick={() => setOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
