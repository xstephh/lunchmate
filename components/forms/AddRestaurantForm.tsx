"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function AddRestaurantForm() {
  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("japanese");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState<number | string>(2);

  async function submit() {
    const payload = {
      name,
      cuisine, // server maps to enum / joins as needed
      address,
      priceLevel: price === "" ? null : Number(price),
      source: "manual",
    };
    await fetch("/api/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setName("");
    setAddress("");
    setPrice(2);
    alert("Added.");
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 items-end gap-x-6 gap-y-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <input
            id="name"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Sakura Bento"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cuisine" className="inline-block mb-1">
            Cuisine
          </Label>
          <select
            id="cuisine"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
          >
            <option value="japanese">Japanese</option>
            <option value="hong_kong">Hong Kong</option>
            <option value="western">Western</option>
            <option value="healthy">Healthy</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="address">Address</Label>
          <input
            id="address"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="12 Sushi St"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="sm:col-span-1 space-y-2">
          <Label htmlFor="price">Price level (0–4)</Label>
          <input
            id="price"
            type="number"
            min={0}
            max={4}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      </div>

      <Button onClick={submit}>Add restaurant</Button>
    </div>
  );
}
