import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { EventRepository, JsonEventRepository } from './data/event-repository';
export const appConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideHttpClient(withFetch()),
        // Eiserne Regel: Komponenten kennen nur EventRepository (docs/architecture.md)
        { provide: EventRepository, useClass: JsonEventRepository },
    ],
};
