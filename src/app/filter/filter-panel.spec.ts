import { TestBed } from '@angular/core/testing';
import { EventRepository } from '../data/event-repository';
import { TimelineStore } from '../state/timeline.store';
import { expectNoAxeViolations } from '../testing/axe.testing';
import { FakeEventRepository } from '../testing/fake-event-repository';
import { makeEvent, makeTaxonomy } from '../testing/fixtures';
import { FilterPanel } from './filter-panel';

// L2 (Kategorie C): Panel + echter Store + Fake-Repository per DI.
describe('FilterPanel', () => {
  async function setup() {
    const fake = new FakeEventRepository({
      events: [makeEvent({ id: 'lepanto', type: 'typ-schlacht', categories: ['cat-militaer', 'cat-religion'] })],
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
    TestBed.configureTestingModule({
      imports: [FilterPanel],
      providers: [{ provide: EventRepository, useValue: fake }],
    });
    const store = TestBed.inject(TimelineStore);
    await store.load();
    const fixture = TestBed.createComponent(FilterPanel);
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, store, host: fixture.nativeElement as HTMLElement };
  }

  it('rendert beide Gruppen aus der Taxonomie mit vorausgewählten Checkboxen', async () => {
    const { host } = await setup();
    const legends = [...host.querySelectorAll('legend')].map((l) => l.textContent?.trim());
    expect(legends).toEqual(['Kategorien', 'Typen']);
    const boxes = [...host.querySelectorAll<HTMLInputElement>('input[type=checkbox]')];
    expect(boxes).toHaveLength(4); // 2 Kategorien + 2 Typen
    expect(boxes.every((b) => b.checked)).toBe(true);
  });

  it('Checkbox-Klick schaltet die Kategorie im Store um', async () => {
    const { fixture, store, host } = await setup();
    const militaer = [...host.querySelectorAll('label')].find((l) => l.textContent?.includes('Militär'));
    militaer?.querySelector('input')?.click();
    await fixture.whenStable();
    expect(store.selectedCategoryIds()).not.toContain('cat-militaer');
    // ODER-Semantik: Lepanto (Militär+Religion) bleibt gefiltert sichtbar
    expect(store.filteredEvents().map((e) => e.id)).toEqual(['lepanto']);
  });

  it('„keine" leert die Auswahl der Gruppe', async () => {
    const { fixture, store, host } = await setup();
    const keineButtons = [...host.querySelectorAll('button')].filter((b) => b.textContent?.trim() === 'keine');
    keineButtons[0].click();
    await fixture.whenStable();
    expect(store.selectedCategoryIds()).toEqual([]);
    expect(store.filteredEvents()).toEqual([]);
  });

  it('besteht die AXE-Prüfung', async () => {
    const { host } = await setup();
    await expectNoAxeViolations(host);
  });
});
