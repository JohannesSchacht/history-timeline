/**
 * Datenmodell (docs/specs/1b-datenmodell-repository.md).
 *
 * Abweichung zur Spec: `HistoricalEvent` statt `Event`, weil `Event` mit dem
 * globalen DOM-Event kollidiert (jeder UI-Handler nutzt den DOM-Typ).
 */
/** Alle Kategorie-Knoten des Baums als flache Liste (reine Funktion). */
export function flattenCategories(nodes) {
    return nodes.flatMap((n) => [n, ...flattenCategories(n.children)]);
}
/**
 * Vergleicht zwei historische Daten: negativ wenn a < b, 0 bei Gleichheit.
 * Fehlende Monate/Tage zählen als Jahresanfang (reicht für die Invariante start ≤ end).
 */
export function compareDates(a, b) {
    return a.year - b.year || (a.month ?? 1) - (b.month ?? 1) || (a.day ?? 1) - (b.day ?? 1);
}
/** Formatiert ein Jahr für die Anzeige: -480 → „480 v. Chr." */
export function formatYear(year) {
    return year < 0 ? `${-year} v. Chr.` : String(year);
}
