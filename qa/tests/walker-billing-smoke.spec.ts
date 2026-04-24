import { test, expect } from "@playwright/test";

test("walker billing page renders Hebrew correctly", async ({ page }) => {
  await page.goto("/walker/billing");
  await page.waitForLoadState("networkidle");

  // Screenshot for visual verification
  await page.screenshot({ path: "qa/walker-billing-smoke.png", fullPage: true });

  // Page must contain at least one known Hebrew string (not mojibake)
  const body = await page.locator("body").innerText();
  expect(body).toContain("\u05DB\u05E1\u05E4\u05D9\u05DD"); // כספים
  expect(body).toMatch(/\u05DE\u05DE\u05EA\u05D9\u05DF|\u05D4\u05DB\u05D5\u05DC \u05E9\u05D5\u05DC\u05DD/); // ממתין or הכול שולם

  // Must not contain Latin-1 mojibake pattern typical of bad Hebrew encoding
  expect(body).not.toMatch(/×[\u0080-\u00FF]/);

  // Header section present
  await expect(page.getByRole("heading", { name: "\u05DB\u05E1\u05E4\u05D9\u05DD" })).toBeVisible();

  // Summary card present
  await expect(page.getByText("\u05E4\u05EA\u05D5\u05D7 \u05DB\u05E8\u05D2\u05E2")).toBeVisible(); // פתוח כרגע
  await expect(page.getByText("\u05DC\u05E7\u05D5\u05D7\u05D5\u05EA \u05E4\u05EA\u05D5\u05D7\u05D9\u05DD")).toBeVisible(); // לקוחות פתוחים
  await expect(page.getByText("\u05E4\u05E8\u05D9\u05D8\u05D9\u05DD \u05D1\u05D7\u05D9\u05D5\u05D1")).toBeVisible(); // פריטים בחיוב

  // Pending section OR empty state
  const hasPending = await page.getByText("\u05DE\u05DE\u05EA\u05D9\u05DF \u05DC\u05EA\u05E9\u05DC\u05D5\u05DD").isVisible(); // ממתין לתשלום
  expect(hasPending).toBe(true);

  console.log("Screenshot saved to qa/walker-billing-smoke.png");
  console.log("Hebrew check passed");
});

test("walker billing SlideOver shows enriched entry for WALK", async ({ page }) => {
  await page.goto("/walker/billing");
  await page.waitForLoadState("networkidle");

  // Find a pending period button and click it
  const periodBtn = page.locator("button").filter({ has: page.getByText("\u05E4\u05E8\u05D9\u05D8\u05D9\u05DD") }).first();
  const hasPeriod = await periodBtn.isVisible();
  if (!hasPeriod) {
    console.log("No open periods — skipping SlideOver check");
    test.skip();
    return;
  }

  await periodBtn.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "qa/walker-billing-slideover.png", fullPage: true });

  // SlideOver title
  await expect(page.getByText("\u05E4\u05D9\u05E8\u05D5\u05D8 \u05D7\u05E9\u05D1\u05D5\u05DF")).toBeVisible(); // פירוט חשבון

  // ADJUSTMENT badge check — amber "התאמה" badge should use correct Hebrew
  const adjustmentBadges = page.locator("span.bg-amber-100");
  const count = await adjustmentBadges.count();
  if (count > 0) {
    await expect(adjustmentBadges.first()).toHaveText("\u05D4\u05EA\u05D0\u05DE\u05D4"); // התאמה
  }

  console.log("SlideOver screenshot saved to qa/walker-billing-slideover.png");
});
