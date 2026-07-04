/**
 * Reine Funktionen der Timeline-Geometrie (siehe docs/testing.md, Kategorie T):
 * (Zeit, Viewport) → Pixel. Kein Angular, kein DOM — nur Rechnung.
 *
 * 1a: bewusst minimal (linearer Maßstab). Wächst ab Schritt 1c.
 */

/** Der sichtbare Zeitausschnitt, abgebildet auf eine Pixelbreite. */
export interface Viewport {
  /** erstes sichtbares Jahr (linker Rand) */
  readonly startYear: number;
  /** letztes sichtbares Jahr (rechter Rand) */
  readonly endYear: number;
  /** verfügbare Breite in Pixeln */
  readonly widthPx: number;
}

/** Bildet ein Jahr linear auf die x-Position im Viewport ab. */
export function yearToX(year: number, viewport: Viewport): number {
  const { startYear, endYear, widthPx } = viewport;
  return ((year - startYear) / (endYear - startYear)) * widthPx;
}
