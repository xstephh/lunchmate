"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export function ImportForm() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [jsonText, setJsonText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const fd = new FormData();
      const file = fileRef.current?.files?.[0];
      if (file) fd.append("file", file);
      if (jsonText.trim()) fd.append("json", jsonText.trim());

      const res = await fetch("/api/import", { method: "POST", body: fd });
      const data = (await res.json()) as { created: number; updated: number; errors: number };
      if (!res.ok) {
        throw new Error("Import failed");
      }
      setMessage(
        `Import complete: created ${data.created}, updated ${data.updated}, errors ${data.errors}`,
      );
      router.refresh();
    } catch (err: any) {
      setMessage(err.message || "Import error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="file">CSV file</Label>
          <Input id="file" ref={fileRef} type="file" accept=".csv" />
          <p className="text-xs text-muted-foreground mt-1">
            Expected headers: name,cuisine,address,lat,lng,price_level
          </p>
        </div>
        <div>
          <Label htmlFor="json">Or JSON array</Label>
          <textarea
            id="json"
            className="h-28 w-full rounded-xl border border-input bg-background p-2 text-sm"
            placeholder='[{"name":"Sakura","cuisine":"japanese","address":"12 Sushi St","source":"manual"}]'
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />
        </div>
      </div>
      <div className="pt-1">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Importing..." : "Import"}
        </Button>
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </form>
  );
}
