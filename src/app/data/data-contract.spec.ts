import events from '../../../public/data/events.json';
import places from '../../../public/data/places.json';
import taxonomy from '../../../public/data/taxonomy.json';
import { HistoricalEvent, Place, Taxonomy, compareDates, flattenCategories } from './model';

/**
 * Datenvertrags-Test (docs/testing.md): validiert die ECHTEN Datendateien
 * gegen Modell und Invarianten — unser Analogon zum Contract-Riegel.
 * Kaputte Datenpflege fällt hier auf, nicht erst beim Herumklicken.
 */
const allEvents = events as HistoricalEvent[];
const allPlaces = places as Place[];
const tax = taxonomy as Taxonomy;

const PRECISIONS = ['day', 'month', 'year', 'circa'];

function duplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  return ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
}

describe('Datenvertrag: events.json / places.json / taxonomy.json', () => {
  const categoryIds = new Set(flattenCategories(tax.categories).map((c) => c.id));
  const typeIds = new Set(tax.types.map((t) => t.id));
  const placeIds = new Set(allPlaces.map((p) => p.id));

  it('alle IDs sind eindeutig', () => {
    expect(duplicates(allEvents.map((e) => e.id))).toEqual([]);
    expect(duplicates(allPlaces.map((p) => p.id))).toEqual([]);
    expect(duplicates([...categoryIds])).toEqual([]);
    expect(duplicates([...typeIds])).toEqual([]);
  });

  it('jede Typ-Referenz existiert in der Taxonomie', () => {
    const broken = allEvents.filter((e) => !typeIds.has(e.type));
    expect(broken.map((e) => `${e.id} → ${e.type}`)).toEqual([]);
  });

  it('jede Kategorie-Referenz existiert im Kategorien-Baum', () => {
    const broken = allEvents.flatMap((e) =>
      e.categories.filter((c) => !categoryIds.has(c)).map((c) => `${e.id} → ${c}`),
    );
    expect(broken).toEqual([]);
  });

  it('jede Orts-Referenz existiert', () => {
    const broken = allEvents.flatMap((e) =>
      e.placeIds.filter((p) => !placeIds.has(p)).map((p) => `${e.id} → ${p}`),
    );
    expect(broken).toEqual([]);
  });

  it('jedes Event hat mindestens eine Kategorie', () => {
    expect(allEvents.filter((e) => e.categories.length === 0).map((e) => e.id)).toEqual([]);
  });

  it('precision ist gültig', () => {
    const broken = allEvents.filter((e) => !PRECISIONS.includes(e.precision));
    expect(broken.map((e) => `${e.id} → ${e.precision}`)).toEqual([]);
  });

  it('start ≤ end bei Zeitspannen', () => {
    const broken = allEvents.filter((e) => e.end && compareDates(e.start, e.end) > 0);
    expect(broken.map((e) => e.id)).toEqual([]);
  });

  it('Datums-Invarianten: kein Jahr 0, Monat 1–12, Tag nur mit Monat', () => {
    const broken = allEvents.flatMap((e) =>
      [e.start, e.end].flatMap((d, i) => {
        if (!d) return [];
        const label = `${e.id}/${i === 0 ? 'start' : 'end'}`;
        const errs: string[] = [];
        if (d.year === 0) errs.push(`${label}: Jahr 0`);
        if (d.month !== undefined && (d.month < 1 || d.month > 12)) errs.push(`${label}: Monat ${d.month}`);
        if (d.day !== undefined && d.month === undefined) errs.push(`${label}: Tag ohne Monat`);
        if (d.day !== undefined && (d.day < 1 || d.day > 31)) errs.push(`${label}: Tag ${d.day}`);
        return errs;
      }),
    );
    expect(broken).toEqual([]);
  });

  it('der Datensatz enthält die bewusst gemeinen Fälle', () => {
    // Diese Prüfung schützt die KURATIERUNGS-Absicht (Spec 1b), nicht nur die Form:
    expect(allEvents.some((e) => e.start.year < 0)).toBe(true); // v. Chr.
    expect(allEvents.some((e) => e.end !== undefined)).toBe(true); // Spannen
    expect(allEvents.some((e) => e.precision === 'circa')).toBe(true); // Unschärfe
    expect(allEvents.some((e) => e.categories.length >= 2)).toBe(true); // Mehrkategorien
    expect(allEvents.some((e) => e.placeIds.length === 0)).toBe(true); // ohne Ort
    expect(allEvents.some((e) => e.placeIds.length >= 2)).toBe(true); // mehrere Orte
  });
});
