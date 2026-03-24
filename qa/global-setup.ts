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
  const res = await page.request.post(`${baseUrl}/api/auth/sign-in/email`, {
    data: { email, password },
  });

  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Auth sign-in failed (${res.status()}): ${body}`);
  }

  // Save cookies + storage
  await context.storageState({ path: STATE_PATH });
  await browser.close();
}
