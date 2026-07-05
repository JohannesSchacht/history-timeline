import { Viewport, xToYear, yearToX } from './time-scale';
import {
  MAX_SPAN_YEARS,
  ZOOM,
  clampViewport,
  formatAxisYear,
  panViewport,
  wheelBoost,
  wheelZoomFactor,
  zoomViewport,
} from './viewport-controls';

const viewport: Viewport = { startYear: 1400, endYear: 1700, widthPx: 1000 };

describe('xToYear', () => {
  it('ist die Umkehrung von yearToX', () => {
    expect(xToYear(yearToX(1571, viewport), viewport)).toBeCloseTo(1571, 9);
    expect(xToYear(0, viewport)).toBe(1400);
    expect(xToYear(1000, viewport)).toBe(1700);
  });
});

describe('zoomViewport', () => {
  it('hält das Fokus-Jahr an derselben x-Position (die Invariante)', () => {
    const focusYear = 1571;
    const xBefore = yearToX(focusYear, viewport);
    const zoomed = zoomViewport(viewport, focusYear, 1.5);
    expect(yearToX(focusYear, zoomed)).toBeCloseTo(xBefore, 6);
  });

  it('verkleinert die Spanne beim Hineinzoomen um den Faktor', () => {
    const zoomed = zoomViewport(viewport, 1550, 2);
    expect(zoomed.endYear - zoomed.startYear).toBeCloseTo(150, 6);
  });

  it('vergrößert die Spanne beim Herauszoomen (Faktor < 1)', () => {
    const zoomed = zoomViewport(viewport, 1550, 0.5);
    expect(zoomed.endYear - zoomed.startYear).toBeCloseTo(600, 6);
  });

  it('stoppt an der minimalen Spanne', () => {
    const tiny = zoomViewport({ startYear: 1500, endYear: 1501.5, widthPx: 1000 }, 1500.75, 10);
    expect(tiny.endYear - tiny.startYear).toBe(ZOOM.minSpanYears);
  });

  it('stoppt an der maximalen Spanne und am Fenster', () => {
    const huge = zoomViewport(viewport, 1550, 1e-12);
    expect(huge.endYear - huge.startYear).toBe(MAX_SPAN_YEARS);
    expect(huge.startYear).toBe(ZOOM.minYear);
    expect(huge.endYear).toBe(ZOOM.maxYear);
  });
});

describe('panViewport', () => {
  it('übersetzt viewBox-Verschiebung in Jahre (Drag nach rechts → frühere Zeit)', () => {
    const panned = panViewport(viewport, 100); // 100 von 1000 Einheiten = 10 % von 300 Jahren
    expect(panned.startYear).toBeCloseTo(1370, 6);
    expect(panned.endYear).toBeCloseTo(1670, 6);
  });

  it('hält am Fenster-Rand an', () => {
    const panned = panViewport({ startYear: 2900, endYear: 2990, widthPx: 1000 }, -5000);
    expect(panned.endYear).toBe(ZOOM.maxYear);
    expect(panned.endYear - panned.startYear).toBeCloseTo(90, 6);
  });
});

describe('clampViewport', () => {
  it('lässt gültige Viewports unangetastet', () => {
    expect(clampViewport(viewport)).toEqual(viewport);
  });
});

describe('wheelZoomFactor', () => {
  it('zoomt bei negativem deltaY hinein, bei positivem heraus', () => {
    expect(wheelZoomFactor(-100)).toBeCloseTo(ZOOM.factorPerNotch, 6);
    expect(wheelZoomFactor(100)).toBeCloseTo(1 / ZOOM.factorPerNotch, 6);
  });

  it('skaliert mit der Delta-Größe, aber gedeckelt', () => {
    expect(wheelZoomFactor(-200)).toBeCloseTo(ZOOM.factorPerNotch ** 2, 6);
    expect(wheelZoomFactor(-1e6)).toBeCloseTo(ZOOM.factorPerNotch ** 10, 6);
  });

  it('boost verstärkt den Exponenten (Beschleunigung)', () => {
    expect(wheelZoomFactor(-100, 3)).toBeCloseTo(ZOOM.factorPerNotch ** 3, 6);
    expect(wheelZoomFactor(100, 3)).toBeCloseTo(1 / ZOOM.factorPerNotch ** 3, 6);
  });
});

describe('wheelBoost', () => {
  it('einzelne Rasten bleiben präzise (Boost 1)', () => {
    expect(wheelBoost(0)).toBe(1);
  });

  it('wächst mit der Serie und ist gedeckelt', () => {
    expect(wheelBoost(5)).toBe(3);
    expect(wheelBoost(100)).toBe(6); // Deckel
  });
});

describe('formatAxisYear (Q7)', () => {
  it('formatiert Milliarden', () => {
    expect(formatAxisYear(-4_600_000_000)).toBe('4,6 Mrd. v. Chr.');
    expect(formatAxisYear(-4_000_000_000)).toBe('4 Mrd. v. Chr.');
  });
  it('formatiert Millionen', () => {
    expect(formatAxisYear(-66_000_000)).toBe('66 Mio. v. Chr.');
    expect(formatAxisYear(-541_000_000)).toBe('541 Mio. v. Chr.');
  });
  it('gruppiert große Jahreszahlen', () => {
    expect(formatAxisYear(-300_000)).toBe('300.000 v. Chr.');
  });
  it('lässt normale Jahre wie gehabt', () => {
    expect(formatAxisYear(-480)).toBe('480 v. Chr.');
    expect(formatAxisYear(1571)).toBe('1571');
    expect(formatAxisYear(2026)).toBe('2026');
  });
});
