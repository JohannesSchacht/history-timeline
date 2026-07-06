import { __decorate } from "tslib";
import { Component, computed, inject } from '@angular/core';
import { flattenCategories } from '../data/model';
import { TimelineStore } from '../state/timeline.store';
/**
 * Filterleiste (Spec 1e): Kategorien und Typen als Checkbox-Chips.
 * Redet nur mit dem TimelineStore. Bewusst schlicht — Schönheit ist 1g.
 */
let FilterPanel = class FilterPanel {
    store = inject(TimelineStore);
    categories = computed(() => flattenCategories(this.store.taxonomy()?.categories ?? []));
    types = computed(() => this.store.taxonomy()?.types ?? []);
    isCategorySelected(id) {
        return this.store.selectedCategoryIds().includes(id);
    }
    isTypeSelected(id) {
        return this.store.selectedTypeIds().includes(id);
    }
};
FilterPanel = __decorate([
    Component({
        selector: 'app-filter-panel',
        templateUrl: './filter-panel.html',
        styleUrl: './filter-panel.scss',
    })
], FilterPanel);
export { FilterPanel };
