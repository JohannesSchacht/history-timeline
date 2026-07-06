import { signal } from '@angular/core';
import { EventRepository } from '../data/event-repository';
import { makeTaxonomy } from './fixtures';
/**
 * Seedbares Fake-Repository für L2-Tests (docs/testing.md): per DI an die
 * Stelle des echten Repositories — die Mini-Ausgabe der FakeBackendDb-Idee.
 */
export class FakeEventRepository extends EventRepository {
    seed;
    _events = signal([]);
    _places = signal([]);
    _taxonomy = signal(null);
    _loading = signal(false);
    _error = signal(null);
    events = this._events.asReadonly();
    places = this._places.asReadonly();
    taxonomy = this._taxonomy.asReadonly();
    loading = this._loading.asReadonly();
    error = this._error.asReadonly();
    constructor(seed = {}) {
        super();
        this.seed = seed;
    }
    async load() {
        this._loading.set(true);
        await Promise.resolve(); // ein Mikrotask, damit Ladezustände beobachtbar sind
        if (this.seed.failOnLoad) {
            this._error.set('Daten konnten nicht geladen werden.');
        }
        else {
            this._events.set(this.seed.events ?? []);
            this._places.set(this.seed.places ?? []);
            this._taxonomy.set(this.seed.taxonomy ?? makeTaxonomy());
        }
        this._loading.set(false);
    }
}
