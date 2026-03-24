import { test, expect } from "@playwright/test";
import {
  loadScenario,
  seedAndReload,
  reset,
  gotoDashboard,
  waitForDebugPanel,
  waitForSlideOver,
  selectFirstDog,
  startWalkFull,
  assertUrl,
  assertNoError,
  assertErrorVisible,
  T,
} from "./helpers";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// Fail fast: stop on first assertion failure within a test (default, but explicit)
test.describe.configure({ mode: "serial" });

test.afterEach(async ({ page }) => {
  try {
    // If a LIVE walk exists the app redirects /walker/dashboard → /walker/live,
    // so navigate to wherever we land and append ?debug=true to ensure the panel loads.
    await page.goto("/walker/dashboard?debug=true", { timeout: T.nav });
    // If redirected to /walker/live, re-navigate with debug flag
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
// 1. start-walk-success
// ===========================================================================

test.describe("start-walk-success", () => {
  const scenario = loadScenario("start-walk-success");

  test(`[${scenario.tags.join(",")}] seed → start walk → lands on live screen`, async ({ page }) => {
    // --- Setup ---
    await gotoDashboard(page);
    await assertNoError(page);

    await seedAndReload(page);
    await assertUrl(page, "/walker/dashboard");
    await assertNoError(page);

    // --- Step 1: open SlideOver ---
    await page.getByTestId("start-walk").click({ timeout: T.action });
    const dialog = await waitForSlideOver(page);
    // SlideOver title visible
    await expect(dialog.getByText("בחירת כלב לטיול")).toBeVisible({ timeout: T.visible });
    // Confirm button should be disabled (no dog selected yet)
    await expect(page.getByTestId("start-walk-confirm")).toBeDisabled({ timeout: 1_000 });
    await assertUrl(page, "/walker/dashboard"); // no navigation yet

    // --- Step 2: select dog ---
    await selectFirstDog(page);
    // Confirm button should now be enabled
    await expect(page.getByTestId("start-walk-confirm")).toBeEnabled({ timeout: 1_000 });

    // --- Step 3: confirm start ---
    await page.getByTestId("start-walk-confirm").click({ timeout: T.action });

    // --- Assertions ---
    // A1: navigation — redirected to /walker/live
    await page.waitForURL("**/walker/live**", { timeout: T.nav });
    await assertUrl(page, "/walker/live");

    // A2: critical UI — live timer visible
    await expect(page.getByText(/^00:/).first(), "Timer should be visible").toBeVisible({ timeout: T.visible });

    // A3: live indicator
    await expect(page.getByText("בהליכה עכשיו"), "Live indicator should be visible").toBeVisible({ timeout: T.visible });

    // A4: end-walk control available
    await expect(page.getByTestId("end-walk"), "end-walk button should be visible").toBeVisible({ timeout: T.visible });

    // A5: no error
    await assertNoError(page);

    // A6: business invariant — start-walk button must NOT be visible (we're on live)
    await expect(page.getByTestId("start-walk")).not.toBeVisible({ timeout: 1_000 });
  });
});

// ===========================================================================
// 2. start-walk-offline
// ===========================================================================

test.describe("start-walk-offline", () => {
  const scenario = loadScenario("start-walk-offline");

  test(`[${scenario.tags.join(",")}] force-offline → start walk → blocked with error`, async ({ page }) => {
    // --- Setup ---
    await gotoDashboard(page);
    await assertNoError(page);

    await seedAndReload(page);

    // --- Step 1: enable force-offline ---
    await page.getByTestId("debug-force-offline").click({ timeout: T.action });
    // Offline indicator should appear on the page
    await expect(page.getByText("אין חיבור לאינטרנט")).toBeVisible({ timeout: T.visible });
    await assertUrl(page, "/walker/dashboard");

    // --- Step 2: attempt start walk ---
    await page.getByTestId("start-walk").click({ timeout: T.action });
    await selectFirstDog(page);
    await page.getByTestId("start-walk-confirm").click({ timeout: T.action });

    // --- Assertions ---
    // A1: NO navigation — still on dashboard
    await assertUrl(page, "/walker/dashboard");
    // Wait briefly to ensure no late redirect
    await page.waitForTimeout(1_000);
    await assertUrl(page, "/walker/dashboard");

    // A2: error banner with offline message inside SlideOver
    await assertErrorVisible(page, "אין חיבור לאינטרנט");

    // A3: start-walk button still exists (UI remains valid)
    await expect(page.getByTestId("start-walk"), "start-walk should still exist").toBeVisible({ timeout: T.visible });

    // A4: confirm button should still be visible (SlideOver didn't close)
    await expect(page.getByTestId("start-walk-confirm"), "confirm button still visible in SlideOver").toBeVisible({ timeout: 1_000 });

    // A5: business invariant — NOT on /walker/live
    expect(page.url()).not.toContain("/walker/live");
  });
});

// ===========================================================================
// 3. end-walk-success
// ===========================================================================

test.describe("end-walk-success", () => {
  const scenario = loadScenario("end-walk-success");

  test(`[${scenario.tags.join(",")}] start walk → end walk → back to dashboard`, async ({ page }) => {
    // --- Setup: seed + start a walk ---
    await gotoDashboard(page);
    await assertNoError(page);
    await seedAndReload(page);

    // Start walk via full helper
    await startWalkFull(page);

    // Verify live screen state before ending
    await expect(page.getByText("בהליכה עכשיו")).toBeVisible({ timeout: T.visible });
    await expect(page.getByTestId("end-walk")).toBeVisible({ timeout: T.visible });
    await assertNoError(page);

    // --- Step 1: open finish SlideOver ---
    await page.getByTestId("end-walk").click({ timeout: T.action });
    const dialog = await waitForSlideOver(page);
    // SlideOver title
    await expect(dialog.getByText("סיכום טיול")).toBeVisible({ timeout: T.visible });
    // Confirm button visible and enabled
    await expect(page.getByTestId("end-walk-confirm")).toBeVisible({ timeout: T.visible });
    await expect(page.getByTestId("end-walk-confirm")).toBeEnabled({ timeout: 1_000 });
    // Still on /walker/live
    await assertUrl(page, "/walker/live");

    // --- Step 2: confirm end ---
    await page.getByTestId("end-walk-confirm").click({ timeout: T.action });

    // --- Assertions ---
    // A1: navigation — back to dashboard
    await page.waitForURL("**/walker/dashboard**", { timeout: T.nav });
    await assertUrl(page, "/walker/dashboard");

    // A2: critical UI — start-walk button visible again (idle state)
    await expect(page.getByTestId("start-walk"), "start-walk should reappear").toBeVisible({ timeout: T.visible });

    // A3: no error
    await assertNoError(page);

    // A4: end-walk button must NOT exist (we're back on dashboard, not live)
    await expect(page.getByTestId("end-walk")).not.toBeVisible({ timeout: 1_000 });

    // A5: business invariant — idle message visible
    await expect(page.getByText("אין הליכה פעילה כרגע"), "Idle message should show").toBeVisible({ timeout: T.visible });
  });
});

// ===========================================================================
// 4. double-start-race
// ===========================================================================

test.describe("double-start-race", () => {
  const scenario = loadScenario("double-start-race");

  test(`[${scenario.tags.join(",")}] rapid double-click confirm → single walk, no duplicates`, async ({ page }) => {
    // --- Setup ---
    await gotoDashboard(page);
    await assertNoError(page);
    await seedAndReload(page);

    // --- Step 1: open SlideOver, select dog ---
    await page.getByTestId("start-walk").click({ timeout: T.action });
    await selectFirstDog(page);

    // --- Step 2: double-click confirm (race condition) ---
    await page.getByTestId("start-walk-confirm").dblclick({ timeout: T.action });

    // --- Assertions ---
    // A1: navigation — ends up on /walker/live
    await page.waitForURL("**/walker/live**", { timeout: T.nav });
    await assertUrl(page, "/walker/live");

    // A2: live timer visible (single walk running)
    await expect(page.getByText(/^00:/).first(), "Timer should be visible").toBeVisible({ timeout: T.visible });

    // A3: no error banner
    await assertNoError(page);

    // A4: business invariant — no "2 active walks" or duplicate indicator
    await expect(page.getByText("2 active walks")).not.toBeVisible({ timeout: 1_000 });

    // A5: exactly one live indicator
    const liveIndicators = page.getByText("בהליכה עכשיו");
    await expect(liveIndicators).toHaveCount(1, { timeout: 1_000 });

    // A6: end-walk is available (walk is running normally)
    await expect(page.getByTestId("end-walk")).toBeVisible({ timeout: T.visible });
  });
});

// ===========================================================================
// 5. reset-data-empty-state
// ===========================================================================

test.describe("reset-data-empty-state", () => {
  const scenario = loadScenario("reset-data-empty-state");

  test(`[${scenario.tags.join(",")}] seed → reset → empty state, no dogs`, async ({ page }) => {
    // --- Setup: seed first so there's data to reset ---
    await gotoDashboard(page);
    await assertNoError(page);
    await seedAndReload(page);

    // Confirm seeded state: start-walk visible, not empty
    await expect(page.getByTestId("start-walk")).toBeVisible({ timeout: T.visible });
    await expect(page.getByTestId("empty-state")).not.toBeVisible({ timeout: 1_000 });

    // --- Step 1: reset ---
    await reset(page);
    await page.reload({ timeout: T.nav });
    await waitForDebugPanel(page);

    // --- Assertions ---
    // A1: still on dashboard (no navigation)
    await assertUrl(page, "/walker/dashboard");

    // A2: empty state visible
    await expect(page.getByTestId("empty-state"), "Empty state should be visible").toBeVisible({ timeout: T.visible });

    // A3: "אין כלבים" text present
    await expect(page.getByText("אין כלבים"), "No-dogs text should be visible").toBeVisible({ timeout: T.visible });

    // A4: no error
    await assertNoError(page);

    // A5: business invariant — start-walk button must NOT exist (no dogs)
    await expect(page.getByTestId("start-walk"), "start-walk should not exist without dogs").not.toBeVisible({ timeout: 1_000 });

    // A6: idle message for no-dogs state
    await expect(page.getByText("ברוך הבא"), "Welcome message should show").toBeVisible({ timeout: T.visible });
  });
});
