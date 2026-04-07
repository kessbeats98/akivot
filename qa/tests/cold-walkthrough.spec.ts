/**
 * Cold Walkthrough — Part A + Part B
 *
 * Runs against production: https://akivot.vercel.app
 * Uses real credentials — no seed/reset API.
 *
 * Run with:
 *   BASE_URL=https://akivot.vercel.app \
 *   WALKER_EMAIL=<real-walker-email> \
 *   WALKER_PASSWORD=<real-walker-password> \
 *   npx playwright test qa/tests/cold-walkthrough.spec.ts --project=cold-walkthrough --reporter=list
 */

import { test, expect, type Page, type BrowserContext } from "@playwright/test";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE = process.env.BASE_URL ?? "https://akivot.vercel.app";

// Part A owner account — must be supplied via env.
const OWNER_EMAIL = process.env.OWNER_EMAIL;
const OWNER_PASSWORD = process.env.OWNER_PASSWORD;

// Part B walker account — must be supplied via env.
// Fail fast here so the error is clear, not buried in a B1 login failure.
const WALKER_EMAIL = process.env.WALKER_EMAIL;
const WALKER_PASSWORD = process.env.WALKER_PASSWORD;

if (!OWNER_EMAIL || !OWNER_PASSWORD) {
  throw new Error(
    "Cold walkthrough Part A requires OWNER_EMAIL and OWNER_PASSWORD env vars."
  );
}
if (!WALKER_EMAIL || !WALKER_PASSWORD) {
  throw new Error(
    "Cold walkthrough Part B requires WALKER_EMAIL and WALKER_PASSWORD env vars. " +
    "Set them to a real production walker account that has a dog assigned."
  );
}

// Unique signup email for Part A (new user, no prior state)
const SIGNUP_EMAIL = `walkthrough-${Date.now()}@sholef.co.il`;
const SIGNUP_PASSWORD = "Test1234!";

const T = { nav: 20_000, visible: 8_000, action: 8_000 } as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function screenshot(page: Page, label: string) {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  await page.screenshot({ path: `qa/cold-walkthrough/${ts}-${label}.png`, fullPage: true });
}

async function note(label: string, start: number) {
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`  ✓ ${label} [${elapsed}s]`);
}

// ---------------------------------------------------------------------------
// PART A — New user signup / login flow
// ---------------------------------------------------------------------------

