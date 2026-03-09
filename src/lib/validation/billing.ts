import { z } from "zod";
import { uuidSchema } from "@/lib/validation/common";

export const setPriceSchema = z.object({
  dogWalkerId: uuidSchema,
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Expected decimal with up to 2 places"),
});

export const closePeriodSchema = z.object({
  periodId: uuidSchema,
  lockVersion: z.coerce.number().int().nonnegative(),
});

export type SetPriceInput = z.infer<typeof setPriceSchema>;
export type ClosePeriodInput = z.infer<typeof closePeriodSchema>;
