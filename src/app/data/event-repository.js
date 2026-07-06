import { __decorate } from "tslib";
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom, forkJoin } from 'rxjs';
/**
 * Die eiserne Regel (docs/architecture.md): ALLE Datenzugriffe laufen durch
 * dieses Repository. Komponenten kennen nur diese abstrakte Klasse (dient
 * zugleich als DI-Token); die Implementierung ist austauschbar
 * (JSON heute, Backend/KI in Ausbaustufe 3, Fake im Test).
 */
export class EventRepository {
}
/** Stufe-1-Implementierung: liest die statischen JSON-Dateien aus public/data/. */
let JsonEventRepository = class JsonEventRepository extends EventRepository {
    http = inject(HttpClient);
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
    async load() {
        this._loading.set(true);
        this._error.set(null);
        try {
            const data = await firstValueFrom(forkJoin({
                events: this.http.get('data/events.json'),
                places: this.http.get('data/places.json'),
                taxonomy: this.http.get('data/taxonomy.json'),
            }));
            this._events.set(data.events);
            this._places.set(data.places);
            this._taxonomy.set(data.taxonomy);
        }
        catch {
            this._error.set('Daten konnten nicht geladen werden.');
        }
        finally {
            this._loading.set(false);
        }
    }
};
JsonEventRepository = __decorate([
    Injectable()
], JsonEventRepository);
export { JsonEventRepository };
