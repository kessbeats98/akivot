import { test, expect, type Page } from "@playwright/test";
import { assertNoError, assertUrl, qaHeaders, reset, resetOnly, T } from "./helpers";

const isRemote = /^https?:\/\/(?!localhost|127\.0\.0\.1)/.test(process.env.BASE_URL ?? "");

test.describe.configure({ mode: "serial" });

test.afterEach(async ({ page }) => {
  try {
    await reset(page);
  } catch {
    // Best-effort cleanup
  }
});

async function seedAssignedDogs(page: Page, count: number) {
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
  const res = await page.request.post(`${baseUrl}/api/qa/seed`, {
    headers: qaHeaders(),
    data: { count },
  });

  if (!res.ok()) {
    throw new Error(`QA seed failed (${res.status()}): ${await res.text()}`);
  }
}

async function openTestMode(page: Page) {
  await page.goto("/walker/dashboard?debug=true", { timeout: T.nav });
  await page.waitForLoadState("networkidle", { timeout: T.nav });
  await assertUrl(page, "/walker/dashboard");
  await assertNoError(page);

  await page.getByTestId("debug-test-mode").click({ timeout: T.action });
  await expect(page.getByText("- Test Mode")).toBeVisible({ timeout: T.visible });
}

async function setDogPrice(page: Page, dogName: string, price: string) {
  const option = page.locator("select option").filter({ hasText: dogName }).first();
  const dogId = await option.getAttribute("value");

  if (!dogId) {
    throw new Error(`Could not find dog option for ${dogName}`);
  }

  await page.getByTestId("debug-dog-select").selectOption(dogId);
  await page.getByTestId("debug-price-input").fill(price);
  await page.getByTestId("debug-price-set").click({ timeout: T.action });
  await expect(page.getByText("Set price OK")).toBeVisible({ timeout: T.action });
  await page.waitForLoadState("networkidle", { timeout: T.nav });

  return dogId;
}

async function prepareBlockedFirstReadySecond(page: Page) {
  await resetOnly(page);
  await seedAssignedDogs(page, 2);
  await openTestMode(page);

  await setDogPrice(page, "QA Dog 1", "0.00");
  await setDogPrice(page, "QA Dog 2", "50.00");

  await page.goto("/walker/dashboard?debug=true", { timeout: T.nav });
  await page.waitForLoadState("networkidle", { timeout: T.nav });
  await assertUrl(page, "/walker/dashboard");
  await assertNoError(page);
}

test.describe("price-enforcement", () => {
  // Phase 5 note: the walker dashboard uses direct-launch (no SlideOver chooser for
  // single-dog start). The primary CTA goes straight to /walker/live on click.
  // The SlideOver chooser is only reachable via "בחר כלב אחר ›".

  test("[smoke,price] multi-dog dashboard promotes ready dog when first dog has no price", async ({ page }) => {
    test.skip(
      isRemote,
      "price-enforcement regression relies on Test Mode server actions via debug mode. Run against local dev server.",
    );

    await prepareBlockedFirstReadySecond(page);

    const primaryCta = page.getByTestId("start-walk");
    await expect(primaryCta, "Primary CTA should remain available").toBeVisible({
      timeout: T.visible,
    });
    await expect(primaryCta, "Ready dog should own the primary CTA").toContainText("QA Dog 2");
    await expect(
      page.getByTestId("start-walk-blocked"),
      "Blocked dog must not replace the primary CTA",
    ).toHaveCount(0);
  });

  test("[smoke,price] multi-dog start launches the ready dog to live when first dog has no price", async ({
    page,
  }) => {
    test.skip(
      isRemote,
      "price-enforcement regression relies on Test Mode server actions via debug mode. Run against local dev server.",
    );

    await prepareBlockedFirstReadySecond(page);
    const primaryCtaText = await page.getByTestId("start-walk").innerText();
    expect(primaryCtaText).toContain("QA Dog 2");

    // Direct-launch: clicking start-walk navigates straight to /walker/live (no SlideOver).
    await page.getByTestId("start-walk").click({ timeout: T.action });

    await page.waitForURL("**/walker/live**", { timeout: T.nav });
    await assertUrl(page, "/walker/live");
    await assertNoError(page);
    await expect(page.getByText("בהליכה עכשיו")).toBeVisible({ timeout: T.visible });
    await expect(page.getByTestId("end-walk")).toBeVisible({ timeout: T.visible });
    await expect(page.getByText("QA Dog 2").first()).toBeVisible({ timeout: T.visible });
    await expect(page.getByText("QA Dog 1")).toHaveCount(0);
  });
});
