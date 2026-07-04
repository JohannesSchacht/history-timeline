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

test('Filter: Lepanto überlebt eine abgewählte Kategorie, nicht zwei (Spec 1e)', async ({ page }) => {
  await page.goto('/');
  const lepanto = page.locator('svg title', { hasText: 'Seeschlacht von Lepanto' });
  await expect(lepanto).toHaveCount(1);

  // Militär abwählen → Lepanto bleibt (Religion ist noch gewählt, ODER-Semantik)
  await page.getByRole('checkbox', { name: 'Militär' }).uncheck();
  await expect(lepanto).toHaveCount(1);

  // Religion zusätzlich abwählen → Lepanto verschwindet, ebenso rein
  // religiöse Events — aber Kultur-Events bleiben (Filter ist selektiv):
  await page.getByRole('checkbox', { name: 'Religion' }).uncheck();
  await expect(lepanto).toHaveCount(0);
  await expect(page.locator('svg title', { hasText: 'Luthers 95 Thesen' })).toHaveCount(0);
  await expect(page.locator('svg title', { hasText: 'Michelangelos David' })).toHaveCount(1);
});

test('Herauszoomen mit dem Mausrad macht die Antike sichtbar (Spec 1d)', async ({ page }) => {
  await page.goto('/');
  const svg = page.locator('svg');
  await expect(svg).toBeVisible();
  // Thermopylen (480 v. Chr.) liegt außerhalb des Start-Ausschnitts:
  await expect(page.locator('svg title', { hasText: 'Thermopylen' })).toHaveCount(0);

  await svg.hover(); // Cursor über die Timeline, dann herauszoomen
  for (let i = 0; i < 10; i++) {
    await page.mouse.wheel(0, 500);
  }
  await expect(page.locator('svg title', { hasText: 'Thermopylen' })).toHaveCount(1);
});