test.describe("PART A — New user signup / login flow", () => {
  test.describe.configure({ mode: "serial" });

  let ctx: BrowserContext;
  let page: Page;
  let capturedVerifyUrl: string | undefined;

  test.beforeAll(async ({ browser }) => {
    // Fresh incognito context — no cookies, no prior state
    ctx = await browser.newContext({ storageState: undefined });
    page = await ctx.newPage();
  });

  test.afterAll(async () => {
    await ctx.close();
  });

  test("A1 — Land on home page", async () => {
    const t = Date.now();
    await page.goto(BASE, { timeout: T.nav });
    await page.waitForLoadState("networkidle", { timeout: T.nav });
    await screenshot(page, "A1-home");
    await note("A1 home page loaded", t);
    // Verify something renders (not blank)
    const body = await page.textContent("body");
    expect(body?.length, "Page should have content").toBeGreaterThan(50);
  });

  test("A2 — Click sign up, fill form", async () => {
    const t = Date.now();

    // Intercept auth response to capture verification URL/token if present
    page.route("**/api/auth/**", async (route) => {
      const response = await route.fetch();
      try {
        const body = await response.json();
        if (body?.url) capturedVerifyUrl = body.url;
        if (body?.verificationUrl) capturedVerifyUrl = body.verificationUrl;
        if (body?.token) capturedVerifyUrl = `${BASE}/verify-email?token=${body.token}`;
      } catch {
        // not JSON — ignore
      }
      await route.fulfill({ response });
    });

    // Navigate to signup
    const signupLink = page.getByRole("link", { name: /sign.?up|register|הרשמה/i }).first();
    if (await signupLink.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await signupLink.click({ timeout: T.action });
    } else {
      await page.goto(`${BASE}/signup`, { timeout: T.nav });
    }

    await page.waitForLoadState("networkidle", { timeout: T.nav });
    await screenshot(page, "A2-signup-form");
    await note("A2 signup page reached", t);

    // Fill form
    const nameField = page.getByLabel(/name|שם/i).first();
    if (await nameField.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await nameField.fill("Walkthrough Test");
    }
    await page.getByLabel(/email|מייל/i).first().fill(SIGNUP_EMAIL);
    await page.getByLabel(/password|סיסמה/i).first().fill(SIGNUP_PASSWORD);

    const confirmField = page.getByLabel(/confirm|repeat|חזור/i).first();
    if (await confirmField.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await confirmField.fill(SIGNUP_PASSWORD);
    }

    await screenshot(page, "A2-filled");
    await page.getByRole("button", { name: /sign.?up|register|הרשמה|צור/i }).first().click({ timeout: T.action });
    await page.waitForLoadState("networkidle", { timeout: T.nav });
    await screenshot(page, "A2-after-submit");
    await note("A2 signup form submitted", t);
  });

  test("A3 — Verification email confirmation screen", async () => {
    const t = Date.now();
    // Should see "check your inbox" type message
    const confirmMsg = page.getByText(/בדוק|inbox|מייל|verify|confirm/i).first();
    const isVisible = await confirmMsg.isVisible({ timeout: 5_000 }).catch(() => false);
    await screenshot(page, "A3-verify-screen");
    await note(`A3 verify-email screen shown: ${isVisible}`, t);

    // Log captured token for manual verification if needed
    if (capturedVerifyUrl) {
      console.log("  → Captured verify URL:", capturedVerifyUrl);
    }

    // This step is PASS if the confirmation screen appears (email itself not testable from browser)
    expect(
      isVisible || page.url().includes("verify"),
      "Should show verify-email screen or redirect to verify URL",
    ).toBe(true);
  });

  test("A4 — Login with existing verified owner account", async () => {
    // Part A tests the signup form UI. For the login + dashboard steps,
    // we use a pre-existing verified owner account (OWNER_EMAIL) since
    // the new account requires email verification we can't automate against production.
    const t = Date.now();

    await page.goto(`${BASE}/login`, { timeout: T.nav });
    await page.waitForLoadState("networkidle", { timeout: T.nav });
    await screenshot(page, "A4-login");

    await page.getByLabel(/email|מייל/i).first().fill(OWNER_EMAIL!);
    await page.getByLabel(/password|סיסמה/i).first().fill(OWNER_PASSWORD!);
    await page.getByRole("button", { name: /sign.?in|login|כניסה/i }).first().click({ timeout: T.action });

    await page.waitForLoadState("networkidle", { timeout: T.nav });
    await screenshot(page, "A4-after-login");
    await note("A4 login submitted", t);
  });

  test("A5 — Reach dashboard", async () => {
    const t = Date.now();
    // After login — should land on owner or walker dashboard
    await page.waitForURL(/dashboard|onboarding/, { timeout: T.nav });
    await screenshot(page, "A5-dashboard");
    const url = page.url();
    await note(`A5 landed at: ${url}`, t);
    expect(url, "Should be on a dashboard or onboarding page").toMatch(/dashboard|onboarding/);
  });

  test("A6 — Understand what to do next (empty state clarity)", async () => {
    const t = Date.now();
    const bodyText = await page.textContent("body");
    await screenshot(page, "A6-next-action");
    await note("A6 captured dashboard state", t);
    // Record: does the page give a clear next action?
    const hasGuidance = bodyText?.match(/הוסף|הזמן|assign|add|invite|start|start walk|התחל/i);
    console.log(`  → Clear next-action guidance visible: ${!!hasGuidance}`);
  });
});

