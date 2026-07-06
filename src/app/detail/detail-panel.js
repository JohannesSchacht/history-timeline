import { __decorate } from "tslib";
import { Component, computed, inject } from '@angular/core';
import { formatEventDate } from '../data/format';
import { flattenCategories } from '../data/model';
import { TimelineStore } from '../state/timeline.store';
/**
 * Detailansicht des gewählten Events (Spec 1f): Panel unter der Timeline,
 * kein Overlay. Liest aus dem TimelineStore (Kategorie C).
 */
let DetailPanel = class DetailPanel {
    store = inject(TimelineStore);
    event = this.store.selectedEvent;
    dateText = computed(() => {
        const event = this.event();
        return event ? formatEventDate(event) : '';
    });
    typeName = computed(() => {
        const event = this.event();
        const types = this.store.taxonomy()?.types ?? [];
        return types.find((t) => t.id === event?.type)?.name ?? event?.type ?? '';
    });
    categoryNames = computed(() => {
        const event = this.event();
        if (!event)
            return '';
        const all = flattenCategories(this.store.taxonomy()?.categories ?? []);
        return event.categories.map((id) => all.find((c) => c.id === id)?.name ?? id).join(', ');
    });
    placeNames = computed(() => {
        const event = this.event();
        if (!event)
            return '';
        const places = this.store.places();
        return event.placeIds.map((id) => places.find((p) => p.id === id)?.name ?? id).join(', ');
    });
};
DetailPanel = __decorate([
    Component({
        selector: 'app-detail-panel',
        templateUrl: './detail-panel.html',
        styleUrl: './detail-panel.scss',
    })
], DetailPanel);
export { DetailPanel };
