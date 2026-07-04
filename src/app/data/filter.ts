import { CategoryNode, HistoricalEvent } from './model';

/**
 * Filter-Logik als reine Funktionen (Spec 1e). Semantik (decisions.md):
 * - Kategorien: ODER — sichtbar, wenn MINDESTENS EINE Event-Kategorie
 *   ausgewählt ist (Lepanto verschwindet erst, wenn Militär UND Religion
 *   abgewählt sind).
 * - Baum: eine gewählte Kategorie schließt ihre Nachfahren ein.
 * - Typ: zweite, unabhängige Achse (UND-verknüpft mit den Kategorien).
 */

/** Erweitert die Auswahl um alle Nachfahren gewählter Knoten. */
export function expandCategorySelection(nodes: CategoryNode[], selectedIds: readonly string[]): Set<string> {
  const selected = new Set(selectedIds);
  const expanded = new Set<string>();
  const walk = (node: CategoryNode, ancestorSelected: boolean): void => {
    const isSelected = ancestorSelected || selected.has(node.id);
    if (isSelected) expanded.add(node.id);
    for (const child of node.children) walk(child, isSelected);
  };
  for (const node of nodes) walk(node, false);
  return expanded;
}

/** Wendet Kategorie- (ODER) und Typ-Filter (UND) an. Leere Auswahl → nichts sichtbar. */
export function filterEvents(
  events: readonly HistoricalEvent[],
  expandedCategoryIds: ReadonlySet<string>,
  selectedTypeIds: ReadonlySet<string>,
): HistoricalEvent[] {
  return events.filter(
    (event) =>
      selectedTypeIds.has(event.type) && event.categories.some((c) => expandedCategoryIds.has(c)),
  );
}
