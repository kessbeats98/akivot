import { z } from "zod";

export const registerDeviceSchema = z.object({
  fcmToken: z.string().min(1),
  platform: z.enum(["WEB_DESKTOP"]),
});

export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;
