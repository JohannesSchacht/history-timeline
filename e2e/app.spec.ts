import { test, expect } from '@playwright/test';

// L3-Beispieltest (docs/testing.md): App öffnen, Titel sehen.
test('App startet und zeigt den Titel', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('history-timeline');
});
