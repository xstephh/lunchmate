// app/api/import/route.ts
import { NextResponse } from "next/server";
import Papa from "papaparse";
import { prisma } from "@/lib/prisma";
import { ImportPayloadSchema } from "@/lib/schema";

type Row = {
  name: string;
  cuisine: "japanese" | "hong_kong" | "western" | "healthy" | "other";
  address: string;
  lat?: number | string;
  lng?: number | string;
  price_level?: number | string;
  source?: "manual";
};

function normalizeRow(r: Row) {
  const priceLevel =
    r.price_level === undefined || r.price_level === ""
      ? null
      : typeof r.price_level === "string"
      ? Number(r.price_level)
      : r.price_level;
  const lat = r.lat === undefined || r.lat === "" ? null : Number(r.lat);
  const lng = r.lng === undefined || r.lng === "" ? null : Number(r.lng);
  return {
    name: String(r.name).trim(),
    cuisine: r.cuisine,
    address: String(r.address).trim(),
    priceLevel: priceLevel ?? null,
    lat,
    lng,
    source: "manual" as const,
  };
}

export async function POST(req: Request) {
  try {
    const ctype = req.headers.get("content-type") || "";
    let rows: Row[] = [];

    if (ctype.includes("multipart/form-data")) {
      const form = await req.formData();
      const f = form.get("file");
      const j = form.get("json");
      if (f && typeof f === "object" && "text" in f) {
        const text = await (f as File).text();
        const parsed = Papa.parse<Row>(text, { header: true, skipEmptyLines: true });
        if (parsed.errors.length) {
          return NextResponse.json(
            { created: 0, updated: 0, errors: parsed.errors.length },
            { status: 400 },
          );
        }
        rows = parsed.data;
      } else if (typeof j === "string" && j.trim().length) {
        const json = JSON.parse(j);
        const payload = ImportPayloadSchema.parse({ json });
        rows = (payload.json ?? []) as Row[];
      } else {
        return new NextResponse("No file or json provided", { status: 400 });
      }
    } else {
      // raw JSON body
      const body = await req.json();
      const payload = ImportPayloadSchema.parse(body);
      rows = (payload.json ?? []) as Row[];
    }

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const r of rows) {
      try {
        const n = normalizeRow(r);
        if (!n.name || !n.address || !n.cuisine) {
          errors++;
          continue;
        }
        const placeId = `${n.name}::${n.address}`;
        const res = await prisma.restaurant.upsert({
          where: { placeId },
          update: {
            name: n.name,
            cuisine: n.cuisine,
            address: n.address,
            priceLevel: n.priceLevel,
            lat: n.lat,
            lng: n.lng,
            source: "manual",
          },
          create: {
            name: n.name,
            cuisine: n.cuisine,
            address: n.address,
            priceLevel: n.priceLevel,
            lat: n.lat,
            lng: n.lng,
            source: "manual",
            placeId,
          },
        });
        if (res.createdAt.getTime() === res.updatedAt.getTime()) created++;
        else updated++;
      } catch {
        errors++;
      }
    }

    return NextResponse.json({ created, updated, errors });
  } catch (e: any) {
    return new NextResponse(e?.message || "Import error", { status: 400 });
  }
}
