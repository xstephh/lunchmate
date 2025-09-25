// lib/schema.ts
import { z } from "zod";

export const CuisineEnum = z.enum(["japanese", "hong_kong", "western", "healthy", "other"]);
export const SourceEnum = z.enum(["manual", "google"]);

export const RestaurantCreateSchema = z.object({
  name: z.string().min(1),
  cuisine: CuisineEnum,
  address: z.string().min(1),
  priceLevel: z.number().int().min(0).max(4).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export type RestaurantCreate = z.infer<typeof RestaurantCreateSchema>;

export const RestaurantUpdateSchema = RestaurantCreateSchema.partial().extend({
  id: z.string().min(1),
});

export const ImportPayloadSchema = z.object({
  // For JSON import via textarea
  json: z
    .array(
      z.object({
        name: z.string(),
        cuisine: CuisineEnum,
        address: z.string(),
        price_level: z.number().int().min(0).max(4).optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        source: z.literal("manual").optional(),
      }),
    )
    .optional(),
});
