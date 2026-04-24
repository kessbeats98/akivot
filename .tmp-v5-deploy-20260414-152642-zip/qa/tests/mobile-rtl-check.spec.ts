/**
 * Mobile RTL check — price form on dog profile
 * Uses the QA smoke account (pre-authed via globalSetup storageState).
 * Runs against LOCAL dev server only (not prod).
 */
import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

// iPhone 14 viewport, RTL — chromium only (no webkit dependency)
test.use({ viewport: { width: 390, height: 844 } });

test("mobile RTL: price form renders and decimal submit works", async ({ page }) => {
  // globalSetup already seeded 1 dog + walker assignment — go straight to owner dashboard
  await page.goto(`${BASE}/owner/dashboard`, { waitUntil: "load" });

  // Navigate to dogs management page, grab first dog-profile link
  await page.goto(`${BASE}/owner/dogs`, { waitUntil: "load" });
  const dogLink = page.locator('a[href*="/owner/dog-profile/"]').first();
  await expect(dogLink).toBeVisible({ timeout: 10_000 });
  const dogHref = await dogLink.getAttribute("href");
  if (!dogHref) throw new Error("No dog profile link found");

  await page.goto(`${BASE}${dogHref}`, { waitUntil: "load" });

  // Screenshot A: initial state
  await page.screenshot({ path: "test-results/mobile-rtl-initial.png", fullPage: false });

  // Price form must be visible for active walker
  const priceInput = page.locator('input[name="price"]').first();
  await expect(priceInput).toBeVisible({ timeout: 5_000 });

  const submitBtn   = page.locator("form").filter({ has: priceInput }).locator('button[type="submit"]');
  const defaultVal  = await priceInput.inputValue();
  const btnText     = (await submitBtn.textContent())?.trim() ?? "";

  // Warning should only appear when price is already set
  const warning = page.locator("p", { hasText: "שינוי מחיר ישפיע" });
  const warningVisible = await warning.isVisible().catch(() => false);

  console.log("initial defaultValue:", defaultVal);
  console.log("initial button label:", btnText);
  console.log("billing warning visible:", warningVisible);

  // Invariant: warning ↔ price already set
  if (defaultVal === "" || defaultVal === "0" || defaultVal === "0.00") {
    expect(warningVisible, "Warning must NOT show when price is zero").toBe(false);
    expect(btnText, "Button must say קבע מחיר").toBe("קבע מחיר");
  } else {
    expect(warningVisible, "Warning MUST show when price is already set").toBe(true);
    expect(btnText, "Button must say עדכן מחיר").toBe("עדכן מחיר");
  }

  // --- Decimal submit: enter 49.50 ---
  await priceInput.fill("49.50");
  await submitBtn.click();
  await page.waitForLoadState("networkidle");

  // Screenshot B: after submit
  await page.screenshot({ path: "test-results/mobile-rtl-after-submit.png", fullPage: false });

  // After submit: warning now visible, button says עדכן מחיר, input pre-filled
  const inputAfter = page.locator('input[name="price"]').first();
  await expect(inputAfter).toBeVisible({ timeout: 5_000 });
  const valAfter  = await inputAfter.inputValue();
  const btnAfter  = (await page.locator("form").filter({ has: inputAfter }).locator('button[type="submit"]').textContent())?.trim();
  const warnAfter = await page.locator("p", { hasText: "שינוי מחיר ישפיע" }).isVisible().catch(() => false);

  console.log("after submit — input value:", valAfter);
  console.log("after submit — button:", btnAfter);
  console.log("after submit — warning:", warnAfter);

  expect(valAfter, "Input must be pre-filled after price set").toMatch(/49\.?5/);
  expect(btnAfter, "Button must switch to עדכן מחיר").toBe("עדכן מחיר");
  expect(warnAfter, "Billing warning must appear after price set").toBe(true);

  // Rendered price tag in walker header must show 49.50 (not ₪50)
  const priceTag = page.locator("span.font-numbers").filter({ hasText: /49/ }).first();
  const rendered = (await priceTag.textContent().catch(() => ""))?.trim();
  console.log("rendered price tag:", rendered);
  expect(rendered, "Price must render with decimal — not rounded to ₪50").toMatch(/49[.,]5/);

  // Screenshot C: final state
  await page.screenshot({ path: "test-results/mobile-rtl-final.png", fullPage: false });
});
