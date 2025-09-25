import * as React from "react";
import { cn } from "/Users/stephanie/lunchmate/lib/utils";

export interface Option {
  value: string;
  label: string;
}

export function Select({
  value,
  onChange,
  options,
  id,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  id?: string;
  className?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm",
        className,
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
