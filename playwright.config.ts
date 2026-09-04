import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
const baseURL = `http://127.0.0.1:${PORT}`;
// Pinned: wrangler defaults this to today, and the pinned workerd binary only
// supports dates up to its own release. An unpinned date breaks the day the
// binary falls behind the calendar.
const COMPAT_DATE = '2026-07-21';

/**
 * End-to-end suite for the built site.
 *
 * The server is `wrangler pages dev`, not `astro preview`: public URLs carry no
 * language, so every HTML response comes from `apps/web/public/_worker.js`
 * resolving one. A static file server would serve the internal trees directly
 * and the suite would be testing a site nobody visits.
 *
 * `pnpm build` must have run.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    locale: 'en-US',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
      testIgnore: /mobile\.spec\.ts/,
    },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /mobile\.spec\.ts/ },
  ],
  webServer: {
    command: `pnpm exec wrangler pages dev apps/web/dist --port ${PORT} --ip 127.0.0.1 --compatibility-date ${COMPAT_DATE} --log-level warn`,
    url: `${baseURL}/`,
    reuseExistingServer: !process.env.CI,
    // workerd takes appreciably longer to come up than a static file server.
    timeout: 120_000,
  },
});
