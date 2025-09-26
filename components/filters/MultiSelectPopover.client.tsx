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
  const panelRef = useRef<HTMLDivElement | null>(null);

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

  // close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className={cn("relative inline-block", className)}>
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
        <svg
          className="h-4 w-4 opacity-60"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.5 7l4.5 4.5L14.5 7" />
        </svg>
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          className={cn(
            "absolute z-50 mt-2 w-72 rounded-xl border shadow-xl",
            // solid white in light mode; tokenized popover in dark mode
            "bg-white text-foreground dark:bg-popover dark:text-popover-foreground",
          )}
        >
          <div className="p-3">
            <input
              placeholder={placeholder}
              className="mb-2 w-full rounded-md border px-2 py-1 text-sm bg-white dark:bg-background"
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

            <div className="mt-3 flex items-center justify-between gap-3 pt-1">
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
        </div>
      )}
    </div>
  );
}
