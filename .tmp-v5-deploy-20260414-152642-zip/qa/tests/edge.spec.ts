import { test, expect } from "@playwright/test";
import {
  loadScenario,
  seedAndReload,
  reset,
  gotoDashboard,
  waitForDebugPanel,
  waitForSlideOver,
  startWalkFull,
  assertUrl,
  assertNoError,
  T,
} from "./helpers";

const isRemote = /^https?:\/\/(?!localhost|127\.0\.0\.1)/.test(process.env.BASE_URL ?? "");

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

test.describe.configure({ mode: "serial" });

test.afterEach(async ({ page }) => {
  try {
    await page.goto("/walker/dashboard?debug=true", { timeout: T.nav });
    if (page.url().includes("/walker/live")) {
      await page.goto("/walker/live?debug=true", { timeout: T.nav });
    }
    await waitForDebugPanel(page);
    await reset(page);
  } catch {
    // Best-effort cleanup
  }
});

// ===========================================================================
// 1. Refresh during live walk
// ===========================================================================

test.describe("edge-refresh-live", () => {
  const scenario = loadScenario("edge-refresh-live");

  test(`[${scenario.tags.join(",")}] reload mid-walk preserves live state`, async ({ page }) => {
    // --- Setup ---
    await gotoDashboard(page);
    await seedAndReload(page);
    await startWalkFull(page);

    // --- Step: reload browser ---
    await page.reload({ timeout: T.nav });

    // --- Assertions ---
    // A1: still on /walker/live (server re-fetched walk from DB)
    await assertUrl(page, "/walker/live");

    // A2: timer visible (HH:MM:SS format)
    await expect(
      page.getByText(/^\d{2}:\d{2}:\d{2}$/).first(),
      "Timer should be visible after reload",
    ).toBeVisible({ timeout: T.visible });

    // A3: live indicator
    await expect(
      page.getByText("בהליכה עכשיו"),
      "Live indicator should survive reload",
    ).toBeVisible({ timeout: T.visible });

    // A4: end-walk control
    await expect(
      page.getByTestId("end-walk"),
      "end-walk should be visible after reload",
    ).toBeVisible({ timeout: T.visible });

    // A5: no error
    await assertNoError(page);

    // A6: business invariant — start-walk must NOT be visible on live page
    await expect(page.getByTestId("start-walk")).not.toBeVisible({ timeout: 1_000 });
  });
});

// ===========================================================================
// 2. End then start again quickly
// ===========================================================================

test.describe("edge-end-start-again", () => {
  const scenario = loadScenario("edge-end-start-again");

  test(`[${scenario.tags.join(",")}] end walk then immediately start another`, async ({ page }) => {
    // --- Setup: seed + start first walk ---
    await gotoDashboard(page);
    await seedAndReload(page);
    await startWalkFull(page);

    // --- Step 1: end walk ---
    await page.getByTestId("end-walk").click({ timeout: T.action });
    await waitForSlideOver(page);
    await page.getByTestId("end-walk-confirm").click({ timeout: T.action });
    await page.waitForURL("**/walker/dashboard**", { timeout: T.nav });

    // --- Assert idle state ---
    await expect(
      page.getByTestId("start-walk"),
      "start-walk should reappear after ending",
    ).toBeVisible({ timeout: T.visible });
    await assertNoError(page);

    // --- Step 2: start second walk ---
    await startWalkFull(page);

    // --- Assertions on second walk ---
    // A1: URL
    await assertUrl(page, "/walker/live");

    // A2: timer visible
    await expect(
      page.getByText(/^\d{2}:\d{2}:\d{2}$/).first(),
      "Timer should be visible for second walk",
    ).toBeVisible({ timeout: T.visible });

    // A3: live indicator
    await expect(
      page.getByText("בהליכה עכשיו"),
      "Live indicator for second walk",
    ).toBeVisible({ timeout: T.visible });

    // A4: end-walk control
    await expect(
      page.getByTestId("end-walk"),
      "end-walk should be available for second walk",
    ).toBeVisible({ timeout: T.visible });

    // A5: no error
    await assertNoError(page);

    // A6: business invariant — only one live indicator
    await expect(page.getByText("בהליכה עכשיו")).toHaveCount(1, { timeout: 1_000 });
  });
});

