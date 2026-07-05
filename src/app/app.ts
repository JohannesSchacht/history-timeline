import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DetailPanel } from './detail/detail-panel';
import { FilterPanel } from './filter/filter-panel';
import { TimelineStore } from './state/timeline.store';
import { Timeline } from './timeline/timeline';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Timeline, FilterPanel, DetailPanel],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('history-timeline');
  /** Ab 1e reden Komponenten nur noch mit dem Store (SignalStore-Einzug). */
  protected readonly store = inject(TimelineStore);

  constructor() {
    void this.store.load();
  }
}
