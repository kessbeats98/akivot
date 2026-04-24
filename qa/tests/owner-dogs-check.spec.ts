import { test } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "https://akivot.vercel.app";
const OWNER_EMAIL = process.env.OWNER_EMAIL;
const OWNER_PASSWORD = process.env.OWNER_PASSWORD;

test("owner dogs page", async ({ browser }) => {
  test.skip(!OWNER_EMAIL || !OWNER_PASSWORD, "Requires OWNER_EMAIL and OWNER_PASSWORD in qa/.env.qa");

  const ctx = await browser.newContext({ storageState: undefined });
  const page = await ctx.newPage();
  await page.goto(`${BASE_URL}/login`);
  await page.locator('input[type="email"]').fill(OWNER_EMAIL!);
  await page.locator('input[type="password"]').fill(OWNER_PASSWORD!);
  await page.getByRole("button", { name: /כניסה/ }).click();
  await page.waitForURL(/dashboard|dogs/, { timeout: 15000 });
  await page.goto(`${BASE_URL}/owner/dogs`);
  await page.waitForTimeout(2000);
  console.log("URL:", page.url());
  const text = await page.evaluate(() => document.body.innerText);
  console.log("TEXT:\n" + text.substring(0, 1500));
  await page.screenshot({ path: "qa/cold-walkthrough/owner-dogs-page.png", fullPage: true });
  await ctx.close();
});
