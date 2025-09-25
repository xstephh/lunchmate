// components/common/EmptyState.tsx
import React from "react";

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-8 text-center text-sm text-muted-foreground">
      <div className="font-medium text-foreground mb-1">{title}</div>
      {children}
    </div>
  );
}
