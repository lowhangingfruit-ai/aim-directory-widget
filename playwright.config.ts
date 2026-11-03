import { defineConfig } from "@playwright/test";

// End-to-end tests run against a production build fed by a made-up feed
// (tests/e2e/make-feed.mjs), so they don't depend on Manage My Market.
const PORT = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `node tests/e2e/make-feed.mjs && next build && next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 180_000,
    reuseExistingServer: false,
    env: {
      MMM_FEED_FILE: "tests/e2e/.feed.txt",
      CRON_SECRET: "test-secret",
      BLOB_READ_WRITE_TOKEN: "",
      INTAKE_SCRIPT_URL: "",
      INTAKE_SCRIPT_SECRET: "",
    },
  },
});
