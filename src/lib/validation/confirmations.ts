import { z } from "zod";

export const requestConfirmationSchema = z.object({
  dogId: z.string().uuid(),
});

export const answerConfirmationSchema = z.object({
  dogId: z.string().uuid(),
  answer: z.enum(["CONFIRMED", "NOT_NEEDED", "UNSURE"]),
});

export type RequestConfirmationInput = z.infer<typeof requestConfirmationSchema>;
export type AnswerConfirmationInput = z.infer<typeof answerConfirmationSchema>;
