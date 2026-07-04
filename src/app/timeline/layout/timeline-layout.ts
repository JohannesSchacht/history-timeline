import { HistoricalDate, HistoricalEvent, formatYear } from '../../data/model';
import { Viewport, yearToX } from './time-scale';

/**
 * Reine Layout-Funktionen der Timeline (Spec 1c, testing.md Kategorie T):
 * (Events, Viewport) → Positionen. Kein Angular, kein DOM.
 *
 * Alle Maße in viewBox-Einheiten (nicht Pixel) — die Komponente skaliert
 * das SVG per CSS auf Containerbreite. Die Höhe wächst mit den Lanes:
 * Punkte stapeln sich ÜBER der Achse, Spannen als Balken DARUNTER.
 */

/** Vertikale Konstanten (Spec 1c: Konstanten im Layout-Modul, nicht im Template). */
export const LAYOUT = {
  topMargin: 10,
  pointLaneHeight: 14,
  pointRadius: 4,
  /** Mindestabstand (x) zweier Punkte in derselben Lane */
  pointGap: 12,
  /** Abstand unterste Punkt-Lane ↔ Achse */
  axisGap: 18,
  /** Abstand Achse ↔ erste Spannen-Lane (Platz für die Tick-Beschriftung) */
  spanOffset: 30,
  spanLaneHeight: 16,
  spanHeight: 10,
  /** Mindestabstand (x) zweier Spannen in derselben Lane */
  spanGap: 4,
  bottomMargin: 24,
} as const;

export interface PositionedPoint {
  event: HistoricalEvent;
  x: number;
  y: number;
}

export interface PositionedSpan {
  event: HistoricalEvent;
  x1: number;
  x2: number;
  y: number;
}

export interface Tick {
  x: number;
  label: string;
}

export interface TimelineLayout {
  points: PositionedPoint[];
  spans: PositionedSpan[];
  ticks: Tick[];
  /** y-Position der Zeitachse (dynamisch: rückt nach unten, wenn Punkte hoch stapeln) */
  axisY: number;
  /** Anzahl Events im Ausschnitt (Punkte + Spannen) */
  visibleCount: number;
  /** Gesamthöhe des SVG in viewBox-Einheiten (wächst mit den Lanes) */
  height: number;
}

/**
 * Löst ein historisches Datum in einen Jahresbruchteil auf, damit z. B.
 * Januar und Oktober 1492 unterscheidbare x-Positionen bekommen.
 * Monotonie genügt (Layout, keine Kalenderrechnung).
 */
export function dateToYearFraction(date: HistoricalDate): number {
  return date.year + ((date.month ?? 1) - 1) / 12 + ((date.day ?? 1) - 1) / (12 * 31);
}

/** Wählt eine Tick-Schrittweite (1-2-5-Reihe), sodass höchstens ~8 Ticks entstehen. */
export function tickStep(spanYears: number): number {
  const candidates = [1, 2, 5];
  for (let magnitude = 1; ; magnitude *= 10) {
    for (const c of candidates) {
      const step = c * magnitude;
      if (spanYears / step <= 8) return step;
    }
  }
}

/** Achsen-Ticks: Vielfache der Schrittweite innerhalb des Viewports. */
export function buildTicks(viewport: Viewport): Tick[] {
  const step = tickStep(viewport.endYear - viewport.startYear);
  const first = Math.ceil(viewport.startYear / step) * step;
  const ticks: Tick[] = [];
  for (let year = first; year <= viewport.endYear; year += step) {
    ticks.push({ x: yearToX(year, viewport), label: formatYear(year) });
  }
  return ticks;
}

/**
 * Greedy-Lane-Packing: weist jedem Intervall (sortiert nach x1) die erste
 * Lane zu, deren letztes Intervall weit genug links endet. Deterministisch.
 */
function packLanes(intervals: { x1: number; x2: number }[], gap: number): number[] {
  const laneEnds: number[] = [];
  return intervals.map(({ x1, x2 }) => {
    const lane = laneEnds.findIndex((end) => end + gap <= x1);
    if (lane === -1) {
      laneEnds.push(x2);
      return laneEnds.length - 1;
    }
    laneEnds[lane] = x2;
    return lane;
  });
}

/** Das Herzstück von 1c: Events + Viewport → gezeichnete Geometrie. */
export function layoutTimeline(events: readonly HistoricalEvent[], viewport: Viewport): TimelineLayout {
  const { startYear, endYear, widthPx } = viewport;

  // Punkte: im Ausschnitt; Spannen: überlappen den Ausschnitt (werden gekappt)
  const pointEvents = events
    .filter((e) => !e.end)
    .map((e) => ({ event: e, yf: dateToYearFraction(e.start) }))
    .filter(({ yf }) => yf >= startYear && yf <= endYear)
    .sort((a, b) => a.yf - b.yf);

  const spanEvents = events
    .filter((e) => e.end !== undefined)
    .map((e) => ({
      event: e,
      yf1: dateToYearFraction(e.start),
      yf2: dateToYearFraction(e.end as HistoricalDate),
    }))
    .filter(({ yf1, yf2 }) => yf2 >= startYear && yf1 <= endYear)
    .sort((a, b) => a.yf1 - b.yf1);

  const pointXs = pointEvents.map(({ yf }) => yearToX(yf, viewport));
  const pointLanes = packLanes(
    pointXs.map((x) => ({ x1: x, x2: x })),
    LAYOUT.pointGap,
  );
  const maxPointLane = pointLanes.length ? Math.max(...pointLanes) : -1;

  // Die Achse rückt so weit nach unten, dass die höchste Punkt-Lane hineinpasst.
  const axisY = LAYOUT.topMargin + (maxPointLane + 1) * LAYOUT.pointLaneHeight + LAYOUT.axisGap;

  const points: PositionedPoint[] = pointEvents.map(({ event }, i) => ({
    event,
    x: pointXs[i],
    y: axisY - LAYOUT.axisGap - pointLanes[i] * LAYOUT.pointLaneHeight,
  }));

  const spanRects = spanEvents.map(({ yf1, yf2 }) => ({
    x1: Math.max(0, yearToX(yf1, viewport)),
    x2: Math.min(widthPx, yearToX(yf2, viewport)),
  }));
  const spanLanes = packLanes(spanRects, LAYOUT.spanGap);
  const spanBaseY = axisY + LAYOUT.spanOffset;
  const spans: PositionedSpan[] = spanEvents.map(({ event }, i) => ({
    event,
    x1: spanRects[i].x1,
    x2: spanRects[i].x2,
    y: spanBaseY + spanLanes[i] * LAYOUT.spanLaneHeight,
  }));

  const maxSpanLane = spanLanes.length ? Math.max(...spanLanes) : -1;
  const height = spanBaseY + (maxSpanLane + 1) * LAYOUT.spanLaneHeight + LAYOUT.bottomMargin;

  return {
    points,
    spans,
    ticks: buildTicks(viewport),
    axisY,
    visibleCount: points.length + spans.length,
    height,
  };
}
