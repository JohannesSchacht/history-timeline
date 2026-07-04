import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EventRepository } from './data/event-repository';
import { formatYear } from './data/model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('history-timeline');
  protected readonly repo = inject(EventRepository);
  protected readonly formatYear = formatYear;

  constructor() {
    void this.repo.load();
  }
}
