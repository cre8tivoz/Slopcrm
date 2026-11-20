import { defineConfig, devices } from "@playwright/test";

const port = process.env.SLOPCRM_BROWSER_PORT ?? "4173";
const baseURL = `http://127.0.0.1:${port}/slopcrm/`;
const executablePath = process.env.SLOPCRM_CHROMIUM_PATH;

export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  use: {
    baseURL,
    reducedMotion: "reduce",
    launchOptions: { executablePath },
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run build:static && node scripts/serve-browser-export.mjs",
    env: {
      PORT: port,
      NEXT_PUBLIC_BASE_PATH: "/slopcrm",
      NEXT_PUBLIC_SITE_URL: baseURL.slice(0, -1),
      NEXT_TELEMETRY_DISABLED: "1",
    },
    url: baseURL,
    timeout: 180_000,
  },
});