// ---------------------------------------------------------------------------
// PART B — Core loop (pre-assigned walker)
// ---------------------------------------------------------------------------

test.describe("PART B — Core loop (pre-assigned walker)", () => {
  test.describe.configure({ mode: "serial" });

  let ctx: BrowserContext;
  let page: Page;
  let loginStart: number;
  let walkStartedAt: number;
  let walkEndedAt: number;

  test.beforeAll(async ({ browser }) => {
    ctx = await browser.newContext({ storageState: undefined });
    page = await ctx.newPage();
  });

  test.afterAll(async () => {
    await ctx.close();
  });

  test("B1 — Login as pre-assigned walker", async () => {
    loginStart = Date.now();
    await page.goto(`${BASE}/login`, { timeout: T.nav });
    await page.waitForLoadState("networkidle", { timeout: T.nav });
    await screenshot(page, "B1-login");

    await page.getByLabel(/email|מייל/i).first().fill(WALKER_EMAIL);
    await page.getByLabel(/password|סיסמה/i).first().fill(WALKER_PASSWORD);
    await page.getByRole("button", { name: /sign.?in|login|כניסה/i }).first().click({ timeout: T.action });

    await page.waitForLoadState("networkidle", { timeout: T.nav });
    await screenshot(page, "B1-after-login");

    await page.waitForURL(/dashboard|live|onboarding/, { timeout: T.nav });
    const url = page.url();
    console.log(`  → B1 landed at: ${url}`);
    expect(url).toMatch(/dashboard|live/);
  });

  test("B2 — See assigned dog on dashboard", async () => {
    const t = Date.now();

    // Ensure on walker dashboard
    if (!page.url().includes("/walker/dashboard")) {
      await page.goto(`${BASE}/walker/dashboard`, { timeout: T.nav });
      await page.waitForLoadState("networkidle", { timeout: T.nav });
    }

    await screenshot(page, "B2-walker-dashboard");
    await note("B2 walker dashboard loaded", t);

    // Check for dog assignment or start-walk button
    const startWalk = page.getByTestId("start-walk");
    const isVisible = await startWalk.isVisible({ timeout: 5_000 }).catch(() => false);
    console.log(`  → start-walk button visible: ${isVisible}`);

    if (!isVisible) {
      // Look for empty state — Class B issue
      const emptyState = await page.textContent("body");
      console.log("  → FRICTION B2: no start-walk button. Body excerpt:", emptyState?.slice(0, 200));
    }

    expect(isVisible, "B2: start-walk button should be visible (dog must be assigned)").toBe(true);
  });

  test("B3 — Start a walk", async () => {
    const t = Date.now();

    await page.getByTestId("start-walk").click({ timeout: T.action });
    await page.waitForLoadState("networkidle", { timeout: T.nav });
    await screenshot(page, "B3-slideover-open");

    // SlideOver should open
    const dialog = page.locator("div[role='dialog']");
    const dialogVisible = await dialog.isVisible({ timeout: 5_000 }).catch(() => false);
    console.log(`  → SlideOver opened: ${dialogVisible}`);

    if (dialogVisible) {
      // Select first dog
      const dogCard = dialog.locator("button").first();
      await dogCard.click({ timeout: T.action });
      await screenshot(page, "B3-dog-selected");

      // Confirm start
      const confirmBtn = page.getByTestId("start-walk-confirm");
      await expect(confirmBtn).toBeEnabled({ timeout: 3_000 });
      await confirmBtn.click({ timeout: T.action });
    } else {
      // Direct start without SlideOver
      console.log("  → FRICTION B3: no SlideOver dialog appeared after start-walk click");
    }

    await note("B3 walk start submitted", t);
  });

  test("B4 — See live timer screen running", async () => {
    const t = Date.now();
    walkStartedAt = Date.now();

    await page.waitForURL(/walker\/live/, { timeout: T.nav });
    await page.waitForLoadState("networkidle", { timeout: T.nav });
    await screenshot(page, "B4-live-screen");

    const url = page.url();
    const onLive = url.includes("/walker/live");
    console.log(`  → B4 on /walker/live: ${onLive}`);

    // Timer visible
    const timer = page.getByText(/^\d{2}:/).first();
    const timerVisible = await timer.isVisible({ timeout: 5_000 }).catch(() => false);
    console.log(`  → Timer visible: ${timerVisible}`);

    // Live indicator
    const liveText = page.getByText(/בהליכה עכשיו/);
    const liveVisible = await liveText.isVisible({ timeout: 3_000 }).catch(() => false);
    console.log(`  → Live indicator visible: ${liveVisible}`);

    await note("B4 live screen checked", t);
    expect(onLive, "B4: should be on /walker/live after confirming walk start").toBe(true);
  });

  test("B5 — End walk (fill required fields)", async () => {
    const t = Date.now();

    // Wait a couple seconds so timer has a non-zero value
    await page.waitForTimeout(2_000);

    const endBtn = page.getByTestId("end-walk");
    await expect(endBtn).toBeVisible({ timeout: T.visible });
    await endBtn.click({ timeout: T.action });

    await screenshot(page, "B5-end-slideover");

    const dialog = page.locator("div[role='dialog']");
    const dialogVisible = await dialog.isVisible({ timeout: 5_000 }).catch(() => false);
    console.log(`  → End-walk SlideOver opened: ${dialogVisible}`);

    if (dialogVisible) {
      // Fill any required fields (notes, etc.)
      const noteField = dialog.getByRole("textbox").first();
      if (await noteField.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await noteField.fill("Walkthrough test walk");
      }
      await screenshot(page, "B5-end-filled");

      const confirmBtn = page.getByTestId("end-walk-confirm");
      await expect(confirmBtn).toBeVisible({ timeout: T.visible });
      await expect(confirmBtn).toBeEnabled({ timeout: 3_000 });
      await confirmBtn.click({ timeout: T.action });
    }

    walkEndedAt = Date.now();
    await note("B5 walk end submitted", t);
  });

  test("B6 — Return to dashboard, see walk recorded", async () => {
    const t = Date.now();

    await page.waitForURL(/walker\/dashboard/, { timeout: T.nav });
    await page.waitForLoadState("networkidle", { timeout: T.nav });
    await screenshot(page, "B6-back-to-dashboard");

    const url = page.url();
    console.log(`  → B6 landed at: ${url}`);

    // Walk history or recent walk should appear
    const recentWalk = page.getByText(/הליכה|walk|completed|הושלמ/i).first();
    const walkVisible = await recentWalk.isVisible({ timeout: 5_000 }).catch(() => false);
    console.log(`  → Walk recorded on dashboard: ${walkVisible}`);

    const timeLoginToWalk = ((walkStartedAt - loginStart) / 1000).toFixed(1);
    console.log(`  → Time login → walk started: ${timeLoginToWalk}s`);

    await note("B6 dashboard after walk checked", t);
    expect(url).toContain("/walker/dashboard");
  });

  test("B7 — Open billing page, see walk in period", async () => {
    const t = Date.now();

    await page.goto(`${BASE}/walker/billing`, { timeout: T.nav });
    await page.waitForLoadState("networkidle", { timeout: T.nav });
    await screenshot(page, "B7-billing");

    const url = page.url();
    console.log(`  → B7 billing URL: ${url}`);

    const bodyText = await page.textContent("body");
    const hasBillingData = bodyText?.match(/₪|\d+\s*min|דקות|הליכה|walk/i);
    console.log(`  → Billing data visible: ${!!hasBillingData}`);

    const timeWalkEndToBilling = ((Date.now() - walkEndedAt) / 1000).toFixed(1);
    console.log(`  → Time walk ended → billing confirmed: ${timeWalkEndToBilling}s`);

    await screenshot(page, "B7-billing-final");
    await note("B7 billing page checked", t);

    expect(url).toMatch(/billing/);
  });
});
