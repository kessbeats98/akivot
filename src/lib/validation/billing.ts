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

export const reopenPeriodSchema = z.object({
  periodId: uuidSchema,
  lockVersion: z.coerce.number().int().nonnegative(),
});

export type SetPriceInput = z.infer<typeof setPriceSchema>;
export type ClosePeriodInput = z.infer<typeof closePeriodSchema>;
export type ReopenPeriodInput = z.infer<typeof reopenPeriodSchema>;

export const proposePriceAgreementSchema = z.object({
  ownerUserId: z.string().min(1),
  walkerProfileId: uuidSchema,
  dogId: uuidSchema,
  proposedPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
  currency: z.string().length(3).optional(),
});

export const approvePriceAgreementSchema = z.object({
  agreementId: uuidSchema,
});

export const rejectPriceAgreementSchema = z.object({
  agreementId: uuidSchema,
});

export type ProposePriceAgreementInput = z.infer<typeof proposePriceAgreementSchema>;
export type ApprovePriceAgreementInput = z.infer<typeof approvePriceAgreementSchema>;
export type RejectPriceAgreementInput = z.infer<typeof rejectPriceAgreementSchema>;
