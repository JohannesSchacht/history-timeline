/**
 * Erlebnis-Review-Werkzeug (WORKFLOW.md: Validierung gegen docs/erwartung.md).
 * Fährt Erkundungs-Missionen als Persona A und legt Screenshots + Messwerte
 * unter .review/ ab. Maschinenraum-Werkzeug, kein Test.
 *
 * Aufruf: node tools/erlebnis-review.mjs [baseUrl]  (Default: http://localhost:4200)
 */
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const baseUrl = process.argv[2] ?? 'http://localhost:4200';
const outDir = '.review';
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto(baseUrl);
await page.waitForSelector('svg');
await page.waitForTimeout(500);

const notes = [];
const shot = async (name) => {
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
  notes.push(`Screenshot: ${name}`);
};

/** Wheel-Events direkt dispatchen (deterministisch, Fokus-x in Client-Pixeln). */
const wheel = (deltaY, clientX, times, pauseMs = 60) =>
  page.evaluate(
    async ({ deltaY, clientX, times, pauseMs }) => {
      const svg = document.querySelector('svg');
      for (let i = 0; i < times; i++) {
        svg.dispatchEvent(new WheelEvent('wheel', { deltaY, clientX, bubbles: true, cancelable: true }));
        await new Promise((r) => setTimeout(r, pauseMs));
      }
    },
    { deltaY, clientX, times, pauseMs },
  );

const state = () =>
  page.evaluate(() => ({
    aria: document.querySelector('svg')?.getAttribute('aria-label'),
    count: document.querySelector('.count')?.textContent?.trim(),
  }));

/** Messwert: wie viele Punkt-Beschriftungen überlappen einander? */
const labelCollisions = () =>
  page.evaluate(() => {
    const rects = [...document.querySelectorAll('.point-label')].map((t) => t.getBoundingClientRect());
    let collisions = 0;
    for (let i = 0; i < rects.length; i++)
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i], b = rects[j];
        if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) collisions++;
      }
    return { labels: rects.length, collisions };
  });

// M1 — Startansicht
notes.push('--- M1 Startansicht (1400-1700) ---');
notes.push(JSON.stringify(await state()));
notes.push(`Label-Kollisionen: ${JSON.stringify(await labelCollisions())}`);
await shot('m1-start');

// M2 — Reise: herauszoomen bis zur vollen Erdgeschichte, Zwischenhalte
notes.push('--- M2 Reise heute -> Erdgeschichte ---');
await wheel(300, 800, 4);
notes.push(`nach 4 Rasten: ${JSON.stringify(await state())}`);
await shot('m2a-mittel');
await wheel(500, 800, 8);
notes.push(`nach weiteren 8: ${JSON.stringify(await state())}`);
await shot('m2b-weit');
await wheel(800, 800, 8);
notes.push(`Vollansicht: ${JSON.stringify(await state())}`);
await shot('m2c-vollansicht');

// M3 — Johannes' Fall: mitten in der Erdgeschichte tief hineinzoomen
notes.push('--- M3 Tiefzoom in der Erdgeschichte (Johannes-Fall) ---');
await wheel(-800, 700, 14, 40); // hineinzoomen um x=700 (~3 Mrd. v. Chr.)
notes.push(`tief drin: ${JSON.stringify(await state())}`);
await shot('m3-tiefzoom-erdgeschichte');

// M4 — zurück zur Vollansicht, dann gezielt ins 1492er-Cluster
notes.push('--- M4 Praezisionszoom 1492 ---');
await wheel(1000, 800, 12, 40);
// 1492 in der Vollansicht: fast ganz rechts — Fokus nahe rechtem Rand
await wheel(-500, 1560, 30, 40);
notes.push(`nahe 1492? ${JSON.stringify(await state())}`);
await shot('m4-zoom-neuzeit');

// M5 — Randkappung: Ausschnitt mitten im Kaenozoikum
notes.push('--- M5 Balken-Kappung (P6) ---');
notes.push('siehe m1-start: Kaenozoikum-Balken endet optisch an den Raendern');

// M6 — Filter: nur Natur, Vollansicht
notes.push('--- M6 Filter Natur + Vollansicht ---');
await page.evaluate(() => location.reload());
await page.waitForSelector('svg');
await page.waitForTimeout(600);
for (const name of ['Politik', 'Militär', 'Kultur', 'Wissenschaft', 'Religion', 'Wirtschaft']) {
  await page.getByRole('checkbox', { name }).uncheck();
}
await wheel(800, 800, 14);
notes.push(`nur Natur, Vollansicht: ${JSON.stringify(await state())}`);
await shot('m6-nur-natur');

// M7 — circa vs. tagesgenau: sehen Marker unterschiedlich aus?
notes.push('--- M7 Unschaerfe-Darstellung (P6) ---');
notes.push(
  JSON.stringify(
    await page.evaluate(() => {
      const marker = (id) => {
        const c = document.querySelector(`[data-event-id="${id}"] circle`);
        return c ? { r: c.getAttribute('r'), klasse: c.parentElement?.getAttribute('class') } : null;
      };
      return { circaBuchdruck: marker('ev-buchdruck'), tagesgenauThesen: marker('ev-95-thesen') };
    }),
  ),
);

writeFileSync(`${outDir}/notes.txt`, notes.join('\n'));
console.log(notes.join('\n'));
await browser.close();
