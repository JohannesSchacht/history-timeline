import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EventRepository } from './data/event-repository';
import { Viewport } from './timeline/layout/time-scale';
import { Timeline } from './timeline/timeline';

/** Start-Ausschnitt (Spec 1c): das dichte Kernfenster. Wird in 1d beweglich (Zoom/Pan). */
export const DEFAULT_VIEWPORT: Viewport = { startYear: 1400, endYear: 1700, widthPx: 1000 };

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Timeline],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('history-timeline');
  protected readonly repo = inject(EventRepository);
  /** Der bewegliche Ausschnitt (Spec 1d): Timeline meldet Änderungen, App hält den State. */
  protected readonly viewport = signal<Viewport>(DEFAULT_VIEWPORT);

  constructor() {
    void this.repo.load();
  }
}
