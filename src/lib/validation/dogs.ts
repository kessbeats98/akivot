import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
  .optional();

export const createDogSchema = z.object({
  name: z.string().min(1).max(100),
  breed: z.string().max(100).optional(),
  birthDate: isoDate,
  notes: z.string().max(1000).optional(),
});

export const deactivateDogSchema = z.object({
  dogId: z.string().uuid(),
});

export type CreateDogInput = z.infer<typeof createDogSchema>;
export type DeactivateDogInput = z.infer<typeof deactivateDogSchema>;
