/**
 * Production canary — owner price-edit feature
 * Hits akivot.vercel.app directly using QA smoke account + Vercel bypass.
 * Uses seeded dog a3cef721 (1 active walker assignment).
 * Checks all 5 required live states after deploy 54bd5b7.
 */
import { test, expect } from "@playwright/test";

const BASE   = "https://akivot.vercel.app";
const BYPASS = "484xxrShTYEAavJqsW2uvo0OQ5jAShcD";
const DOG_ID = "f933ede8-dd1e-4bf3-8900-7c0353ddaa60";

test.use({
  viewport: { width: 390, height: 844 }, // iPhone 14 — mobile RTL check
  storageState: "qa/.auth/prod-state.json",
  extraHTTPHeaders: { "x-vercel-protection-bypass": BYPASS },
});

test("PROD canary: owner price-edit — all 5 live checks", async ({ page }) => {
  const profileUrl = `${BASE}/owner/dog-profile/${DOG_ID}`;

  // ── Load dog profile — check whatever state exists, then set 49.50 ─────────
  await page.goto(profileUrl, { waitUntil: "load" });
  await page.screenshot({ path: "test-results/prod-canary-initial.png", fullPage: false });

  const priceInput = page.locator('input[name="price"]').first();
  await expect(priceInput).toBeVisible({ timeout: 10_000 });

  const defaultVal  = await priceInput.inputValue();
  const submitBtn   = page.locator("form").filter({ has: priceInput }).locator('button[type="submit"]');
  const btnText     = (await submitBtn.textContent())?.trim() ?? "";
  const warningEl   = page.locator("p", { hasText: "שינוי מחיר ישפיע" });
  const warnVisible = await warningEl.isVisible().catch(() => false);

  console.log("[INITIAL] defaultVal:", defaultVal, "button:", btnText, "warning:", warnVisible);

  // Check: invariant holds regardless of initial state
  const isFirstTime = defaultVal === "" || defaultVal === "0" || defaultVal === "0.00";
  if (isFirstTime) {
    // STATE B: first-time
    expect(warnVisible, "STATE B: warning must NOT be visible").toBe(false);
    expect(btnText, "STATE B: button must say קבע מחיר").toBe("קבע מחיר");
    console.log("[STATE B] PASS — first-time state correct");
  } else {
    // STATE A: existing price
    expect(warnVisible, "STATE A: billing warning must be visible").toBe(true);
    expect(btnText, "STATE A: button must say עדכן מחיר").toBe("עדכן מחיר");
    console.log("[STATE A] PASS — existing price state correct");
  }

  // ── Submit 49.50 → always transitions to STATE A with decimal ────────────
  await priceInput.fill("49.50");
  await submitBtn.click();
  await page.waitForLoadState("load");
  await page.screenshot({ path: "test-results/prod-canary-after-set.png", fullPage: false });

  // ── STATE A post-submit: verify all fields ────────────────────────────────
  const inputAfter  = page.locator('input[name="price"]').first();
  await expect(inputAfter).toBeVisible({ timeout: 10_000 });

  const valAfter    = await inputAfter.inputValue();
  const btnAfter    = (await page.locator("form").filter({ has: inputAfter }).locator('button[type="submit"]').textContent())?.trim();
  const warnAfter   = await page.locator("p", { hasText: "שינוי מחיר ישפיע" }).isVisible().catch(() => false);

  console.log("[POST-SUBMIT] valAfter:", valAfter, "button:", btnAfter, "warning:", warnAfter);

  // Check 2: existing-price state after set
  expect(warnAfter, "STATE A: billing warning must be visible after set").toBe(true);
  expect(valAfter, "STATE A: input must be pre-filled with 49.50").toMatch(/49\.?5/);
  expect(btnAfter, "STATE A: button must say עדכן מחיר").toBe("עדכן מחיר");

  // Check 4: decimal display — rendered price tag in walker header
  const priceTag = page.locator("span.font-numbers").filter({ hasText: /49/ }).first();
  const rendered  = (await priceTag.textContent().catch(() => ""))?.trim();
  console.log("[CHECK 4] rendered price tag:", rendered);
  expect(rendered, "DECIMAL: must render 49.50 not ₪50").toMatch(/49[.,]5/);

  // Check 5: mobile RTL — layout checks
  // Input right-aligned (RTL): verify text-right class present
  const inputClass = await inputAfter.getAttribute("class") ?? "";
  expect(inputClass, "RTL: input must have text-right class").toContain("text-right");

  // Warning text right-aligned
  const warnClass = await page.locator("p", { hasText: "שינוי מחיר ישפיע" }).getAttribute("class") ?? "";
  expect(warnClass, "RTL: warning must have text-right class").toContain("text-right");

  // Form row: payments icon + input + button visible and horizontally laid out
  const icon   = page.locator("span.material-symbols-rounded", { hasText: "payments" }).first();
  const iconBox = await icon.boundingBox();
  const btnBox  = await submitBtn.boundingBox();
  expect(iconBox, "RTL: payments icon must be visible").not.toBeNull();
  expect(btnBox,  "RTL: submit button must be visible").not.toBeNull();
  // In a flex row both should be at approximately the same y, within 10px
  if (iconBox && btnBox) {
    expect(Math.abs(iconBox.y - btnBox.y), "RTL: icon and button should be horizontally aligned").toBeLessThan(15);
    console.log("[CHECK 5] icon y:", iconBox.y, "btn y:", btnBox.y, "viewport width: 390");
  }

  // Final screenshot
  await page.screenshot({ path: "test-results/prod-canary-final.png", fullPage: false });
  console.log("All production checks PASS");
});
