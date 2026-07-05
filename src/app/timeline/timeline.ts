import { Component, ElementRef, computed, input, output, signal, viewChild } from '@angular/core';
import { HistoricalEvent, formatYear } from '../data/model';
import { Viewport, xToYear } from './layout/time-scale';
import { LAYOUT, layoutTimeline } from './layout/timeline-layout';
import { panViewport, wheelZoomFactor, zoomViewport } from './layout/viewport-controls';

/**
 * Timeline-Komponente (testing.md Kategorie T): zeichnet das Ergebnis von
 * layoutTimeline stumpf ab — alle Geometrie kommt aus dem Layout-Modul.
 *
 * Interaktion (Spec 1d): Wheel = Zoom um den Cursor, Pointer-Drag = Pan.
 * Die Handler sind bewusst dünn — sie übersetzen nur Maus-Pixel in
 * viewBox-Einheiten und rufen die reinen viewport-controls-Funktionen.
 * Der Viewport-State selbst gehört dem Eltern-Element (Signal in App).
 */
@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss',
})
export class Timeline {
  readonly events = input.required<readonly HistoricalEvent[]>();
  readonly viewport = input.required<Viewport>();
  /** hervorzuhebendes Event (1f) */
  readonly selectedId = input<string | null>(null);
  readonly viewportChange = output<Viewport>();
  /** Marker geklickt (Event-ID) bzw. Hintergrund geklickt (null) */
  readonly eventSelected = output<string | null>();

  protected readonly svg = viewChild.required<ElementRef<SVGSVGElement>>('svgRoot');
  protected readonly dragging = signal(false);
  private lastPointerX: number | null = null;
  /** trennt Klick von Pan-Drag (Spec 1f): Bewegung über der Schwelle → kein Klick */
  private movedPx = 0;
  private static readonly CLICK_THRESHOLD_PX = 4;

  protected readonly LAYOUT = LAYOUT;
  protected readonly formatYear = formatYear;
  protected readonly layout = computed(() => layoutTimeline(this.events(), this.viewport()));

  protected readonly ariaLabel = computed(
    () =>
      `Zeitachse ${formatYear(this.viewport().startYear)} bis ${formatYear(this.viewport().endYear)}, ` +
      `${this.layout().visibleCount} Ereignisse`,
  );

  /** Hover-Text: Titel + Jahr(e) */
  protected tooltip(event: HistoricalEvent): string {
    const years = event.end
      ? `${formatYear(event.start.year)}–${formatYear(event.end.year)}`
      : formatYear(event.start.year);
    return `${event.title} (${years})`;
  }

  /** Maus-Pixel (clientX) → viewBox-Einheiten. jsdom liefert width 0 → Maßstab 1 (Tests). */
  private clientXToViewBox(clientX: number): number {
    const rect = this.svg().nativeElement.getBoundingClientRect();
    const scale = rect.width > 0 ? this.viewport().widthPx / rect.width : 1;
    return (clientX - rect.left) * scale;
  }

  protected onWheel(event: WheelEvent): void {
    event.preventDefault();
    const focusYear = xToYear(this.clientXToViewBox(event.clientX), this.viewport());
    this.viewportChange.emit(zoomViewport(this.viewport(), focusYear, wheelZoomFactor(event.deltaY)));
  }

  protected onPointerDown(event: PointerEvent): void {
    this.dragging.set(true);
    this.lastPointerX = event.clientX;
    this.movedPx = 0;
    this.svg().nativeElement.setPointerCapture(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.dragging() || this.lastPointerX === null) return;
    this.movedPx += Math.abs(event.clientX - this.lastPointerX);
    const dx = this.clientXToViewBox(event.clientX) - this.clientXToViewBox(this.lastPointerX);
    this.lastPointerX = event.clientX;
    if (dx !== 0) this.viewportChange.emit(panViewport(this.viewport(), dx));
  }

  protected onPointerUp(event: PointerEvent): void {
    this.dragging.set(false);
    this.lastPointerX = null;
    this.svg().nativeElement.releasePointerCapture(event.pointerId);
  }

  private wasDrag(): boolean {
    return this.movedPx > Timeline.CLICK_THRESHOLD_PX;
  }

  protected onMarkerClick(id: string, event: MouseEvent): void {
    event.stopPropagation(); // sonst feuert zusätzlich der Hintergrund-Klick
    if (!this.wasDrag()) this.eventSelected.emit(id);
  }

  protected onBackgroundClick(): void {
    if (!this.wasDrag()) this.eventSelected.emit(null);
  }
}
