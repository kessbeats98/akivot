import { z } from "zod";
import { uuidSchema } from "@/lib/validation/common";

export const assignWalkerSchema = z.object({
  dogId: uuidSchema,
  walkerProfileId: uuidSchema,
});

export const startWalkSchema = z.object({
  dogId: uuidSchema,
});

export const endWalkSchema = z.object({
  walkId: uuidSchema,
  finalPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Expected decimal with up to 2 places")
    .optional(),
  note: z.string().max(2000).optional(),
});

export type AssignWalkerInput = z.infer<typeof assignWalkerSchema>;
export type StartWalkInput = z.infer<typeof startWalkSchema>;
export type EndWalkInput = z.infer<typeof endWalkSchema>;
