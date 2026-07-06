import { __decorate } from "tslib";
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DetailPanel } from './detail/detail-panel';
import { FilterPanel } from './filter/filter-panel';
import { TimelineStore } from './state/timeline.store';
import { Timeline } from './timeline/timeline';
let App = class App {
    title = signal('history-timeline');
    /** Ab 1e reden Komponenten nur noch mit dem Store (SignalStore-Einzug). */
    store = inject(TimelineStore);
    constructor() {
        void this.store.load();
    }
};
App = __decorate([
    Component({
        selector: 'app-root',
        imports: [RouterOutlet, Timeline, FilterPanel, DetailPanel],
        templateUrl: './app.html',
        styleUrl: './app.scss',
    })
], App);
export { App };
