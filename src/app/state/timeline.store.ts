import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { EventRepository } from '../data/event-repository';
import { expandCategorySelection, filterEvents } from '../data/filter';
import { flattenCategories } from '../data/model';
import { Viewport } from '../timeline/layout/time-scale';

/** Start-Ausschnitt (Spec 1c): das dichte Kernfenster. */
export const DEFAULT_VIEWPORT: Viewport = { startYear: 1400, endYear: 1700, widthPx: 1000 };

/**
 * UI-Zustand der Timeline als SignalStore (Spec 1e; Entscheidung: SignalStore
 * ab 1e, kein Full-NgRx). Das EventRepository bleibt der einzige Datenzugang
 * (eiserne Regel) — der Store KONSUMIERT es und legt Filter + Viewport
 * darüber. Komponenten reden nur noch mit dem Store.
 */
export const TimelineStore = signalStore(
  { providedIn: 'root' },
  withState({
    viewport: DEFAULT_VIEWPORT,
    selectedCategoryIds: [] as readonly string[],
    selectedTypeIds: [] as readonly string[],
    /** gewähltes Event (1f); überlebt Filter/Zoom bewusst (Detail = Nachschlagen) */
    selectedEventId: null as string | null,
  }),
  withComputed((store) => {
    const repo = inject(EventRepository);
    return {
      loading: repo.loading,
      error: repo.error,
      taxonomy: repo.taxonomy,
      totalCount: computed(() => repo.events().length),
      places: repo.places,
      /** aus ALLEN Events aufgelöst, nicht nur den gefilterten (Spec 1f) */
      selectedEvent: computed(
        () => repo.events().find((e) => e.id === store.selectedEventId()) ?? null,
      ),
      filteredEvents: computed(() =>
        filterEvents(
          repo.events(),
          expandCategorySelection(repo.taxonomy()?.categories ?? [], store.selectedCategoryIds()),
          new Set(store.selectedTypeIds()),
        ),
      ),
    };
  }),
  withMethods((store) => {
    const repo = inject(EventRepository);

    const allCategoryIds = (): string[] =>
      flattenCategories(repo.taxonomy()?.categories ?? []).map((c) => c.id);
    const allTypeIds = (): string[] => (repo.taxonomy()?.types ?? []).map((t) => t.id);
    const toggle = (list: readonly string[], id: string): string[] =>
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

    return {
      /** Lädt die Daten und initialisiert die Auswahl mit „alle an". */
      async load(): Promise<void> {
        await repo.load();
        patchState(store, { selectedCategoryIds: allCategoryIds(), selectedTypeIds: allTypeIds() });
      },
      setViewport(viewport: Viewport): void {
        patchState(store, { viewport });
      },
      /** Klick-Semantik (1f): gleiches Event oder Hintergrund (null) → abwählen. */
      toggleEvent(id: string | null): void {
        patchState(store, {
          selectedEventId: id === null || id === store.selectedEventId() ? null : id,
        });
      },
      toggleCategory(id: string): void {
        patchState(store, { selectedCategoryIds: toggle(store.selectedCategoryIds(), id) });
      },
      toggleType(id: string): void {
        patchState(store, { selectedTypeIds: toggle(store.selectedTypeIds(), id) });
      },
      selectAllCategories(): void {
        patchState(store, { selectedCategoryIds: allCategoryIds() });
      },
      selectNoCategories(): void {
        patchState(store, { selectedCategoryIds: [] });
      },
      selectAllTypes(): void {
        patchState(store, { selectedTypeIds: allTypeIds() });
      },
      selectNoTypes(): void {
        patchState(store, { selectedTypeIds: [] });
      },
    };
  }),
);
