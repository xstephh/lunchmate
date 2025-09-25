"use client";

import React, { useState } from "react";
import { CUISINE_OPTIONS } from "@/lib/cuisine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export function AddRestaurantForm() {
  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("japanese");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          cuisine,
          address,
          priceLevel: typeof price === "string" ? undefined : price,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to create restaurant");
      }
      setName("");
      setAddress("");
      setPrice("");
      router.refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="r_name">Name</Label>
          <Input
            id="r_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sakura Bento"
            required
          />
        </div>
        <div>
          <Label htmlFor="r_cuisine">Cuisine</Label>
          <Select
            id="r_cuisine"
            value={cuisine}
            onChange={(v) => setCuisine(v)}
            options={CUISINE_OPTIONS}
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="r_addr">Address</Label>
          <Input
            id="r_addr"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="12 Sushi St"
            required
          />
        </div>
        <div>
          <Label htmlFor="r_price">Price level (0–4)</Label>
          <Input
            id="r_price"
            type="number"
            min={0}
            max={4}
            value={price}
            onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="2"
          />
        </div>
      </div>
      {err && <p className="text-red-600 text-sm">{err}</p>}
      <div className="pt-1">
        <Button disabled={submitting} type="submit">
          {submitting ? "Adding..." : "Add restaurant"}
        </Button>
      </div>
    </form>
  );
}
