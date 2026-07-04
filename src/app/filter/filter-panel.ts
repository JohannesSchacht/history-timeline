import { Component, computed, inject } from '@angular/core';
import { flattenCategories } from '../data/model';
import { TimelineStore } from '../state/timeline.store';

/**
 * Filterleiste (Spec 1e): Kategorien und Typen als Checkbox-Chips.
 * Redet nur mit dem TimelineStore. Bewusst schlicht — Schönheit ist 1g.
 */
@Component({
  selector: 'app-filter-panel',
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.scss',
})
export class FilterPanel {
  protected readonly store = inject(TimelineStore);

  protected readonly categories = computed(() =>
    flattenCategories(this.store.taxonomy()?.categories ?? []),
  );
  protected readonly types = computed(() => this.store.taxonomy()?.types ?? []);

  protected isCategorySelected(id: string): boolean {
    return this.store.selectedCategoryIds().includes(id);
  }
  protected isTypeSelected(id: string): boolean {
    return this.store.selectedTypeIds().includes(id);
  }
}
