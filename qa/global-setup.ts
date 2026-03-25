import { chromium, type FullConfig } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const AUTH_DIR = path.join(__dirname, ".auth");
const STATE_PATH = path.join(AUTH_DIR, "state.json");

export default async function globalSetup(_config: FullConfig) {
  const email = process.env.QA_EMAIL;
  const password = process.env.QA_PASSWORD;
  if (!email || !password) {
    throw new Error("QA_EMAIL and QA_PASSWORD env vars are required");
  }

  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Sign in via Better Auth API
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
  const bypassToken = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  const baseHeaders: Record<string, string> = bypassToken
    ? { "x-vercel-protection-bypass": bypassToken }
    : {};

  const res = await page.request.post(`${baseUrl}/api/auth/sign-in/email`, {
    data: { email, password },
    headers: baseHeaders,
  });

  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Auth sign-in failed (${res.status()}): ${body}`);
  }

  // Save cookies + storage
  await context.storageState({ path: STATE_PATH });

  // Seed test data via API (context still holds session cookies)
  const seedHeaders: Record<string, string> = { ...baseHeaders };
  if (process.env.QA_SEED_SECRET) {
    seedHeaders["x-qa-seed-secret"] = process.env.QA_SEED_SECRET;
  }
  const seedRes = await page.request.post(`${baseUrl}/api/qa/seed`, {
    headers: seedHeaders,
  });
  if (!seedRes.ok()) {
    const body = await seedRes.text();
    throw new Error(`QA seed failed (${seedRes.status()}): ${body}`);
  }

  await browser.close();
}
