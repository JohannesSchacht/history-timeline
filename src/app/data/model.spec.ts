import { compareDates, flattenCategories, formatYear } from './model';

describe('compareDates', () => {
  it('vergleicht Jahre', () => {
    expect(compareDates({ year: 1500 }, { year: 1600 })).toBeLessThan(0);
    expect(compareDates({ year: 476 }, { year: -27 })).toBeGreaterThan(0);
  });

  it('vergleicht innerhalb eines Jahres nach Monat und Tag', () => {
    expect(compareDates({ year: 1492, month: 1, day: 2 }, { year: 1492, month: 10, day: 12 })).toBeLessThan(0);
    expect(compareDates({ year: 1648, month: 10, day: 24 }, { year: 1648, month: 10, day: 24 })).toBe(0);
  });

  it('behandelt fehlende Monate/Tage als Jahresanfang', () => {
    expect(compareDates({ year: 1529 }, { year: 1529, month: 9 })).toBeLessThan(0);
  });
});

describe('formatYear', () => {
  it('formatiert v.-Chr.-Jahre', () => {
    expect(formatYear(-480)).toBe('480 v. Chr.');
  });
  it('lässt n.-Chr.-Jahre unverändert', () => {
    expect(formatYear(1571)).toBe('1571');
  });
});

describe('flattenCategories', () => {
  it('liefert auch verschachtelte Knoten', () => {
    const flat = flattenCategories([
      { id: 'a', name: 'A', children: [{ id: 'a1', name: 'A1', children: [] }] },
      { id: 'b', name: 'B', children: [] },
    ]);
    expect(flat.map((n) => n.id)).toEqual(['a', 'a1', 'b']);
  });
});
