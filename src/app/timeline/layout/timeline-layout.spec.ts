import { makeEvent } from '../../testing/fixtures';
import { Viewport } from './time-scale';
import { LAYOUT, buildTicks, dateToYearFraction, layoutTimeline, tickStep } from './timeline-layout';

const viewport: Viewport = { startYear: 1400, endYear: 1700, widthPx: 1000 };

describe('dateToYearFraction', () => {
  it('lässt reine Jahresangaben unverändert', () => {
    expect(dateToYearFraction({ year: 1571 })).toBe(1571);
  });

  it('macht Monate innerhalb eines Jahres unterscheidbar (1492er-Cluster)', () => {
    const granada = dateToYearFraction({ year: 1492, month: 1, day: 2 });
    const alhambra = dateToYearFraction({ year: 1492, month: 3, day: 31 });
    const kolumbus = dateToYearFraction({ year: 1492, month: 10, day: 12 });
    expect(granada).toBeLessThan(alhambra);
    expect(alhambra).toBeLessThan(kolumbus);
    expect(kolumbus).toBeLessThan(1493);
  });

  it('funktioniert mit negativen Jahren', () => {
    expect(dateToYearFraction({ year: -480 })).toBe(-480);
  });
});

describe('tickStep / buildTicks', () => {
  it('wählt für 300 Jahre die 50er-Schrittweite', () => {
    expect(tickStep(300)).toBe(50);
  });

  it('wählt für sehr große Spannen große Schritte (max. ~8 Ticks)', () => {
    expect(tickStep(4_600_000_000) / 4_600_000_000).toBeGreaterThanOrEqual(1 / 8);
  });

  it('legt Ticks auf runde Vielfache im Viewport', () => {
    const ticks = buildTicks(viewport);
    expect(ticks.map((t) => t.label)).toEqual(['1400', '1450', '1500', '1550', '1600', '1650', '1700']);
    expect(ticks[0].x).toBe(0);
    expect(ticks[ticks.length - 1].x).toBe(1000);
  });
});

describe('layoutTimeline', () => {
  it('lässt Events außerhalb des Viewports weg', () => {
    const layout = layoutTimeline(
      [
        makeEvent({ id: 'drin', start: { year: 1500 } }),
        makeEvent({ id: 'davor', start: { year: -480 } }),
        makeEvent({ id: 'danach', start: { year: 1969 } }),
      ],
      viewport,
    );
    expect(layout.points.map((p) => p.event.id)).toEqual(['drin']);
    expect(layout.visibleCount).toBe(1);
  });

  it('behält Punkte exakt auf der Viewport-Grenze', () => {
    const layout = layoutTimeline([makeEvent({ start: { year: 1400 } }), makeEvent({ start: { year: 1700 } })], viewport);
    expect(layout.points.map((p) => p.x)).toEqual([0, 1000]);
  });

  it('kappt hineinragende Spannen am Rand', () => {
    // Italienische Kriege 1494–1559 bei engem Viewport 1500–1550: umschließt komplett
    const eng: Viewport = { startYear: 1500, endYear: 1550, widthPx: 1000 };
    const layout = layoutTimeline([makeEvent({ start: { year: 1494 }, end: { year: 1559 } })], eng);
    expect(layout.spans).toHaveLength(1);
    expect(layout.spans[0].x1).toBe(0);
    expect(layout.spans[0].x2).toBe(1000);
  });

  it('lässt Spannen ganz außerhalb weg', () => {
    const layout = layoutTimeline([makeEvent({ start: { year: -252000000 }, end: { year: -66000000 } })], viewport);
    expect(layout.spans).toHaveLength(0);
  });

  it('packt überlappende Spannen in getrennte Lanes, nicht überlappende in dieselbe', () => {
    const layout = layoutTimeline(
      [
        makeEvent({ id: 'a', start: { year: 1450 }, end: { year: 1550 } }),
        makeEvent({ id: 'b', start: { year: 1500 }, end: { year: 1600 } }), // überlappt a
        makeEvent({ id: 'c', start: { year: 1560 }, end: { year: 1650 } }), // passt hinter a
      ],
      viewport,
    );
    const byId = Object.fromEntries(layout.spans.map((s) => [s.event.id, s.y]));
    expect(byId['a']).not.toBe(byId['b']);
    expect(byId['c']).toBe(byId['a']);
  });

  it('stapelt dicht beieinanderliegende Punkte in Lanes nach oben', () => {
    const layout = layoutTimeline(
      [makeEvent({ id: 'p1', start: { year: 1500 } }), makeEvent({ id: 'p2', start: { year: 1501 } })],
      viewport,
    );
    const ys = layout.points.map((p) => p.y);
    expect(ys[0]).not.toBe(ys[1]);
    expect(Math.abs(ys[0] - ys[1])).toBe(LAYOUT.pointLaneHeight);
  });

  it('alle Elemente liegen innerhalb der berechneten Höhe', () => {
    const events = Array.from({ length: 30 }, (_, i) =>
      makeEvent({ id: `p${i}`, start: { year: 1500 } , end: i % 2 ? { year: 1600 } : undefined }),
    );
    const layout = layoutTimeline(events, viewport);
    for (const p of layout.points) expect(p.y).toBeGreaterThan(0);
    for (const s of layout.spans) expect(s.y + LAYOUT.spanHeight).toBeLessThan(layout.height);
    expect(layout.axisY).toBeGreaterThan(0);
    expect(layout.axisY).toBeLessThan(layout.height);
  });

  it('ist deterministisch (gleiche Eingabe → gleiche Ausgabe)', () => {
    const events = [makeEvent({ id: 'x', start: { year: 1492, month: 10, day: 12 } })];
    expect(layoutTimeline(events, viewport)).toEqual(layoutTimeline(events, viewport));
  });
});
