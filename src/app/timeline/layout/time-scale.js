/**
 * Reine Funktionen der Timeline-Geometrie (siehe docs/testing.md, Kategorie T):
 * (Zeit, Viewport) → Pixel. Kein Angular, kein DOM — nur Rechnung.
 *
 * 1a: bewusst minimal (linearer Maßstab). Wächst ab Schritt 1c.
 */
/** Bildet ein Jahr linear auf die x-Position im Viewport ab. */
export function yearToX(year, viewport) {
    const { startYear, endYear, widthPx } = viewport;
    return ((year - startYear) / (endYear - startYear)) * widthPx;
}
/** Umkehrung von yearToX: x-Position → Jahr (für Zoom um den Cursor). */
export function xToYear(x, viewport) {
    const { startYear, endYear, widthPx } = viewport;
    return startYear + (x / widthPx) * (endYear - startYear);
}
