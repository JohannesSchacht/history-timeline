import { signal } from '@angular/core';
import { EventRepository } from '../data/event-repository';
import { HistoricalEvent, Place, Taxonomy } from '../data/model';
import { makeTaxonomy } from './fixtures';

/**
 * Seedbares Fake-Repository für L2-Tests (docs/testing.md): per DI an die
 * Stelle des echten Repositories — die Mini-Ausgabe der FakeBackendDb-Idee.
 */
export class FakeEventRepository extends EventRepository {
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

  constructor(
    private readonly seed: {
      events?: HistoricalEvent[];
      places?: Place[];
      taxonomy?: Taxonomy;
      /** lässt load() im Fehlerzustand enden (Fehlerpfad-Tests) */
      failOnLoad?: boolean;
    } = {},
  ) {
    super();
  }

  async load(): Promise<void> {
    this._loading.set(true);
    await Promise.resolve(); // ein Mikrotask, damit Ladezustände beobachtbar sind
    if (this.seed.failOnLoad) {
      this._error.set('Daten konnten nicht geladen werden.');
    } else {
      this._events.set(this.seed.events ?? []);
      this._places.set(this.seed.places ?? []);
      this._taxonomy.set(this.seed.taxonomy ?? makeTaxonomy());
    }
    this._loading.set(false);
  }
}
