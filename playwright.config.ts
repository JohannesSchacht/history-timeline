import { defineConfig, devices } from '@playwright/test';

/**
 * L3 — hermetische e2e (docs/testing.md): echte App im echten Browser.
 * Läuft gegen den Produktions-Build (das, was deployt wird), nicht gegen
 * ng serve. `npm run e2e` baut vorher (siehe package.json).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: 0,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4300',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx http-server dist/history-timeline/browser -p 4300 -s',
    url: 'http://localhost:4300',
    reuseExistingServer: !process.env['CI'],
  },
});