// ===========================================================================
// 3. Offline then online recovery
// ===========================================================================

test.describe("edge-offline-recovery", () => {
  const scenario = loadScenario("edge-offline-recovery");

  test(`[${scenario.tags.join(",")}] offline error clears after connectivity restores`, async ({ page }) => {
    // --- Setup ---
    await gotoDashboard(page);
    await seedAndReload(page);
    // Reload with debug=true so force-offline toggle is available
    await page.goto("/walker/dashboard?debug=true", { timeout: T.nav });
    await page.waitForLoadState("networkidle", { timeout: T.nav });

    // --- Step 1: enable force-offline ---
    // Offline indicator lives in a bg-stone100 container, distinct from error banners
    const offlineBanner = page.locator(".bg-stone100").filter({ hasText: "אין חיבור לאינטרנט" });
    await page.getByTestId("debug-force-offline").click({ timeout: T.action });
    await expect(offlineBanner, "Offline banner should appear").toBeVisible({ timeout: T.visible });

    // --- Step 2: attempt start walk (1-dog direct-start: offline check fires immediately) ---
    await page.getByTestId("start-walk").click({ timeout: T.action });

    // Assert: still on dashboard, error visible
    await assertUrl(page, "/walker/dashboard");
    await expect(
      page.locator("[class*='red-light'], [class*='fca5a5']").filter({ hasText: "⚠️" }).first(),
      "Error banner should be visible after offline attempt",
    ).toBeVisible({ timeout: T.visible });

    // Business invariant: NOT on live page
    expect(page.url()).not.toContain("/walker/live");

    // --- Step 3: disable force-offline ---
    await page.getByTestId("debug-force-offline").click({ timeout: T.action });
    await expect(offlineBanner, "Offline banner should disappear").not.toBeVisible({ timeout: T.visible });

    // --- Step 4: retry — click start-walk again (online now, isStarting=false) ---
    await page.getByTestId("start-walk").click({ timeout: T.action });

    // --- Assertions ---
    // A1: navigation to live
    await page.waitForURL("**/walker/live**", { timeout: T.nav });
    await assertUrl(page, "/walker/live");

    // A2: timer visible
    await expect(
      page.getByText(/^\d{2}:\d{2}:\d{2}$/).first(),
      "Timer should be visible after recovery",
    ).toBeVisible({ timeout: T.visible });

    // A3: no error
    await assertNoError(page);

    // A4: end-walk available
    await expect(
      page.getByTestId("end-walk"),
      "end-walk should be available after recovery",
    ).toBeVisible({ timeout: T.visible });

    // A5: business invariant — start-walk NOT visible
    await expect(page.getByTestId("start-walk")).not.toBeVisible({ timeout: 1_000 });
  });
});

// ===========================================================================
// 4. Multi-tab consistency
// ===========================================================================

