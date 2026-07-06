import axe from 'axe-core';
import { expect } from 'vitest';
/**
 * Prüft ein gerendertes Element auf Barrierefreiheits-Verstöße (axe-core)
 * und lässt den Test mit lesbarer Meldung scheitern (docs/testing.md).
 *
 * Abgeschaltet, weil in jsdom ohne echtes Rendering nur Fehlalarme:
 * - color-contrast (kein Layout/Farben)
 * - region (Landmark-Analyse braucht volle Seite)
 */
export async function expectNoAxeViolations(root) {
    const results = await axe.run(root, {
        rules: {
            'color-contrast': { enabled: false },
            region: { enabled: false },
        },
    });
    const violations = results.violations.map((v) => `${v.id}: ${v.help} [${v.nodes.map((n) => n.target.join(' ')).join('; ')}]`);
    expect(violations).toEqual([]);
}
