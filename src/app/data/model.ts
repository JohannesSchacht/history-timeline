/**
 * Datenmodell (docs/specs/1b-datenmodell-repository.md).
 *
 * Abweichung zur Spec: `HistoricalEvent` statt `Event`, weil `Event` mit dem
 * globalen DOM-Event kollidiert (jeder UI-Handler nutzt den DOM-Typ).
 */

/** Historisches Datum. Kein JS-Date: v. Chr. und Kalenderwechsel brauchen ein eigenes Format. */
export interface HistoricalDate {
  /** negativ = v. Chr.; ein Jahr 0 gibt es nicht (Invariante im Datenvertrag) */
  year: number;
  /** 1–12, optional */
  month?: number;
  /** 1–31, nur wenn month gesetzt (Invariante) */
  day?: number;
}

export type DatePrecision = 'day' | 'month' | 'year' | 'circa';

export interface HistoricalEvent {
  id: string;
  title: string;
  start: HistoricalDate;
  /** gesetzt = Zeitspanne, sonst Zeitpunkt */
  end?: HistoricalDate;
  precision: DatePrecision;
  /** genau EIN Typ (ID aus Taxonomy.types) */
  type: string;
  /** 1..n Kategorie-IDs (Knoten des Kategorien-Baums) */
  categories: string[];
  /** 0..n Ort-IDs */
  placeIds: string[];
  description: string;
}

export interface Place {
  id: string;
  name: string;
  coordinate?: { lat: number; lon: number };
}

export interface CategoryNode {
  id: string;
  name: string;
  /** Verfeinern = Kinder anhängen (decisions.md: Taxonomie iterativ) */
  children: CategoryNode[];
}

export interface Taxonomy {
  categories: CategoryNode[];
  types: { id: string; name: string }[];
}

/** Alle Kategorie-Knoten des Baums als flache Liste (reine Funktion). */
export function flattenCategories(nodes: CategoryNode[]): CategoryNode[] {
  return nodes.flatMap((n) => [n, ...flattenCategories(n.children)]);
}

/**
 * Vergleicht zwei historische Daten: negativ wenn a < b, 0 bei Gleichheit.
 * Fehlende Monate/Tage zählen als Jahresanfang (reicht für die Invariante start ≤ end).
 */
export function compareDates(a: HistoricalDate, b: HistoricalDate): number {
  return a.year - b.year || (a.month ?? 1) - (b.month ?? 1) || (a.day ?? 1) - (b.day ?? 1);
}

/** Formatiert ein Jahr für die Anzeige: -480 → „480 v. Chr." */
export function formatYear(year: number): string {
  return year < 0 ? `${-year} v. Chr.` : String(year);
}
