import { defineConfig, devices } from "@playwright/test";

const TEST_DB = "postgresql://mm:mm_dev_pw@localhost:5432/mmsolution_test?schema=public";
const PORT = 3100;
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  globalSetup: "./tests/e2e/global-setup.ts",
  use: { baseURL: `http://localhost:${PORT}`, trace: "off" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] }, testIgnore: /mobile\.spec/ }, { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /mobile\.spec/ }],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/robots.txt`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { DATABASE_URL: TEST_DB, SITE_URL: `http://localhost:${PORT}`, UPLOAD_DIR: "./storage/e2e-uploads", NODE_ENV: "production" },
  },
});
