import fs from "node:fs";
import path from "node:path";
import { expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Scenario loader
// ---------------------------------------------------------------------------

export interface Scenario {
  name: string;
  baseUrl: string;
  tags: string[];
  setup: { action: string; value?: string; ref?: string; note?: string }[];
  steps: { action: string; value?: string; ref?: string; note?: string }[];
  assertions: { name: string; type: string; value: string }[];
  artifacts: { trace: boolean };
}

export function loadScenario(name: string): Scenario {
  const filePath = path.join(__dirname, "..", "scenarios", `${name}.json`);
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as Scenario;
}

// ---------------------------------------------------------------------------
// Timeouts — single source of truth
// ---------------------------------------------------------------------------

export const T = {
  action: 5_000,
  nav: 15_000,
  visible: 5_000,
  seed: 15_000,
} as const;

// ---------------------------------------------------------------------------
// Locators
// ---------------------------------------------------------------------------

const ERROR_BANNER_SEL = "[class*='red-light'], [class*='fca5a5']";
const SLIDEOVER_SEL = "div[role='dialog']";

// ---------------------------------------------------------------------------
// Shared assertions — called after every major step
// ---------------------------------------------------------------------------

/** Assert current URL contains `fragment` */
export async function assertUrl(page: Page, fragment: string) {
  expect(page.url(), `URL should contain "${fragment}"`).toContain(fragment);
}

/** Assert no unexpected error banner on the page */
export async function assertNoError(page: Page) {
  // Error banners use red-light background + ⚠️ emoji. Allow 300ms settle.
  const errorBanner = page.locator(ERROR_BANNER_SEL).filter({ hasText: "⚠️" });
  await expect(errorBanner, "Unexpected error banner visible").toHaveCount(0, { timeout: 1_000 });
}

/** Assert an error banner IS visible with expected text */
export async function assertErrorVisible(page: Page, text: string) {
  const banner = page.locator(ERROR_BANNER_SEL).filter({ hasText: text }).first();
  await expect(banner, `Error banner with "${text}" should be visible`).toBeVisible({ timeout: T.visible });
}

// ---------------------------------------------------------------------------
// Navigation helpers
// ---------------------------------------------------------------------------

/** Navigate to walker dashboard in debug mode, wait for debug panel */
export async function gotoDashboard(page: Page) {
  await page.goto("/walker/dashboard?debug=true", { timeout: T.nav });
  await page.waitForSelector("text=DEBUG", { timeout: T.visible });
  await assertUrl(page, "/walker/dashboard");
}

export async function waitForDebugPanel(page: Page) {
  await page.waitForSelector("text=DEBUG", { timeout: T.visible });
}

// ---------------------------------------------------------------------------
// Seed / Reset — via window hooks (debug mode only)
// ---------------------------------------------------------------------------

/** Seed test data, reload, and verify seeded state */
export async function seedAndReload(page: Page) {
  await page.evaluate(() => (window as any).__akivotSeed());
  await page.reload({ timeout: T.nav });
  await waitForDebugPanel(page);
  // After seed: start-walk button must exist (dog was assigned)
  await expect(
    page.getByTestId("start-walk"),
    "start-walk button should be visible after seed",
  ).toBeVisible({ timeout: T.visible });
  // empty-state must NOT be visible
  await expect(
    page.getByTestId("empty-state"),
    "empty-state should be hidden after seed",
  ).not.toBeVisible({ timeout: 1_000 });
}

/** Reset test data via window hook */
export async function reset(page: Page) {
  await page.evaluate(() => (window as any).__akivotReset());
}

// ---------------------------------------------------------------------------
// SlideOver interaction
// ---------------------------------------------------------------------------

/** Wait for SlideOver dialog to be on-screen (translate-y-0, not translate-y-full) */
export async function waitForSlideOver(page: Page) {
  const dialog = page.locator(SLIDEOVER_SEL);
  // SlideOver uses translate-y-0 when open, translate-y-full when closed.
  // Wait for the transition to complete by checking the computed class.
  await expect(dialog).toHaveClass(/translate-y-0/, { timeout: T.action });
  return dialog;
}

/** Select the first dog card inside an open SlideOver */
export async function selectFirstDog(page: Page) {
  const dialog = await waitForSlideOver(page);
  // Dog cards use: relative p-4 rounded-[18px] border-2
  const dogCard = dialog.locator("button.relative").first();
  await dogCard.click({ timeout: T.action });
  // Verify selection: the card should now have border-brand class
  await expect(dogCard, "Dog card should show selected state").toHaveClass(/border-brand/, { timeout: 1_000 });
}

// ---------------------------------------------------------------------------
// Full walk lifecycle helpers (used by multiple tests)
// ---------------------------------------------------------------------------

/** Full start-walk flow: open SlideOver → select dog → confirm → arrive at /walker/live */
export async function startWalkFull(page: Page) {
  await page.getByTestId("start-walk").click({ timeout: T.action });
  await selectFirstDog(page);
  await page.getByTestId("start-walk-confirm").click({ timeout: T.action });
  await page.waitForURL("**/walker/live**", { timeout: T.nav });
  await assertUrl(page, "/walker/live");
  await assertNoError(page);
}
