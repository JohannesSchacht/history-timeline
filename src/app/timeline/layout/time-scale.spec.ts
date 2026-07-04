import { yearToX, Viewport } from './time-scale';

// L1-Beispieltest (docs/testing.md): reine Funktion, keine Angular-Maschinerie.
describe('yearToX', () => {
  const viewport: Viewport = { startYear: 1500, endYear: 1700, widthPx: 2000 };

  it('bildet den linken Rand auf 0 ab', () => {
    expect(yearToX(1500, viewport)).toBe(0);
  });

  it('bildet den rechten Rand auf die volle Breite ab', () => {
    expect(yearToX(1700, viewport)).toBe(2000);
  });

  it('bildet ein Jahr dazwischen linear ab (Lepanto 1571)', () => {
    expect(yearToX(1571, viewport)).toBe(710);
  });

  it('liefert negative x für Jahre vor dem Viewport', () => {
    expect(yearToX(1490, viewport)).toBeLessThan(0);
  });

  it('funktioniert mit Jahren v. Chr. (negative Jahreszahlen)', () => {
    const antike: Viewport = { startYear: -500, endYear: 500, widthPx: 1000 };
    expect(yearToX(0, antike)).toBe(500);
    expect(yearToX(-480, antike)).toBe(20);
  });
});
