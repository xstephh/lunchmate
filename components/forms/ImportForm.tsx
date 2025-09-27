// components/forms/ImportForm.tsx
"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

const CSV_HEADER = "name,cuisine,address,lat,lng,price_level,tags,source,place_id";
const JSON_EXAMPLE = `[
  {"name":"Sakura Bento","cuisine":"japanese","address":"12 Sushi St","price_level":2,"tags":"quick;spicy","source":"manual"},
  {"name":"Ramen Ichigo","cuisine":"japanese","address":"9 Baker Rd","lat":35.7,"lng":139.7,"source":"manual"}
]`;

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
      if (!res.ok) throw new Error("Import failed");

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
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Guide box */}
      <div className="rounded-xl border bg-card/60 p-4">
        <p className="font-medium">
          Accepted columns (CSV header keys). Only <b>name</b> and <b>address</b> are required:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
          <li>
            <code className="font-mono">name</code> — restaurant name (required)
          </li>
          <li>
            <code className="font-mono">address</code> — street / area (required)
          </li>
          <li>
            <code className="font-mono">lat</code>, <code className="font-mono">lng</code> — numbers
            (optional)
          </li>
          <li>
            <code className="font-mono">price_level</code> — integer 0–4 (optional)
          </li>
          <li>
            <code className="font-mono">cuisine</code> — free text (e.g. japanese, hong kong)
          </li>
          <li>
            <code className="font-mono">tags</code> — optional; semicolon separated (e.g. quick;
            spicy; budget)
          </li>
          <li>
            <code className="font-mono">source</code> — manual|google (default: manual)
          </li>
          <li>
            <code className="font-mono">place_id</code> — provider place id (optional)
          </li>
        </ul>

        <div className="mt-3 space-y-2 text-xs">
          <div className="overflow-x-auto">
            <span className="font-semibold">CSV header: </span>
            <code className="rounded bg-muted px-1 py-0.5 font-mono break-all inline-block min-w-0">
              {CSV_HEADER}
            </code>
          </div>

          <div className="rounded-md bg-muted p-2 font-mono">
            <div className="mb-1 font-semibold">CSV row:</div>
            <div className="overflow-x-auto">
              <code className="break-all inline-block min-w-0">
                {`Sakura Bento,japanese,12 Sushi St,35.68,139.76,2,"quick;spicy",manual,`}
              </code>
            </div>
          </div>

          <div className="rounded-md bg-muted p-2">
            <div className="mb-1 font-semibold">JSON array example:</div>
            <pre className="overflow-x-auto text-xs whitespace-pre-wrap break-words">
              {JSON_EXAMPLE}
            </pre>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <Label htmlFor="file">CSV file</Label>
          <Input
            id="file"
            ref={fileRef}
            type="file"
            accept=".csv"
            className="w-full"
            aria-describedby="csv-help"
          />
        </div>

        <div className="min-w-0 space-y-2">
          <Label htmlFor="json">Or JSON array</Label>
          <textarea
            id="json"
            className="h-28 w-full rounded-xl border border-input bg-background p-2 text-sm"
            placeholder='[{"name":"Sakura","cuisine":"japanese","address":"12 Sushi St","source":"manual"}]'
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />
        </div>

        <div id="csv-help" className="md:col-span-2 overflow-x-auto text-xs text-muted-foreground">
          Header should be: <code className="font-mono break-all inline-block">{CSV_HEADER}</code>
        </div>
      </div>

      <div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Importing..." : "Import"}
        </Button>
      </div>

      {message && (
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </form>
  );
}
