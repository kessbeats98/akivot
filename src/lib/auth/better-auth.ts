import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/db/drizzle";
import * as schema from "@/db/schema";
import { config } from "@/lib/config";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email/resend";

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    usePlural: true,
    camelCase: true,
    schema,
  }),
  baseURL: config.app.url,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    sendResetPassword: async (data) => {
      await sendPasswordResetEmail({ user: data.user, url: data.url });
    },
  },
  emailVerification: {
    sendVerificationEmail: async (data) => {
      await sendVerificationEmail({ user: data.user, url: data.url });
    },
    sendOnSignUp: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,
  },
  advanced: {
    cookiePrefix: "ak",
  },
});
