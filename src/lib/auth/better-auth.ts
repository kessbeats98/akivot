// Better Auth config skeleton.
// TASK-03 completes this with email verification plugin, password reset, and schema.
// Not activated at runtime in TASK-01 — auth route is a 501 stub until TASK-03.
//
// Decision: database sessions (not JWT) — walker sessions are long-lived;
// DB sessions allow immediate revocation if a device is lost. (impl rule 7)
//
// TODO TASK-03: import betterAuth, wire drizzleAdapter(getDb(), { provider: "pg" }),
//              add emailAndPassword plugin, email verification, password reset.

export const authConfig = {
  sessionStrategy: "database" as const,
  emailAndPassword: { enabled: true },
} as const;
