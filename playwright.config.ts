import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const isRemote = !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(BASE_URL);
const bypassToken = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: "qa/tests",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [
    ["./qa/compact-reporter.ts"],
    ["json", { outputFile: "qa/results.json" }],
  ],
  globalSetup: "qa/global-setup.ts",
  timeout: 60_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: BASE_URL,
    storageState: "qa/.auth/state.json",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 5_000,
    navigationTimeout: 15_000,
    ...(bypassToken
      ? { extraHTTPHeaders: { "x-vercel-protection-bypass": bypassToken } }
      : {}),
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  ...(isRemote
    ? {}
    : {
        webServer: {
          command: "npm run dev",
          port: 3000,
          reuseExistingServer: true,
        },
      }),
});
