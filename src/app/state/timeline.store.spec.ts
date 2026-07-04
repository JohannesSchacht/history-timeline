import { TestBed } from '@angular/core/testing';
import { EventRepository } from '../data/event-repository';
import { FakeEventRepository } from '../testing/fake-event-repository';
import { makeEvent, makeTaxonomy } from '../testing/fixtures';
import { TimelineStore } from './timeline.store';

// Store-Test gegen das Fake-Repository (testing.md: Fake per DI).
describe('TimelineStore', () => {
  const lepanto = makeEvent({ id: 'lepanto', type: 'typ-schlacht', categories: ['cat-militaer', 'cat-religion'] });
  const thesen = makeEvent({ id: 'thesen', type: 'typ-ereignis', categories: ['cat-religion'] });

  function setup() {
    const fake = new FakeEventRepository({
      events: [lepanto, thesen],
      taxonomy: makeTaxonomy({
        categories: [
          { id: 'cat-militaer', name: 'Militär', children: [] },
          { id: 'cat-religion', name: 'Religion', children: [] },
        ],
        types: [
          { id: 'typ-schlacht', name: 'Schlacht' },
          { id: 'typ-ereignis', name: 'Ereignis' },
        ],
      }),
    });
    TestBed.configureTestingModule({ providers: [{ provide: EventRepository, useValue: fake }] });
    return { store: TestBed.inject(TimelineStore) };
  }

  it('initialisiert nach load() mit „alle an" und zeigt alles', async () => {
    const { store } = setup();
    await store.load();
    expect(store.selectedCategoryIds().length).toBe(2);
    expect(store.selectedTypeIds().length).toBe(2);
    expect(store.filteredEvents().map((e) => e.id)).toEqual(['lepanto', 'thesen']);
  });

  it('toggleCategory: Lepanto überlebt eine abgewählte Kategorie (ODER), nicht zwei', async () => {
    const { store } = setup();
    await store.load();
    store.toggleCategory('cat-militaer');
    expect(store.filteredEvents().map((e) => e.id)).toEqual(['lepanto', 'thesen']);
    store.toggleCategory('cat-religion');
    expect(store.filteredEvents()).toEqual([]);
  });

  it('toggleType wirkt unabhängig', async () => {
    const { store } = setup();
    await store.load();
    store.toggleType('typ-schlacht');
    expect(store.filteredEvents().map((e) => e.id)).toEqual(['thesen']);
  });

  it('selectNo/selectAll setzen die Auswahl komplett', async () => {
    const { store } = setup();
    await store.load();
    store.selectNoCategories();
    expect(store.filteredEvents()).toEqual([]);
    store.selectAllCategories();
    expect(store.filteredEvents().length).toBe(2);
  });

  it('setViewport aktualisiert den Ausschnitt', () => {
    const { store } = setup();
    store.setViewport({ startYear: 1000, endYear: 2000, widthPx: 1000 });
    expect(store.viewport().startYear).toBe(1000);
  });
});
