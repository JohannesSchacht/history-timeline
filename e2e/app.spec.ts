import { test, expect } from '@playwright/test';

// L3 (docs/testing.md): echte App, echter Browser, echte Daten (public/data/*.json).
test('App startet und zeigt den Titel', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('history-timeline');
});

test('App lädt die echten Ereignisse und zeigt sie als Liste', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/\d+ Ereignisse geladen/)).toBeVisible();
  await expect(page.getByText('Seeschlacht von Lepanto')).toBeVisible();
  await expect(page.getByText('Schlacht bei den Thermopylen')).toBeVisible();
});
