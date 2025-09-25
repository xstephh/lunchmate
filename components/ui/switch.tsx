import * as React from "react";

export function Switch({
  checked,
  onChange,
  id
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id?: string;
}) {
  return (
    <button
      id={id}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`inline-flex h-6 w-11 items-center rounded-full border transition ${
        checked ? "bg-primary border-primary" : "bg-secondary border-input"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-background transition ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}