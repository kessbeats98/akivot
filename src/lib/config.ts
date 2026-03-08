export const config = {
  app: { url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000" },
  cron: { secret: process.env.CRON_SECRET, warnMinutes: 90, autoCloseMinutes: 120 },
  blob: { maxSizeBytes: 5 * 1024 * 1024 },
  walks: { maxDogsPerBatch: 5 },
} as const;