test.describe("edge-multi-tab", () => {
  const scenario = loadScenario("edge-multi-tab");

  test(`[${scenario.tags.join(",")}] second tab sees existing live walk`, async ({ page, browser }) => {
    // --- Setup: Tab A starts a walk ---
    await gotoDashboard(page);
    await seedAndReload(page);
    await startWalkFull(page);

    // --- Step: open Tab B with same auth ---
    const tabBContext = await browser.newContext({
      storageState: "qa/.auth/state.json",
    });
    const tabB = await tabBContext.newPage();

    try {
      await tabB.goto("/walker/dashboard", { timeout: T.nav });

      // --- Assertions on Tab B ---
      // A1: server redirect to /walker/live (page.tsx line 18: if activeWalks[0] redirect)
      await tabB.waitForURL("**/walker/live**", { timeout: T.nav });
      expect(tabB.url()).toContain("/walker/live");

      // A2: live indicator
      await expect(
        tabB.getByText("בהליכה עכשיו"),
        "Tab B should show live indicator",
      ).toBeVisible({ timeout: T.visible });

      // A3: timer visible
      await expect(
        tabB.getByText(/^\d{2}:\d{2}:\d{2}$/).first(),
        "Tab B should show timer",
      ).toBeVisible({ timeout: T.visible });

      // A4: end-walk available
      await expect(
        tabB.getByTestId("end-walk"),
        "Tab B should have end-walk button",
      ).toBeVisible({ timeout: T.visible });

      // A5: no error
      const errorBanner = tabB.locator("[class*='red-light'], [class*='fca5a5']").filter({ hasText: "⚠️" });
      await expect(errorBanner, "Tab B should have no error").toHaveCount(0, { timeout: 1_000 });

      // A6: business invariant — start-walk NOT visible (on live page)
      await expect(tabB.getByTestId("start-walk")).not.toBeVisible({ timeout: 1_000 });
    } finally {
      await tabBContext.close();
    }
  });
});

// ===========================================================================
// 5. Auto-close lifecycle
// ===========================================================================

test.describe("edge-auto-close", () => {
  const scenario = loadScenario("edge-auto-close");

  test(`[${scenario.tags.join(",")}] auto-closed walk redirects to dashboard`, async ({ page }) => {
    test.skip(isRemote, "edge-auto-close: Test Mode panel uses assertDev() — disabled in production. Run against local dev server.");
    // --- Setup: seed + start walk ---
    await gotoDashboard(page);
    await seedAndReload(page);
    await startWalkFull(page);

    // Navigate to live with debug to access test mode
    await page.goto("/walker/live?debug=true", { timeout: T.nav });
    await waitForDebugPanel(page);

    // --- Step 1: open Test Mode panel ---
    await page.getByTestId("debug-test-mode").click({ timeout: T.action });
    // Panel open: button text changes to "- Test Mode"
    await expect(
      page.getByText("- Test Mode"),
      "Test Mode panel should open",
    ).toBeVisible({ timeout: T.visible });

    // --- Step 2: click Force Auto-Close ---
    // Panel loads active walks async — wait for the button to appear
    const autoCloseBtn = page.getByText("Force Auto-Close");
    await expect(autoCloseBtn, "Force Auto-Close should appear after walks load").toBeVisible({ timeout: T.visible });
    await autoCloseBtn.click({ timeout: T.action });
    // Wait for the action to complete (status line shows "Auto-close OK")
    await expect(
      page.getByText("Auto-close OK"),
      "Auto-close action should succeed",
    ).toBeVisible({ timeout: T.action });

    // --- Step 3: navigate away and back (real lifecycle transition) ---
    // Server component page.tsx will re-fetch activeWalks — since walk is now
    // AUTO_CLOSED, activeWalks[0] is falsy → redirect to /walker/dashboard
    await page.goto("about:blank", { timeout: T.nav });
    await page.goto("/walker/live?debug=true", { timeout: T.nav });

    // --- Assertions ---
    // A1: redirected to dashboard (server redirect because no active walk)
    await page.waitForURL("**/walker/dashboard**", { timeout: T.nav });
    expect(page.url()).toContain("/walker/dashboard");

    // A2: no error
    await assertNoError(page);

    // A3: start-walk visible (back to idle, seeded dog still exists)
    await expect(
      page.getByTestId("start-walk"),
      "start-walk should be visible after auto-close redirect",
    ).toBeVisible({ timeout: T.visible });

    // A4: business invariant — end-walk NOT visible (not on live page)
    await expect(page.getByTestId("end-walk")).not.toBeVisible({ timeout: 1_000 });
  });
});
