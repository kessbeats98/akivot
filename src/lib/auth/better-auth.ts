import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/db/drizzle";
import * as schema from "@/db/schema";
import { config } from "@/lib/config";

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
    sendResetPassword: async (data) => {
      // TODO TASK-03-email: wire transactional email (Resend / Nodemailer)
      console.info("[reset-password] url=", data.url, "user=", data.user.email);
    },
  },
  emailVerification: {
    sendVerificationEmail: async (data) => {
      // TODO TASK-03-email: wire transactional email
      console.info("[verify-email] url=", data.url, "user=", data.user.email);
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
