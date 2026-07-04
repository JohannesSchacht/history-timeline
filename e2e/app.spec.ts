import { test, expect } from '@playwright/test';

// L3 (docs/testing.md): echte App, echter Browser, echte Daten (public/data/*.json).
test('App startet und zeigt den Titel', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('history-timeline');
});

test('App zeigt die echten Ereignisse auf der Zeitachse', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/\d+ von \d+ Ereignissen im Ausschnitt/)).toBeVisible();
  await expect(page.getByRole('img', { name: /Zeitachse 1400 bis 1700/ })).toBeVisible();
  // Lepanto liegt im Start-Ausschnitt und muss als Marker mit Tooltip da sein:
  await expect(page.locator('svg title', { hasText: 'Seeschlacht von Lepanto' })).toHaveCount(1);
});
