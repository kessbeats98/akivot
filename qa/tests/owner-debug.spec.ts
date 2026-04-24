import { test } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "https://akivot.vercel.app";
const OWNER_EMAIL = process.env.OWNER_EMAIL;
const OWNER_PASSWORD = process.env.OWNER_PASSWORD;

test("owner dashboard debug", async ({ browser }) => {
  test.skip(!OWNER_EMAIL || !OWNER_PASSWORD, "Requires OWNER_EMAIL and OWNER_PASSWORD in qa/.env.qa");

  const ctx = await browser.newContext({ storageState: undefined });
  const page = await ctx.newPage();
  await page.goto(`${BASE_URL}/login`);
  await page.locator('input[type="email"], input[name="email"]').first().fill(OWNER_EMAIL!);
  await page.locator('input[type="password"], input[name="password"]').first().fill(OWNER_PASSWORD!);
  await page.getByRole("button", { name: /כניסה/i }).first().click();
  await page.waitForURL(/dashboard|onboarding/, { timeout: 15000 });
  await page.waitForTimeout(3000);
  console.log("URL:", page.url());
  const text = await page.evaluate(() => document.body.innerText);
  console.log("TEXT:\n" + text.substring(0, 3000));
  await page.screenshot({ path: "qa/cold-walkthrough/owner-dashboard-debug.png", fullPage: true });
  await ctx.close();
});
