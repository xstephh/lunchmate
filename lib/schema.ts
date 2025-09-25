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

// lib/schema.ts (append to bottom)
export const VisitPlaceSchema = z.object({
  placeId: z.string().optional(),
  name: z.string().min(1),
  address: z.string().min(1),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  priceLevel: z.number().int().min(0).max(4).nullable().optional(),
  source: z.enum(["google", "mock", "manual"]).optional(),
  cuisine: CuisineEnum.optional(),
});

export const VisitCreateSchema = z
  .object({
    restaurantId: z.string().optional(),
    place: VisitPlaceSchema.optional(),
    rating: z.number().int().min(1).max(5),
    notes: z.string().max(500).optional(),
    tags: z.array(z.string().min(1)).max(10).optional(),
  })
  .refine((d) => !!d.restaurantId || !!d.place, {
    message: "restaurantId or place is required",
  });

export type VisitCreateInput = z.infer<typeof VisitCreateSchema>;
