import { Viewport } from './time-scale';

/**
 * Zoom-/Pan-Geometrie als reine Funktionen (Spec 1d: „Interaktion ist auch
 * nur Geometrie"). Event-Handler rufen diese Funktionen — keine Mathematik
 * in der Komponente.
 */

export const ZOOM = {
  /** Zoomfaktor pro Mausrad-Raste (deltaY ≈ 100). Wird am lebenden Objekt eingestellt. */
  factorPerNotch: 1.2,
  /** engster Ausschnitt: 1 Jahr */
  minSpanYears: 1,
  /** Fenster, in dem sich der Viewport bewegen darf */
  minYear: -5_000_000_000,
  maxYear: 3000,
} as const;

/** weitester Ausschnitt = das ganze erlaubte Fenster */
export const MAX_SPAN_YEARS = ZOOM.maxYear - ZOOM.minYear;

/** Hält den Viewport in den Grenzen: Spannweite zuerst, dann das Fenster. */
export function clampViewport(viewport: Viewport): Viewport {
  const { startYear, endYear, widthPx } = viewport;
  let span = endYear - startYear;
  let start = startYear;

  if (span < ZOOM.minSpanYears) {
    const center = startYear + span / 2;
    span = ZOOM.minSpanYears;
    start = center - span / 2;
  } else if (span > MAX_SPAN_YEARS) {
    span = MAX_SPAN_YEARS;
  }

  if (start < ZOOM.minYear) start = ZOOM.minYear;
  if (start + span > ZOOM.maxYear) start = ZOOM.maxYear - span;

  return { startYear: start, endYear: start + span, widthPx };
}

/**
 * Zoomt um ein Fokus-Jahr. Invariante: das Fokus-Jahr behält seine relative
 * Position (und damit seine x-Koordinate), solange keine Grenze eingreift.
 * factor > 1 = hineinzoomen (Spanne schrumpft).
 */
export function zoomViewport(viewport: Viewport, focusYear: number, factor: number): Viewport {
  const { startYear, endYear, widthPx } = viewport;
  const span = endYear - startYear;
  const t = (focusYear - startYear) / span; // relative Position des Fokus
  const newSpan = span / factor;
  const start = focusYear - t * newSpan;
  return clampViewport({ startYear: start, endYear: start + newSpan, widthPx });
}

/** Verschiebt den Ausschnitt um dx viewBox-Einheiten (Drag nach rechts = frühere Zeit). */
export function panViewport(viewport: Viewport, dx: number): Viewport {
  const { startYear, endYear, widthPx } = viewport;
  const deltaYears = (-dx / widthPx) * (endYear - startYear);
  return clampViewport({ startYear: startYear + deltaYears, endYear: endYear + deltaYears, widthPx });
}

/**
 * Mausrad-Delta → Zoomfaktor. deltaY < 0 (nach vorn) zoomt hinein.
 * Proportional zu |deltaY| (Trackpads liefern feine Deltas, Mäuse ~100 je
 * Raste); Exponent gedeckelt, damit ein Ausreißer-Event nicht springt.
 */
export function wheelZoomFactor(deltaY: number): number {
  const notches = Math.min(Math.abs(deltaY) / 100, 10);
  const factor = Math.pow(ZOOM.factorPerNotch, notches);
  return deltaY < 0 ? factor : 1 / factor;
}

/**
 * Achsenbeschriftung für beliebige Größenordnungen (löst Q7).
 * Exakte Jahre bleiben den Tooltips vorbehalten.
 */
export function formatAxisYear(year: number): string {
  const abs = Math.abs(year);
  const suffix = year < 0 ? ' v. Chr.' : '';
  if (abs >= 1_000_000_000) return `${trimDecimal(abs / 1_000_000_000)} Mrd.${suffix}`;
  if (abs >= 1_000_000) return `${trimDecimal(abs / 1_000_000)} Mio.${suffix}`;
  if (abs >= 10_000) return `${groupThousands(Math.round(abs))}${suffix}`;
  return year < 0 ? `${abs} v. Chr.` : String(year);
}

/** 4.6 → „4,6", 4.0 → „4" */
function trimDecimal(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return String(rounded).replace('.', ',');
}

/** 300000 → „300.000" */
function groupThousands(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
