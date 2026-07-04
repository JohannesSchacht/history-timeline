import { HttpClient } from '@angular/common/http';
import { Injectable, Signal, inject, signal } from '@angular/core';
import { firstValueFrom, forkJoin } from 'rxjs';
import { HistoricalEvent, Place, Taxonomy } from './model';

/**
 * Die eiserne Regel (docs/architecture.md): ALLE Datenzugriffe laufen durch
 * dieses Repository. Komponenten kennen nur diese abstrakte Klasse (dient
 * zugleich als DI-Token); die Implementierung ist austauschbar
 * (JSON heute, Backend/KI in Ausbaustufe 3, Fake im Test).
 */
export abstract class EventRepository {
  abstract readonly events: Signal<readonly HistoricalEvent[]>;
  abstract readonly places: Signal<readonly Place[]>;
  abstract readonly taxonomy: Signal<Taxonomy | null>;
  abstract readonly loading: Signal<boolean>;
  abstract readonly error: Signal<string | null>;
  /** Lädt den Datenbestand. Gibt ein Promise zurück (deterministisch awaitbar, s. testing.md). */
  abstract load(): Promise<void>;
}

/** Stufe-1-Implementierung: liest die statischen JSON-Dateien aus public/data/. */
@Injectable()
export class JsonEventRepository extends EventRepository {
  private readonly http = inject(HttpClient);

  private readonly _events = signal<readonly HistoricalEvent[]>([]);
  private readonly _places = signal<readonly Place[]>([]);
  private readonly _taxonomy = signal<Taxonomy | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly events = this._events.asReadonly();
  readonly places = this._places.asReadonly();
  readonly taxonomy = this._taxonomy.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  async load(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const data = await firstValueFrom(
        forkJoin({
          events: this.http.get<HistoricalEvent[]>('data/events.json'),
          places: this.http.get<Place[]>('data/places.json'),
          taxonomy: this.http.get<Taxonomy>('data/taxonomy.json'),
        }),
      );
      this._events.set(data.events);
      this._places.set(data.places);
      this._taxonomy.set(data.taxonomy);
    } catch {
      this._error.set('Daten konnten nicht geladen werden.');
    } finally {
      this._loading.set(false);
    }
  }
}
