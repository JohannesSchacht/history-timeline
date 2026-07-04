import { Component, computed, input } from '@angular/core';
import { HistoricalEvent, formatYear } from '../data/model';
import { Viewport } from './layout/time-scale';
import { LAYOUT, layoutTimeline } from './layout/timeline-layout';

/**
 * Timeline-Komponente (testing.md Kategorie T): zeichnet das Ergebnis von
 * layoutTimeline stumpf ab — alle Geometrie kommt aus dem Layout-Modul.
 * Statischer Ausschnitt (Spec 1c); Zoom/Pan folgt in 1d.
 */
@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss',
})
export class Timeline {
  readonly events = input.required<readonly HistoricalEvent[]>();
  readonly viewport = input.required<Viewport>();

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
}
