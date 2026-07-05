import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { HistoricalEvent } from '../data/model';
import { expectNoAxeViolations } from '../testing/axe.testing';
import { makeEvent } from '../testing/fixtures';
import { Viewport, yearToX } from './layout/time-scale';
import { Timeline } from './timeline';

/**
 * L2, Kategorie T (testing.md): Die Geometrie ist in layout/ L1-getestet —
 * hier prüfen wir nur, dass berechnete Positionen als SVG-Attribute im DOM
 * ankommen, plus AXE-Basics (role/label).
 */
const viewport: Viewport = { startYear: 1400, endYear: 1700, widthPx: 1000 };

@Component({
  imports: [Timeline],
  template: `<app-timeline
    [events]="events"
    [viewport]="viewport"
    [selectedId]="selectedId"
    (viewportChange)="changes.push($event)"
    (eventSelected)="selections.push($event)"
  />`,
})
class Host {
  events: readonly HistoricalEvent[] = [];
  viewport = viewport;
  selectedId: string | null = null;
  changes: Viewport[] = [];
  selections: (string | null)[] = [];
}

describe('Timeline', () => {
  async function setup(events: HistoricalEvent[], selectedId: string | null = null) {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.events = events;
    fixture.componentInstance.selectedId = selectedId;
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, host: fixture.nativeElement as HTMLElement };
  }

  const lepanto = makeEvent({
    id: 'ev-lepanto',
    title: 'Seeschlacht von Lepanto',
    start: { year: 1571, month: 10, day: 7 },
  });
  const italienischeKriege = makeEvent({
    id: 'ev-ital',
    title: 'Italienische Kriege',
    start: { year: 1494 },
    end: { year: 1559 },
  });

  it('zeichnet einen Zeitpunkt als circle an der berechneten x-Position', async () => {
    const { host } = await setup([lepanto]);
    const circle = host.querySelector('.point circle');
    const cx = Number(circle?.getAttribute('cx'));
    expect(cx).toBeCloseTo(yearToX(1571 + 9 / 12 + 6 / 372, viewport), 0);
  });

  it('zeichnet eine Zeitspanne als rect mit korrekter Breite', async () => {
    const { host } = await setup([italienischeKriege]);
    const rect = host.querySelector('.span rect');
    expect(Number(rect?.getAttribute('x'))).toBeCloseTo(yearToX(1494, viewport), 5);
    const width = Number(rect?.getAttribute('width'));
    expect(width).toBeCloseTo(yearToX(1559, viewport) - yearToX(1494, viewport), 5);
  });

  it('zeigt Zähler und Tooltip-title', async () => {
    const { host } = await setup([lepanto, italienischeKriege, makeEvent({ id: 'weit-weg', start: { year: -480 } })]);
    expect(host.querySelector('.count')?.textContent).toContain('2 von 3 Ereignissen');
    expect(host.querySelector('.point circle title')?.textContent).toContain('Seeschlacht von Lepanto (1571)');
  });

  it('hat role=img und ein sprechendes aria-label (AXE-Basics)', async () => {
    const { host } = await setup([lepanto]);
    const svg = host.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toContain('Zeitachse 1400 bis 1700');
    await expectNoAxeViolations(host);
  });

  // Interaktion (Spec 1d). jsdom hat kein Layout (rect.width 0) → die
  // Komponente fällt auf Maßstab 1 zurück: clientX ≡ viewBox-Einheiten.
  describe('Interaktion', () => {
    it('Wheel nach vorn zoomt hinein und hält das Jahr unter dem Cursor fest', async () => {
      const { fixture, host } = await setup([lepanto]);
      const svg = host.querySelector('svg') as SVGSVGElement;
      const cursorX = 500; // = viewBox 500 → Jahr 1550
      svg.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, clientX: cursorX, cancelable: true }));
      const emitted = fixture.componentInstance.changes.at(-1);
      expect(emitted).toBeDefined();
      const span = emitted!.endYear - emitted!.startYear;
      expect(span).toBeLessThan(300); // hineingezoomt
      // Fokus-Invariante: Jahr 1550 liegt weiterhin bei x=500
      expect(yearToX(1550, emitted!)).toBeCloseTo(500, 4);
    });

    it('Wheel zurück zoomt heraus', async () => {
      const { fixture, host } = await setup([lepanto]);
      const svg = host.querySelector('svg') as SVGSVGElement;
      svg.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, clientX: 500, cancelable: true }));
      const emitted = fixture.componentInstance.changes.at(-1);
      expect(emitted!.endYear - emitted!.startYear).toBeGreaterThan(300);
    });

    it('Marker-Klick wählt das Event aus (und nicht den Hintergrund)', async () => {
      const { fixture, host } = await setup([lepanto]);
      (host.querySelector('[data-event-id="ev-lepanto"]') as SVGGElement).dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
      await fixture.whenStable();
      expect(fixture.componentInstance.selections).toEqual(['ev-lepanto']);
    });

    it('Hintergrund-Klick meldet null (Abwählen)', async () => {
      const { fixture, host } = await setup([lepanto]);
      (host.querySelector('svg') as SVGSVGElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await fixture.whenStable();
      expect(fixture.componentInstance.selections).toEqual([null]);
    });

    it('nach einem Pan-Drag wählt das Loslassen NICHT aus (Schwelle)', async () => {
      const { fixture, host } = await setup([lepanto]);
      const svg = host.querySelector('svg') as SVGSVGElement;
      svg.setPointerCapture = () => undefined;
      svg.releasePointerCapture = () => undefined;
      svg.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, clientX: 400 }));
      svg.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 450 }));
      svg.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, clientX: 450 }));
      svg.dispatchEvent(new MouseEvent('click', { bubbles: true })); // Browser feuert Click nach dem Drag
      await fixture.whenStable();
      expect(fixture.componentInstance.selections).toEqual([]);
    });

    it('hebt das gewählte Event hervor (selected-Klasse)', async () => {
      const { host } = await setup([lepanto], 'ev-lepanto');
      expect(host.querySelector('[data-event-id="ev-lepanto"]')?.classList.contains('selected')).toBe(true);
    });

    it('Pointer-Drag nach rechts schwenkt in frühere Jahre', async () => {
      const { fixture, host } = await setup([lepanto]);
      const svg = host.querySelector('svg') as SVGSVGElement;
      svg.setPointerCapture = () => undefined; // jsdom kennt Pointer-Capture nicht
      svg.releasePointerCapture = () => undefined;
      svg.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, clientX: 400 }));
      svg.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 500 }));
      svg.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, clientX: 500 }));
      const emitted = fixture.componentInstance.changes.at(-1);
      expect(emitted!.startYear).toBeCloseTo(1370, 4); // 100 Einheiten = 30 Jahre zurück
      expect(emitted!.endYear - emitted!.startYear).toBeCloseTo(300, 6);
    });
  });
});
